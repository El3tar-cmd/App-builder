import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a conversational AI agent that can both talk to the user and build web applications. Your objective is to architect and implement web applications based on the user's exact requirements, while also being able to answer questions, search the internet, and hold a conversation.

If the user asks a general question or wants to chat, respond conversationally.
If the user asks to build or modify an app, you MUST output the project using the following exact XML-like format. You may also include conversational text before or after the XML. Do not use markdown code blocks around the XML output.

Architecture Standards (Apply these UNLESS the user requests otherwise):
1. Framework: React 19 (Frontend) + Express 5 (Backend).
2. Styling: Tailwind CSS 4.0 with utility-first principles.
3. Icons: Lucide React for a consistent vector design language.
4. Logic: Use modern React hooks, context API for state, and robust error boundaries.
5. Backend: RESTful API design with proper middleware, validation, and security headers.
6. Responsive Design: Mobile-first approach with fluid layouts.
7. Security: Implement strict input validation, sanitize data, use secure headers (Helmet), and prevent common vulnerabilities (XSS, CSRF, SQLi).

CRITICAL: Listen to the user's exact requirements. If they ask for a simple app, a specific tool, or a non-professional app, DO NOT add unnecessary features like dashboards, authentication, or complex routing unless explicitly requested. Build exactly what they ask for.

Output Requirements:
<project name="Project Name" description="Technical description" review="Technical assessment">
  <file path="package.json" language="json">
    { "name": "my-app", ... }
  </file>
  <file path="src/App.tsx" language="typescript">
    import React from 'react';
    ...
  </file>
</project>

Ensure all critical configuration files (package.json, tsconfig.json, vite.config.ts) are included to make the project immediately buildable. The package.json MUST include a "dev" script that starts both the frontend and backend concurrently (e.g., using tsx and vite).`;

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface AppStructure {
  name: string;
  description: string;
  files: GeneratedFile[];
  review: string;
  conversationalText?: string;
}

// Helper to parse the streaming XML-like format
export const parseStreamingResponse = (text: string): { text: string, app: AppStructure | null } => {
  const result: { text: string, app: AppStructure | null } = { text: "", app: null };
  
  // Extract conversational text (everything outside <project>...</project>)
  const projectRegex = /<project[\s\S]*?<\/project>/;
  const matchProject = text.match(projectRegex);
  
  if (matchProject) {
    result.text = text.replace(projectRegex, '').trim();
    
    // Parse the project
    const app: AppStructure = { name: "Generating App...", description: "", review: "", files: [] };
    
    const nameMatch = text.match(/<project[^>]*name="([^"]*)"/);
    if (nameMatch) app.name = nameMatch[1];
    
    const descMatch = text.match(/<project[^>]*description="([^"]*)"/);
    if (descMatch) app.description = descMatch[1];
    
    const reviewMatch = text.match(/<project[^>]*review="([^"]*)"/);
    if (reviewMatch) app.review = reviewMatch[1];

    const fileRegex = /<file[^>]*path="([^"]*)"[^>]*language="([^"]*)"[^>]*>([\s\S]*?)(?:<\/file>|$)/g;
    let match;
    while ((match = fileRegex.exec(text)) !== null) {
      app.files.push({
        path: match[1],
        language: match[2],
        content: match[3].trim()
      });
    }
    
    result.app = app;
  } else {
    // If no project tag yet, the whole text might be conversational, or just starting to generate
    
    // If it looks like it's starting to generate a project, extract text before it
    if (text.includes('<project')) {
      result.text = text.split('<project')[0].trim();
      result.app = { name: "Generating App...", description: "", review: "", files: [] };
      
      const nameMatch = text.match(/<project[^>]*name="([^"]*)"/);
      if (nameMatch) result.app.name = nameMatch[1];
      
      const descMatch = text.match(/<project[^>]*description="([^"]*)"/);
      if (descMatch) result.app.description = descMatch[1];
      
      const fileRegex = /<file[^>]*path="([^"]*)"[^>]*language="([^"]*)"[^>]*>([\s\S]*?)(?:<\/file>|$)/g;
      let match;
      while ((match = fileRegex.exec(text)) !== null) {
        result.app.files.push({
          path: match[1],
          language: match[2],
          content: match[3].trim()
        });
      }
    } else {
      result.text = text.trim();
    }
  }

  return result;
};

export const generateApp = async (
  prompt: string, 
  currentApp?: AppStructure | null, 
  options?: { 
    useWebSearch?: boolean;
    modelConfig?: { provider: 'gemini' | 'ollama', ollamaEndpoint: string, ollamaModel: string };
    messages?: { role: 'user' | 'assistant', content: string }[];
  },
  onProgress?: (result: { text: string, app: AppStructure | null }) => void
): Promise<{ text: string, app: AppStructure | null }> => {
  let contents = `User request: ${prompt}`;
  
  if (options?.messages && options.messages.length > 1) {
    let history = "Conversation History:\n";
    for (const msg of options.messages.slice(0, -1)) { // Exclude the current prompt which is the last message
      history += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
    }
    contents = `${history}\n\n${contents}`;
  }

  if (currentApp) {
    // Convert current app back to XML format for context
    let xmlContext = `<project name="${currentApp.name}" description="${currentApp.description}">\n`;
    for (const file of currentApp.files) {
      xmlContext += `  <file path="${file.path}" language="${file.language}">\n${file.content}\n  </file>\n`;
    }
    xmlContext += `</project>`;
    contents = `I have an existing application. Here is the current codebase:\n\n${xmlContext}\n\n${contents}\n\nIf the request requires modifying the app, return the FULL updated application structure including all files (both modified and unmodified) so the app remains complete. DO NOT add unnecessary files, pages, or features unless explicitly requested by the user. If the request is just a question, respond conversationally.`;
  } else {
    contents = `${contents}\n\nIf the request requires building an app, return the FULL application structure. DO NOT add unnecessary files, pages, or features unless explicitly requested by the user. If the request is just a question, respond conversationally.`;
  }

  // Handle Ollama Provider
  if (options?.modelConfig?.provider === 'ollama') {
    try {
      const response = await fetch(`${options.modelConfig.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.modelConfig.ollamaModel,
          prompt: contents,
          system: SYSTEM_INSTRUCTION,
          stream: true,
          options: { num_ctx: 32000 }
        }),
      });

      if (!response.ok || !response.body) throw new Error(`Ollama API error: ${response.statusText}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullText += parsed.response;
              if (onProgress) onProgress(parseStreamingResponse(fullText));
            }
          } catch (e) {}
        }
      }
      return parseStreamingResponse(fullText);
    } catch (e) {
      console.error("Failed to generate with Ollama", e);
      throw new Error(`Ollama Generation Failed: Ensure your local Ollama instance is running, the model is pulled, and CORS is configured.`);
    }
  }

  // Default to Gemini Provider
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
  };

  if (options?.useWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents,
    config
  });

  let fullText = "";
  for await (const chunk of responseStream) {
    fullText += chunk.text;
    if (onProgress) {
      onProgress(parseStreamingResponse(fullText));
    }
  }

  return parseStreamingResponse(fullText);
};

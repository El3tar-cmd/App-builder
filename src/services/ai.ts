import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a Senior Neural Architect and Full-Stack Engineer. Your objective is to architect and implement high-fidelity, production-grade web applications ready for an advanced professional work environment.

Architecture Standards:
1. Framework: React 19 (Frontend) + Express 5 (Backend).
2. Styling: Tailwind CSS 4.0 with utility-first principles.
3. Icons: Lucide React for a consistent vector design language.
4. Logic: Use modern React hooks, context API for state, and robust error boundaries.
5. Backend: RESTful API design with proper middleware, validation, and security headers.
6. Responsive Design: Mobile-first approach with fluid layouts.
7. Security: Implement strict input validation, sanitize data, use secure headers (Helmet), and prevent common vulnerabilities (XSS, CSRF, SQLi).
8. Documentation: Provide comprehensive JSDoc comments, clear inline explanations for complex logic, and professional README-style documentation within the code.

Output Requirements:
You MUST output the project using the following exact XML-like format. Do not use markdown code blocks around the output.

<project name="Professional Project Name" description="Comprehensive technical description" review="A rigorous technical assessment of the codebase.">
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
}

// Helper to parse the streaming XML-like format
export const parseStreamingResponse = (text: string): AppStructure => {
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
  
  return app;
};

export const generateApp = async (
  prompt: string, 
  currentApp?: AppStructure | null, 
  options?: { 
    useWebSearch?: boolean;
    modelConfig?: { provider: 'gemini' | 'ollama', ollamaEndpoint: string, ollamaModel: string }
  },
  onProgress?: (partialApp: AppStructure) => void
): Promise<AppStructure> => {
  let contents = `Build me this app: ${prompt}`;
  if (currentApp) {
    // Convert current app back to XML format for context
    let xmlContext = `<project name="${currentApp.name}" description="${currentApp.description}">\n`;
    for (const file of currentApp.files) {
      xmlContext += `  <file path="${file.path}" language="${file.language}">\n${file.content}\n  </file>\n`;
    }
    xmlContext += `</project>`;
    contents = `I have an existing application. Here is the current codebase:\n\n${xmlContext}\n\nNow, please make the following modifications: ${prompt}\n\nReturn the FULL updated application structure including all files (both modified and unmodified) so the app remains complete.`;
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
        const lines = chunk.split('\n').filter(l => l.trim());
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

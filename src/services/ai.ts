import { GoogleGenAI, Type } from "@google/genai";

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

Special Instruction: Website Cloning
If the user provides a URL or asks to "clone" a website, analyze the visual and structural patterns of that domain (based on your internal knowledge) and synthesize a high-fidelity React implementation that captures its aesthetic, layout, and functionality while making it modular and editable.

Output Requirements:
Generate a single JSON object:
{
  "name": "Professional Project Name",
  "description": "Comprehensive technical description",
  "review": "A rigorous technical assessment of the codebase, covering security, performance, scalability, and documentation quality.",
  "files": [
    {
      "path": "src/App.tsx",
      "content": "...",
      "language": "typescript"
    }
  ]
}

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

export const generateApp = async (prompt: string, currentApp?: AppStructure | null): Promise<AppStructure> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  let contents = `Build me this app: ${prompt}`;
  if (currentApp) {
    contents = `I have an existing application named "${currentApp.name}". Here is the current codebase:\n\n${JSON.stringify(currentApp.files)}\n\nNow, please make the following modifications: ${prompt}\n\nReturn the FULL updated application structure including all files (both modified and unmodified) so the app remains complete.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          review: { type: Type.STRING, description: "A detailed review of the generated code, explaining why it is production-ready." },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                content: { type: Type.STRING },
                language: { type: Type.STRING }
              },
              required: ["path", "content", "language"]
            }
          }
        },
        required: ["name", "description", "files", "review"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AppStructure;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to generate app structure.");
  }
};

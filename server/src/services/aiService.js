import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: modelName }) : null;

/**
 * Refine Markdown content using Gemini
 * @param {Object} params
 * @param {string} params.content - Raw markdown content
 * @returns {Promise<string>} - Refined markdown content
 */
export async function refineMarkdown({ content }) {
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.status = 500;
    throw error;
  }

  if (!model) {
    const error = new Error("Gemini client not initialized");
    error.status = 500;
    throw error;
  }

  const systemPrompt = `You are a Markdown formatter. Clean and improve the input Markdown while preserving meaning.
- Keep headings hierarchy consistent.
- Fix bullet/numbered lists indentation.
- Normalize spacing and blank lines.
- Preserve code fences and language hints.
- Keep links and inline code intact.
- Do not add new content beyond light formatting.
Return only valid Markdown.`;

  const prompt = `${systemPrompt}\n\n---\n\n${content}`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8000,
    },
  });

  const refined = result?.response?.text()?.trim();

  if (!refined) {
    const error = new Error("Failed to generate formatted content");
    error.status = 500;
    throw error;
  }

  return refined;
}

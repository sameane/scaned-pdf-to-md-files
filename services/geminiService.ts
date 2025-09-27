
import { GoogleGenAI, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT = `You are an expert OCR and document formatting tool. Your task is to convert scanned textbook pages (provided as images) into a clean, structured Markdown file. Follow these instructions precisely for each page:

1.  **Extract Text:** Transcribe all text from the page verbatim, including questions, multiple-choice options, paragraphs, and any other textual content.
2.  **Format with Markdown:**
    *   Use appropriate heading levels (\`#\`, \`##\`, \`###\`) for titles and sections.
    *   Format questions by making the question number bold. For example: **1.** or **Q1.**
    *   Use ordered or unordered lists for multiple-choice options or enumerated points.
3.  **Describe Visuals:** If you encounter any images, graphs, charts, or diagrams that are referenced by the text (e.g., "look at the graph below"), you MUST add a descriptive section.
    *   This section must be under a \`### وصف الصور:\` heading.
    *   In this section, provide a detailed, objective description of the visual element. Describe all components, labels, axes (with their values), data points, trends, and any other relevant information shown. The goal is to make the question fully understandable without seeing the original image.
4.  **Strict Constraints:**
    *   DO NOT answer the questions.
    *   DO NOT summarize the content.
    *   DO NOT add any information that is not present in the images.
    *   Preserve the original language of the text exactly as it appears.
    *   Process the pages in the order they are provided and generate a single, continuous Markdown output.`;

export async function generateMarkdownFromImages(imageParts: Part[]): Promise<string> {
    const promptPart = { text: PROMPT };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [promptPart, ...imageParts] },
        });

        if (!response.text) {
             throw new Error("The API returned an empty response. The content may be blocked.");
        }
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate markdown from images. Please check the console for details.");
    }
}

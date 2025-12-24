import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateQuizFromTask(taskText: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Create 3 simple quiz questions to verify that someone actually completed this task:

Task: "${taskText}"

Rules:
- Questions must be factual
- No trick questions
- Short answers
- Return JSON only in this format:

{
  "questions": [
    { "question": "...", "answer": "..." }
  ]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
}

/**
 * Generate text using Gemini AI
 */
export async function generateText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

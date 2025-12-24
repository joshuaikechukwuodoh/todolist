import { generateText } from "@/lib/ai";
import { QUIZ } from "./constants";

export interface QuizQuestion {
  question: string;
  answer: string;
}

/**
 * Generate quiz questions for a task using AI
 */
export async function generateQuiz(
  taskTitle: string,
  taskDescription: string
): Promise<QuizQuestion[]> {
  const prompt = `You are a quiz generator. Generate exactly ${QUIZ.QUESTIONS_PER_QUIZ} quiz questions based on the following task:

Task Title: ${taskTitle}
Task Description: ${taskDescription}

Generate questions that test understanding of the task requirements, key concepts, or related knowledge.
Each question should have a clear, concise answer.

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "answer": "Answer text here"
  }
]

Requirements:
- Generate exactly ${QUIZ.QUESTIONS_PER_QUIZ} questions
- Questions should be relevant to the task
- Answers should be short (1-3 words ideally)
- Return ONLY the JSON array, no other text
- Do not include markdown code blocks or formatting`;

  try {
    const response = await generateText(prompt);

    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    // Parse the JSON response
    const questions = JSON.parse(cleanedResponse);

    // Validate the structure
    if (!Array.isArray(questions)) {
      throw new Error("AI response is not an array");
    }

    if (questions.length !== QUIZ.QUESTIONS_PER_QUIZ) {
      throw new Error(
        `Expected ${QUIZ.QUESTIONS_PER_QUIZ} questions, got ${questions.length}`
      );
    }

    // Validate each question has required fields
    for (const q of questions) {
      if (!q.question || !q.answer) {
        throw new Error("Invalid question format: missing question or answer");
      }
    }

    return questions as QuizQuestion[];
  } catch (error) {
    console.error("Quiz generation error:", error);

    // Fallback: generate generic questions
    return generateFallbackQuiz(taskTitle, taskDescription);
  }
}

/**
 * Generate fallback quiz questions if AI fails
 */
function generateFallbackQuiz(
  taskTitle: string,
  taskDescription: string
): QuizQuestion[] {
  return [
    {
      question: `What is the main objective of the task: "${taskTitle}"?`,
      answer: taskTitle.split(" ").slice(0, 3).join(" "),
    },
    {
      question: "What is the key focus of this task?",
      answer: "Understanding requirements",
    },
    {
      question: "What should be the outcome of this task?",
      answer: "Successful completion",
    },
    {
      question: "What is important to remember about this task?",
      answer: "Follow instructions",
    },
    {
      question: "What is the priority of this task?",
      answer: "High",
    },
  ];
}

/**
 * Validate quiz answers
 */
export function validateQuizAnswers(
  questions: QuizQuestion[],
  userAnswers: string[]
): { correct: number; total: number; score: number; passed: boolean } {
  let correct = 0;

  questions.forEach((q, i) => {
    const userAnswer = userAnswers[i]?.toLowerCase().trim() || "";
    const correctAnswer = q.answer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      correct++;
    }
  });

  const total = questions.length;
  const score = total > 0 ? correct / total : 0;
  const passed = score >= QUIZ.PASSING_SCORE;

  return { correct, total, score, passed };
}

/**
 * Check if quiz score is perfect
 */
export function isPerfectScore(score: number): boolean {
  return score >= QUIZ.PERFECT_SCORE;
}

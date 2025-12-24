import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quiz } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { validate } from "@/lib/zod_validation";

// Define the structure of quiz questions
interface QuizQuestion {
  question: string;
  answer: string;
}

const submitSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    // Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    const body = await request.json();
    const { quizId, answers } = validate(submitSchema, body);

    // Get quiz
    const [existingQuiz] = await db
      .select()
      .from(quiz)
      .where(eq(quiz.id, quizId))
      .limit(1);

    if (!existingQuiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Score quiz
    const questions = existingQuiz.questions as QuizQuestion[];
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        correct++;
      }
    });

    const score = correct / questions.length;
    const passed = score >= 0.6;

    // Save result
    await db.update(quiz).set({ passed }).where(eq(quiz.id, quizId));

    return NextResponse.json({
      passed,
      score,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json(
      { message: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

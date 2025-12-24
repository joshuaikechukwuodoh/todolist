import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task, quiz } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQuiz } from "@/lib/quiz";
import { z } from "zod";
import { validate } from "@/lib/zod_validation";

const generateSchema = z.object({
  taskId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    const body = await request.json();
    const { taskId } = validate(generateSchema, body);

    // Get task
    const [existingTask] = await db
      .select()
      .from(task)
      .where(eq(task.id, taskId))
      .limit(1);

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Verify task belongs to user
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Check if quiz already exists for this task
    const [existingQuiz] = await db
      .select()
      .from(quiz)
      .where(eq(quiz.taskId, taskId))
      .limit(1);

    if (existingQuiz) {
      return NextResponse.json(
        { message: "Quiz already exists for this task" },
        { status: 400 }
      );
    }

    // Generate quiz via AI
    const questions = await generateQuiz(
      existingTask.title,
      existingTask.description
    );

    // Save quiz
    const [newQuiz] = await db
      .insert(quiz)
      .values({
        taskId: existingTask.id,
        questions: questions,
        passed: false,
      })
      .returning();

    // Return questions WITHOUT answers
    return NextResponse.json({
      quizId: newQuiz.id,
      questions: questions.map((q) => ({
        question: q.question,
      })),
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { message: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

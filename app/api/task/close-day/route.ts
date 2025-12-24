import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task, quiz } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { awardReward, awardBonus } from "@/lib/economy";
import { REWARDS } from "@/lib/constants";
import { isPerfectScore } from "@/lib/quiz";

export async function POST(request: NextRequest) {
  try {
    // Check session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find all active tasks for user
    const activeTasks = await db
      .select()
      .from(task)
      .where(and(eq(task.userId, session.user.id), eq(task.status, "active")));

    if (activeTasks.length === 0) {
      return NextResponse.json(
        { message: "No active tasks to close" },
        { status: 400 }
      );
    }

    const results = [];

    // Process each active task
    for (const activeTask of activeTasks) {
      // Check if task has a quiz
      const [taskQuiz] = await db
        .select()
        .from(quiz)
        .where(eq(quiz.taskId, activeTask.id))
        .limit(1);

      let taskStatus = "failed";
      let coinsAwarded = 0;
      let bonusAwarded = 0;

      // If quiz exists and passed, mark as completed and award rewards
      if (taskQuiz && taskQuiz.passed) {
        taskStatus = "completed";

        // Award base completion reward
        await awardReward(
          session.user.id,
          REWARDS.TASK_COMPLETION,
          activeTask.id,
          "Task completion reward"
        );
        coinsAwarded += REWARDS.TASK_COMPLETION;

        // Award quiz pass bonus
        await awardBonus(
          session.user.id,
          REWARDS.QUIZ_PASS_BONUS,
          activeTask.id,
          "Quiz pass bonus"
        );
        bonusAwarded += REWARDS.QUIZ_PASS_BONUS;

        // Check for perfect score (if quiz data available)
        // Note: We'd need to store the score in the quiz table to check this
        // For now, we'll skip the perfect score bonus
      }

      // Update task status
      await db
        .update(task)
        .set({ status: taskStatus })
        .where(eq(task.id, activeTask.id));

      results.push({
        taskId: activeTask.id,
        title: activeTask.title,
        status: taskStatus,
        coinsAwarded,
        bonusAwarded,
        totalAwarded: coinsAwarded + bonusAwarded,
      });
    }

    // Calculate totals
    const totalCoins = results.reduce((sum, r) => sum + r.totalAwarded, 0);
    const completedCount = results.filter(
      (r) => r.status === "completed"
    ).length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    // Return response
    return NextResponse.json({
      message: "Day closed successfully",
      summary: {
        totalTasks: results.length,
        completed: completedCount,
        failed: failedCount,
        totalCoinsAwarded: totalCoins,
      },
      tasks: results,
    });
  } catch (error) {
    console.error("Error closing day:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

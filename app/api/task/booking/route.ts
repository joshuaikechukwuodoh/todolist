// app/api/task/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validate } from "@/lib/zod_validation";
import { z } from "zod";
import { db } from "@/db";
import { task } from "@/db/schema";
import { hasSufficientBalance, deductStake } from "@/lib/economy";
import { LIMITS } from "@/lib/constants";

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  stake: z.number().int().min(LIMITS.MIN_STAKE).max(LIMITS.MAX_STAKE),
});

export async function POST(request: NextRequest) {
  try {
    // Check session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse & validate body
    const body = await request.json();
    const { title, description, stake } = validate(taskSchema, body);

    // Check if user has sufficient balance
    const hasBalance = await hasSufficientBalance(session.user.id, stake);
    if (!hasBalance) {
      return NextResponse.json(
        { message: "Insufficient balance to stake on this task" },
        { status: 400 }
      );
    }

    // Define time window (morning → night)
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(22, 0, 0, 0); // 10 PM

    // Insert task
    const [newTask] = await db
      .insert(task)
      .values({
        userId: session.user.id,
        title,
        description,
        stake,
        status: "active",
        startTime,
        endTime,
      })
      .returning();

    // Deduct stake from user's wallet
    await deductStake(session.user.id, stake, newTask.id);

    // Return response
    return NextResponse.json(
      {
        task: newTask,
        message: `Task created! ${stake} coins staked.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating task:", error);

    return NextResponse.json(
      { message: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

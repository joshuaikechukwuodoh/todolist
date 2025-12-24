import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { task } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    //Check session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Define today's time window
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Query today's task
    const [todayTask] = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.userId, session.user.id),
          gte(task.startTime, startOfDay),
          lte(task.endTime, endOfDay)
        )
      )
      .limit(1);

    // Return result
    return NextResponse.json({
      task: todayTask ?? null,
    });
  } catch (error) {
    console.error("Error fetching today task:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

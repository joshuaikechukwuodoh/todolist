import { NextRequest, NextResponse } from "next/server";
import { getTopUsers } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  try {
    // Get query parameter for limit
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);

    // Get top users
    const leaderboard = await getTopUsers(limit);
    return NextResponse.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { message: "Failed to get leaderboard" },
      { status: 500 }
    );
  }
}

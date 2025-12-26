import { NextResponse } from "next/server";
import { getUserStats } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const userId = params.id;
  const stats = await getUserStats(userId);
  return NextResponse.json(stats);
}

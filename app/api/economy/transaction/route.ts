import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTransactionHistory, getTransactionCount } from "@/lib/economy";

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Get transaction history
    const transactions = await getTransactionHistory(userId, limit, offset);
    const total = await getTransactionCount(userId);

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { message: "Failed to get transactions" },
      { status: 500 }
    );
  }
}

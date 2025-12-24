import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserBalance } from "@/lib/economy";

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

    // Get user's balance
    const balance = await getUserBalance(userId);

    return NextResponse.json({
      balance,
      userId,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { message: "Failed to get balance" },
      { status: 500 }
    );
  }
}

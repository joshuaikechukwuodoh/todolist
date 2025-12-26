import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await auth.api.signOut({
      headers: request.headers,
    });

    return NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json(
      { message: "Failed to sign out" },
      { status: 500 }
    );
  }
}

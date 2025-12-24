import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "@/lib/zod_validation";
import { z } from "zod";

const resetPasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { currentPassword, newPassword } = validate(resetPasswordSchema, body);

    const user = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Failed to reset password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error resetting password:", error);

    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}   
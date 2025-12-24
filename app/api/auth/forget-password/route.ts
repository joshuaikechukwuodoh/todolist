import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "@/lib/zod_validation";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, redirectTo } = validate(forgotPasswordSchema, body);

    const user = await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Failed to send reset password email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error sending reset password email:", error);

    return NextResponse.json(
      { message: "Failed to send reset password email" },
      { status: 500 }
    );
  }
}

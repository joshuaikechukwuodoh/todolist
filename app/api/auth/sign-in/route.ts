import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "@/lib/zod_validation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password } = validate(signInSchema, body);

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Failed to sign in" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error signing in:", error);

    return NextResponse.json({ message: "Failed to sign in" }, { status: 500 });
  }
}

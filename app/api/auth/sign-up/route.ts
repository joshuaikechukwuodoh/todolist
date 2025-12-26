// app/api/auth/sign-up/route.ts

import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "@/lib/zod_validation";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]).default("user"),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, password, role } = validate(signUpSchema, body);

    // create auth user
    return await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role,
      },
      asResponse: true,
    });
  } catch (error) {
    console.error("Error signing up:", error);

    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

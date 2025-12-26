import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { db } from "../db";
import sendEmail from "../lib/mailer";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "user",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${url}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #007bff;">Reset Your Password</h2>
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your password. Click the button below to proceed:</p>
              <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777;">TodoApp - Gamified Task Management</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send reset password email:", error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${url}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #28a745;">Welcome to TodoApp!</h2>
              <p>Hello ${user.name},</p>
              <p>Please verify your email address to start managing your tasks and earning rewards:</p>
              <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="font-size: 12px; word-break: break-all;">${url}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777;">TodoApp - Gamified Task Management</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },
});

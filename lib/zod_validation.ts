import { z } from "zod";

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(result.error.issues.map((e) => e.message).join(", "));
  }

  return result.data;
}

import z from "zod";

export const RoleSchema = z.union([z.literal("teacher"), z.literal("student")]);

export const SignupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: RoleSchema,
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const ClassNameSchema = z.object({
  className: z.string(),
});
export type RoleInfer = z.infer<typeof RoleSchema>;
export type SignupInfer = z.infer<typeof SignupSchema>;
export type LoginInfer = z.infer<typeof LoginSchema>;

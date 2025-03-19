import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: "Username must be at least 2 characters long." })
      .max(25, { message: "Username cannot exceed 25 characters." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(25, { message: "Password cannot exceed 25 characters." }),

    password2: z
      .string()
      .min(8, {
        message: "Confirm Password must be at least 8 characters long.",
      })
      .max(25, { message: "Confirm Password cannot exceed 25 characters." }),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match.",
    path: ["password2"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface ActionResponse {
  success: boolean;
  message?: string;
}

export type User = {
  id: string;
  username: string;
};

export type SessionData = {
  user?: User;
};

import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: "Username must be at least 2 characters long." })
      .max(25, { message: "Username cannot exceed 25 characters." }),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
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

export const editUserSchema = z
  .object({
    username: z.string().min(3, "Username is required").readonly(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    old_password: z.string().optional(),
    password: z.string().optional(),
    password2: z.string().optional(),
  })
  .refine(
    (data) => !data.password || (data.password && data.old_password?.length),
    {
      message: "Old password is required to set a new password",
      path: ["old_password"],
    }
  )
  .refine((data) => !data.password || data.password.length >= 8, {
    message: "New password must be at least 8 characters",
    path: ["new_password"],
  })
  .refine(
    (data) =>
      !data.password ||
      (data.password &&
        data.old_password &&
        data.password !== data.old_password),
    {
      message: "New password cannot be the same as old password",
      path: ["new_password"],
    }
  )
  .refine(
    (data) =>
      !data.password ||
      (data.password && data.password2 && data.password === data.password2),
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }
  );
export type EditUserFormData = z.infer<typeof editUserSchema>;

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface ActionResponse {
  success: boolean;
  message?: string;
}

export type User = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
};
export type SessionUser = User & {
  isAdmin: boolean;
};

export type SessionData = {
  user?: SessionUser;
};

export const SESSION_TERMINATED_MESSAGE = "Session terminated";

export const audioFormSchema = z.object({
  file: z.any().refine((val) => val?.length === 1, "Audio file is required"),
  filename: z.string().min(1, "Filename is required"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Please select a category"),
});

export type AudioFormValues = z.infer<typeof audioFormSchema>;

export type CategoryData = {
  id: string;
  name: string;
};
export type Audio = {
  id: string;
  file_name: string;
  description: string;
  category_data: CategoryData;
  file_url: string;
  upload_date: string;
  user_id: string;
  owner: string;
};

export const audioEditFormSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Please select a category"),
});

export type AudioEditFormValues = z.infer<typeof audioEditFormSchema>;

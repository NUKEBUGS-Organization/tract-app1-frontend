import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),

    email: z.string().min(1, "Email is required").email("Enter a valid email"),

    phone: z
      .string()
      .min(10, "Enter a valid phone number")
      .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),

    dob: z.string().min(1, "Date of birth is required"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Confirm password is required"),

    state: z.string().min(1, "State is required"),

    role: z.enum(["seller", "wholesaler", "realtor", "admin"]),

    terms: z
      .boolean()
      .refine((value) => value === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
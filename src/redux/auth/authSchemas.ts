import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const today = new Date();

const minimumAgeDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),

  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Full name must not exceed 60 characters")
      .regex(/^[A-Za-z\s.'-]+$/, "Full name can only contain letters"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email"),

    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .refine((value) => value.startsWith("+"), {
        message: "Please include country code, for example +923001234567",
      })
      .refine((value) => {
        const phoneNumber = parsePhoneNumberFromString(value);

        return Boolean(phoneNumber && phoneNumber.isPossible());
      }, "Phone number length is invalid for this country")
      .refine((value) => {
        const phoneNumber = parsePhoneNumberFromString(value);

        return Boolean(phoneNumber && phoneNumber.isValid());
      }, "Enter a valid phone number"),

    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((value) => {
        const selectedDate = new Date(value);

        return !Number.isNaN(selectedDate.getTime());
      }, "Enter a valid date of birth")
      .refine((value) => {
        const selectedDate = new Date(value);

        return selectedDate <= minimumAgeDate;
      }, "You must be at least 18 years old"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string().min(1, "Confirm password is required"),

    state: z.string().min(1, "State is required"),

    role: z.enum(["seller", "wholesaler", "realtor"], {
      message: "Please select a role",
    }),

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
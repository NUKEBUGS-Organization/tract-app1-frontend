import { z } from "zod";
import { MAX_IMAGE_SIZE, MAX_IMAGES, MIN_IMAGES, STATES } from "./constants";

const currentYear = new Date().getFullYear();

const propertyTypes = ["sfh", "multi_family", "land"];
const states = STATES.map((state) => state.code);
const conditions = ["excellent", "good", "fair", "poor"];

const requiredText = (message: string) =>
  z.string().trim().min(1, message);

const requiredPositiveNumberString = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message,
    });

const optionalPositiveNumberString = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Number(value)) && Number(value) > 0),
      {
        message,
      }
    );

const optionalNonNegativeNumberString = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Number(value)) && Number(value) >= 0),
      {
        message,
      }
    );

export const step1Schema = z
  .object({
    propertyType: z.string().refine((value) => propertyTypes.includes(value), {
      message: "Please select a property type.",
    }),

    unitCount: z.string(),

    address: requiredText("Please enter street address."),

    state: z.string().refine((value) => states.includes(value), {
      message: "Please select state.",
    }),

    zip: z
      .string()
      .trim()
      .regex(/^\d{5}$/, "Please enter a valid 5-digit ZIP code."),
  })
  .superRefine((data, ctx) => {
    if (
      data.propertyType === "multi_family" &&
      (!data.unitCount || Number(data.unitCount) < 2)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["unitCount"],
        message: "Multi-family property must have at least 2 units.",
      });
    }
  });

export const step2Schema = z
  .object({
    zoning: requiredText("Please enter zoning."),

    yearBuilt: z
      .string()
      .trim()
      .min(1, "Please enter year built.")
      .refine(
        (value) => {
          const year = Number(value);
          return Number.isFinite(year) && year >= 1800 && year <= currentYear;
        },
        {
          message: `Year built must be between 1800 and ${currentYear}.`,
        }
      ),

    marketPrice: requiredPositiveNumberString(
      "Please enter a valid market price."
    ),

    hiddenReserve: optionalPositiveNumberString(
      "Hidden reserve must be greater than 0."
    ),

    hasLiens: z.boolean(),
    lienDetails: z.string(),

    isPreforeclosure: z.boolean(),

    mortgageAmount: optionalNonNegativeNumberString(
      "Mortgage amount cannot be negative."
    ),
  })
  .superRefine((data, ctx) => {
    if (
      data.hiddenReserve &&
      Number(data.hiddenReserve) > Number(data.marketPrice)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["hiddenReserve"],
        message: "Hidden reserve should not be greater than market price.",
      });
    }

    if (data.hasLiens && !data.lienDetails.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["lienDetails"],
        message: "Please enter lien disclosure details.",
      });
    }
  });

export const step3Schema = z.object({
  roofCondition: z.string().refine((value) => conditions.includes(value), {
    message: "Please select roof condition.",
  }),

  hvacCondition: z.string().refine((value) => conditions.includes(value), {
    message: "Please select HVAC condition.",
  }),

  overallCondition: z.string().refine((value) => conditions.includes(value), {
    message: "Please select overall condition.",
  }),

  conditionNotes: z.string(),

  hasWetlands: z.boolean(),
  isVacant: z.boolean(),
  isOffMarket: z.boolean(),
});

export const step4Schema = z.object({
  timeline: requiredText("Please select desired timeline."),

  reason: requiredText("Please select reason for selling."),

  realtorCommission: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 100),
      {
        message: "Realtor commission must be between 0 and 100.",
      }
    ),

  proofOfFundsRequired: z.boolean(),
});

export const listingFormSchema = step1Schema
  .and(step2Schema)
  .and(step3Schema)
  .and(step4Schema);

export type FormState = z.infer<typeof listingFormSchema>;

export const imageFilesSchema = z
  .array(z.instanceof(File))
  .min(MIN_IMAGES, "Please select at least 1 property picture.")
  .max(MAX_IMAGES, "You can upload a maximum of 10 property pictures.")
  .refine((files) => files.every((file) => file.type.startsWith("image/")), {
    message: "Only image files are allowed for property pictures.",
  })
  .refine((files) => files.every((file) => file.size <= MAX_IMAGE_SIZE), {
    message: "Each property picture must be 5 MB or smaller.",
  });
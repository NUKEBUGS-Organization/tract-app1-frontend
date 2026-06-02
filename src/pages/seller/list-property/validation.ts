import {
  imageFilesSchema,
  listingFormSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "./schema";
import type { FormState } from "./types";

function getFirstError(error: any) {
  return error?.issues?.[0]?.message || "Please fix the highlighted fields.";
}

export function validateStep(step: number, form: FormState) {
  const schemaByStep: Record<number, any> = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
  };

  const schema = schemaByStep[step];

  if (!schema) {
    return null;
  }

  const result = schema.safeParse(form);

  if (!result.success) {
    return getFirstError(result.error);
  }

  return null;
}

export function validateFullForm(form: FormState) {
  for (let step = 1; step <= 4; step += 1) {
    const error = validateStep(step, form);

    if (error) {
      return {
        step,
        error,
      };
    }
  }

  const result = listingFormSchema.safeParse(form);

  if (!result.success) {
    return {
      step: 1,
      error: getFirstError(result.error),
    };
  }

  return null;
}

export function validateImages(files: File[]) {
  const result = imageFilesSchema.safeParse(files);

  if (!result.success) {
    return getFirstError(result.error);
  }

  return null;
}
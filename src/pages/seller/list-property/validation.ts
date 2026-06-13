import {
  imageFilesSchema,
  listingFormSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "./schema";
import type { FormState } from "./types";

export type FieldErrors = Record<string, string>;

export type ValidationResult = {
  error: string;
  fieldErrors: FieldErrors;
};

function getFirstError(error: any) {
  return error?.issues?.[0]?.message || "Please fix the highlighted fields.";
}

function getIssuePath(issue: any) {
  return issue?.path?.join(".") || "form";
}

function getFieldErrors(error: any): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error?.issues || []) {
    const path = getIssuePath(issue);

    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}

function getValidationResult(error: any): ValidationResult {
  return {
    error: getFirstError(error),
    fieldErrors: getFieldErrors(error),
  };
}

function getStepSchema(step: number) {
  const schemaByStep: Record<number, any> = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
  };

  return schemaByStep[step] || null;
}

/*
  Old function kept only in case some old code still imports it.
*/
export function validateStep(step: number, form: FormState) {
  const schema = getStepSchema(step);

  if (!schema) return null;

  const result = schema.safeParse(form);

  if (!result.success) {
    return getFirstError(result.error);
  }

  return null;
}

/*
  New function for red field borders + reason under field.
*/
export function validateStepWithFields(
  step: number,
  form: FormState
): ValidationResult | null {
  const schema = getStepSchema(step);

  if (!schema) return null;

  const result = schema.safeParse(form);

  if (!result.success) {
    return getValidationResult(result.error);
  }

  return null;
}

/*
  Old function kept only in case some old code still imports it.
*/
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

/*
  New function for final Create Draft button.
*/
export function validateFullFormWithFields(form: FormState) {
  for (let step = 1; step <= 4; step += 1) {
    const validation = validateStepWithFields(step, form);

    if (validation) {
      return {
        step,
        error: validation.error,
        fieldErrors: validation.fieldErrors,
      };
    }
  }

  const result = listingFormSchema.safeParse(form);

  if (!result.success) {
    const validation = getValidationResult(result.error);

    return {
      step: 1,
      error: validation.error,
      fieldErrors: validation.fieldErrors,
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
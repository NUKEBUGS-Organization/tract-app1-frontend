import type { BidFormState } from "./types";

interface ValidationResult {
  error: string;
  fieldErrors: Record<string, string>;
  step: number;
}

// Step 1: bid_price only
export function validateStep1(form: BidFormState): ValidationResult | null {
  const errors: Record<string, string> = {};

  if (!form.bid_price || Number(form.bid_price) <= 0) {
    errors.bid_price = "A valid bid price is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { error: "Please enter a valid bid price.", fieldErrors: errors, step: 1 };
  }
  return null;
}

// Step 2: inspection_period and due_diligence_period
export function validateStep2(form: BidFormState): ValidationResult | null {
  const errors: Record<string, string> = {};

  if (form.inspection_period === null) {
    errors.inspection_period = "Select an inspection period: 3, 7, or 10 days.";
  }

  if (form.due_diligence_period === null) {
    errors.due_diligence_period = "Select a due diligence period: 5, 10, or 15 business days.";
  }

  if (Object.keys(errors).length > 0) {
    return { error: "Please complete all required terms.", fieldErrors: errors, step: 2 };
  }
  return null;
}

export function validateBidForm(form: BidFormState): ValidationResult | null {
  return validateStep1(form) || validateStep2(form);
}

export function validateStepWithFields(
  step: number,
  form: BidFormState
): ValidationResult | null {
  if (step === 1) return validateStep1(form);
  if (step === 2) return validateStep2(form);
  return null;
}

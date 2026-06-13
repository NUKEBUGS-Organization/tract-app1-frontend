import type { BidFormState } from "./types";

interface ValidationResult {
  error: string;
  fieldErrors: Record<string, string>;
  step: number;
}

export function validateStep1(form: BidFormState): ValidationResult | null {
  const errors: Record<string, string> = {};

  if (!form.offerAmount || Number(form.offerAmount) <= 0) {
    errors.offerAmount = "A valid offer amount is required.";
  }

  if (!form.earnestMoney || Number(form.earnestMoney) < 0) {
    errors.earnestMoney = "Earnest money deposit amount is required.";
  }

  if (!form.buyerType) {
    errors.buyerType = "Please select your buyer type.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: "Please fill in all required bid fields.",
      fieldErrors: errors,
      step: 1,
    };
  }

  return null;
}

export function validateStep2(form: BidFormState): ValidationResult | null {
  const errors: Record<string, string> = {};

  if (!form.closingTimeline) {
    errors.closingTimeline = "Please select a closing timeline.";
  }

  if (!form.inspectionPeriodDays || Number(form.inspectionPeriodDays) < 0) {
    errors.inspectionPeriodDays = "Inspection period in days is required.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: "Please complete all due diligence fields.",
      fieldErrors: errors,
      step: 2,
    };
  }

  return null;
}

export function validateBidForm(
  form: BidFormState
): ValidationResult | null {
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

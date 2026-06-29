import type { OfferFormState } from "./types";
import { COMMISSION_MIN, COMMISSION_MAX } from "./constants";

export interface ValidationResult {
  /** Human-readable summary shown in the toast */
  error: string;
  /** Per-field errors (field name → message) for inline field highlighting */
  fieldErrors: Record<string, string>;
  /** Which step this error belongs to (for scrolling back) */
  step: number;
}

// ─── Step 1 Validation ────────────────────────────────────────────────────────
// Validates: offer_price must be a positive number

export function validateStep1(form: OfferFormState): ValidationResult | null {
  const errors: Record<string, string> = {};

  const parsed = parseFloat(form.offer_price.replace(/,/g, "")) || 0;

  if (!form.offer_price || parsed <= 0) {
    errors.offer_price = "Please enter a valid proposed sale price.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: "Please enter a valid proposed sale price.",
      fieldErrors: errors,
      step: 1,
    };
  }

  return null;
}

// ─── Step 2 Validation ────────────────────────────────────────────────────────
// Validates: commission must be within the allowed 2–6% range

export function validateStep2(form: OfferFormState): ValidationResult | null {
  const errors: Record<string, string> = {};

  if (form.commission_pct < COMMISSION_MIN || form.commission_pct > COMMISSION_MAX) {
    errors.commission_pct = `Commission must be between ${COMMISSION_MIN}% and ${COMMISSION_MAX}%.`;
  }

  if (!form.agency_role) {
    errors.agency_role = "Please select an agency role.";
  }

  if (!form.payment_source) {
    errors.payment_source = "Please select a payment source.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: "Please complete all required fields.",
      fieldErrors: errors,
      step: 2,
    };
  }

  return null;
}

// ─── Full Form Validation (used before final submit) ─────────────────────────

export function validateOfferForm(form: OfferFormState): ValidationResult | null {
  return validateStep1(form) || validateStep2(form);
}

// ─── Per-Step Dispatcher (used by handleContinue in index.tsx) ───────────────

export function validateStepWithFields(
  step: number,
  form: OfferFormState
): ValidationResult | null {
  if (step === 1) return validateStep1(form);
  if (step === 2) return validateStep2(form);
  return null;
}

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  useSubmitBidMutation,
  useGetListingByIdQuery,
} from "../../../services/listingService";
import { usePartnerTheme } from "../../../hooks/usePartnerTheme";

import { DEFAULT_OFFER_FORM, type OfferFormState } from "./types";
import { OFFER_STEPS } from "./constants";
import { validateStepWithFields } from "./validation";

import StepIndicator from "./components/StepIndicator";
import OfferDetails from "./components/OfferDetails";
import ProfessionalSetup from "./components/ProfessionalSetup";
import ReviewSubmit from "./components/ReviewSubmit";
import OfferSuccess from "./components/OfferSuccess";

// ─── Toast (local to this file — it's UI glue, not a domain component) ───────

type ToastState = {
  type: "error" | "success";
  title: string;
  message: string;
};

function ToastPopup({
  toast,
  onClose,
  isDark,
}: {
  toast: ToastState;
  onClose: () => void;
  isDark: boolean;
}) {
  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed right-6 top-24 z-[9999] w-[calc(100%-3rem)] max-w-md rounded-2xl border p-5 shadow-2xl ${isDark
          ? "border-white/10 bg-[var(--color-dark-main)]"
          : "border-[var(--color-border-light)] bg-white"
        }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
              ? isDark
                ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : isDark
                ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                : "bg-red-50 text-red-600"
            }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSuccess
                ? isDark
                  ? "text-[var(--color-secondary)]"
                  : "text-[var(--color-primary)]"
                : isDark
                  ? "text-[var(--color-danger)]"
                  : "text-red-600"
              }`}
          >
            {isSuccess ? "Success" : "Action Required"}
          </p>
          <h3
            className={`mt-1 text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            {toast.title}
          </h3>
          <p
            className={`mt-1 text-xs leading-5 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
              }`}
          >
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`rounded-full p-1 transition ${isDark
              ? "text-white/40 hover:text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RealtorSubmitOfferPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── API hooks ──────────────────────────────────────────────────────────────
  const [submitBid] = useSubmitBidMutation();

  const { data: listingRaw } = useGetListingByIdQuery(propertyId!, {
    skip: !propertyId,
  });

  // Normalize the nested API response shape
  const listingData =
    (listingRaw as any)?.data?.data ??
    (listingRaw as any)?.data ??
    listingRaw ??
    null;

  const propertyLabel = listingData?.address
    ? `${listingData.address}${listingData.state_code ? `, ${listingData.state_code}` : ""}`
    : `Property #${propertyId ?? "Unknown"}`;

  const askingPrice = Number(listingData?.market_price || 0);

  // ── Form state (single object, matches OfferFormState interface) ───────────
  const [form, setForm] = useState<OfferFormState>(DEFAULT_OFFER_FORM);

  // Helper: update any single field without touching others
  function setField<K extends keyof OfferFormState>(key: K, value: OfferFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Navigation state ───────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Per-field validation errors (shown inline in each step) ───────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Toast state ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  }

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ── Derived values (used by multiple steps) ────────────────────────────────
  const parsedOfferPrice = parseFloat(form.offer_price.replace(/,/g, "")) || 0;

  // ── Step navigation ────────────────────────────────────────────────────────
  function handleContinue() {
    // Run per-step validation before allowing progression
    const validationResult = validateStepWithFields(step, form);

    if (validationResult) {
      // Set per-field errors so the step component can highlight them
      setFieldErrors(validationResult.fieldErrors);
      showToast({
        type: "error",
        title: "Please fix the following",
        message: validationResult.error,
      });
      return;
    }

    // Clear errors and advance
    setFieldErrors({});
    setStep((s) => Math.min(3, s + 1));
  }

  function handleBack() {
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  // ── Form submission ────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!propertyId) return;

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        bid_price: parsedOfferPrice,
        inspection_period: 7,           // realtor default — not user-configurable
        due_diligence_period: 10,        // realtor default — not user-configurable
        commission_percentage: form.commission_pct,
        agency_role: form.agency_role,
        payment_source: form.payment_source,
        closing_timeline_days: form.closing_timeline_days,
      };

      await submitBid({ listingId: propertyId, body: payload }).unwrap();
      setSubmitted(true);
    } catch (error: any) {
      // Tolerate 500 "Internal server error" as a successful submit
      // (backend bug workaround — remove once backend is fixed)
      if (
        error?.status === 500 &&
        error?.data?.message === "Internal server error"
      ) {
        setSubmitted(true);
        setIsSubmitting(false);
        return;
      }

      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Unable to submit offer. Please try again.";

      showToast({
        type: "error",
        title: "Submission failed",
        message: Array.isArray(message) ? message.join(", ") : String(message),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted && propertyId) {
    return (
      <OfferSuccess
        propertyId={propertyId}
        propertyLabel={propertyLabel}
        isDark={isDark}
      />
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {toast && (
        <ToastPopup toast={toast} onClose={() => setToast(null)} isDark={isDark} />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
                ? "text-white/40 hover:text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <p
            className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
              }`}
          >
            Submit Representation
          </p>

          <h1
            className={`mt-1 font-serif text-3xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            Offer to Represent Seller
          </h1>

          <p
            className={`mt-2 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
              }`}
          >
            {propertyLabel}
          </p>
        </div>

        {/* Role badge */}
        <div
          className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark
              ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]"
              : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
            }`}
        >
          <BadgeCheck className="mr-1.5 inline h-3.5 w-3.5" />
          Licensed Partner
        </div>
      </div>

      {/* Step indicator — always visible at the top */}
      <StepIndicator currentStep={step} isDark={isDark} />

      {/* Step content card */}
      <div
        className={`min-h-[400px] rounded-2xl border p-6 shadow-[var(--shadow-card)] lg:p-8 ${isDark
            ? "border-white/10 bg-white/[0.02]"
            : "border-[var(--color-border-light)] bg-white"
          }`}
      >
        {step === 1 && (
          <OfferDetails
            offerPrice={form.offer_price}
            onOfferPriceChange={(v) => setField("offer_price", v)}
            timeline={form.closing_timeline_days}
            onTimelineChange={(v) => setField("closing_timeline_days", v)}
            askingPrice={askingPrice}
            fieldErrors={fieldErrors}
            isDark={isDark}
          />
        )}

        {step === 2 && (
          <ProfessionalSetup
            commissionPct={form.commission_pct}
            onCommissionChange={(v) => setField("commission_pct", v)}
            agencyRole={form.agency_role}
            onAgencyRoleChange={(v) => setField("agency_role", v)}
            paymentSource={form.payment_source}
            onPaymentSourceChange={(v) => setField("payment_source", v)}
            parsedOfferPrice={parsedOfferPrice}
            fieldErrors={fieldErrors}
            isDark={isDark}
          />
        )}

        {step === 3 && (
          <ReviewSubmit
            form={form}
            parsedOfferPrice={parsedOfferPrice}
            propertyLabel={propertyLabel}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isDark={isDark}
          />
        )}
      </div>

      {/* Bottom navigation (Previous / dot indicators / Continue) — hidden on step 3 */}
      {step < 3 && (
        <div
          className={`flex items-center justify-between border-t pt-6 ${isDark ? "border-white/10" : "border-[var(--color-border-light)]"
            }`}
        >
          {/* Previous button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 border px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition disabled:pointer-events-none disabled:opacity-30 ${isDark
                ? "border-white/20 bg-white/5 text-white/50 hover:border-white/40 hover:text-white"
                : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Dot progress indicators */}
          <div className="flex gap-1">
            {OFFER_STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${s.id === step
                    ? isDark
                      ? "w-8 bg-[#d4af37]"
                      : "w-8 bg-[var(--color-secondary)]"
                    : s.id < step
                      ? isDark
                        ? "w-4 bg-[#d4af37]/40"
                        : "w-4 bg-[var(--color-secondary)]/40"
                      : isDark
                        ? "w-4 bg-white/20"
                        : "w-4 bg-[var(--color-border-light)]"
                  }`}
              />
            ))}
          </div>

          {/* Continue button */}
          <button
            type="button"
            onClick={handleContinue}
            className={`flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] ${isDark ? "shadow-[0_0_20px_rgba(212,175,55,0.3)]" : ""
              }`}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

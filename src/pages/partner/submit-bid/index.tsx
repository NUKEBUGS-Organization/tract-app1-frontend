import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gavel,
  X,
} from "lucide-react";

import {
  useSubmitBidMutation,
  useGetListingByIdQuery,
} from "../../../services/listingService";

import { BID_STEPS } from "./constants";
import { DEFAULT_BID_FORM, type BidFormState } from "./types";
import { validateStepWithFields } from "./validation";

import BidStepIndicator from "./components/StepIndicator";
import BidDetails from "./components/BidDetails";
import DueDiligence from "./components/DueDiligence";
import SubmitBid from "./components/SubmitBid";
import { usePartnerTheme } from "../../../hooks/usePartnerTheme";

type ToastState = {
  type: "error" | "success";
  title: string;
  message: string;
};

function ToastPopup({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";
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

function BidSuccessState({
  propertyId,
  propertyLabel,
}: {
  propertyId: string;
  propertyLabel: string;
}) {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-4 ${isDark
            ? "bg-[var(--color-secondary)]/15 ring-[var(--color-secondary)]/20"
            : "bg-[var(--color-primary)]/10 ring-[var(--color-primary)]/20"
            }`}
        >
          <CheckCircle2
            className={`h-10 w-10 ${isDark
              ? "text-[var(--color-secondary)]"
              : "text-[var(--color-primary)]"
              }`}
          />
        </div>

        <h1
          className={`font-serif text-3xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Bid Submitted!
        </h1>

        <p
          className={`mt-3 text-sm leading-6 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Your offer on{" "}
          <span className={`font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
            {propertyLabel}
          </span>{" "}
          has been submitted. The seller will be notified and you'll receive an
          update soon.
        </p>

        <div
          className={`mt-6 rounded-2xl border p-5 text-left ${isDark
            ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5"
            : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
            }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            What happens next?
          </p>
          <ul className="mt-3 space-y-2">
            {[
              "Seller reviews your bid within 24–72 hours",
              "You may receive a counter-offer or acceptance",
              "Track deal progress in Active Deals",
            ].map((item) => (
              <li
                key={item}
                className={`flex items-start gap-2 text-[12px] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
                  }`}
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-secondary)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/my-bids"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
          >
            <Gavel className="h-4 w-4" />
            View My Bids
          </Link>

          <Link
            to={`/properties/${propertyId}`}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${isDark
              ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
              : "border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
              }`}
          >
            Back to Property
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubmitBidPage() {
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const [submitBid] = useSubmitBidMutation();

  // Fetch listing to get real property label
  const { data: listingRaw } = useGetListingByIdQuery(propertyId!, {
    skip: !propertyId,
  });
  const listingData =
    listingRaw?.data?.data ?? listingRaw?.data ?? listingRaw ?? null;
  const propertyLabel = listingData?.address
    ? `${listingData.address}${listingData.state_code ? `, ${listingData.state_code}` : ""
    }`
    : `Property #${propertyId ?? "Unknown"}`;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BidFormState>(DEFAULT_BID_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function set<K extends keyof BidFormState>(key: K, value: BidFormState[K]) {
    clearFieldError(String(key));
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleContinue = () => {
    const validation = validateStepWithFields(step, form);
    if (validation) {
      setFieldErrors(validation.fieldErrors);
      showToast({
        type: "error",
        title: "Please fix highlighted fields",
        message: validation.error,
      });
      return;
    }
    setFieldErrors({});
    setStep((s) => Math.min(3, s + 1));
  };

  const handleSubmit = async () => {
    if (!propertyId) return;

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        bid_price: Number(form.bid_price),
        inspection_period: form.inspection_period,
        due_diligence_period: form.due_diligence_period,
      };

      if (form.loi_url.trim()) payload.loi_url = form.loi_url.trim();
      if (form.proof_of_funds_url.trim())
        payload.proof_of_funds_url = form.proof_of_funds_url.trim();

      await submitBid({ listingId: propertyId, body: payload }).unwrap();
      setSubmitted(true);
    } catch (error: any) {
      if (error?.status === 500 && error?.data?.message === "Internal server error") {
        setSubmitted(true);
        setIsSubmitting(false);
        return;
      }

      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Unable to submit bid. Please try again.";
      showToast({
        type: "error",
        title: "Submission failed",
        message: Array.isArray(message) ? message.join(", ") : String(message),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && propertyId) {
    return (
      <BidSuccessState propertyId={propertyId} propertyLabel={propertyLabel} />
    );
  }

  return (
    <div className="space-y-8">
      {toast && <ToastPopup toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
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

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Submit Offer
          </p>
          <h1
            className={`mt-1 font-serif text-3xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            Place Your Bid
          </h1>

        </div>

        <div
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border ${isDark
            ? "border-white/10 bg-white/5 text-white/40"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
            }`}
        >
          Secure Offer
        </div>
      </div>

      {/* Step Indicator */}
      <div className="overflow-x-auto pb-2">
        <BidStepIndicator current={step} />
      </div>

      {/* Step Content */}
      <div
        className={`min-h-[400px] rounded-2xl border p-6 lg:p-8 ${isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-[var(--color-border-light)] bg-white"
          }`}
      >
        {step === 1 && (
          <BidDetails
            form={form}
            fieldErrors={fieldErrors}
            set={set}
            askingPrice={listingData?.market_price ? Number(listingData.market_price) : undefined}
          />
        )}
        {step === 2 && (
          <DueDiligence form={form} fieldErrors={fieldErrors} set={set} />
        )}
        {step === 3 && (
          <SubmitBid
            form={form}
            propertyLabel={propertyLabel}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation — steps 1 & 2 */}
      {step < 3 && (
        <div
          className={`flex items-center justify-between border-t pt-6 ${isDark ? "border-white/8" : "border-[var(--color-border-light)]"
            }`}
        >
          <button
            type="button"
            onClick={() => {
              setFieldErrors({});
              setStep((s) => Math.max(1, s - 1));
            }}
            disabled={step === 1}
            className={`flex items-center gap-2 border px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition disabled:pointer-events-none disabled:opacity-30 ${isDark
              ? "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white"
              : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex gap-1">
            {BID_STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${s.id === step
                  ? "w-8 bg-[var(--color-secondary)]"
                  : s.id < step
                    ? isDark
                      ? "w-4 bg-[var(--color-secondary)]/40"
                      : "w-4 bg-[var(--color-secondary)]/40"
                    : isDark
                      ? "w-4 bg-white/10"
                      : "w-4 bg-[var(--color-border-light)]"
                  }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation — step 3 edit back */}
      {step === 3 && (
        <div
          className={`border-t pt-6 ${isDark ? "border-white/8" : "border-[var(--color-border-light)]"
            }`}
        >
          <button
            type="button"
            onClick={() => {
              setFieldErrors({});
              setStep(2);
            }}
            className={`flex items-center gap-2 border px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
              ? "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white"
              : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Edit Bid
          </button>
        </div>
      )}
    </div>
  );
}
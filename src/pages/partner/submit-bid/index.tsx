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

/* ─── Toast ─────────────────────────────────────────────────────────── */
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
  const isSuccess = toast.type === "success";
  return (
    <div className="fixed right-6 top-24 z-[9999] w-[calc(100%-3rem)] max-w-md rounded-2xl border border-white/10 bg-[var(--color-dark-main)] p-5 shadow-2xl">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
              ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
              : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
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
                ? "text-[var(--color-secondary)]"
                : "text-[var(--color-danger)]"
              }`}
          >
            {isSuccess ? "Success" : "Action Required"}
          </p>
          <h3 className="mt-1 text-sm font-black text-white">{toast.title}</h3>
          <p className="mt-1 text-xs leading-5 text-white/50">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/40 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Success state ─────────────────────────────────────────────────── */
function BidSuccessState({
  propertyId,
  propertyLabel,
}: {
  propertyId: string;
  propertyLabel: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary)]/15 ring-4 ring-[var(--color-secondary)]/20">
          <CheckCircle2 className="h-10 w-10 text-[var(--color-secondary)]" />
        </div>

        <h1 className="font-serif text-3xl font-black text-white">
          Bid Submitted!
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Your offer on{" "}
          <span className="font-bold text-white">{propertyLabel}</span> has been
          submitted. The seller will be notified and you'll receive an update
          within 72 hours.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 p-5 text-left">
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
                className="flex items-start gap-2 text-[12px] text-white/60"
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-secondary)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/deals"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
          >
            <Gavel className="h-4 w-4" />
            View My Deals
          </Link>

          <Link
            to={`/properties/${propertyId}`}
            className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/5 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
          >
            Back to Property
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function SubmitBidPage() {
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
        inspection_period: form.inspection_period,       // 3 | 7 | 10
        due_diligence_period: form.due_diligence_period, // 5 | 10 | 15
      };

      // Optional fields — only include if user provided them
      if (form.loi_url.trim()) payload.loi_url = form.loi_url.trim();
      if (form.proof_of_funds_url.trim())
        payload.proof_of_funds_url = form.proof_of_funds_url.trim();

      await submitBid({ listingId: propertyId, body: payload }).unwrap();
      setSubmitted(true);
    } catch (error: any) {
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
            className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Submit Offer
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black text-white">
            Place Your Bid
          </h1>
          <p className="mt-1 text-sm text-white/50">{propertyLabel}</p>
        </div>

        <div className="border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Secure Offer
        </div>
      </div>

      {/* Step Indicator */}
      <div className="overflow-x-auto pb-2">
        <BidStepIndicator current={step} />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
        {step === 1 && (
          <BidDetails form={form} fieldErrors={fieldErrors} set={set} />
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
        <div className="flex items-center justify-between border-t border-white/8 pt-6">
          <button
            type="button"
            onClick={() => {
              setFieldErrors({});
              setStep((s) => Math.max(1, s - 1));
            }}
            disabled={step === 1}
            className="flex items-center gap-2 border border-white/10 bg-white/5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 transition hover:border-white/25 hover:text-white disabled:pointer-events-none disabled:opacity-30"
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
                      ? "w-4 bg-[var(--color-secondary)]/40"
                      : "w-4 bg-white/10"
                  }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation — step 3 edit back */}
      {step === 3 && (
        <div className="border-t border-white/8 pt-6">
          <button
            type="button"
            onClick={() => {
              setFieldErrors({});
              setStep(2);
            }}
            className="flex items-center gap-2 border border-white/10 bg-white/5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 transition hover:border-white/25 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Edit Bid
          </button>
        </div>
      )}
    </div>
  );
}

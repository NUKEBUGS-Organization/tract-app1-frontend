import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Handshake,
  X,
} from "lucide-react";
import {
  useSubmitBidMutation,
  useGetListingByIdQuery,
} from "../../services/listingService";

// Commission % → Net-to-seller calculator
function calcNetToSeller(price: number, commissionPct: number): number {
  return price - price * (commissionPct / 100);
}

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

type ToastState = {
  type: "error" | "success";
  title: string;
  message: string;
};

function ToastPopup({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const isSuccess = toast.type === "success";
  return (
    <div className="fixed right-6 top-24 z-[9999] w-[calc(100%-3rem)] max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-2xl">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
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
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSuccess ? "text-[var(--color-primary)]" : "text-red-600"
              }`}
          >
            {isSuccess ? "Success" : "Action Required"}
          </p>
          <h3 className="mt-1 text-sm font-black text-[var(--color-primary)]">
            {toast.title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function OfferSuccessState({
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

        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Offer Submitted!
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          Your representation offer for{" "}
          <span className="font-bold text-[var(--color-primary)]">{propertyLabel}</span>{" "}
          has been submitted. The seller will review your offer shortly.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-5 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            What happens next?
          </p>
          <ul className="mt-3 space-y-2">
            {[
              "Seller reviews your offer and commission structure",
              "You may be selected as Primary or Backup Partner",
              "Once selected, sign the listing agreement in-app",
              "Launch marketing within 7 days to avoid kill switch",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[12px] text-[var(--color-text-muted)]"
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
            <Handshake className="h-4 w-4" />
            View My Offers
          </Link>
          <Link
            to={`/properties/${propertyId}`}
            className="inline-flex items-center justify-center gap-2 border border-[var(--color-border-light)] bg-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)]"
          >
            Back to Property
          </Link>
        </div>
      </div>
    </div>
  );
}

const TIMELINE_OPTIONS = [
  { value: 30, label: "30 Days" },
  { value: 45, label: "45 Days" },
  { value: 60, label: "60 Days" },
];

const COMMISSION_OPTIONS = [2, 2.5, 3];

const AGENCY_ROLES = ["Listing Agent", "Transaction Coordinator"];
const PAYMENT_SOURCES = ["Seller Pays Commission", "Buyer Pays Commission"];

const STEPS = [
  { id: 1, label: "Offer Details", icon: DollarSign },
  { id: 2, label: "Professional Setup", icon: BadgeCheck },
  { id: 3, label: "Review & Submit", icon: FileText },
];

export default function RealtorSubmitOfferPage() {
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submitBid] = useSubmitBidMutation();

  const { data: listingRaw } = useGetListingByIdQuery(propertyId!, {
    skip: !propertyId,
  });
  const listingData =
    (listingRaw as any)?.data?.data ?? (listingRaw as any)?.data ?? listingRaw ?? null;
  const propertyLabel = listingData?.address
    ? `${listingData.address}${listingData.state_code ? `, ${listingData.state_code}` : ""}`
    : `Property #${propertyId ?? "Unknown"}`;

  const askingPrice = Number(listingData?.market_price || 0);

  // Form state
  const [step, setStep] = useState(1);
  const [offerPrice, setOfferPrice] = useState("");
  const [timeline, setTimeline] = useState(45);
  const [commissionPct, setCommissionPct] = useState(2.5);
  const [agencyRole, setAgencyRole] = useState("Listing Agent");
  const [paymentSource, setPaymentSource] = useState("Seller Pays Commission");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const parsedOfferPrice = parseFloat(offerPrice.replace(/,/g, "")) || 0;
  const netToSeller = parsedOfferPrice > 0 ? calcNetToSeller(parsedOfferPrice, commissionPct) : 0;

  const handleContinue = () => {
    if (step === 1) {
      if (!offerPrice || parsedOfferPrice <= 0) {
        showToast({
          type: "error",
          title: "Offer price required",
          message: "Please enter a valid proposed sale price.",
        });
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleSubmit = async () => {
    if (!propertyId) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        bid_price: parsedOfferPrice,
        inspection_period: 7,
        due_diligence_period: 10,
        commission_percentage: commissionPct,
        agency_role: agencyRole,
        payment_source: paymentSource,
        closing_timeline_days: timeline,
      };
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
        "Unable to submit offer. Please try again.";
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
    return <OfferSuccessState propertyId={propertyId} propertyLabel={propertyLabel} />;
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
            className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Submit Representation
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            Offer to Represent Seller
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{propertyLabel}</p>
        </div>

        <div className="rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          <BadgeCheck className="mr-1.5 inline h-3.5 w-3.5" />
          Licensed Partner
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isDone
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : isActive
                        ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10"
                        : "border-[var(--color-border-light)] bg-white"
                    }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Icon
                      className={`h-4 w-4 ${isActive
                          ? "text-[var(--color-secondary)]"
                          : "text-[var(--color-text-muted)]"
                        }`}
                    />
                  )}
                </div>
                <p
                  className={`mt-2 text-[10px] font-black uppercase tracking-wider ${isActive
                      ? "text-[var(--color-secondary)]"
                      : isDone
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {s.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mb-5 h-0.5 w-full transition-all ${step > s.id
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-border-light)]"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
        {/* Step 1: Offer Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Offer Details
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Enter your proposed sale price and closing timeline.
              </p>
            </div>

            {askingPrice > 0 && (
              <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
                  Seller's Asking Price
                </p>
                <p className="mt-1 text-2xl font-black text-[var(--color-secondary)]">
                  {formatMoney(askingPrice)}
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Proposed Sale Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="350,000"
                  className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] py-3.5 pl-10 pr-4 text-sm font-bold text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Estimated Closing Timeline
              </label>
              <div className="flex flex-wrap gap-3">
                {TIMELINE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeline(opt.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition ${timeline === opt.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg"
                        : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Professional Setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Professional Setup
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Configure your commission structure. The Net-to-Seller is calculated automatically.
              </p>
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Commission Percentage
              </label>
              <div className="flex flex-wrap gap-3">
                {COMMISSION_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCommissionPct(pct)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition ${commissionPct === pct
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg"
                        : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Net-to-Seller Preview */}
            {parsedOfferPrice > 0 && (
              <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Transparency Engine — Seller View
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Your Offer Price</span>
                    <span className="text-sm font-black text-[var(--color-primary)]">
                      {formatMoney(parsedOfferPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">
                      Commission ({commissionPct}%)
                    </span>
                    <span className="text-sm font-black text-[var(--color-danger)]">
                      −{formatMoney(parsedOfferPrice * (commissionPct / 100))}
                    </span>
                  </div>
                  <div className="border-t border-[var(--color-border-light)] pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--color-primary)]">
                        Net-to-Seller
                      </span>
                      <span className="text-lg font-black text-[var(--color-secondary)]">
                        {formatMoney(netToSeller)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Agency Role
              </label>
              <div className="flex flex-wrap gap-3">
                {AGENCY_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setAgencyRole(role)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition ${agencyRole === role
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg"
                        : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Payment Source
              </label>
              <div className="flex flex-wrap gap-3">
                {PAYMENT_SOURCES.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPaymentSource(src)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition ${paymentSource === src
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg"
                        : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
                Review Your Offer
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Review the details below before submitting to the seller.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Property", value: propertyLabel },
                { label: "Proposed Sale Price", value: formatMoney(parsedOfferPrice) },
                { label: "Closing Timeline", value: `${timeline} Days` },
                { label: "Commission", value: `${commissionPct}%` },
                { label: "Net-to-Seller", value: formatMoney(netToSeller), highlight: true },
                { label: "Agency Role", value: agencyRole },
                { label: "Payment Source", value: paymentSource },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-xl border px-5 py-4 ${row.highlight
                      ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                      : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                    }`}
                >
                  <span className="text-sm text-[var(--color-text-muted)]">{row.label}</span>
                  <span
                    className={`text-sm font-black ${row.highlight
                        ? "text-[var(--color-secondary)]"
                        : "text-[var(--color-primary)]"
                      }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-5 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-warning)]">
                ⚠ 7-Day Market Launch Rule
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">
                If the seller selects you, you must upload proof of marketing within{" "}
                <strong>7 days</strong>. Failure to do so activates the Kill Switch and
                promotes the Backup Partner.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[var(--color-danger)] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Representation Offer"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border-light)] pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition disabled:pointer-events-none disabled:opacity-30 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex gap-1">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${s.id === step
                    ? "w-8 bg-[var(--color-secondary)]"
                    : s.id < step
                      ? "w-4 bg-[var(--color-secondary)]/40"
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

      {step === 3 && (
        <div className="border-t border-[var(--color-border-light)] pt-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Edit Offer
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Building2,
  Hash,
  MapPin,
  User,
  BadgeCheck,
  Info,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useGetMeQuery } from "../../services/userService";
import {
  useUploadRealtorVerificationMutation,
  useGetRealtorVerificationStatusQuery,
} from "../../services/verificationService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

interface FormState {
  license_number: string;
  brokerage_name: string;
  managing_broker: string;
  office_address: string;
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  isDark,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
}) {
  return (
    <div>
      <label
        className={`mb-2 block text-[11px] font-black uppercase tracking-[0.18em] ${
          isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
            isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
          }`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:ring-2 ${
            isDark
              ? "border-white/15 bg-white/[0.04] text-white placeholder:text-white/20 focus:border-[#d4af37] focus:ring-[#d4af37]/10"
              : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
          }`}
        />
      </div>
    </div>
  );
}

export default function RealtorVerificationPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { data: meData } = useGetMeQuery();
  const { data: statusData, refetch: refetchStatus } =
    useGetRealtorVerificationStatusQuery();

  const [submitVerification, { isLoading }] =
    useUploadRealtorVerificationMutation();

  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const [form, setForm] = useState<FormState>({
    license_number: "",
    brokerage_name: "",
    managing_broker: "",
    office_address: "",
  });

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const profile = meData?.data ?? meData;
  const statusPayload = statusData?.data ?? statusData;

  const status: "not_submitted" | "pending" | "approved" | "rejected" =
    statusPayload?.status ||
    profile?.realtor_verification_status ||
    "not_submitted";

  const rejectionReason =
    statusPayload?.rejection_reason ||
    profile?.realtor_verification_rejection_reason;

  const isApproved = status === "approved";
  const isPending = status === "pending" || justSubmitted;
  const isRejected = status === "rejected" && !justSubmitted;

  async function handleSubmit() {
    setError(null);

    if (!form.license_number.trim()) {
      setError("Please enter your State License Number.");
      return;
    }
    if (!form.brokerage_name.trim()) {
      setError("Please enter your Brokerage Name.");
      return;
    }
    if (!form.managing_broker.trim()) {
      setError("Please enter your Managing Broker's name.");
      return;
    }
    if (!form.office_address.trim()) {
      setError("Please enter your Office Address.");
      return;
    }

    try {
      await submitVerification({
        license_number: form.license_number,
        brokerage_name: form.brokerage_name,
        managing_broker: form.managing_broker,
        office_address: form.office_address,
      }).unwrap();

      setJustSubmitted(true);
      setForm({ license_number: "", brokerage_name: "", managing_broker: "", office_address: "" });
      refetchStatus();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Submission failed. Please try again.";
      setError(message);
    }
  }

  return (
    <div className="min-h-[calc(100vh-150px)] space-y-8">
      {/* ── Hero Header ── */}
      <section
        className={`relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-card)] ${
          isDark
            ? "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10"
            : "bg-[var(--color-primary)]"
        }`}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/5" />

        <div className="relative max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
            <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
              Licensed Partner Verification
            </span>
          </div>

          <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
            Professional Verification
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
            Submit your State License Number and Brokerage details for admin
            review. Access to the live property stream unlocks once your
            credentials are verified.
          </p>
        </div>
      </section>

      {/* ── Approved ── */}
      {isApproved && (
        <div
          className={`flex items-center gap-4 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${
            isDark
              ? "border-white/10 bg-white/[0.06]"
              : "border-[var(--color-border-light)] bg-white"
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            }`}
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
              Credentials verified — Dashboard unlocked
            </p>
            <p className={`mt-0.5 text-xs ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              You're all set. Your account has full access to the Live Property Stream.
            </p>
          </div>
          <Link
            to="/properties"
            className={`inline-flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${
              isDark
                ? "border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
                : "border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20"
            }`}
          >
            Browse Properties
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Pending ── */}
      {isPending && !isApproved && (
        <div
          className={`flex items-start gap-4 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${
            isDark
              ? "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/[0.08]"
              : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
            }`}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-warning)]"}`}>
              Pending admin approval
            </p>
            <p className={`mt-1 text-xs leading-6 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
              Your credentials are under review by our admin team. This typically
              takes 1–2 business days. Your dashboard will unlock automatically
              once approved.
            </p>
          </div>
        </div>
      )}

      {/* ── Rejected ── */}
      {isRejected && (
        <div
          className={`flex items-start gap-4 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${
            isDark
              ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/[0.08]"
              : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10"
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
            }`}
          >
            <XCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[var(--color-danger)]"}`}>
              Submission rejected — please resubmit
            </p>
            <p className={`mt-1 text-xs leading-6 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
              {rejectionReason ||
                "Your submission didn't meet our requirements. Please correct your information and resubmit."}
            </p>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      {!isApproved && !isPending && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form — 2 cols */}
          <section
            className={`lg:col-span-2 rounded-2xl border p-6 shadow-[var(--shadow-card)] ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-[var(--color-border-light)] bg-white"
            }`}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isDark
                    ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                    : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                }`}
              >
                <Building2 className="h-5 w-5 text-[var(--color-secondary)]" />
              </div>
              <div>
                <h2
                  className={`font-serif text-xl font-black ${
                    isDark ? "text-white" : "text-[var(--color-primary)]"
                  }`}
                >
                  {isRejected ? "Resubmit Credentials" : "License & Brokerage"}
                </h2>
                <p className={`text-xs ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                  All fields are required for admin review
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InputField
                label="State License Number *"
                icon={Hash}
                value={form.license_number}
                onChange={(v) => set("license_number", v)}
                placeholder="e.g. NY-12345678"
                isDark={isDark}
              />
              <InputField
                label="Brokerage Name *"
                icon={Building2}
                value={form.brokerage_name}
                onChange={(v) => set("brokerage_name", v)}
                placeholder="e.g. Keller Williams Realty"
                isDark={isDark}
              />
              <InputField
                label="Managing Broker *"
                icon={User}
                value={form.managing_broker}
                onChange={(v) => set("managing_broker", v)}
                placeholder="e.g. Jane Smith"
                isDark={isDark}
              />
              <InputField
                label="Office Address *"
                icon={MapPin}
                value={form.office_address}
                onChange={(v) => set("office_address", v)}
                placeholder="e.g. 123 Main St, New York, NY 10001"
                isDark={isDark}
              />
            </div>

            {error && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-xs font-semibold ${
                  isDark
                    ? "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)]"
                    : "bg-red-50 border-red-300 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                isLoading={isLoading}
                loadingText="Submitting..."
                onClick={handleSubmit}
              >
                Submit for Review
              </Button>
            </div>
          </section>

          {/* Info sidebar — 1 col */}
          <div className="space-y-4">
            {/* What happens next */}
            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/[0.04]"
                  : "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5"
              }`}
            >
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                What Happens Next
              </p>
              <ul className="space-y-2.5">
                {[
                  "Your credentials are sent to the TRACT admin team",
                  "Admin verifies your license with your state board",
                  "You receive an email confirmation within 1–2 business days",
                  "Your dashboard unlocks automatically on approval",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-secondary)]" />
                    <span
                      className={`text-xs leading-5 ${
                        isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KYC note */}
            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Info
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                  }`}
                />
                <p className={`text-xs leading-5 ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                  <strong className={isDark ? "text-white/60" : "text-[var(--color-text-main)]"}>
                    Identity verification (KYC)
                  </strong>{" "}
                  is handled separately via the KYC page. This form covers your
                  professional credentials only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div
        className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-4 ${
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
        }`}
      >
        <ShieldCheck
          className={`h-3.5 w-3.5 ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}
        />
        <p className={`text-center text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"}`}>
          Your credentials are reviewed manually by the TRACT admin team and
          kept strictly confidential.
        </p>
      </div>
    </div>
  );
}

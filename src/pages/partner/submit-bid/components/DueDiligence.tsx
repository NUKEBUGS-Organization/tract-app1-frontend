import { AlertCircle, Clock, FileText, Link } from "lucide-react";
import type { BidFormState } from "../types";
import { INSPECTION_PERIODS, DUE_DILIGENCE_PERIODS } from "../constants";
import { usePartnerTheme } from "../../../../hooks/usePartnerTheme";

interface DueDiligenceProps {
  form: BidFormState;
  fieldErrors: Record<string, string>;
  set: <K extends keyof BidFormState>(key: K, value: BidFormState[K]) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-danger)]">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

type ChipValue = 3 | 7 | 10 | 5 | 15;

function ChipGroup({
  options,
  value,
  onSelect,
  formatter,
}: {
  options: ChipValue[];
  value: ChipValue | null;
  onSelect: (v: ChipValue) => void;
  formatter: (v: ChipValue) => string;
}) {
  const isDark = usePartnerTheme() === "dark";
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`rounded-xl border px-6 py-3 text-[13px] font-black tracking-wide transition-all ${isSelected
              ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
              : isDark
                ? "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
                : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
          >
            {formatter(opt)}
          </button>
        );
      })}
    </div>
  );
}

export default function DueDiligence({
  form,
  fieldErrors,
  set,
}: DueDiligenceProps) {
  const isDark = usePartnerTheme() === "dark";
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 2 of 3
        </p>
        <h2
          className={`mt-1 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
        >
          Deal Terms
        </h2>
        <p
          className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
            }`}
        >
          Select your inspection and due diligence periods. These are the only
          values accepted by the platform.
        </p>
      </div>

      {/* Inspection Period — required enum */}
      <div>
        <label
          className={`block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
            }`}
        >
          Inspection Period{" "}
          <span className="text-[var(--color-danger)]">*</span>
        </label>
        <p
          className={`mt-0.5 text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]/70"
            }`}
        >
          Platform-locked options: 3, 7, or 10 days
        </p>
        <div className="mt-3">
          <ChipGroup
            options={INSPECTION_PERIODS as unknown as ChipValue[]}
            value={form.inspection_period as ChipValue | null}
            onSelect={(v) => set("inspection_period", v as 3 | 7 | 10)}
            formatter={(v) => `${v} Days`}
          />
        </div>
        <FieldError message={fieldErrors.inspection_period} />
      </div>

      {/* Due Diligence Period — required enum */}
      <div>
        <label
          className={`block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
            }`}
        >
          Due Diligence Period{" "}
          <span className="text-[var(--color-danger)]">*</span>
        </label>
        <p
          className={`mt-0.5 text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]/70"
            }`}
        >
          Platform-locked options: 5, 10, or 15 business days
        </p>
        <div className="mt-3">
          <ChipGroup
            options={DUE_DILIGENCE_PERIODS as unknown as ChipValue[]}
            value={form.due_diligence_period as ChipValue | null}
            onSelect={(v) => set("due_diligence_period", v as 5 | 10 | 15)}
            formatter={(v) => `${v} Business Days`}
          />
        </div>
        <FieldError message={fieldErrors.due_diligence_period} />
      </div>

      {/* LOI URL — optional */}
      <div>
        <label
          className={`block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
            }`}
        >
          Letter of Intent (LOI) URL{" "}
          <span
            className={`text-[10px] normal-case tracking-normal ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]/50"
              }`}
          >
            (Optional)
          </span>
        </label>
        <p
          className={`mt-0.5 text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]/70"
            }`}
        >
          Paste a link to your LOI document (Google Drive, Dropbox, etc.). LOI
          is active for 10 days.
        </p>
        <div
          className={`mt-2 flex items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-[var(--color-secondary)] ${isDark
            ? "border-white/10 bg-white/5"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
            }`}
        >
          <Link
            className={`h-4 w-4 shrink-0 ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
              }`}
          />
          <input
            type="url"
            value={form.loi_url}
            onChange={(e) => set("loi_url", e.target.value)}
            placeholder="https://drive.google.com/..."
            className={`w-full bg-transparent text-sm font-bold outline-none ${isDark
              ? "text-white placeholder-white/20"
              : "text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/50"
              }`}
          />
        </div>
      </div>

      {/* Proof of Funds URL — optional */}
      <div>
        <label
          className={`block text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"
            }`}
        >
          Proof of Funds URL{" "}
          <span
            className={`text-[10px] normal-case tracking-normal ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]/50"
              }`}
          >
            (Optional)
          </span>
        </label>
        <p
          className={`mt-0.5 text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]/70"
            }`}
        >
          Link to bank statement, LOC, or other proof of funds document.
        </p>
        <div
          className={`mt-2 flex items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-[var(--color-secondary)] ${isDark
            ? "border-white/10 bg-white/5"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
            }`}
        >
          <FileText
            className={`h-4 w-4 shrink-0 ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
              }`}
          />
          <input
            type="url"
            value={form.proof_of_funds_url}
            onChange={(e) => set("proof_of_funds_url", e.target.value)}
            placeholder="https://drive.google.com/..."
            className={`w-full bg-transparent text-sm font-bold outline-none ${isDark
              ? "text-white placeholder-white/20"
              : "text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/50"
              }`}
          />
        </div>
      </div>

      {/* 72-hour reminder */}
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${isDark
          ? "border-white/8 bg-white/[0.03]"
          : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
          }`}
      >
        <Clock
          className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? "text-[var(--color-secondary)]/70" : "text-[var(--color-secondary)]"
            }`}
        />
        <p
          className={`text-[11px] leading-5 ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
        >
          Once selected as the primary partner, you have{" "}
          <span
            className={`font-bold ${isDark ? "text-white/70" : "text-[var(--color-primary)]"
              }`}
          >
            72 hours
          </span>{" "}
          to provide active marketing proof. Failure triggers the Kill Switch.
        </p>
      </div>
    </div>
  );
}
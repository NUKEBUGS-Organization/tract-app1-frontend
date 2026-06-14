import { AlertCircle, Clock, FileText, Link } from "lucide-react";
import type { BidFormState } from "../types";
import { INSPECTION_PERIODS, DUE_DILIGENCE_PERIODS } from "../constants";

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
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`rounded-xl border px-6 py-3 text-[13px] font-black tracking-wide transition-all ${
              isSelected
                ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
            }`}
          >
            {formatter(opt)}
          </button>
        );
      })}
    </div>
  );
}

export default function DueDiligence({ form, fieldErrors, set }: DueDiligenceProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Step 2 of 3
        </p>
        <h2 className="mt-1 font-serif text-2xl font-black text-white">
          Deal Terms
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Select your inspection and due diligence periods. These are the only
          values accepted by the platform.
        </p>
      </div>

      {/* Inspection Period — required enum */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Inspection Period{" "}
          <span className="text-[var(--color-danger)]">*</span>
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Platform-locked options: 3, 7, or 10 days
        </p>
        <div className="mt-3">
          <ChipGroup
            options={INSPECTION_PERIODS as unknown as ChipValue[]}
            value={form.inspection_period as ChipValue | null}
            onSelect={(v) =>
              set("inspection_period", v as 3 | 7 | 10)
            }
            formatter={(v) => `${v} Days`}
          />
        </div>
        <FieldError message={fieldErrors.inspection_period} />
      </div>

      {/* Due Diligence Period — required enum */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Due Diligence Period{" "}
          <span className="text-[var(--color-danger)]">*</span>
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Platform-locked options: 5, 10, or 15 business days
        </p>
        <div className="mt-3">
          <ChipGroup
            options={DUE_DILIGENCE_PERIODS as unknown as ChipValue[]}
            value={form.due_diligence_period as ChipValue | null}
            onSelect={(v) =>
              set("due_diligence_period", v as 5 | 10 | 15)
            }
            formatter={(v) => `${v} Business Days`}
          />
        </div>
        <FieldError message={fieldErrors.due_diligence_period} />
      </div>

      {/* LOI URL — optional */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Letter of Intent (LOI) URL{" "}
          <span className="text-[10px] normal-case tracking-normal text-white/25">
            (Optional)
          </span>
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Paste a link to your LOI document (Google Drive, Dropbox, etc.). LOI
          is active for 10 days.
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-[var(--color-secondary)]">
          <Link className="h-4 w-4 shrink-0 text-white/30" />
          <input
            type="url"
            value={form.loi_url}
            onChange={(e) => set("loi_url", e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full bg-transparent text-sm font-bold text-white placeholder-white/20 outline-none"
          />
        </div>
      </div>

      {/* Proof of Funds URL — optional */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
          Proof of Funds URL{" "}
          <span className="text-[10px] normal-case tracking-normal text-white/25">
            (Optional)
          </span>
        </label>
        <p className="mt-0.5 text-[11px] text-white/35">
          Link to bank statement, LOC, or other proof of funds document.
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-[var(--color-secondary)]">
          <FileText className="h-4 w-4 shrink-0 text-white/30" />
          <input
            type="url"
            value={form.proof_of_funds_url}
            onChange={(e) => set("proof_of_funds_url", e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full bg-transparent text-sm font-bold text-white placeholder-white/20 outline-none"
          />
        </div>
      </div>

      {/* 72-hour reminder */}
      <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-secondary)]/70" />
        <p className="text-[11px] leading-5 text-white/40">
          Once selected as the primary partner, you have{" "}
          <span className="font-bold text-white/70">72 hours</span> to provide
          active marketing proof. Failure triggers the Kill Switch.
        </p>
      </div>
    </div>
  );
}

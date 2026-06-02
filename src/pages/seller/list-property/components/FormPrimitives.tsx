import { Check, Info } from "lucide-react";

export const inputCls =
  "w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]";

export function Lbl({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </label>

      {hint && (
        <span title={hint}>
          <Info className="h-3.5 w-3.5 cursor-help text-[var(--color-text-muted)]/50" />
        </span>
      )}
    </div>
  );
}

export function Inp({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

export function Tarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-none`}
    />
  );
}

export function ToggleCard({
  checked,
  onToggle,
  label,
  sub,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/40"
      }`}
    >
      <div>
        <p
          className={`text-sm font-bold ${
            checked
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-main)]"
          }`}
        >
          {label}
        </p>

        {sub && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {sub}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.18em] ${
            checked
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          {checked ? "Yes" : "No"}
        </span>

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
            checked
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-border-light)] bg-white text-transparent"
          }`}
        >
          <Check className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

export function Chips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
            value === option.value
              ? "bg-[var(--color-primary)] text-white"
              : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
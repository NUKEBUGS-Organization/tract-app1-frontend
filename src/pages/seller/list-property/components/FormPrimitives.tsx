import { Check, Info } from "lucide-react";

export const inputBaseCls =
  "w-full border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:shadow-[0_0_0_3px_rgba(23,77,52,0.08)]";

export const inputNormalCls =
  "border-[var(--color-border-light)] focus:border-[var(--color-primary)]";

export const inputErrorCls =
  "border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]";

export const inputCls = `${inputBaseCls} ${inputNormalCls}`;

export function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-2 text-xs font-bold leading-5 text-red-600">
      {message}
    </p>
  );
}

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
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputBaseCls} ${error ? inputErrorCls : inputNormalCls}`}
      />

      <ErrorText message={error} />
    </div>
  );
}

export function Tarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputBaseCls} resize-none ${
          error ? inputErrorCls : inputNormalCls
        }`}
      />

      <ErrorText message={error} />
    </div>
  );
}

export function ToggleCard({
  checked,
  onToggle,
  label,
  sub,
  error,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
  error?: string;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
          checked
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
            : error
              ? "border-red-500 bg-red-50"
              : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-primary)]/40"
        }`}
      >
        <div>
          <p
            className={`text-sm font-bold ${
              checked
                ? "text-[var(--color-primary)]"
                : error
                  ? "text-red-700"
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
                : error
                  ? "text-red-600"
                  : "text-[var(--color-text-muted)]"
            }`}
          >
            {checked ? "Yes" : "No"}
          </span>

          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
              checked
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : error
                  ? "border-red-500 bg-white text-transparent"
                  : "border-[var(--color-border-light)] bg-white text-transparent"
            }`}
          >
            <Check className="h-4 w-4" />
          </span>
        </div>
      </button>

      <ErrorText message={error} />
    </div>
  );
}

export function Chips({
  options,
  value,
  onChange,
  error,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
              value === option.value
                ? "bg-[var(--color-primary)] text-white"
                : error
                  ? "border border-red-400 bg-red-50 text-red-600 hover:border-red-500"
                  : "border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ErrorText message={error} />
    </div>
  );
}
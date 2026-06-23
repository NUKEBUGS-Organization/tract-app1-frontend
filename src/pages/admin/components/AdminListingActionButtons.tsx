import type { ReactNode } from "react";
import { RefreshCcw } from "lucide-react";

type ActionIconButtonVariant = "status" | "success" | "danger" | "neutral";

const actionIconButtonClasses: Record<ActionIconButtonVariant, string> = {
  status:
    "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-primary)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20",
  success:
    "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
  danger:
    "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white",
  neutral:
    "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]",
};

export function ActionIconButton({
  label,
  icon,
  variant = "neutral",
  isLoading = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  variant?: ActionIconButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isDisabled}
      onClick={onClick}
      className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${actionIconButtonClasses[variant]}`}
    >
      <span className="sr-only">{label}</span>

      {isLoading ? (
        <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}

      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  );
}

export function MobileActionButton({
  label,
  icon,
  variant = "neutral",
  isLoading = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  variant?: ActionIconButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${actionIconButtonClasses[variant]}`}
    >
      {isLoading ? (
        <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}

      <span>{label}</span>
    </button>
  );
}
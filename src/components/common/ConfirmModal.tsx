import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

import StatusBadge, { type StatusBadgeVariant } from "./StatusBadge";

type ConfirmModalVariant = "success" | "warning" | "danger" | "gold" | "neutral";

interface ConfirmModalProps {
  isOpen: boolean;
  variant?: ConfirmModalVariant;
  badgeLabel: string;
  title: string;
  description: string;
  icon: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  confirmIcon?: ReactNode;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

const variantStyles: Record<
  ConfirmModalVariant,
  {
    badgeVariant: StatusBadgeVariant;
    topBar: string;
    iconBg: string;
    iconText: string;
    titleText: string;
    confirmButton: string;
    closeHover: string;
    cancelHover: string;
    border: string;
  }
> = {
  success: {
    badgeVariant: "success",
    topBar: "bg-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary)]/10",
    iconText: "text-[var(--color-primary)]",
    titleText: "text-[var(--color-primary)]",
    confirmButton:
      "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 focus:ring-[var(--color-primary)]/40",
    closeHover: "hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]",
    cancelHover:
      "hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)]",
    border: "border-[var(--color-border-light)]",
  },
  warning: {
    badgeVariant: "warning",
    topBar: "bg-[var(--color-warning)]",
    iconBg: "bg-[var(--color-warning)]/10",
    iconText: "text-[var(--color-warning)]",
    titleText: "text-[var(--color-primary)]",
    confirmButton:
      "bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/90 focus:ring-[var(--color-warning)]/40",
    closeHover: "hover:bg-yellow-50 hover:text-[var(--color-warning)]",
    cancelHover:
      "hover:border-[var(--color-warning)] hover:bg-yellow-50 hover:text-[var(--color-warning)]",
    border: "border-yellow-100",
  },
  danger: {
    badgeVariant: "danger",
    topBar: "bg-[var(--color-danger)]",
    iconBg: "bg-[var(--color-danger)]/10",
    iconText: "text-[var(--color-danger)]",
    titleText: "text-[var(--color-danger)]",
    confirmButton:
      "bg-[var(--color-danger)] hover:bg-red-700 focus:ring-[var(--color-danger)]/40",
    closeHover: "hover:bg-red-50 hover:text-[var(--color-danger)]",
    cancelHover:
      "hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)]",
    border: "border-red-100",
  },
  gold: {
    badgeVariant: "gold",
    topBar: "bg-[var(--color-secondary)]",
    iconBg: "bg-[var(--color-secondary)]/15",
    iconText: "text-[#8a6a00]",
    titleText: "text-[var(--color-primary)]",
    confirmButton:
      "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 focus:ring-[var(--color-secondary)]/40",
    closeHover: "hover:bg-[var(--color-secondary)]/10 hover:text-[#8a6a00]",
    cancelHover:
      "hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 hover:text-[#8a6a00]",
    border: "border-[var(--color-secondary)]/20",
  },
  neutral: {
    badgeVariant: "neutral",
    topBar: "bg-gray-300",
    iconBg: "bg-gray-100",
    iconText: "text-gray-700",
    titleText: "text-[var(--color-primary)]",
    confirmButton:
      "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 focus:ring-[var(--color-primary)]/40",
    closeHover: "hover:bg-gray-100 hover:text-[var(--color-primary)]",
    cancelHover:
      "hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)]",
    border: "border-[var(--color-border-light)]",
  },
};

function ConfirmModal({
  isOpen,
  variant = "neutral",
  badgeLabel,
  title,
  description,
  icon,
  confirmLabel,
  cancelLabel = "Cancel",
  loadingLabel = "Working...",
  isLoading = false,
  confirmIcon,
  children,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const styles = variantStyles[variant];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onCancel}
        disabled={isLoading}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed"
      />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-300">
        <div
          className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-white shadow-2xl`}
        >
          <div className={`absolute left-0 right-0 top-0 h-1 ${styles.topBar}`} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.iconBg} ${styles.iconText}`}
                >
                  {icon}
                </div>

                <div>
                  <StatusBadge
                    label={badgeLabel}
                    variant={styles.badgeVariant}
                  />

                  <h2
                    className={`mt-3 font-serif text-2xl font-black tracking-tight ${styles.titleText}`}
                  >
                    {title}
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className={`rounded-full p-1.5 text-[var(--color-text-muted)] transition disabled:cursor-not-allowed disabled:opacity-50 ${styles.closeHover}`}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {children && <div className="mt-6">{children}</div>}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className={`rounded-full border border-[var(--color-border-light)] bg-white px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)] transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.cancelHover}`}
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirmButton}`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  confirmIcon
                )}

                {isLoading ? loadingLabel : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
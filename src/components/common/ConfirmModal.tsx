import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ConfirmModalVariant = "danger" | "warning" | "success" | "neutral";

interface ConfirmModalProps {
  isOpen: boolean;
  variant?: ConfirmModalVariant;
  title: string;
  description: string;
  icon?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

const variantClasses: Record<
  ConfirmModalVariant,
  {
    icon: string;
    title: string;
    confirmButton: string;
  }
> = {
  danger: {
    icon: "bg-red-50 text-red-600",
    title: "text-red-600",
    confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-200",
  },
  warning: {
    icon: "bg-yellow-50 text-yellow-600",
    title: "text-yellow-700",
    confirmButton: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-200",
  },
  success: {
    icon: "bg-green-50 text-green-600",
    title: "text-green-700",
    confirmButton:
      "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 focus:ring-[var(--color-primary)]/20",
  },
  neutral: {
    icon: "bg-gray-100 text-gray-700",
    title: "text-[var(--color-primary)]",
    confirmButton:
      "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 focus:ring-[var(--color-primary)]/20",
  },
};

function ConfirmModal({
  isOpen,
  variant = "neutral",
  title,
  description,
  icon,
  confirmLabel,
  cancelLabel = "Cancel",
  loadingLabel = "Please wait...",
  isLoading = false,
  children,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const styles = variantClasses[variant];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onCancel}
        disabled={isLoading}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4 pr-8">
          {icon && (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
            >
              {icon}
            </div>
          )}

          <div>
            <h2 className={`font-serif text-2xl font-black ${styles.title}`}>
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          </div>
        </div>

        {children && <div className="mt-5">{children}</div>}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-[var(--color-border-light)] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] transition hover:bg-gray-50 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirmButton}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
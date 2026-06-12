import { LogOut, X } from "lucide-react";
import { createPortal } from "react-dom";
import StatusBadge from "./StatusBadge";

interface LogoutModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function LogoutModal({ isOpen, onCancel, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-all">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in slide-in-from-bottom-5 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-2xl">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <StatusBadge label="Notice" variant="success" />

                <h2 className="mt-3 font-serif text-2xl font-black tracking-tight text-[var(--color-primary)]">
                  Ready to sign out?
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  You are about to log out of your TRACT account. You will
                  need to sign in again to access your dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="rounded-full p-1.5 text-[var(--color-text-muted)] transition-all hover:bg-gray-100 hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-[var(--color-border-light)] bg-white px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              >
                Stay Logged In
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-y-px" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LogoutModal;

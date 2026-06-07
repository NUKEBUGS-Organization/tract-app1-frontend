import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface WithdrawListingModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  listingTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function WithdrawListingModal({
  isOpen,
  isLoading = false,
  listingTitle,
  onCancel,
  onConfirm,
}: WithdrawListingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" />
            </div>

            <div>
              <StatusBadge label="Requires Confirmation" variant="danger" />

              <h2 className="mt-3 font-serif text-2xl font-black text-[var(--color-primary)]">
                Withdraw listing?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                This will withdraw the selected listing from the seller flow.
                This action should only be used before bids are placed.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {listingTitle && (
          <div className="mt-5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Selected Listing
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
              {listingTitle}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-[var(--color-border-light)] bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-danger)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isLoading ? "Withdrawing..." : "Withdraw Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WithdrawListingModal;
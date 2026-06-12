import { AlertTriangle, Trash2 } from "lucide-react";

import ConfirmModal from "./ConfirmModal";

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
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      badgeLabel="Requires Confirmation"
      title="Withdraw listing?"
      description="This will withdraw the selected listing from the seller flow. This action should only be used before bids are placed."
      icon={<AlertTriangle className="h-6 w-6" />}
      confirmIcon={<Trash2 className="h-4 w-4" />}
      confirmLabel="Withdraw Listing"
      loadingLabel="Withdrawing..."
      cancelLabel="Cancel"
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {listingTitle && (
        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Selected Listing
          </p>

          <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
            {listingTitle}
          </p>
        </div>
      )}
    </ConfirmModal>
  );
}

export default WithdrawListingModal;
import { AlertTriangle } from "lucide-react";

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
      title="Withdraw listing?"
      description="This listing will be removed from the active seller flow. This action should only be used before bids are placed."
      icon={<AlertTriangle className="h-5 w-5" />}
      confirmLabel="Withdraw"
      cancelLabel="Cancel"
      loadingLabel="Withdrawing..."
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {listingTitle && (
        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">
            Selected listing
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
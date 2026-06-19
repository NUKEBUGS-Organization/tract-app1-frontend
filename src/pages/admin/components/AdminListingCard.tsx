import { Link } from "react-router";
import { CheckCircle, RefreshCcw, Trash2, XCircle } from "lucide-react";

import StatusBadge from "../../../components/common/StatusBadge";
import {
  formatDate,
  getListingTitle,
  getMongoId,
  getPersonName,
  getStatusVariant,
} from "../../../utils/adminUtils";
import { MobileActionButton } from "./AdminListingActionButtons";

function AdminListingCard({
  listing,
  status,
  location,
  formattedStatus,
  isStatusUpdating,
  isRejecting,
  isDeleting,
  canMakeLive,
  canRejectListing,
  canDeleteListing,
  onMakeLive,
  onChangeStatus,
  onReject,
  onDelete,
}: {
  listing: any;
  status: string;
  location: string;
  formattedStatus: string;
  isStatusUpdating: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  canMakeLive: (status: string) => boolean;
  canRejectListing: (status: string) => boolean;
  canDeleteListing: (status: string) => boolean;
  onMakeLive: (listing: any) => void;
  onChangeStatus: (listing: any) => void;
  onReject: (listing: any) => void;
  onDelete: (listing: any) => void;
}) {
  const listingId = getMongoId(listing);
  const seller = listing.seller_id;
  const isBusy = isStatusUpdating || isRejecting || isDeleting;

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/properties/${listingId}`}
            state={{ listing }}
            className="break-words text-base font-black leading-6 text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            {getListingTitle(listing)}
          </Link>

          <p className="mt-1 break-words text-xs font-semibold text-[var(--color-text-muted)]">
            {location}
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge
            label={formattedStatus}
            variant={getStatusVariant(status)}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-[var(--color-bg-soft)] p-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Seller
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
            {getPersonName(seller)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Created
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            {formatDate(listing.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MobileActionButton
          label="Status"
          variant="status"
          disabled={isBusy}
          onClick={() => onChangeStatus(listing)}
          icon={<RefreshCcw className="h-4 w-4" aria-hidden="true" />}
        />

        {canMakeLive(status) && (
          <MobileActionButton
            label="Make Live"
            variant="success"
            isLoading={isStatusUpdating}
            disabled={isBusy}
            onClick={() => onMakeLive(listing)}
            icon={<CheckCircle className="h-4 w-4" aria-hidden="true" />}
          />
        )}

        {canRejectListing(status) && (
          <MobileActionButton
            label="Reject"
            variant="danger"
            isLoading={isRejecting}
            disabled={isBusy}
            onClick={() => onReject(listing)}
            icon={<XCircle className="h-4 w-4" aria-hidden="true" />}
          />
        )}

        {canDeleteListing(status) && (
          <MobileActionButton
            label="Delete"
            variant="neutral"
            isLoading={isDeleting}
            disabled={isBusy}
            onClick={() => onDelete(listing)}
            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          />
        )}
      </div>
    </article>
  );
}

export default AdminListingCard;
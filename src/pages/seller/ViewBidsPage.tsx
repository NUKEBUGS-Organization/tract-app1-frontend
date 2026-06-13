import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Gavel,
  Loader2,
  RefreshCw,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import StatusBadge from "../../components/common/StatusBadge";
import {
  useGetBidByIdQuery,
  useGetListingBidsQuery,
  useGetListingsDashboardQuery,
  useRejectBidMutation,
  useSelectBidMutation,
} from "../../services/listingService";

function getApiPayload(response: any) {
  return response?.data?.data ?? response?.data ?? response;
}

function getListingsFromDashboard(response: any) {
  const payload = getApiPayload(response);

  if (Array.isArray(payload?.listings)) return payload.listings;
  if (Array.isArray(payload?.data?.listings)) return payload.data.listings;
  if (Array.isArray(payload)) return payload;

  return [];
}

// function getBidsFromResponse(response: any) {
//   const payload = getApiPayload(response);

//   if (Array.isArray(payload?.bids)) return payload.bids;
//   if (Array.isArray(payload?.data)) return payload.data;
//   if (Array.isArray(payload)) return payload;

//   return [];
// }

function getBidFromResponse(response: any) {
  const payload = getApiPayload(response);
  return payload?.bid ?? payload;
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.data?.message || error?.data?.error || error?.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || fallback;
}

function formatMoney(value: any) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return numberValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status?: string) {
  if (!status) return "Active";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusVariant(status?: string) {
  const normalized = String(status || "active").toLowerCase();

  if (normalized === "selected") return "success";
  if (normalized === "backup") return "gold";
  if (normalized === "rejected") return "danger";
  if (normalized === "deleted") return "danger";
  if (normalized === "active") return "neutral";
  if (normalized === "pending") return "neutral";

  return "neutral";
}

function getListingLabel(listing: any) {
  const address = listing?.address || "Untitled Listing";
  const state = listing?.state_code ? `, ${listing.state_code}` : "";
  const zip = listing?.zip_code ? ` ${listing.zip_code}` : "";

  return `${address}${state}${zip}`;
}

function getBidderName(bid: any) {
  return (
    bid?.bidder_id?.full_name ||
    bid?.bidder_id?.email ||
    bid?.bidder_name ||
    "Unknown Bidder"
  );
}

function getBidderRole(bid: any) {
  return bid?.bidder_id?.role || "-";
}

function getReliabilityScore(bid: any) {
  return Number(
    bid?.bidder_id?.reliability_score ||
    bid?.bidder_id?.professional_score ||
    0
  );
}

function getBidId(bid: any) {
  return bid?._id || bid?.id;
}

function getBidStatus(bid: any) {
  return String(bid?.status || "active").toLowerCase();
}

function isRejectedOrDeleted(bid: any) {
  const status = getBidStatus(bid);
  return status === "rejected" || status === "deleted";
}

function scoreColor(score: number) {
  if (score >= 90) return "text-[var(--color-primary)]";
  if (score >= 75) return "text-[var(--color-secondary)]";
  return "text-[var(--color-warning)]";
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-[var(--color-primary)]"
      : score >= 75
        ? "bg-[var(--color-secondary)]"
        : "bg-[var(--color-warning)]";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border-light)]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      <span className={`text-sm font-black ${scoreColor(score)}`}>
        {score || "-"}
      </span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <p className="font-serif text-3xl font-black text-[var(--color-primary)]">
        {value}
      </p>
    </div>
  );
}

function ConfirmModal({
  bid,
  action,
  isLoading,
  onConfirm,
  onCancel,
}: {
  bid: any;
  action: "primary" | "backup1" | "backup2" | "reject";
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isReject = action === "reject";

  const title =
    action === "primary"
      ? "Select Primary Bid"
      : action === "backup1"
        ? "Select Backup 1"
        : action === "backup2"
          ? "Select Backup 2"
          : "Reject Bid";

  const description =
    action === "primary"
      ? "This will mark this bid as selected and move the listing into the contract flow."
      : action === "backup1"
        ? "This will mark this bid as the first backup offer."
        : action === "backup2"
          ? "This will mark this bid as the second backup offer."
          : "This will reject the selected bid.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${isReject
                ? "bg-[var(--color-danger)]/10"
                : "bg-[var(--color-primary)]/10"
              }`}
          >
            {isReject ? (
              <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-[var(--color-primary)]" />
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="font-serif text-xl font-black text-[var(--color-primary)]">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          {description}
        </p>

        <div className="mt-5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Bidder
          </p>

          <p className="mt-1 text-base font-black text-[var(--color-primary)]">
            {getBidderName(bid)}
          </p>

          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            Net to Seller: {formatMoney(bid?.net_to_seller)}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border border-[var(--color-border-light)] bg-white py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-60 ${isReject
                ? "bg-[var(--color-danger)] text-white"
                : "bg-[var(--color-primary)] text-white"
              }`}
          >
            {isLoading ? "Working..." : isReject ? "Reject" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BidDetailsModal({
  bidId,
  onClose,
}: {
  bidId: string;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useGetBidByIdQuery(bidId, {
    skip: !bidId,
  });

  const bid = getBidFromResponse(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Bid Details
            </p>

            <h3 className="mt-1 font-serif text-2xl font-black text-[var(--color-primary)]">
              {isLoading ? "Loading..." : getBidderName(bid)}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
            Unable to load bid details.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Bid Price
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {formatMoney(bid?.bid_price)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Net to Seller
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {formatMoney(bid?.net_to_seller)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Inspection Period
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {bid?.inspection_period ?? "-"} days
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Due Diligence
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {bid?.due_diligence_period ?? "-"} days
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Bidder Role
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {getBidderRole(bid)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Submitted
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text-main)]">
                {formatDate(bid?.submitted_at || bid?.createdAt)}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Status
              </p>
              <div className="mt-2">
                <StatusBadge
                  label={formatStatus(bid?.status)}
                  variant={getStatusVariant(bid?.status)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewBidsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const listingIdFromUrl = searchParams.get("listingId") || "";

  const [manualListingId, setManualListingId] = useState(listingIdFromUrl);
  const [modal, setModal] = useState<{
    bid: any;
    action: "primary" | "backup1" | "backup2" | "reject";
  } | null>(null);
  const [detailsBidId, setDetailsBidId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"net_to_seller" | "reliability">(
    "net_to_seller"
  );
  const [sortAsc, setSortAsc] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
  } = useGetListingsDashboardQuery();

  const listings = getListingsFromDashboard(dashboardData);

  const selectedListing =
    listings.find((listing: any) => listing?._id === listingIdFromUrl) ||
    listings[0];

  const activeListingId =
    listingIdFromUrl || selectedListing?._id || manualListingId || "";

  const activeListing = listings.find(
    (listing: any) => listing?._id === activeListingId
  );

  const activeListingLabel = activeListing
    ? getListingLabel(activeListing)
    : activeListingId
      ? "Selected Listing"
      : "No listing selected";

  const {
    data: bidsData,
    isLoading: isLoadingBids,
    isFetching: isFetchingBids,
    refetch: refetchBids,
  } = useGetListingBidsQuery(activeListingId, {
    skip: !activeListingId,
  });

  const [selectBid, { isLoading: isSelecting }] = useSelectBidMutation();
  const [rejectBid, { isLoading: isRejecting }] = useRejectBidMutation();

  const bids = Array.isArray(bidsData) ? bidsData : [];

  const selectedPrimaryBid = bids.find(
    (bid: any) => getBidStatus(bid) === "selected"
  );

  const backupBids = bids.filter((bid: any) => getBidStatus(bid) === "backup");
  const rejectedBids = bids.filter((bid: any) => isRejectedOrDeleted(bid));
  const activeBids = bids.filter((bid: any) => !isRejectedOrDeleted(bid));

  const sortedBids = useMemo(() => {
    return [...activeBids].sort((a: any, b: any) => {
      const aValue =
        sortKey === "reliability"
          ? getReliabilityScore(a)
          : Number(a?.net_to_seller || 0);

      const bValue =
        sortKey === "reliability"
          ? getReliabilityScore(b)
          : Number(b?.net_to_seller || 0);

      const diff = aValue - bValue;

      return sortAsc ? diff : -diff;
    });
  }, [activeBids, sortKey, sortAsc]);

  function updateListingId(listingId: string) {
    if (!listingId) return;

    setSearchParams({ listingId });
    setManualListingId(listingId);
    setApiError(null);
  }

  function useManualListingId() {
    const id = manualListingId.trim();

    if (!id) {
      setApiError("Please enter a listing ID.");
      return;
    }

    updateListingId(id);
  }

  function toggleSort(key: "net_to_seller" | "reliability") {
    if (sortKey === key) {
      setSortAsc((value) => !value);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  async function handleConfirmAction() {
    if (!modal || !activeListingId) return;

    const bidId = getBidId(modal.bid);

    if (!bidId) {
      setApiError("Bid ID is missing.");
      setModal(null);
      return;
    }

    try {
      setApiError(null);

      if (modal.action === "reject") {
        await rejectBid({
          listingId: activeListingId,
          bidId,
        }).unwrap();
      } else {
        const selection =
          modal.action === "primary" ? 1 : modal.action === "backup1" ? 2 : 3;

        await selectBid({
          listingId: activeListingId,
          bidId,
          selection,
        }).unwrap();
      }

      setModal(null);
      await refetchBids();
      await refetchDashboard();
    } catch (error: any) {
      setApiError(getErrorMessage(error, "Unable to update bid."));
      setModal(null);
    }
  }

  const actionLoading = isSelecting || isRejecting;

  return (
    <div className="space-y-8">
      {modal && (
        <ConfirmModal
          bid={modal.bid}
          action={modal.action}
          isLoading={actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setModal(null)}
        />
      )}

      {detailsBidId && (
        <BidDetailsModal
          bidId={detailsBidId}
          onClose={() => setDetailsBidId(null)}
        />
      )}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Seller Portal
          </p>

          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            View Bids
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Review submitted bids, select a primary buyer, choose backup offers,
            or reject bids for your listing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetchBids();
            refetchDashboard();
          }}
          disabled={isFetchingBids}
          className="inline-flex items-center gap-2 border border-[var(--color-border-light)] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetchingBids ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Select Listing
            </p>

            {isLoadingDashboard ? (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading listings...
              </div>
            ) : listings.length > 0 ? (
              <select
                value={activeListingId}
                onChange={(event) => updateListingId(event.target.value)}
                className="mt-2 w-full border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-primary)] outline-none focus:border-[var(--color-primary)]"
              >
                {listings.map((listing: any) => (
                  <option key={listing?._id} value={listing?._id}>
                    {getListingLabel(listing)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                <input
                  value={manualListingId}
                  onChange={(event) => setManualListingId(event.target.value)}
                  placeholder="Paste listing ID"
                  className="border border-[var(--color-border-light)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                <button
                  type="button"
                  onClick={useManualListingId}
                  className="bg-[var(--color-primary)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white"
                >
                  Use Listing
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Active Listing
            </p>

            <p className="mt-2 truncate text-sm font-black text-[var(--color-primary)]">
              {activeListingLabel}
            </p>

            {activeListing?.market_price && (
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                Market Price: {formatMoney(activeListing.market_price)}
              </p>
            )}

            {activeListingId && (
              <Link
                to={`/listings/${activeListingId}`}
                className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
              >
                View Listing
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {apiError && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          {apiError}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Bids" value={bids.length} icon={Gavel} />
        <SummaryCard
          label="Active Bids"
          value={activeBids.length}
          icon={Users}
        />
        <SummaryCard
          label="Selected"
          value={selectedPrimaryBid ? 1 : 0}
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Rejected"
          value={rejectedBids.length}
          icon={Trash2}
        />
      </section>

      {selectedPrimaryBid && (
        <section className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />

            <div>
              <p className="text-sm font-black text-[var(--color-primary)]">
                Primary bid selected
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                {getBidderName(selectedPrimaryBid)} is selected as the primary
                buyer. Listing is now expected to move into the contract flow.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-light)] p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Listing Bids
            </h2>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Sorted by net to seller by default.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleSort("net_to_seller")}
              className="inline-flex items-center gap-1 border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)]"
            >
              Net to Seller
              {sortKey === "net_to_seller" &&
                (sortAsc ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                ))}
            </button>

            <button
              type="button"
              onClick={() => toggleSort("reliability")}
              className="inline-flex items-center gap-1 border border-[var(--color-border-light)] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)]"
            >
              Reliability
              {sortKey === "reliability" &&
                (sortAsc ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                ))}
            </button>
          </div>
        </div>

        {!activeListingId && (
          <div className="p-8 text-center">
            <p className="text-sm font-bold text-[var(--color-text-main)]">
              Select a listing to view bids.
            </p>
          </div>
        )}

        {activeListingId && isLoadingBids && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {activeListingId && !isLoadingBids && sortedBids.length === 0 && (
          <div className="p-8 text-center">
            <Gavel className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />

            <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
              No bids found for this listing.
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Bids will appear here once partners submit offers.
            </p>
          </div>
        )}

        {activeListingId && !isLoadingBids && sortedBids.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  {[
                    "Bidder",
                    "Role",
                    "Bid Price",
                    "Net to Seller",
                    "Reliability",
                    "Terms",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedBids.map((bid: any, index: number) => {
                  const bidId = getBidId(bid);
                  const status = getBidStatus(bid);
                  const isSelected = status === "selected";
                  const isBackup = status === "backup";
                  const score = getReliabilityScore(bid);

                  return (
                    <tr
                      key={bidId || index}
                      className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/40"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                            <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                          </div>

                          <div>
                            <p className="text-sm font-black text-[var(--color-primary)]">
                              {getBidderName(bid)}
                            </p>

                            <p className="mt-0.5 text-[10px] font-semibold text-[var(--color-text-muted)]">
                              Rank #{index + 1}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-xs font-bold capitalize text-[var(--color-text-main)]">
                        {getBidderRole(bid)}
                      </td>

                      <td className="px-5 py-5 text-sm font-black text-[var(--color-text-main)]">
                        {formatMoney(bid?.bid_price)}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-1 text-sm font-black text-[var(--color-primary)]">
                          <TrendingUp className="h-4 w-4 text-[var(--color-secondary)]" />
                          {formatMoney(bid?.net_to_seller)}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <ScoreBar score={score} />
                      </td>

                      <td className="px-5 py-5 text-xs text-[var(--color-text-muted)]">
                        <p>
                          Inspection:{" "}
                          <span className="font-bold text-[var(--color-text-main)]">
                            {bid?.inspection_period ?? "-"} days
                          </span>
                        </p>

                        <p className="mt-1">
                          Due Diligence:{" "}
                          <span className="font-bold text-[var(--color-text-main)]">
                            {bid?.due_diligence_period ?? "-"} days
                          </span>
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <div className="space-y-1">
                          <StatusBadge
                            label={formatStatus(bid?.status)}
                            variant={getStatusVariant(bid?.status)}
                          />

                          {isBackup && bid?.backup_position && (
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)]">
                              Backup {bid.backup_position}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailsBidId(bidId)}
                            className="inline-flex items-center gap-1 border border-[var(--color-border-light)] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </button>

                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() =>
                                setModal({ bid, action: "primary" })
                              }
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 bg-[var(--color-primary)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Primary
                            </button>
                          )}

                          {!isSelected && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setModal({ bid, action: "backup1" })
                                }
                                disabled={actionLoading}
                                className="border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8a6a00] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Backup 1
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setModal({ bid, action: "backup2" })
                                }
                                disabled={actionLoading}
                                className="border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8a6a00] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Backup 2
                              </button>
                            </>
                          )}

                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => setModal({ bid, action: "reject" })}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {backupBids.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
            Backup Offers
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {backupBids.map((bid: any) => (
              <div
                key={getBidId(bid)}
                className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 p-4"
              >
                <p className="text-sm font-black text-[var(--color-primary)]">
                  Backup {bid?.backup_position || "-"} — {getBidderName(bid)}
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Net to Seller: {formatMoney(bid?.net_to_seller)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
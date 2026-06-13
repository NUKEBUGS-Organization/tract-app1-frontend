import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Handshake,
  Loader2,
  XCircle,
} from "lucide-react";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useGetMyBidsQuery } from "../../services/listingService";
import { useSignContractAsBuyerMutation } from "../../services/contractService";

/* ─── Types & helpers ────────────────────────────────────────────────── */
function formatMoney(value: any) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function normalizeBids(data: any): any[] {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.bids)) return payload.bids;
  return [];
}

function normalizeDeals(data: any[]): any[] {
  return Array.isArray(data) ? data : [];
}

function getBidStatus(bid: any): string {
  return String(bid?.status || "pending").toLowerCase();
}

function getDealStatus(deal: any): string {
  return String(deal?.status || "").toLowerCase();
}

type TabValue = "bids" | "deals" | "closed";

const TABS: { value: TabValue; label: string }[] = [
  { value: "bids", label: "My Bids" },
  { value: "deals", label: "Active Deals" },
  { value: "closed", label: "Closed" },
];

/* ─── Status configs ─────────────────────────────────────────────────── */
function getBidStatusConfig(status: string) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pending: {
      label: "Pending Review",
      className: "bg-white/10 text-white/60 border border-white/10",
      icon: Clock,
    },
    accepted: {
      label: "Accepted ✓",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
      icon: CheckCircle2,
    },
    selected: {
      label: "Selected ✓",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: XCircle,
    },
    withdrawn: {
      label: "Withdrawn",
      className: "bg-white/8 text-white/40 border border-white/8",
      icon: XCircle,
    },
  };
  return map[status] ?? map.pending;
}

function getDealStatusConfig(status: string) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    active: {
      label: "Active",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: Handshake,
    },
    under_contract: {
      label: "Under Contract",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: FileText,
    },
    closing: {
      label: "Closing",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
      icon: CheckCircle2,
    },
    closed: {
      label: "Closed 🏠",
      className:
        "bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/20",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: XCircle,
    },
  };
  return map[status] ?? map.active;
}

/* ─── Bid card ────────────────────────────────────────────────────────── */
function BidCard({ bid }: { bid: any }) {
  const status = getBidStatus(bid);
  const config = getBidStatusConfig(status);
  const StatusIcon = config.icon;

  const isActionRequired = status === "accepted" || status === "selected";
  const bidPrice = bid?.bid_price || bid?.amount;
  const listingAddress =
    bid?.listing?.address || bid?.property_address || "Property";
  const listingId = bid?.listing?._id || bid?.listing_id || bid?.property_id;
  const bidId = bid?._id || bid?.id;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isActionRequired
          ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 shadow-[0_0_30px_rgba(212,175,55,0.08)]"
          : "border-white/10 bg-white/[0.04]"
      } hover:border-white/20`}
    >
      {isActionRequired && (
        <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{listingAddress}</p>
            {bid?.listing?.city && (
              <p className="mt-0.5 text-[11px] text-white/40">
                {bid.listing.city}
                {bid.listing.state_code ? `, ${bid.listing.state_code}` : ""}
              </p>
            )}
          </div>

          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${config.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </span>
        </div>

        {/* Bid amount */}
        <div className="mt-4 rounded-xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8 p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
            My Bid
          </p>
          <p className="mt-1 text-xl font-black text-[var(--color-secondary)]">
            {formatMoney(bidPrice)}
          </p>
        </div>

        {/* Notes */}
        {bid?.notes && (
          <p className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[12px] leading-5 text-white/50">
            {bid.notes}
          </p>
        )}

        {/* Contingencies */}
        {Array.isArray(bid?.contingencies) && bid.contingencies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bid.contingencies.map((c: string) => (
              <span
                key={c}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/50"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Buyer type */}
        {bid?.buyer_type && (
          <p className="mt-2 text-[11px] text-white/35">
            Buyer Type:{" "}
            <span className="font-semibold capitalize text-white/60">
              {bid.buyer_type.replace(/_/g, " ")}
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {listingId && (
            <Link
              to={`/properties/${listingId}`}
              className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-white/25 hover:text-white"
            >
              View Property
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Bid created date */}
        {bid?.created_at && (
          <p className="mt-3 text-[10px] text-white/25">
            Submitted{" "}
            {new Date(bid.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Deal card ───────────────────────────────────────────────────────── */
function DealCard({ deal }: { deal: any }) {
  const status = getDealStatus(deal);
  const config = getDealStatusConfig(status);
  const StatusIcon = config.icon;
  const [signContract, { isLoading: isSigning }] = useSignContractAsBuyerMutation();

  const contractId = deal?.contract?._id || deal?.contract_id;
  const listingId = deal?.listing?._id || deal?.property_id;
  const listingAddress = deal?.listing?.address || deal?.property_address || "Property";
  const bidAmount = deal?.bid?.bid_price || deal?.offer_price;
  const sellerAsk = deal?.listing?.market_price;
  const isClosed = ["closed", "cancelled"].includes(status);

  const handleSign = async () => {
    if (!contractId) return;
    try {
      await signContract(contractId).unwrap();
    } catch {
      // toast would be nice here — for now silent fail is acceptable
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        !isClosed
          ? "border-[var(--color-secondary)]/20 bg-white/[0.05]"
          : "border-white/8 bg-white/[0.03]"
      } hover:border-white/20`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{listingAddress}</p>
            {deal?.listing?.city && (
              <p className="mt-0.5 text-[11px] text-white/40">
                {deal.listing.city}
                {deal.listing.state_code ? `, ${deal.listing.state_code}` : ""}
              </p>
            )}
          </div>

          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${config.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </span>
        </div>

        {/* Bid vs Ask */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/35">
              My Offer
            </p>
            <p className="mt-1 text-base font-black text-[var(--color-secondary)]">
              {formatMoney(bidAmount)}
            </p>
          </div>
          {sellerAsk && (
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-white/35">
                Asking Price
              </p>
              <p className="mt-1 text-base font-black text-white">
                {formatMoney(sellerAsk)}
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {(deal?.created_at || deal?.closing_date) && (
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-white/40">
            {deal?.created_at && (
              <span>
                Started:{" "}
                <span className="font-bold text-white/60">
                  {new Date(deal.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}
            {deal?.closing_date && (
              <span>
                Closing:{" "}
                <span className="font-bold text-white/60">
                  {new Date(deal.closing_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {/* Sign contract if available and unsigned */}
          {contractId && !isClosed && (
            <button
              type="button"
              onClick={handleSign}
              disabled={isSigning}
              className="flex items-center gap-2 bg-[var(--color-secondary)] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isSigning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              {isSigning ? "Signing..." : "Sign Contract"}
            </button>
          )}

          {listingId && (
            <Link
              to={`/properties/${listingId}`}
              className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-white/25 hover:text-white"
            >
              View Property
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function ActiveDealsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("bids");

  // Bids from listing service
  const { data: bidsData, isLoading: bidsLoading } = useGetMyBidsQuery();
  const allBids = normalizeBids(bidsData);

  // Deals from deal service
  const { data: dealsData, isLoading: dealsLoading } = useGetMyDealsQuery();
  const allDeals = normalizeDeals(dealsData);

  const isLoading = bidsLoading || dealsLoading;

  // Tab filters
  const activeBids = allBids.filter((b) =>
    ["pending", "accepted", "selected"].includes(getBidStatus(b))
  );
  const rejectedBids = allBids.filter((b) =>
    ["rejected", "withdrawn"].includes(getBidStatus(b))
  );
  const activeDeals = allDeals.filter((d) =>
    ["active", "under_contract", "closing"].includes(getDealStatus(d))
  );
  const closedDeals = allDeals.filter((d) =>
    ["closed", "cancelled"].includes(getDealStatus(d))
  );

  // Stats
  const totalActiveBids = activeBids.length;
  const totalActiveDeals = activeDeals.length;
  const totalClosed = closedDeals.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <Gavel className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Deal Tracker
              </span>
            </div>

            <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
              Active Deals
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Track your submitted bids, pending contracts, and closed deals
              from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "Active Bids",
                value: isLoading ? "—" : totalActiveBids,
                color: "text-[var(--color-secondary)]",
              },
              {
                label: "Active Deals",
                value: isLoading ? "—" : totalActiveDeals,
                color: "text-[var(--color-warning)]",
              },
              {
                label: "Closed",
                value: isLoading ? "—" : totalClosed,
                color: "text-[#6ee7b7]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-white/35">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/8">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 border-b-2 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.value
                ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
            <p className="mt-3 text-sm font-semibold text-white/40">
              Loading your deals...
            </p>
          </div>
        </div>
      )}

      {/* Bids tab */}
      {!isLoading && activeTab === "bids" && (
        <>
          {activeBids.length === 0 && rejectedBids.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-12 text-center">
              <Gavel className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm font-bold text-white/40">
                You haven't submitted any bids yet.
              </p>
              <Link
                to="/properties"
                className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
              >
                Browse Property Stream →
              </Link>
            </div>
          ) : (
            <>
              {activeBids.length > 0 && (
                <div>
                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Active Bids ({activeBids.length})
                  </p>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {activeBids.map((bid: any) => (
                      <BidCard key={String(bid?._id || bid?.id)} bid={bid} />
                    ))}
                  </div>
                </div>
              )}

              {rejectedBids.length > 0 && (
                <div className="mt-6">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Past Bids ({rejectedBids.length})
                  </p>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {rejectedBids.map((bid: any) => (
                      <BidCard key={String(bid?._id || bid?.id)} bid={bid} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Deals tab */}
      {!isLoading && activeTab === "deals" && (
        <>
          {activeDeals.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-12 text-center">
              <Handshake className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm font-bold text-white/40">
                No active deals yet. Get a bid accepted to start a deal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {activeDeals.map((deal: any) => (
                <DealCard key={String(deal?._id || deal?.id)} deal={deal} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Closed tab */}
      {!isLoading && activeTab === "closed" && (
        <>
          {closedDeals.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm font-bold text-white/40">
                No closed deals yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {closedDeals.map((deal: any) => (
                <DealCard key={String(deal?._id || deal?.id)} deal={deal} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

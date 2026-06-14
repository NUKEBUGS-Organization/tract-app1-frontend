import { useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Gavel,
  Handshake,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useSignContractAsBuyerMutation } from "../../services/contractService";

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function formatMoney(value: any) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function normalizeDeals(data: any[] | undefined): any[] {
  return Array.isArray(data) ? data : [];
}

function getDealStatus(deal: any): string {
  return String(deal?.status || "").toLowerCase();
}

type TabValue = "deals" | "closed";

const TABS: { value: TabValue; label: string }[] = [
  { value: "deals", label: "Active Deals" },
  { value: "closed", label: "Closed" },
];

/* ─── Status config ──────────────────────────────────────────────────── */
function getDealStatusConfig(status: string) {
  // Exact DealStatus enum values 
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    active: {
      label: "Under Contract",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: Handshake,
    },
    backup_activated: {
      label: "Backup Activated",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: FileText,
    },
    under_review: {
      label: "Under Review",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
      icon: FileText,
    },
    proceeding_to_closing: {
      label: "Proceeding to Closing",
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

/* ─── Deal stage tracker ─────────────────────────────────────────────── */
const DEAL_STAGES = [
  { key: "under_contract", label: "Under Contract" },
  { key: "inspection", label: "Inspection" },
  { key: "due_diligence", label: "Due Diligence" },
  { key: "marketing", label: "Marketing" },
  { key: "closing", label: "Closing" },
];

// Maps exact DealStatus enum values
function getDealStageIndex(status: string): number {
  const map: Record<string, number> = {
    active: 0,
    backup_activated: 0,
    under_review: 1,
    proceeding_to_closing: 2,
    closed: 4,
    cancelled: 5,
  };
  return map[status] ?? 0;
}

function DealStageTracker({ status }: { status: string }) {
  const currentIndex = getDealStageIndex(status);
  // Exact DealStatus.CLOSED / DealStatus.CANCELLED 
  const isClosed = status === "closed" || status === "cancelled";

  return (
    <div className="mt-5">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-white/40">
        Deal Progress
      </p>
      <div className="flex items-center gap-0">
        {DEAL_STAGES.map((stage, i) => {
          const isDone = isClosed || i < currentIndex;
          const isCurrent = !isClosed && i === currentIndex;

          return (
            <div key={stage.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">

              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={`h-1 flex-1 transition-all ${isDone
                      ? "bg-[#2d6a4f]"
                      : "bg-white/10"
                      }`}
                  />
                )}
                <div
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isDone
                    ? "border-[#2d6a4f] bg-[#2d6a4f]"
                    : isCurrent
                      ? "border-[var(--color-danger)] bg-[var(--color-danger)] shadow-[0_0_0_5px_rgba(220,38,38,0.18)]"
                      : "border-white/15 bg-transparent"
                    }`}
                >
                  {isDone && (
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                  )}
                </div>
                {i < DEAL_STAGES.length - 1 && (
                  <div
                    className={`h-1 flex-1 transition-all ${isDone
                      ? "bg-[#2d6a4f]"
                      : "bg-white/10"
                      }`}
                  />
                )}
              </div>

              {/* Label */}
              <p
                className={`text-center text-[11px] font-bold leading-tight transition-all ${isDone
                  ? "text-[#6ee7b7]"
                  : isCurrent
                    ? "text-[var(--color-danger)]"
                    : "text-white/35"
                  }`}
              >
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#2d6a4f]" />
          <span className="text-[11px] text-white/40">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />
          <span className="text-[11px] text-white/40">Action Required</span>
        </div>
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
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${!isClosed
        ? "border-[var(--color-secondary)]/25 bg-white/[0.06]"
        : "border-white/8 bg-white/[0.03]"
        } hover:border-white/25`}
    >
      {!isClosed && (
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
      )}

      <div className="p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{listingAddress}</p>
            {deal?.listing?.city && (
              <p className="mt-1 text-sm text-white/45">
                {deal.listing.city}
                {deal.listing.state_code ? `, ${deal.listing.state_code}` : ""}
              </p>
            )}
          </div>

          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${config.className}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        </div>

        {/* Bid vs Ask */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-white/40">
              My Offer
            </p>
            <p className="mt-1.5 text-2xl font-black text-[var(--color-secondary)]">
              {formatMoney(bidAmount)}
            </p>
          </div>
          {sellerAsk && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-white/40">
                Asking Price
              </p>
              <p className="mt-1.5 text-2xl font-black text-white">
                {formatMoney(sellerAsk)}
              </p>
            </div>
          )}
        </div>

        {/* Stage Tracker — only for active deals */}
        {!isClosed && <DealStageTracker status={status} />}

        {/* 72h Marketing Countdown — mirrors seller DealTrackerPage */}
        {deal?.marketing_deadline && !deal?.marketing_proof_url && (
          <div className="mt-5 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 p-5">
            <div className="flex items-center gap-2.5 mb-2">
              <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-warning)]">
                72h Marketing Window Active
              </p>
            </div>
            <p className="text-sm text-white/65">
              Upload proof before:{" "}
              <span className="font-bold text-white/85">
                {new Date(deal.marketing_deadline).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        )}

        {deal?.marketing_proof_url && (
          <div className="mt-5 rounded-xl border border-[#6ee7b7]/25 bg-[#6ee7b7]/8 px-5 py-3.5">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#6ee7b7]">
              ✓ Marketing Proof Uploaded
            </p>
          </div>
        )}

        {/* Timeline */}
        {deal?.created_at && (
          <div className="mt-4 text-[12px] text-white/45">
            <span>
              Started:{" "}
              <span className="font-bold text-white/65">
                {new Date(deal.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Sign contract as buyer */}
          {contractId && !isClosed && (
            <button
              type="button"
              onClick={handleSign}
              disabled={isSigning}
              className="flex items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] disabled:opacity-60"
            >
              {isSigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isSigning ? "Signing..." : "Sign Contract"}
            </button>
          )}

          {/* Chat */}
          {deal?.chat_unlocked && (
            <Link
              to="/chat"
              className="flex items-center gap-2 border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/8 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition hover:bg-[var(--color-secondary)]/15"
            >
              <MessageSquare className="h-4 w-4" />
              Open Deal Chat
            </Link>
          )}

          {listingId && (
            <Link
              to={`/properties/${listingId}`}
              className="flex items-center gap-2 border border-white/10 bg-white/5 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/65 transition hover:border-white/25 hover:text-white"
            >
              View Property
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function ActiveDealsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("deals");

  const { data: dealsData, isLoading } = useGetMyDealsQuery();
  const allDeals = normalizeDeals(dealsData);

  // Exact DealStatus enum values
  const activeDeals = allDeals.filter((d) =>
    ["active", "backup_activated", "under_review", "proceeding_to_closing"].includes(
      getDealStatus(d)
    )
  );
  const closedDeals = allDeals.filter((d) =>
    ["closed", "cancelled"].includes(getDealStatus(d))
  );

  const totalActiveDeals = activeDeals.length;
  const totalClosed = closedDeals.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3.5 py-1.5">
              <Gavel className="h-4 w-4 text-[var(--color-secondary)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Deal Tracker
              </span>
            </div>

            <h1 className="font-serif text-4xl font-black text-white lg:text-5xl">
              Active Deals
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/55">
              Track your pending contracts and closed deals from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
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
                className="min-w-[140px] rounded-2xl border border-white/10 bg-white/5 px-6 py-4"
              >
                <p className="text-[11px] font-black uppercase tracking-wider text-white/40">
                  {stat.label}
                </p>
                <p className={`mt-1 text-3xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 border-b-[3px] px-6 py-4 text-[13px] font-black uppercase tracking-[0.22em] transition-all ${activeTab === tab.value
              ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
              : "border-transparent text-white/45 hover:text-white/80"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--color-secondary)]" />
            <p className="mt-4 text-base font-semibold text-white/45">
              Loading your deals...
            </p>
          </div>
        </div>
      )}

      {/* Active deals tab */}
      {!isLoading && activeTab === "deals" && (
        <>
          {activeDeals.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-14 text-center">
              <Handshake className="mx-auto h-10 w-10 text-white/20" />
              <p className="mt-4 text-base font-bold text-white/45">
                No active deals yet. Get a bid accepted to start a deal.
              </p>
              <Link
                to="/my-bids"
                className="mt-5 inline-block text-[12px] font-black uppercase tracking-[0.22em] text-[var(--color-secondary)] hover:underline"
              >
                View My Bids →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-14 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-white/20" />
              <p className="mt-4 text-base font-bold text-white/45">
                No closed deals yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSignature,
  FileText,
  Handshake,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useGetMyBidsQuery } from "../../services/listingService";
import {
  useSignContractAsBuyerMutation,
  useGetMyContractsQuery,
} from "../../services/contractService";

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

function normalizeArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (!data) return [];
  // Backend interceptor sometimes wraps arrays as { "0": ..., "1": ... }
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null)
    return Object.values(payload);
  return [];
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCountdownParts(deadlineValue?: string, now = Date.now()) {
  if (!deadlineValue) return null;
  const deadline = new Date(deadlineValue).getTime();
  if (Number.isNaN(deadline)) return null;
  const diff = deadline - now;
  const safeDiff = Math.max(diff, 0);
  const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDiff / 1000) % 60);
  return {
    expired: diff <= 0,
    compact:
      diff <= 0
        ? "Deadline passed"
        : days > 0
          ? `${days}d ${hours}h ${minutes}m remaining`
          : `${hours}h ${minutes}m ${seconds}s remaining`,
  };
}

function getId(item: any): string {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item?._id || item?.id || "";
}

/* ─── Status config ──────────────────────────────────────────────────── */
function getDealStatusConfig(status: string) {
  const map: Record<
    string,
    { label: string; className: string; icon: React.ElementType }
  > = {
    active: {
      label: "Under Contract",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: Handshake,
    },
    pending_signature: {
      label: "Pending Signature",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: FileSignature,
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
      className: "bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/20",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: XCircle,
    },
    not_started: {
      label: "Not Started",
      className: "bg-white/10 text-white border border-white/20",
      icon: FileText,
    },
  };
  return map[status] ?? map.not_started;
}

/* ─── UI Components ──────────────────────────────────────────────────── */
function StatCardDark({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[var(--shadow-premium)] transition hover:border-white/20">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          {title}
        </p>
        <Icon className="h-5 w-5 text-[var(--color-secondary)]" />
      </div>
      <p className="break-words font-serif text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function TrackerStep({ title, description, done, current, locked }: any) {
  return (
    <div className={`group relative flex gap-5 ${locked ? "opacity-40" : ""}`}>
      <div className="flex flex-col items-center">
        <div
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            done
              ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]"
              : current
                ? "border-[var(--color-danger)] bg-[var(--color-danger)] shadow-[0_0_0_5px_rgba(220,38,38,0.18)]"
                : "border-white/10 bg-transparent"
          }`}
        >
          {done && (
            <CheckCircle2 className="h-4 w-4 text-[var(--color-dark-main)]" />
          )}
          {current && (
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          )}
        </div>
        <div
          className={`w-[2px] flex-1 my-1 transition-all min-h-[30px] ${
            done ? "bg-[var(--color-secondary)]" : "bg-white/10"
          }`}
        />
      </div>
      <div className="pb-8 pt-1">
        <p
          className={`text-[13px] font-black uppercase tracking-wider transition-all ${
            done
              ? "text-[var(--color-secondary)]"
              : current
                ? "text-[var(--color-danger)]"
                : "text-white/40"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-1.5 text-sm leading-relaxed transition-all ${
            done || current ? "text-white/70" : "text-white/30"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/*
 * ─── Unified Entry ──────────────────────────────────────────────────
 *
 * We merge two data sources into a single list:
 *   1. Real deals from `GET /deals/my-deals`
 *   2. "Pending contract" entries from selected bids that don't have a deal yet
 *
 * Each entry has a `_entryKey` for dropdown/routing, which is the listing ID.
 */
interface UnifiedEntry {
  _entryKey: string; // listing ID, used for routing
  _type: "deal" | "pending_contract";
  _raw: any; // original deal or bid object
  address: string;
  status: string;
  bidPrice: number | null;
  marketPrice: number | null;
  // Only present for real deals:
  dealId?: string;
  contractObj?: any; // populated contract from the deal
  contractId?: string;
  marketingDeadline?: string;
  proofUrl?: string;
  proceedToClosingAt?: string;
  chatUnlocked?: boolean;
  // Only present for pending_contract entries:
  bidId?: string; // the bid._id, used to find the contract
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function ActiveDealsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const listingIdFromUrl = searchParams.get("listingId");
  const [now, setNow] = useState(Date.now());

  // Fetch both data sources
  const {
    data: dealsData,
    isLoading: isLoadingDeals,
    refetch: refetchDeals,
    isFetching: isFetchingDeals,
  } = useGetMyDealsQuery();
  const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();

  const allDeals = normalizeArray(dealsData);
  const allBids = normalizeArray(bidsData);

  const [signContractMutation, { isLoading: isSigningBuyer }] =
    useSignContractAsBuyerMutation();

  const isLoading = isLoadingDeals || isLoadingBids;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Build unified entries
  const unifiedEntries: UnifiedEntry[] = useMemo(() => {
    const entries: UnifiedEntry[] = [];
    const dealListingIds = new Set<string>();

    // 1. Add real deals
    for (const deal of allDeals) {
      const listing = deal?.listing_id;
      const listingId =
        typeof listing === "object" ? getId(listing) : String(listing || "");
      if (listingId) dealListingIds.add(listingId);

      const contract = deal?.contract_id;
      const contractObj =
        typeof contract === "object" && contract !== null ? contract : null;

      entries.push({
        _entryKey: listingId,
        _type: "deal",
        _raw: deal,
        address:
          (typeof listing === "object" ? listing?.address : null) ||
          "Untitled Deal",
        status: String(deal?.status || "active").toLowerCase(),
        bidPrice: null, // deals don't carry bid_price directly
        marketPrice:
          typeof listing === "object" ? listing?.market_price : null,
        dealId: getId(deal),
        contractObj,
        contractId: contractObj ? getId(contractObj) : getId(contract),
        marketingDeadline: deal?.marketing_deadline,
        proofUrl: deal?.marketing_proof_url,
        proceedToClosingAt: deal?.proceed_to_closing_at,
        chatUnlocked: deal?.chat_unlocked,
      });
    }

    // 2. Add selected bids that have no matching deal
    for (const bid of allBids) {
      const bidStatus = String(bid?.status || "").toLowerCase();
      if (bidStatus !== "selected") continue;

      const listing = bid?.property_id;
      const listingId =
        typeof listing === "object" ? getId(listing) : String(listing || "");

      // Skip if already covered by a real deal
      if (dealListingIds.has(listingId)) continue;

      entries.push({
        _entryKey: listingId,
        _type: "pending_contract",
        _raw: bid,
        address:
          (typeof listing === "object" ? listing?.address : null) ||
          "Untitled Property",
        status: "pending_signature",
        bidPrice: bid?.bid_price,
        marketPrice:
          typeof listing === "object" ? listing?.market_price : null,
        bidId: getId(bid),
      });
    }

    return entries;
  }, [allDeals, allBids]);

  // Determine active entry (computed after unifiedEntries so we can derive bidId)
  const _tempActiveEntryKey =
    listingIdFromUrl ||
    (unifiedEntries.length > 0 ? unifiedEntries[0]._entryKey : "");
  const _tempActiveEntry = unifiedEntries.find(
    (e) => e._entryKey === _tempActiveEntryKey
  );
  const _pendingBidId =
    _tempActiveEntry?._type === "pending_contract"
      ? _tempActiveEntry.bidId || ""
      : "";

  // Determine active entry (needed to know the listing ID before fetching)
  const activeEntryKey =
    listingIdFromUrl ||
    (unifiedEntries.length > 0 ? unifiedEntries[0]._entryKey : "");

  useEffect(() => {
    if (activeEntryKey && !listingIdFromUrl && !isLoading) {
      setSearchParams({ listingId: activeEntryKey }, { replace: true });
    }
  }, [activeEntryKey, listingIdFromUrl, isLoading, setSearchParams]);

  const activeEntry = unifiedEntries.find(
    (e) => e._entryKey === activeEntryKey
  );

  const isPendingContract = activeEntry?._type === "pending_contract";

  // ─── Fetch my contracts ───
  const {
    data: myContractsData,
    isFetching: isFetchingContractByBid,
    refetch: refetchContractByBid,
  } = useGetMyContractsQuery();

  // Find the contract that matches the pending bid ID
  const contractByBidData = useMemo(() => {
    console.log("[DEBUG] myContractsData:", myContractsData);
    console.log("[DEBUG] _pendingBidId:", _pendingBidId);

    if (!myContractsData || !_pendingBidId) {
      console.log("[DEBUG] Early return: no my contracts or no pendingBidId");
      return null;
    }

    myContractsData.forEach((c: any, i: number) => {
      console.log(`[DEBUG] Contract[${i}]:`, {
        _id: c._id,
        bid_id: c.bid_id,
        status: c.status,
      });
    });

    const found = myContractsData.find((c: any) => {
      const bidId =
        typeof c.bid_id === "object"
          ? c.bid_id?._id || c.bid_id?.id
          : c.bid_id;
      console.log(`[DEBUG] Comparing bidId: "${bidId}" === "${_pendingBidId}" →`, bidId === _pendingBidId);
      return bidId === _pendingBidId;
    }) || null;

    console.log("[DEBUG] contractByBidData (matched):", found);
    return found;
  }, [myContractsData, _pendingBidId]);

  // ─── Derive data from active entry ────────────────────────────────
  const entryStatus = activeEntry?.status || "not_started";
  const statusConfig = getDealStatusConfig(entryStatus);
  const isCancelled = entryStatus === "cancelled";

  // For pending contracts, use the contract fetched by listing ID
  const pendingContractObj = isPendingContract ? contractByBidData : null;

  // For real deals, use the populated contract from the deal
  // For pending contracts, use the fetched contract from bid ID
  const contract = isPendingContract
    ? pendingContractObj
    : activeEntry?.contractObj || null;
  const contractId = isPendingContract
    ? (contract?._id || contract?.id || "")
    : activeEntry?.contractId || "";
  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);
  const isSigned = sellerSigned && buyerSigned;
  const isPending = Boolean(contractId && !isSigned);

  const marketingDeadline = activeEntry?.marketingDeadline;
  const activeCountdown = getCountdownParts(marketingDeadline, now);
  const proofUrl = activeEntry?.proofUrl;
  const proceedToClosing = Boolean(activeEntry?.proceedToClosingAt);

  const dealTitle = activeEntry?.address || "No Deal Selected";
  const dealId = activeEntry?.dealId || "";

  async function handleRefresh() {
    await refetchDeals();
    if (_pendingBidId) {
      await refetchContractByBid();
    }
  }

  async function handleBuyerSign() {
    if (!contractId) return;
    try {
      await signContractMutation(contractId).unwrap();
      await refetchDeals();
      if (_pendingBidId) {
        await refetchContractByBid();
      }
    } catch {
      // silent
    }
  }

  // ─── Tracker Steps ────────────────────────────────────────────────
  // For pending contracts, derive real state from the fetched contract
  const pendingHasContract = isPendingContract && Boolean(contractId);
  const pendingSellerSigned = isPendingContract && sellerSigned;
  const pendingBuyerSigned = isPendingContract && buyerSigned;
  const pendingIsSigned = isPendingContract && isSigned;

  const trackerSteps = isPendingContract
    ? [
        {
          title: "Offer Accepted",
          description:
            "You were selected as the primary partner for this listing.",
          done: true,
          current: false,
          locked: false,
        },
        {
          title: "Contract Created",
          description: pendingHasContract
            ? `Contract ID: ${contractId}`
            : "Waiting for the seller to create the contract.",
          done: pendingHasContract,
          current: !pendingHasContract,
          locked: false,
        },
        {
          title: "Seller Signature",
          description: pendingSellerSigned
            ? `Seller signed at ${formatDateTime(contract?.seller_signed_at)}.`
            : pendingHasContract
              ? "Waiting for seller to sign the contract."
              : "Waiting for contract to be created first.",
          done: pendingSellerSigned,
          current: Boolean(pendingHasContract && !pendingSellerSigned),
          locked: !pendingHasContract,
        },
        {
          title: "Your Signature",
          description: pendingBuyerSigned
            ? `You signed at ${formatDateTime(contract?.buyer_signed_at)}.`
            : pendingSellerSigned
              ? "Action required: Please sign the contract."
              : "Waiting for seller signature first.",
          done: pendingBuyerSigned,
          current: Boolean(pendingSellerSigned && !pendingBuyerSigned),
          locked: !pendingSellerSigned,
        },
        {
          title: "Partnership Secured",
          description: pendingIsSigned
            ? "Both parties signed. Deal is officially active."
            : "Both parties must sign to activate the deal.",
          done: pendingIsSigned,
          current: false,
          locked: !pendingIsSigned,
        },
        {
          title: "Marketing & Buyer Matching",
          description:
            "72-hour marketing window starts after both signatures.",
          done: false,
          current: false,
          locked: !pendingIsSigned,
        },
        {
          title: "Inspection, Title & Escrow",
          description: "Final stages leading to closing.",
          done: false,
          current: false,
          locked: true,
        },
      ]
    : [
        {
          title: "Offer Accepted",
          description:
            "You were selected as the primary partner for this listing.",
          done: true,
          current: false,
          locked: false,
        },
        {
          title: "Contract Created",
          description: contractId
            ? `Contract ID: ${contractId}`
            : "Waiting for the seller to create the contract.",
          done: Boolean(contractId),
          current: !contractId,
          locked: false,
        },
        {
          title: "Seller Signature",
          description: sellerSigned
            ? `Seller signed at ${formatDateTime(contract?.seller_signed_at)}.`
            : "Waiting for seller to sign the contract.",
          done: sellerSigned,
          current: Boolean(contractId && !sellerSigned),
          locked: !contractId,
        },
        {
          title: "Your Signature",
          description: buyerSigned
            ? `You signed at ${formatDateTime(contract?.buyer_signed_at)}.`
            : sellerSigned
              ? "Action required: Please sign the contract."
              : "Waiting for seller signature first.",
          done: buyerSigned,
          current: Boolean(sellerSigned && !buyerSigned),
          locked: !sellerSigned,
        },
        {
          title: "Partnership Secured",
          description: isSigned
            ? "Both parties signed. Deal is officially active."
            : "Pending signatures from both parties.",
          done: isSigned,
          current: false,
          locked: !isSigned,
        },
        {
          title: "Marketing & Buyer Matching",
          description: marketingDeadline
            ? proofUrl
              ? "Marketing proof uploaded successfully."
              : `72-hour tracking is active. ${activeCountdown?.compact || ""}. Upload proof required.`
            : "Starts after the deal is officially secured.",
          done: Boolean(proofUrl),
          current: Boolean(isSigned && marketingDeadline && !proofUrl),
          locked: !isSigned || !marketingDeadline,
        },
        {
          title: "Inspection, Title & Escrow",
          description: proceedToClosing
            ? `Proceeding to closing at ${formatDateTime(activeEntry?.proceedToClosingAt)}.`
            : proofUrl
              ? "Awaiting closing."
              : "Final inspection and closing stages.",
          done: proceedToClosing,
          current: Boolean(proofUrl && !proceedToClosing),
          locked: !proofUrl,
        },
      ];

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Wholesaler Portal
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black text-white">
            Deal Tracker
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Track your contract signatures, marketing deadlines, and complete
            your deals.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetchingDeals}
          className="flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetchingDeals ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
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

      {isCancelled && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          This contract is cancelled. Deal tracker actions are disabled.
        </div>
      )}

      {/* 72h Marketing Countdown Banner */}
      {marketingDeadline && !proofUrl && !isCancelled && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-6 backdrop-blur shadow-[0_0_30px_rgba(220,38,38,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" />
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)]">
                  Action Required: 72h Marketing Window
                </p>
              </div>
              <p className="text-sm text-white/70">
                Upload marketing proof before the kill switch deadline.
              </p>
            </div>
            <div className="rounded-lg bg-black/40 px-6 py-4 text-center border border-white/5 shrink-0">
              <p className="font-serif text-2xl font-black text-white">
                {activeCountdown?.compact}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Select Deal Dropdown */}
      {!isLoading && unifiedEntries.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[var(--shadow-premium)]">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Select Active Deal
          </label>
          <select
            value={activeEntryKey}
            onChange={(e) => setSearchParams({ listingId: e.target.value })}
            className="mt-3 w-full border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[var(--color-secondary)]"
          >
            {unifiedEntries.map((entry) => (
              <option key={entry._entryKey} value={entry._entryKey}>
                {entry.address} (
                {entry._type === "pending_contract"
                  ? "Pending Signature"
                  : entry.status
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                )
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stat Cards */}
      {activeEntry && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCardDark
            title="Contract Status"
            value={
              contractId
                ? isSigned
                  ? "Signed"
                  : isPending
                    ? "Pending"
                    : "Created"
                : isPendingContract
                  ? isFetchingContractByBid
                    ? "Loading..."
                    : "Not Created"
                  : "Not Created"
            }
            icon={FileText}
          />

          <StatCardDark
            title="Signatures"
            value={`${sellerSigned ? "Seller ✓" : "Seller —"} / ${buyerSigned ? "You ✓" : "You —"}`}
            icon={FileSignature}
          />

          <StatCardDark
            title={activeEntry.bidPrice ? "Your Bid" : "Asking Price"}
            value={
              activeEntry.bidPrice
                ? formatMoney(activeEntry.bidPrice)
                : activeEntry.marketPrice
                  ? formatMoney(activeEntry.marketPrice)
                  : "—"
            }
            icon={ShieldCheck}
          />

          <StatCardDark
            title="Live Deadline"
            value={activeCountdown ? activeCountdown.compact : "—"}
            icon={Clock3}
          />
        </div>
      )}

      {/* Main Dashboard */}
      {activeEntry && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-[var(--shadow-premium)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
            <div>
              <h2 className="font-serif text-2xl font-black text-white">
                {dealTitle}
              </h2>
              <p className="mt-1 text-sm text-white/55">
                {isPendingContract
                  ? `${contractId ? `Contract: ${contractId}` : `Bid ID: ${activeEntry.bidId || "-"}`}${contractId ? " · Via selected bid" : " · Awaiting contract"}`
                  : `${contractId ? `Contract: ${contractId}` : "No contract yet"}${dealId ? ` · Deal: ${dealId}` : ""}`}
              </p>
            </div>

            <span
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${statusConfig.className}`}
            >
              <statusConfig.icon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left: Tracker */}
            <div className="space-y-0 pt-4">
              {trackerSteps.map((step) => (
                <TrackerStep
                  key={step.title}
                  title={step.title}
                  description={step.description}
                  done={step.done}
                  current={step.current}
                  locked={step.locked}
                />
              ))}
            </div>

            {/* Right: Panels */}
            <div className="space-y-5">
              {/* Contract Panel */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Contract Panel
                </p>

                <h3 className="mt-2 font-serif text-2xl font-black text-white">
                  {isPendingContract
                    ? "Awaiting Signatures"
                    : !contractId
                      ? "Not Created"
                      : isCancelled
                        ? "Cancelled"
                        : isSigned
                          ? "Partnership Secured"
                          : isPending
                            ? "Signature Required"
                            : "Created"}
                </h3>

                {/* Real deal contract details */}
                {contract && (
                  <div className="mt-5 space-y-4 text-sm">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Contract ID
                      </p>
                      <p className="mt-1 break-all font-bold text-white">
                        {contractId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Contract Status
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {String(contract?.status || "unknown")
                          .split("_")
                          .map(
                            (w: string) =>
                              w.charAt(0).toUpperCase() + w.slice(1)
                          )
                          .join(" ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Seller Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${sellerSigned ? "text-[#6ee7b7]" : "text-white/60"}`}
                      >
                        {sellerSigned
                          ? formatDateTime(contract?.seller_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        You Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${buyerSigned ? "text-[#6ee7b7]" : "text-white/60"}`}
                      >
                        {buyerSigned
                          ? formatDateTime(contract?.buyer_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    {contract?.pdf_url && (
                      <a
                        href={contract.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Contract PDF
                      </a>
                    )}
                  </div>
                )}

                {/* Pending contract info */}
                {isPendingContract && (
                  <div className="mt-5 space-y-4 text-sm">
                    {isFetchingContractByBid && (
                      <div className="flex items-center gap-2 text-white/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading contract...
                      </div>
                    )}
                    {contractId && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                          Contract ID
                        </p>
                        <p className="mt-1 break-all font-bold text-white">
                          {contractId}
                        </p>
                      </div>
                    )}
                    {contractId && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                          Contract Status
                        </p>
                        <p className="mt-1 font-bold text-white">
                          {String(contract?.status || "pending")
                            .split("_")
                            .map(
                              (w: string) =>
                                w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Seller Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${sellerSigned ? "text-[#6ee7b7]" : "text-white/60"}`}
                      >
                        {sellerSigned
                          ? formatDateTime(contract?.seller_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        You Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${buyerSigned ? "text-[#6ee7b7]" : "text-white/60"}`}
                      >
                        {buyerSigned
                          ? formatDateTime(contract?.buyer_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Your Bid
                      </p>
                      <p className="mt-1 font-bold text-[var(--color-secondary)]">
                        {formatMoney(activeEntry.bidPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Asking Price
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {formatMoney(activeEntry.marketPrice)}
                      </p>
                    </div>
                    {contract?.pdf_url && (
                      <a
                        href={contract.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Contract PDF
                      </a>
                    )}
                    {!contractId && !isFetchingContractByBid && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                          Status
                        </p>
                        <p className="mt-1 font-bold text-[var(--color-warning)]">
                          Bid selected — waiting for seller to create contract
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Deal Panel — only for real deals */}
              {!isPendingContract && activeEntry?.dealId && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Deal Panel
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-black text-white">
                    {entryStatus
                      .split("_")
                      .map(
                        (w: string) =>
                          w.charAt(0).toUpperCase() + w.slice(1)
                      )
                      .join(" ")}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Deal ID
                      </p>
                      <p className="mt-1 break-all font-bold text-white">
                        {dealId || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Deadline
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {marketingDeadline
                          ? formatDateTime(marketingDeadline)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Remaining
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {activeCountdown ? activeCountdown.compact : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Chat
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {activeEntry?.chatUnlocked ? "Unlocked" : "Locked"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {contractId &&
                sellerSigned &&
                !buyerSigned &&
                !isCancelled && (
                  <button
                    type="button"
                    onClick={handleBuyerSign}
                    disabled={isSigningBuyer}
                    className="flex w-full items-center justify-center gap-2 bg-[var(--color-danger)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigningBuyer ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSignature className="h-4 w-4" />
                    )}
                    Sign As Buyer
                  </button>
                )}

              {isSigned && !isCancelled && (
                <div className="rounded-xl border border-[#6ee7b7]/30 bg-[#6ee7b7]/10 p-4 text-center text-sm font-semibold text-[#6ee7b7]">
                  ✓ Both parties signed. Partnership is secured.
                </div>
              )}

              {contractId && !sellerSigned && !isCancelled && (
                <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-center text-sm font-semibold text-[var(--color-warning)]">
                  Waiting for seller to sign the contract first.
                </div>
              )}

              {isPendingContract && !contractId && !isFetchingContractByBid && (
                <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-center text-sm font-semibold text-[var(--color-warning)]">
                  Your bid is selected. The seller is creating the contract and
                  signing it. You'll be able to sign once they're done.
                </div>
              )}

              {isPendingContract && contractId && sellerSigned && !buyerSigned && !isCancelled && (
                <button
                  type="button"
                  onClick={handleBuyerSign}
                  disabled={isSigningBuyer}
                  className="flex w-full items-center justify-center gap-2 bg-[var(--color-danger)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningBuyer ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSignature className="h-4 w-4" />
                  )}
                  Sign As Buyer
                </button>
              )}

              {isPendingContract && contractId && !sellerSigned && !isCancelled && (
                <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-center text-sm font-semibold text-[var(--color-warning)]">
                  Contract created. Waiting for seller to sign first.
                </div>
              )}

              {isPendingContract && isSigned && !isCancelled && (
                <div className="rounded-xl border border-[#6ee7b7]/30 bg-[#6ee7b7]/10 p-4 text-center text-sm font-semibold text-[#6ee7b7]">
                  ✓ Both parties signed. Partnership is secured.
                </div>
              )}

              {activeEntry?.chatUnlocked && (
                <Link
                  to="/chat"
                  className="flex w-full items-center justify-center gap-2 border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition hover:bg-[var(--color-secondary)]/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open Deal Chat
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No entries */}
      {!isLoading && unifiedEntries.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-14 text-center">
          <Handshake className="mx-auto h-10 w-10 text-white/20" />
          <p className="mt-4 text-base font-bold text-white/45">
            You don't have any active deals yet.
          </p>
          <Link
            to="/my-bids"
            className="mt-5 inline-block text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
          >
            Submit more bids to start a deal →
          </Link>
        </div>
      )}
    </div>
  );
}
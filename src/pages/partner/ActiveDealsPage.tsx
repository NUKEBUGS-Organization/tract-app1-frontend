import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
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
import {
  useGetMyDealsQuery,
  useUploadMarketingProofMutation,
  useProceedToClosingMutation,
  useCancelDealMutation,
} from "../../services/dealService";
import { useGetMyBidsQuery } from "../../services/listingService";
import {
  useGetMyContractsQuery,
  useCancelContractMutation,
} from "../../services/contractService";
import { useGetChatRoomsQuery } from "../../services/chatService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";
import DocuSealSignButton from "../seller/contracts/DocuSealSignButton";

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
  const totalMs = safeDiff;
  return {
    expired: diff <= 0,
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    totalMs,
    compact:
      diff <= 0
        ? "Deadline passed"
        : days > 0
          ? `${days}d ${hours}h ${minutes}m remaining`
          : `${hours}h ${minutes}m ${seconds}s remaining`,
  };
}

function getProgress(
  startValue?: string,
  deadlineValue?: string,
  now = Date.now(),
) {
  if (!startValue || !deadlineValue) return 0;
  const start = new Date(startValue).getTime();
  const deadline = new Date(deadlineValue).getTime();
  if (Number.isNaN(start) || Number.isNaN(deadline) || deadline <= start)
    return 0;
  const total = deadline - start;
  const elapsed = now - start;
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
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
  isDark,
}: {
  title: string;
  value: string | number;
  icon: any;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[var(--shadow-premium)] transition ${isDark ? "border-white/10 bg-white/[0.04] hover:border-white/20" : "border-[var(--color-border-light)] bg-[var(--color-bg-card)] hover:border-[var(--color-secondary)]/30"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p
          className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
        >
          {title}
        </p>
        <Icon className="h-5 w-5 text-[var(--color-secondary)]" />
      </div>
      <p
        className={`break-words font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function PhaseCountdownBanner({
  title,
  subtitle,
  deadline,
  startAt,
  color,
  isDark,
  now,
  children,
}: {
  title: string;
  subtitle: string;
  deadline?: string;
  startAt?: string;
  color: "danger" | "warning" | "secondary";
  isDark: boolean;
  now: number;
  children?: React.ReactNode;
}) {
  const cd = getCountdownParts(deadline, now);
  const progress = getProgress(startAt, deadline, now);

  const colorMap = {
    danger: {
      border: "border-[var(--color-danger)]/30",
      bg: isDark ? "bg-[var(--color-danger)]/8" : "bg-[var(--color-danger)]/5",
      text: "text-[var(--color-danger)]",
      bar: "bg-[var(--color-danger)]",
      box: isDark
        ? "border-white/10 bg-black/30"
        : "border-[var(--color-border-light)] bg-white",
    },
    warning: {
      border: "border-[var(--color-warning)]/30",
      bg: isDark
        ? "bg-[var(--color-warning)]/8"
        : "bg-[var(--color-warning)]/5",
      text: "text-[var(--color-warning)]",
      bar: "bg-[var(--color-warning)]",
      box: isDark
        ? "border-white/10 bg-black/30"
        : "border-[var(--color-border-light)] bg-white",
    },
    secondary: {
      border: "border-[var(--color-secondary)]/30",
      bg: isDark
        ? "bg-[var(--color-secondary)]/8"
        : "bg-[var(--color-secondary)]/5",
      text: "text-[var(--color-secondary)]",
      bar: "bg-[var(--color-secondary)]",
      box: isDark
        ? "border-white/10 bg-black/30"
        : "border-[var(--color-border-light)] bg-white",
    },
  };
  const c = colorMap[color];

  if (!cd) return null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-card)] ${c.border} ${c.bg}`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className={`mb-1 flex items-center gap-2`}>
            <Clock3 className={`h-4 w-4 ${c.text}`} />
            <p
              className={`text-[11px] font-black uppercase tracking-[0.22em] ${c.text}`}
            >
              {title}
            </p>
          </div>
          <p
            className={`text-sm font-semibold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
          >
            {subtitle}
          </p>
          {deadline && (
            <p
              className={`mt-1 text-xs ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
            >
              Deadline:{" "}
              {new Date(deadline).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}
              >
                Window Progress
              </span>
              <span className={`text-[10px] font-black ${c.text}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-[var(--color-border-light)]"}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 ${c.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div
          className={`grid grid-cols-4 gap-2 rounded-xl border p-3 md:w-[260px] ${c.box}`}
        >
          {[
            { label: "Days", value: cd.days },
            { label: "Hrs", value: cd.hours },
            { label: "Min", value: cd.minutes },
            { label: "Sec", value: cd.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p
                className={`font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
              >
                {item.value}
              </p>
              <p
                className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackerStep({
  title,
  description,
  done,
  current,
  locked,
  isDark,
}: any) {
  return (
    <div className={`group relative flex gap-5 ${locked ? "opacity-40" : ""}`}>
      <div className="flex flex-col items-center">
        <div
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${done
            ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]"
            : current
              ? "border-[var(--color-danger)] bg-[var(--color-danger)] shadow-[0_0_0_5px_rgba(220,38,38,0.18)]"
              : isDark
                ? "border-white/10 bg-transparent"
                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
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
          className={`w-[2px] flex-1 my-1 transition-all min-h-[30px] ${done
            ? "bg-[var(--color-secondary)]"
            : isDark
              ? "bg-white/10"
              : "bg-[var(--color-border-light)]"
            }`}
        />
      </div>
      <div className="pb-8 pt-1">
        <p
          className={`text-[13px] font-black uppercase tracking-wider transition-all ${done
            ? "text-[var(--color-secondary)]"
            : current
              ? "text-[var(--color-danger)]"
              : isDark
                ? "text-white/40"
                : "text-[var(--color-text-muted)]"
            }`}
        >
          {title}
        </p>
        <p
          className={`mt-1.5 text-sm leading-relaxed transition-all ${done || current
            ? isDark
              ? "text-white/70"
              : "text-[var(--color-text-main)]"
            : isDark
              ? "text-white/30"
              : "text-[var(--color-text-muted)]"
            }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* Unified Entry
 *   1. Real deals from `GET /deals/my-deals`
 *   2. "Pending contract" entries from selected bids that don't have a deal yet
 * `_entryKey` -which is the listing ID.
 */
interface UnifiedEntry {
  _entryKey: string;
  _type: "deal" | "pending_contract";
  _raw: any;
  address: string;
  status: string;
  bidPrice: number | null;
  marketPrice: number | null;
  dealId?: string;
  contractObj?: any;
  contractId?: string;
  marketingDeadline?: string;
  proofUrl?: string;
  proceedToClosingAt?: string;
  chatUnlocked?: boolean;
  bidId?: string;
  inspectionPeriod?: number | null;
  dueDiligencePeriod?: number | null;
}

export default function ActiveDealsPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

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
  const { data: chatRoomsData = [] } = useGetChatRoomsQuery();

  const allDeals = normalizeArray(dealsData);
  const allBids = normalizeArray(bidsData);
  const chatRooms = normalizeArray(chatRoomsData);

  function getDealChatRoomId(dealId?: string) {
    if (!dealId) return null;
    const room = chatRooms.find((r: any) => {
      const rDealId = r?.deal_id?._id || r?.deal_id?.id || r?.deal_id;
      return rDealId === dealId;
    });
    return room?._id || room?.id;
  }

  const [cancelContractMutation, { isLoading: isCancellingContract }] =
    useCancelContractMutation();

  const [uploadMarketingProof, { isLoading: isUploadingProof }] =
    useUploadMarketingProofMutation();

  const [proceedToClosingMutation, { isLoading: isProceedingToClosing }] =
    useProceedToClosingMutation();

  const [cancelDealMutation, { isLoading: isCancellingDeal }] =
    useCancelDealMutation();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelContractConfirm, setShowCancelContractConfirm] = useState(false);
  const [docuSealError, setDocuSealError] = useState("");
  const [isDocuSealRefreshing, setIsDocuSealRefreshing] = useState(false);

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
      const listing = deal?.listing || deal?.listing_id || deal?.property_id;
      const listingId =
        typeof listing === "object" ? getId(listing) : String(listing || "");
      if (listingId) dealListingIds.add(listingId);

      const contract = deal?.contract_id;
      const contractObj =
        typeof contract === "object" && contract !== null ? contract : null;

      const matchingBid = allBids.find((b) => {
        const bList = b?.listing || b?.property_id || b?.listing_id;
        return (typeof bList === "object" ? getId(bList) : String(bList || "")) === listingId;
      });

      entries.push({
        _entryKey: listingId,
        _type: "deal",
        _raw: deal,
        address:
          (typeof listing === "object" ? listing?.address : null) ||
          "Untitled Deal",
        status: String(deal?.status || "active").toLowerCase(),
        bidPrice: null,
        marketPrice: typeof listing === "object" ? listing?.market_price : null,
        dealId: getId(deal),
        contractObj,
        contractId: contractObj ? getId(contractObj) : getId(contract),
        marketingDeadline: deal?.marketing_deadline,
        proofUrl: deal?.marketing_proof_url,
        proceedToClosingAt: deal?.proceed_to_closing_at,
        chatUnlocked: deal?.chat_unlocked,
        inspectionPeriod: matchingBid?.inspection_period ?? null,
        dueDiligencePeriod: matchingBid?.due_diligence_period ?? null,
      });
    }

    // 2. Add selected bids that have no matching deal
    for (const bid of allBids) {
      const bidStatus = String(bid?.status || "").toLowerCase();
      if (bidStatus !== "selected") continue;

      const listing = bid?.listing || bid?.property_id || bid?.listing_id;
      const listingId =
        typeof listing === "object" ? getId(listing) : String(listing || "");

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
        marketPrice: typeof listing === "object" ? listing?.market_price : null,
        bidId: getId(bid),
        inspectionPeriod: bid?.inspection_period ?? null,
        dueDiligencePeriod: bid?.due_diligence_period ?? null,
      });
    }

    return entries;
  }, [allDeals, allBids]);

  const _tempActiveEntryKey =
    listingIdFromUrl ||
    (unifiedEntries.length > 0 ? unifiedEntries[0]._entryKey : "");
  const _tempActiveEntry = unifiedEntries.find(
    (e) => e._entryKey === _tempActiveEntryKey,
  );
  const _pendingBidId =
    _tempActiveEntry?._type === "pending_contract"
      ? _tempActiveEntry.bidId || ""
      : "";

  const activeEntryKey =
    listingIdFromUrl ||
    (unifiedEntries.length > 0 ? unifiedEntries[0]._entryKey : "");

  useEffect(() => {
    if (activeEntryKey && !listingIdFromUrl && !isLoading) {
      setSearchParams({ listingId: activeEntryKey }, { replace: true });
    }
  }, [activeEntryKey, listingIdFromUrl, isLoading, setSearchParams]);

  const activeEntry = unifiedEntries.find(
    (e) => e._entryKey === activeEntryKey,
  );

  const isPendingContract = activeEntry?._type === "pending_contract";

  //Fetch my contracts
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

    const found =
      myContractsData.find((c: any) => {
        const bidId =
          typeof c.bid_id === "object"
            ? c.bid_id?._id || c.bid_id?.id
            : c.bid_id;
        console.log(
          `[DEBUG] Comparing bidId: "${bidId}" === "${_pendingBidId}" →`,
          bidId === _pendingBidId,
        );
        return bidId === _pendingBidId;
      }) || null;

    console.log("[DEBUG] contractByBidData (matched):", found);
    return found;
  }, [myContractsData, _pendingBidId]);

  // Derive data from active entry
  const entryStatus = activeEntry?.status || "not_started";
  const statusConfig = getDealStatusConfig(entryStatus);
  const isCancelled = entryStatus === "cancelled";

  const pendingContractObj = isPendingContract ? contractByBidData : null;

  const contract = isPendingContract
    ? pendingContractObj
    : activeEntry?.contractObj || null;
  const contractId = isPendingContract
    ? contract?._id || contract?.id || ""
    : activeEntry?.contractId || "";
  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);
  const isSigned = sellerSigned && buyerSigned;
  const isPending = Boolean(contractId && !isSigned);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEntry?.dealId) return;

    const dummyUrl = `https://mock-storage.com/proofs/${encodeURIComponent(file.name)}`;

    try {
      await uploadMarketingProof({
        dealId: activeEntry.dealId,
        marketing_proof_url: dummyUrl,
      }).unwrap();
      await refetchDeals();
    } catch (err: any) {
      console.error("Failed to upload marketing proof:", err);
      alert("Failed to upload proof. Please try again.");
    }
  };

  const marketingDeadline = activeEntry?.marketingDeadline;
  const activeCountdown = getCountdownParts(marketingDeadline, now);
  const proofUrl = activeEntry?.proofUrl;
  const proceedToClosing = Boolean(activeEntry?.proceedToClosingAt);

  // Due Diligence: uses actual due_diligence_period from the bid (in calendar days)
  const ddDays = activeEntry?.dueDiligencePeriod ?? 10; // fallback to 10 days
  const ddDeadline = marketingDeadline
    ? new Date(
      new Date(marketingDeadline).getTime() + ddDays * 24 * 60 * 60 * 1000,
    ).toISOString()
    : undefined;
  const ddCountdown = getCountdownParts(ddDeadline, now);
  const ddActive = Boolean(proofUrl && !proceedToClosing);
  const ddDone = proceedToClosing || (ddCountdown?.expired ?? false);

  // Inspection Period: uses actual inspection_period from the bid (in calendar days)
  const inspectionDays = activeEntry?.inspectionPeriod ?? 7; // fallback to 7 days
  const inspectionDeadline = ddDeadline
    ? new Date(
      new Date(ddDeadline).getTime() + inspectionDays * 24 * 60 * 60 * 1000,
    ).toISOString()
    : undefined;
  const inspectionCountdown = getCountdownParts(inspectionDeadline, now);
  const inspectionActive = Boolean(proofUrl && ddDone && !proceedToClosing);

  // Dynamic current phase countdown
  let currentPhaseCountdown = activeCountdown; // Default to marketing deadline
  let currentPhaseDeadline = marketingDeadline;

  if (proceedToClosing) {
    currentPhaseCountdown = null; // No strict automated timer after this point
    currentPhaseDeadline = undefined;
  } else if (inspectionActive) {
    currentPhaseCountdown = inspectionCountdown;
    currentPhaseDeadline = inspectionDeadline;
  } else if (ddActive) {
    currentPhaseCountdown = ddCountdown;
    currentPhaseDeadline = ddDeadline;
  }

  const handleProceedToClosing = async () => {
    if (!activeEntry?.dealId) return;
    try {
      await proceedToClosingMutation(activeEntry.dealId).unwrap();
      await refetchDeals();
    } catch (err: any) {
      console.error("Failed to proceed to closing:", err);
      alert("Failed to proceed to closing. Please try again.");
    }
  };

  const handleCancelDeal = async () => {
    if (!activeEntry?.dealId) return;
    try {
      await cancelDealMutation(activeEntry.dealId).unwrap();
      await refetchDeals();
      setShowCancelConfirm(false);
    } catch (err: any) {
      console.error("Failed to cancel deal:", err);
      alert("Failed to cancel deal. Please try again.");
    }
  };

  const dealTitle = activeEntry?.address || "No Deal Selected";
  const dealId = activeEntry?.dealId || "";

  async function handleRefresh() {
    await refetchDeals();
    if (_pendingBidId) {
      await refetchContractByBid();
    }
  }

  async function handleDocuSealReturn() {
    try {
      setIsDocuSealRefreshing(true);
      setDocuSealError("");
      await refetchDeals();
      if (_pendingBidId) {
        await refetchContractByBid();
      }
    } finally {
      setIsDocuSealRefreshing(false);
    }
  }

  async function handleCancelContract() {
    if (!contractId) return;
    setShowCancelContractConfirm(false);
    try {
      await cancelContractMutation(contractId).unwrap();
      if (isPendingContract) {
        await refetchContractByBid();
      } else {
        await refetchDeals();
      }
    } catch (err: any) {
      console.error("Error cancelling contract:", err);
    }
  }

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
        title: "Marketing Proof Submitted",
        description: "72-hour marketing window starts after both signatures.",
        done: false,
        current: false,
        locked: !pendingIsSigned,
      },
      {
        title: "Inspection Period Active",
        description: "Review property condition and repair estimates.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Due Diligence Active",
        description:
          "Verify title, liens, taxes, ownership and deal viability.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Proceed to Closing Confirmed",
        description: "Commits the wholesaler to move forward.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Title & Escrow Opened",
        description: "Title Company Assigned · Escrow File Created",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Clear to Close",
        description: "Title Search Complete · Documents Approved",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Funded & Closed",
        description: "Final payout and transfer.",
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
        title: "Marketing Proof Submitted",
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
        title: "Due Diligence Active",
        description: ddDone
          ? "Due Diligence Complete ✓ — Title, liens, taxes & ownership verified."
          : proofUrl
            ? `${ddDays} Days · ${ddCountdown?.compact || "Calculating…"}. Verify title, liens, taxes, ownership and deal viability.`
            : "Starts after marketing proof is submitted.",
        done: ddDone,
        current: Boolean(proofUrl && !ddDone),
        locked: !proofUrl,
      },
      {
        title: "Inspection Period Active",
        description: proceedToClosing
          ? "Inspection Complete ✓ — Property condition reviewed."
          : inspectionActive
            ? `${inspectionDays} Days · ${inspectionCountdown?.compact || "Calculating…"}. Review property condition and repair estimates.`
            : ddDone
              ? `${inspectionDays} Days Remaining. ${inspectionCountdown?.compact || ""}`
              : "Starts after Due Diligence window closes.",
        done: proceedToClosing,
        current: inspectionActive,
        locked: !ddDone,
      },
      {
        title: "Proceed to Closing Confirmed",
        description: proceedToClosing
          ? `Proceed to closing confirmed ✓ — ${formatDateTime(activeEntry?.proceedToClosingAt)}`
          : "Commits the wholesaler to move forward after inspection & DD are complete.",
        done: proceedToClosing,
        current: Boolean(ddDone && !proceedToClosing),
        locked: !ddDone,
      },
      {
        title: "Title & Escrow Opened",
        description: proceedToClosing
          ? "Title Company Assigned · Escrow File Created · Earnest Money Verified"
          : "Pending confirmation to proceed.",
        done: false,
        current: proceedToClosing,
        locked: !proceedToClosing,
      },
      {
        title: "Clear to Close",
        description:
          "Title Search Complete ✓ · Documents Approved ✓ · Closing Scheduled ✓",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Funded & Closed",
        description: "Final payout and transfer.",
        done: false,
        current: false,
        locked: true,
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
          <h1
            className={`mt-1 font-serif text-3xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
          >
            Deal Tracker
          </h1>
          <p
            className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? "text-white/55" : "text-[var(--color-text-muted)]"}`}
          >
            Track your contract signatures, marketing deadlines, and complete
            your deals.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetchingDeals}
          className={`flex items-center gap-2 border px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition disabled:cursor-not-allowed disabled:opacity-60 ${isDark
            ? "border-white/10 bg-white/5 hover:border-white/25"
            : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-secondary)]/40"
            }`}
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
            <p
              className={`mt-4 text-base font-semibold ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"}`}
            >
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
        <PhaseCountdownBanner
          title="Action Required: 72h Marketing Window"
          subtitle="Upload marketing proof before the kill switch deadline expires."
          deadline={marketingDeadline}
          startAt={contract?.buyer_signed_at}
          color="danger"
          isDark={isDark}
          now={now}
        >
          <label
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition ${isUploadingProof
              ? isDark
                ? "bg-white/20 text-white/50 cursor-not-allowed"
                : "bg-[var(--color-border-light)] text-[var(--color-text-muted)] cursor-not-allowed"
              : "bg-[var(--color-danger)] text-white hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              }`}
          >
            {isUploadingProof ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isUploadingProof ? "Uploading..." : "Upload Proof"}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              className="hidden"
              onChange={handleUploadProof}
              disabled={isUploadingProof}
            />
          </label>
        </PhaseCountdownBanner>
      )}

      {/* Due Diligence Countdown Banner */}
      {proofUrl && !ddDone && !isCancelled && (
        <PhaseCountdownBanner
          title="Due Diligence Period Active"
          subtitle={`Verify title, liens, taxes, ownership and overall deal viability. ${ddDays} Days.`}
          deadline={ddDeadline}
          // startAt={marketingDeadline}
          startAt={contract?.buyer_signed_at}
          color="warning"
          isDark={isDark}
          now={now}
        />
      )}

      {/* Inspection Period Countdown Banner */}
      {proofUrl && ddDone && !proceedToClosing && !isCancelled && (
        <PhaseCountdownBanner
          title="Inspection Period Active"
          subtitle={`Review property condition, structural reports, and repair cost estimates. ${inspectionDays} Days.`}
          deadline={inspectionDeadline}
          //startAt={marketingDeadline}
          startAt={contract?.buyer_signed_at}
          color="secondary"
          isDark={isDark}
          now={now}
        />
      )}

      {/* Select Deal Dropdown */}
      {!isLoading && unifiedEntries.length > 0 && (
        <div
          className={`rounded-2xl border p-5 shadow-[var(--shadow-premium)] ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-card)]"}`}
        >
          <label
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
          >
            Select Active Deal
          </label>
          <select
            value={activeEntryKey}
            onChange={(e) => setSearchParams({ listingId: e.target.value })}
            className={`mt-3 w-full border px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-secondary)] ${isDark
              ? "border-white/10 bg-black/40 text-white"
              : "border-[var(--color-border-light)] bg-white text-[var(--color-text-main)]"
              }`}
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
            isDark={isDark}
          />

          <StatCardDark
            title="Signatures"
            value={`${sellerSigned ? "Seller ✓" : "Seller —"} / ${buyerSigned ? "You ✓" : "You —"}`}
            icon={FileSignature}
            isDark={isDark}
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
            isDark={isDark}
          />

          <StatCardDark
            title="Live Deadline"
            value={currentPhaseCountdown ? currentPhaseCountdown.compact : "—"}
            icon={Clock3}
            isDark={isDark}
          />
        </div>
      )}

      {/* Main Dashboard */}
      {activeEntry && (
        <div
          className={`rounded-2xl border shadow-[var(--shadow-premium)] ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-card)]"}`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-4 border-b p-6 ${isDark ? "border-white/10" : "border-[var(--color-border-light)]"}`}
          >
            <div>
              <h2
                className={`font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
              >
                {dealTitle}
              </h2>
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
                  isDark={isDark}
                />
              ))}
            </div>

            {/* Right: Panels */}
            <div className="space-y-5">
              {/* Contract Panel */}
              <div
                className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                >
                  Contract Panel
                </p>

                <h3
                  className={`mt-2 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                >
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
                {contract && !isPendingContract && (
                  <div className="mt-5 space-y-4 text-sm">
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Contract ID
                      </p>
                      <p
                        className={`mt-1 break-all font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
                        {contractId}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Contract Status
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
                        {String(contract?.status || "unknown")
                          .split("_")
                          .map(
                            (w: string) =>
                              w.charAt(0).toUpperCase() + w.slice(1),
                          )
                          .join(" ")}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Seller Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${sellerSigned ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {sellerSigned
                          ? formatDateTime(contract?.seller_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        You Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${buyerSigned ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {buyerSigned
                          ? formatDateTime(contract?.buyer_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Due Diligence Period
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {activeEntry.dueDiligencePeriod ? `${activeEntry.dueDiligencePeriod} Days` : "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Inspection Period
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {activeEntry.inspectionPeriod ? `${activeEntry.inspectionPeriod} Days` : "—"}
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
                      <div
                        className={`flex items-center gap-2 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading contract...
                      </div>
                    )}
                    {contractId && (
                      <div>
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                        >
                          Contract ID
                        </p>
                        <p
                          className={`mt-1 break-all font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                        >
                          {contractId}
                        </p>
                      </div>
                    )}
                    {contractId && (
                      <div>
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                        >
                          Contract Status
                        </p>
                        <p
                          className={`mt-1 font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                        >
                          {String(contract?.status || "pending")
                            .split("_")
                            .map(
                              (w: string) =>
                                w.charAt(0).toUpperCase() + w.slice(1),
                            )
                            .join(" ")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Seller Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${sellerSigned ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {sellerSigned
                          ? formatDateTime(contract?.seller_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        You Signed
                      </p>
                      <p
                        className={`mt-1 font-bold ${buyerSigned ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {buyerSigned
                          ? formatDateTime(contract?.buyer_signed_at)
                          : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Due Diligence Period
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {activeEntry.dueDiligencePeriod ? `${activeEntry.dueDiligencePeriod} Days` : "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Inspection Period
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}
                      >
                        {activeEntry.inspectionPeriod ? `${activeEntry.inspectionPeriod} Days` : "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Your Bid
                      </p>
                      <p className="mt-1 font-bold text-[var(--color-secondary)]">
                        {formatMoney(activeEntry.bidPrice)}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Asking Price
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
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
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                        >
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
                <div
                  className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                  >
                    Deal Panel
                  </p>
                  <h3
                    className={`mt-2 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                  >
                    {entryStatus
                      .split("_")
                      .map(
                        (w: string) => w.charAt(0).toUpperCase() + w.slice(1),
                      )
                      .join(" ")}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Deal ID
                      </p>
                      <p
                        className={`mt-1 break-all font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
                        {dealId || "-"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Deadline
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
                        {currentPhaseDeadline
                          ? formatDateTime(currentPhaseDeadline)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Remaining
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
                        {currentPhaseCountdown
                          ? currentPhaseCountdown.compact
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                      >
                        Chat
                      </p>
                      <p
                        className={`mt-1 font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                      >
                        {activeEntry?.chatUnlocked && !isCancelled && entryStatus !== "closed" ? "Unlocked" : "Locked"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {contractId && sellerSigned && !buyerSigned && !isCancelled && (
                <div className="space-y-2">
                  {docuSealError && (
                    <p className="rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[11px] font-semibold text-[var(--color-danger)]">
                      {docuSealError}
                    </p>
                  )}
                  <DocuSealSignButton
                    contractId={contractId}
                    label="Sign Contract (DocuSeal)"
                    loadingLabel="Opening DocuSeal..."
                    disabled={isDocuSealRefreshing}
                    className="flex w-full items-center justify-center gap-2 bg-[var(--color-danger)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    onError={(msg: string) => setDocuSealError(msg)}
                    onSigningOpened={() => setDocuSealError("")}
                    onReturnFromSigning={handleDocuSealReturn}
                  />
                </div>
              )}

              {/* Cancel Deal Button */}
              {activeEntry?.dealId && !isCancelled && !proceedToClosing && (
                <div className="mt-2">
                  {!showCancelConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className={`flex w-full items-center justify-center gap-2 border px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
                        ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                        : "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                        }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Deal
                    </button>
                  ) : (
                    <div
                      className={`rounded-xl border p-4 ${isDark
                        ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8"
                        : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
                        }`}
                    >
                      <p
                        className={`mb-3 text-[12px] font-black leading-5 ${isDark
                          ? "text-white/80"
                          : "text-[var(--color-text-main)]"
                          }`}
                      >
                        Are you sure you want to cancel this deal? This action
                        cannot be undone and may affect your reliability score.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCancelDeal}
                          disabled={isCancellingDeal}
                          className="flex flex-1 items-center justify-center gap-2 bg-[var(--color-danger)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCancellingDeal ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Confirm Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCancelConfirm(false)}
                          className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition border ${isDark
                            ? "border-white/15 text-white/60 hover:bg-white/5"
                            : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
                            }`}
                        >
                          Keep Deal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSigned && proofUrl && !proceedToClosing && !isCancelled && (
                <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-6 shadow-[0_0_20px_rgba(34,197,94,0.08)]">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-[var(--color-secondary)]" />
                    <h4 className={`font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                      Proceed to Closing
                    </h4>
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-warning)] mb-4">
                    Action Required
                  </p>
                  <ul className={`space-y-2 mb-5 text-sm font-semibold ${isDark ? "text-white/70" : "text-[var(--color-text-main)]"}`}>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-secondary)]" />{" "}
                      Inspection Complete
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-secondary)]" />{" "}
                      Due Diligence Complete
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={handleProceedToClosing}
                    disabled={isProceedingToClosing}
                    className="flex w-full items-center justify-center gap-2 bg-[var(--color-secondary)] px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-dark-main)] shadow-[0_0_20px_rgba(34,197,94,0.2)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProceedingToClosing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Proceed to Closing
                  </button>
                  <p className={`mt-4 text-xs text-center leading-relaxed ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
                    This is an important milestone because it commits the
                    wholesaler to move forward.
                  </p>
                </div>
              )}

              {proceedToClosing && !isCancelled && (
                <div className="rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 p-4 text-center text-sm font-semibold text-[var(--color-secondary)]">
                  ✓ Proceeding to closing confirmed. Title & Escrow is open.
                </div>
              )}

              {isSigned && !proceedToClosing && !isCancelled && (
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

              {contractId && !isCancelled && !isSigned && (
                <div className="mt-2">
                  {!showCancelContractConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelContractConfirm(true)}
                      className={`flex w-full items-center justify-center gap-2 border px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
                        ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                        : "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                        }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Contract
                    </button>
                  ) : (
                    <div
                      className={`rounded-xl border p-4 ${isDark
                        ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8"
                        : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
                        }`}
                    >
                      <p
                        className={`mb-3 text-[12px] font-black leading-5 ${isDark
                          ? "text-white/80"
                          : "text-[var(--color-text-main)]"
                          }`}
                      >
                        Are you sure you want to cancel this contract? This will
                        terminate the deal and notify the seller. This action
                        cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCancelContract}
                          disabled={isCancellingContract}
                          className="flex flex-1 items-center justify-center gap-2 bg-[var(--color-danger)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCancellingContract ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Confirm Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCancelContractConfirm(false)}
                          className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition border ${isDark
                            ? "border-white/15 text-white/60 hover:bg-white/5"
                            : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
                            }`}
                        >
                          Keep Contract
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeEntry?.chatUnlocked && !isCancelled && entryStatus !== "closed" && (
                <Link
                  to={
                    getDealChatRoomId(activeEntry.dealId)
                      ? `/chat/${getDealChatRoomId(activeEntry.dealId)}`
                      : "/chat"
                  }
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
        <div
          className={`rounded-2xl border p-14 text-center ${isDark ? "border-white/8 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}
        >
          <Handshake
            className={`mx-auto h-10 w-10 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"}`}
          />
          <p
            className={`mt-4 text-base font-bold ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"}`}
          >
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

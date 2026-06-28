import React, { useEffect, useMemo, useState } from "react";
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
  Upload,
  XCircle,
} from "lucide-react";
import {
  useGetMyDealsQuery,
  useUploadMarketLaunchProofMutation,
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
import DocuSealSignButton from "../../components/contracts/DocuSealSignButton";

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
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null) return Object.values(payload);
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
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    totalMs: safeDiff,
    isUrgent: diff > 0 && diff < 24 * 60 * 60 * 1000,
  };
}

function getProgress(startValue?: string, deadlineValue?: string, now = Date.now()) {
  if (!startValue || !deadlineValue) return 0;
  const start = new Date(startValue).getTime();
  const deadline = new Date(deadlineValue).getTime();
  if (Number.isNaN(start) || Number.isNaN(deadline) || deadline <= start) return 0;
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
      label: "Closed 🏡",
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
      className:
        "bg-[var(--color-border-light)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]",
      icon: FileText,
    },
  };
  return map[status] ?? map.not_started;
}

/* ─── Deal Tracker Step component ────────────────────────────────────── */
const REALTOR_TRACKER_STAGES = [
  { key: "listing_secured", label: "Listing Secured" },
  { key: "marketing_prep", label: "Marketing Preparation" },
  { key: "market_launch", label: "Market Launch" },
  { key: "buyer_engagement", label: "Buyer Engagement" },
  { key: "negotiation", label: "Negotiation" },
  { key: "under_contract", label: "Under Contract" },
  { key: "closing", label: "Closing" },
];

function DealTrackerPipeline({
  currentStage,
  isCancelled,
}: {
  currentStage: number;
  isCancelled: boolean;
}) {
  return (
    <div className="space-y-3">
      {REALTOR_TRACKER_STAGES.map((stage, i) => {
        const isDone = i < currentStage && !isCancelled;
        const isCurrent = i === currentStage && !isCancelled;
        const isLocked = i > currentStage || isCancelled;
        return (
          <div key={stage.key} className={`flex gap-4 ${isLocked ? "opacity-40" : ""}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isDone
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : isCurrent
                      ? "border-[var(--color-danger)] bg-[var(--color-danger)] shadow-[0_0_0_5px_rgba(220,38,38,0.18)]"
                      : "border-[var(--color-border-light)] bg-white"
                }`}
              >
                {isDone && <CheckCircle2 className="h-4 w-4 text-white" />}
                {isCurrent && <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />}
              </div>
              {i < REALTOR_TRACKER_STAGES.length - 1 && (
                <div
                  className={`my-1 min-h-[24px] w-0.5 ${
                    isDone ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-light)]"
                  }`}
                />
              )}
            </div>
            <div className="pb-4 pt-1">
              <p
                className={`text-[13px] font-black uppercase tracking-wider ${
                  isDone
                    ? "text-[var(--color-primary)]"
                    : isCurrent
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-text-muted)]"
                }`}
              >
                {stage.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Countdown Banner ───────────────────────────────────────────────── */
function SevenDayBanner({
  deadline,
  startAt,
  now,
  hasProof,
  onUpload,
  isUploading,
}: {
  deadline?: string;
  startAt?: string;
  now: number;
  hasProof: boolean;
  onUpload: (url: string) => void;
  isUploading: boolean;
}) {
  const cd = getCountdownParts(deadline, now);
  const progress = getProgress(startAt, deadline, now);

  if (!cd || hasProof) return null;

  const isUrgent = cd.isUrgent || cd.expired;
  const borderColor = isUrgent ? "border-[var(--color-danger)]/30" : "border-[var(--color-warning)]/30";
  const bgColor = isUrgent ? "bg-[var(--color-danger)]/5" : "bg-[var(--color-warning)]/5";
  const textColor = isUrgent ? "text-[var(--color-danger)]" : "text-[var(--color-warning)]";
  const barColor = isUrgent ? "bg-[var(--color-danger)]" : "bg-[var(--color-warning)]";

  return (
    <div className={`overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-card)] ${borderColor} ${bgColor}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Clock3 className={`h-4 w-4 ${textColor}`} />
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${textColor}`}>
              {cd.expired ? "Kill Switch — Deadline Passed!" : "7-Day Market Launch Rule"}
            </p>
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">
            {cd.expired
              ? "The seller may now cancel your agreement. Upload proof immediately."
              : "Upload proof of marketing (MLS, open houses, social media, etc.)"}
          </p>
          {deadline && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
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
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Window Progress
              </span>
              <span className={`text-[10px] font-black ${textColor}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-light)]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Upload proof button */}
          <div className="mt-4">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                isUploading
                  ? "pointer-events-none opacity-50"
                  : isUrgent
                    ? "border-[var(--color-danger)] bg-[var(--color-danger)] text-white hover:opacity-90"
                    : "border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:opacity-90"
              }`}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Marketing Proof"}
              <input
                type="file"
                className="sr-only"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const dummyUrl = `https://mock-storage.com/realtor-proof/${encodeURIComponent(file.name)}`;
                  onUpload(dummyUrl);
                }}
              />
            </label>
          </div>
        </div>

        {/* Countdown box */}
        <div className="grid grid-cols-4 gap-2 rounded-xl border border-[var(--color-border-light)] bg-white p-3 md:w-[260px]">
          {[
            { label: "Days", value: cd.days },
            { label: "Hrs", value: cd.hours },
            { label: "Min", value: cd.minutes },
            { label: "Sec", value: cd.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className={`font-serif text-2xl font-black ${isUrgent ? "text-[var(--color-danger)]" : "text-[var(--color-primary)]"}`}>
                {item.value}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Types ─────────────────────────────────────────────────────── */
interface UnifiedEntry {
  _entryKey: string;
  _type: "deal" | "pending_contract";
  _raw: any;
  address: string;
  status: string;
  bidPrice: number | null;
  dealId?: string;
  contractObj?: any;
  contractId?: string;
  marketLaunchDeadline?: string;
  proofUrl?: string;
  chatUnlocked?: boolean;
  bidId?: string;
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function RealtorActiveDealsPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";
  const [searchParams, setSearchParams] = useSearchParams();
  const listingIdFromUrl = searchParams.get("listingId");
  const [now, setNow] = useState(Date.now());
  const [docuSealError, setDocuSealError] = useState("");
  const [isDocuSealRefreshing, setIsDocuSealRefreshing] = useState(false);

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
  const [uploadMarketLaunchProof, { isLoading: isUploadingProof }] =
    useUploadMarketLaunchProofMutation();
  const [proceedToClosingMutation, { isLoading: isProceedingToClosing }] =
    useProceedToClosingMutation();
  const [cancelDealMutation, { isLoading: isCancellingDeal }] = useCancelDealMutation();

  const isLoading = isLoadingDeals || isLoadingBids;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Build unified entries
  const unifiedEntries: UnifiedEntry[] = useMemo(() => {
    const entries: UnifiedEntry[] = [];
    const dealListingIds = new Set<string>();

    for (const deal of allDeals) {
      const listing = deal?.listing || deal?.listing_id || deal?.property_id;
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
          (typeof listing === "object" ? listing?.address : null) || "Untitled Deal",
        status: String(deal?.status || "active").toLowerCase(),
        bidPrice: null,
        dealId: getId(deal),
        contractObj,
        contractId: contractObj ? getId(contractObj) : getId(contract),
        marketLaunchDeadline: deal?.market_launch_deadline || deal?.marketing_deadline,
        proofUrl: deal?.market_launch_proof_url || deal?.marketing_proof_url,
        chatUnlocked: deal?.chat_unlocked,
      });
    }

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
          (typeof listing === "object" ? listing?.address : null) || "Untitled Property",
        status: "pending_signature",
        bidPrice: bid?.bid_price,
        bidId: getId(bid),
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

  const activeEntry = unifiedEntries.find((e) => e._entryKey === activeEntryKey);
  const isPendingContract = activeEntry?._type === "pending_contract";

  const {
    data: myContractsData,
    refetch: refetchContractByBid,
  } = useGetMyContractsQuery();

  const contractByBidData = useMemo(() => {
    if (!myContractsData || !_pendingBidId) return null;
    return (
      myContractsData.find((c: any) => {
        const bidId =
          typeof c.bid_id === "object" ? c.bid_id?._id || c.bid_id?.id : c.bid_id;
        return bidId === _pendingBidId;
      }) || null
    );
  }, [myContractsData, _pendingBidId]);

  const entryStatus = activeEntry?.status || "not_started";
  const statusConfig = getDealStatusConfig(entryStatus);
  const isCancelled = entryStatus === "cancelled";

  const pendingContractObj = isPendingContract ? contractByBidData : null;
  const contract = isPendingContract ? pendingContractObj : activeEntry?.contractObj || null;
  const contractId = isPendingContract
    ? contract?._id || contract?.id || ""
    : activeEntry?.contractId || "";
  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);
  const isSigned = sellerSigned && buyerSigned;

  const marketLaunchDeadline = activeEntry?.marketLaunchDeadline;
  const proofUrl = activeEntry?.proofUrl;
  const hasProof = Boolean(proofUrl);

  // Determine current deal tracker stage
  function getCurrentStage(): number {
    if (isCancelled) return -1;
    if (!isSigned) return 0; // Listing secured
    if (!hasProof) return 1; // Marketing preparation
    const dealStatus = entryStatus;
    if (dealStatus === "proceeding_to_closing") return 5;
    if (dealStatus === "closed") return 6;
    return 2; // Market launch / buyer engagement
  }

  const currentStage = getCurrentStage();

  const handleUploadMarketLaunchProof = async (url: string) => {
    if (!activeEntry?.dealId) return;
    try {
      await uploadMarketLaunchProof({
        dealId: activeEntry.dealId,
        market_launch_proof_url: url,
      }).unwrap();
      await refetchDeals();
    } catch (err: any) {
      console.error("Failed to upload market launch proof:", err);
      alert("Failed to upload proof. Please try again.");
    }
  };

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
    if (!window.confirm("Are you sure you want to cancel this deal?")) return;
    try {
      await cancelDealMutation(activeEntry.dealId).unwrap();
      await refetchDeals();
    } catch (err: any) {
      console.error("Failed to cancel deal:", err);
      alert("Failed to cancel deal. Please try again.");
    }
  };

  async function handleRefresh() {
    await refetchDeals();
    if (_pendingBidId) await refetchContractByBid();
  }

  async function handleDocuSealReturn() {
    try {
      setIsDocuSealRefreshing(true);
      setDocuSealError("");
      // Fetch fresh data
      await refetchDeals();
      if (_pendingBidId) await refetchContractByBid();
    } catch (err) {
      console.error("Error refreshing after DocuSeal sign:", err);
    } finally {
      setIsDocuSealRefreshing(false);
    }
  }

  async function handleCancelContract() {
    if (!contractId) return;
    if (!window.confirm("Are you sure you want to cancel this contract?")) return;
    try {
      await cancelContractMutation(contractId).unwrap();
      if (isPendingContract) await refetchContractByBid();
      else await refetchDeals();
    } catch (err: any) {
      console.error("Error cancelling contract:", err);
    }
  }

  const chatRoomId = getDealChatRoomId(activeEntry?.dealId);
  const chatUnlocked = activeEntry?.chatUnlocked || isSigned;

  // ─── Render ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className={`rounded-2xl border px-8 py-6 text-center shadow-[var(--shadow-card)] ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-white"}`}>
          <Loader2 className={`mx-auto h-8 w-8 animate-spin ${isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"}`} />
          <p className={`mt-3 text-sm font-semibold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
            Loading Active Deals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className={`relative overflow-hidden rounded-2xl p-8 ${isDark ? "bg-transparent border border-white/5" : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90"}`}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.45)"} 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage: "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
          }}
        />
        <div className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 ${isDark ? "border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]" : "border-white/10"}`} />
        <div className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 ${isDark ? "border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]" : "border-[var(--color-secondary)]/20"}`} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${isDark ? "border-[#d4af37]/30 bg-[#d4af37]/10" : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15"}`}>
              <Handshake className={`h-3 w-3 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`}>
                Deal Tracker
              </span>
            </div>
            <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
              Active Deals
            </h1>
            <div className={`mt-1 h-0.5 w-16 rounded-full ${isDark ? "bg-[#d4af37]/60" : "bg-[var(--color-secondary)]/60"}`} />
            <p className={`mt-4 max-w-xl text-sm leading-relaxed ${isDark ? "text-white/60" : "text-white/70"}`}>
              Track your listing agreements, marketing milestones, and deal progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4af37]/30" : "border-white/20 bg-white/10 hover:bg-white/20"}`}>
              <Handshake className={`h-5 w-5 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`} />
              <div>
                <p className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"}`}>
                  Active Deals
                </p>
                <p className="text-xl font-black text-white tabular-nums">
                  {unifiedEntries.length}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetchingDeals}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetchingDeals ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Empty state */}
      {unifiedEntries.length === 0 && (
        <div className={`rounded-2xl border p-12 text-center shadow-[var(--shadow-card)] ${isDark ? "border-white/8 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-white"}`}>
          <Handshake className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"}`} />
          <p className={`mt-3 text-sm font-bold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
            No active deals yet.
          </p>
          <Link
            to="/properties"
            className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
          >
            Browse Seller Opportunities →
          </Link>
        </div>
      )}

      {/* Split layout */}
      {unifiedEntries.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left: Deal list */}
          <div className="flex flex-col gap-3">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              Your Deals ({unifiedEntries.length})
            </p>
            {unifiedEntries.map((entry) => {
              const isActive = entry._entryKey === activeEntryKey;
              const sConf = getDealStatusConfig(entry.status);
              const StatusIcon = sConf.icon;
              return (
                <button
                  key={entry._entryKey}
                  type="button"
                  onClick={() =>
                    setSearchParams({ listingId: entry._entryKey }, { replace: true })
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[0_0_0_1px_var(--color-primary)]"
                      : isDark
                        ? "border-white/10 bg-white/[0.04] hover:border-[var(--color-secondary)]/50 hover:shadow-md"
                        : "border-[var(--color-border-light)] bg-white hover:border-[var(--color-secondary)] hover:shadow-md"
                  }`}
                >
                  <p className={`truncate text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                    {entry.address}
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${sConf.className}`}
                  >
                    <StatusIcon className="h-2.5 w-2.5" />
                    {sConf.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Deal detail */}
          {activeEntry && (
            <div className="space-y-6">
              {/* Status header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                    Deal Detail
                  </p>
                  <h2 className={`mt-1 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                    {activeEntry.address}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusConfig.className}`}
                  >
                    <statusConfig.icon className="h-3.5 w-3.5" />
                    {statusConfig.label}
                  </span>
                  {chatUnlocked && chatRoomId && (
                    <Link
                      to={`/chat/${chatRoomId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Open Chat
                    </Link>
                  )}
                </div>
              </div>

              {/* 7-Day Market Launch Countdown */}
              {!isCancelled && isSigned && (
                <SevenDayBanner
                  deadline={marketLaunchDeadline}
                  startAt={contract?.buyer_signed_at || activeEntry._raw?.createdAt}
                  now={now}
                  hasProof={hasProof}
                  onUpload={handleUploadMarketLaunchProof}
                  isUploading={isUploadingProof}
                />
              )}

              {/* Proof uploaded confirmation */}
              {hasProof && (
                <div className="flex items-start gap-4 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-black text-[var(--color-primary)]">
                      Marketing Proof Uploaded ✓
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      The seller has been notified. Continue managing buyer engagement.
                    </p>
                  </div>
                </div>
              )}

              {/* Contract Signing */}
              {isPendingContract && (
                <div className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-white"}`}>
                  <h3 className={`font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                    Listing Agreement
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                    {!contractId
                      ? "Waiting for the seller to generate the listing agreement."
                      : !sellerSigned
                        ? "Waiting for the seller to sign the agreement."
                        : !buyerSigned
                          ? "The seller has signed. Your signature is required."
                          : "Both parties have signed. Listing is active!"}
                  </p>

                  {contractId && !buyerSigned && sellerSigned && (
                    <div className="mt-4 flex flex-col items-start gap-2">
                      {docuSealError && (
                        <div className="text-xs font-bold text-[var(--color-danger)]">
                          {docuSealError}
                        </div>
                      )}
                      <DocuSealSignButton
                        contractId={contractId}
                        label="Sign Agreement (DocuSeal)"
                        loadingLabel="Opening DocuSeal..."
                        disabled={isDocuSealRefreshing}
                        className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
                        onError={(msg) => setDocuSealError(msg)}
                        onSigningOpened={() => setDocuSealError("")}
                        onReturnFromSigning={handleDocuSealReturn}
                      />
                    </div>
                  )}

                  {contractId && !isSigned && (
                    <button
                      type="button"
                      onClick={handleCancelContract}
                      disabled={isCancellingContract}
                      className="mt-3 ml-3 inline-flex items-center gap-2 border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/20 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Contract
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Deal Tracker Pipeline */}
                <div className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-white"}`}>
                  <h3 className={`mb-5 font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                    Deal Progress
                  </h3>
                  <DealTrackerPipeline
                    currentStage={currentStage < 0 ? 0 : currentStage}
                    isCancelled={isCancelled}
                  />
                </div>

                {/* Deal Actions */}
                <div className="space-y-4">
                  {/* Stats */}
                  <div className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-white"}`}>
                    <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                      Deal Info
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Offer Price",
                          value: formatMoney(activeEntry.bidPrice || activeEntry._raw?.bid_price),
                        },
                        {
                          label: "Contract ID",
                          value: contractId ? `...${contractId.slice(-8)}` : "Pending",
                        },
                        {
                          label: "Seller Signed",
                          value: sellerSigned ? `✓ ${formatDateTime(contract?.seller_signed_at)}` : "Pending",
                        },
                        {
                          label: "Realtor Signed",
                          value: buyerSigned ? `✓ ${formatDateTime(contract?.buyer_signed_at)}` : "Pending",
                        },
                        {
                          label: "Marketing Proof",
                          value: hasProof ? "✓ Uploaded" : "Not Yet",
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isDark ? "border-white/8 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}
                        >
                          <span className={`text-[11px] ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
                            {row.label}
                          </span>
                          <span className={`text-[11px] font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isCancelled && isSigned && (
                    <div className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[var(--color-border-light)] bg-white"}`}>
                      <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                        Actions
                      </p>
                      <div className="space-y-3">
                        {hasProof && entryStatus !== "proceeding_to_closing" && (
                          <button
                            type="button"
                            onClick={handleProceedToClosing}
                            disabled={isProceedingToClosing}
                            className="w-full bg-[var(--color-secondary)] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
                          >
                            {isProceedingToClosing ? "Processing..." : "Proceed to Closing"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleCancelDeal}
                          disabled={isCancellingDeal}
                          className="w-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/20 disabled:pointer-events-none disabled:opacity-50"
                        >
                          {isCancellingDeal ? "Cancelling..." : "Cancel Deal"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 7-day info if not yet signed */}
                  {!isSigned && !isCancelled && (
                    <div className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-warning)]">
                            Awaiting Signatures
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                            The 7-day marketing clock starts after both parties sign the listing agreement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

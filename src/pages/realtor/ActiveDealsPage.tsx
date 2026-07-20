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
  ShieldCheck,
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
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null)
    return Object.values(payload).filter(
      (item: any) => item && typeof item === "object" && (item._id || item.id),
    );
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
    compact:
      diff <= 0
        ? "Deadline passed"
        : days > 0
          ? `${days}d ${hours}h ${minutes}m remaining`
          : `${hours}h ${minutes}m ${seconds}s remaining`,
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
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    active: {
      label: "Listing Active",
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
        "bg-white/10 text-white border border-white/20",
      icon: FileText,
    },
  };
  return map[status] ?? map.not_started;
}

/* ─── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({
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

/* ─── Phase Countdown Banner ─────────────────────────────────────────── */
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
      box: isDark ? "border-white/10 bg-black/30" : "border-[var(--color-border-light)] bg-white",
    },
    warning: {
      border: "border-[var(--color-warning)]/30",
      bg: isDark ? "bg-[var(--color-warning)]/8" : "bg-[var(--color-warning)]/5",
      text: "text-[var(--color-warning)]",
      bar: "bg-[var(--color-warning)]",
      box: isDark ? "border-white/10 bg-black/30" : "border-[var(--color-border-light)] bg-white",
    },
    secondary: {
      border: "border-[var(--color-secondary)]/30",
      bg: isDark ? "bg-[var(--color-secondary)]/8" : "bg-[var(--color-secondary)]/5",
      text: "text-[var(--color-secondary)]",
      bar: "bg-[var(--color-secondary)]",
      box: isDark ? "border-white/10 bg-black/30" : "border-[var(--color-border-light)] bg-white",
    },
  };
  const c = colorMap[color];

  if (!cd) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-card)] ${c.border} ${c.bg}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Clock3 className={`h-4 w-4 ${c.text}`} />
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${c.text}`}>
              {title}
            </p>
          </div>
          <p className={`text-sm font-semibold ${isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
            {subtitle}
          </p>
          {deadline && (
            <p className={`mt-1 text-xs ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
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
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
                Window Progress
              </span>
              <span className={`text-[10px] font-black ${c.text}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-[var(--color-border-light)]"}`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${c.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div className={`grid grid-cols-4 gap-2 rounded-xl border p-3 md:w-[260px] ${c.box}`}>
          {[
            { label: "Days", value: cd.days },
            { label: "Hrs", value: cd.hours },
            { label: "Min", value: cd.minutes },
            { label: "Sec", value: cd.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className={`font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                {item.value}
              </p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tracker Step ────────────────────────────────────────────────────── */
function TrackerStep({
  title,
  description,
  done,
  current,
  locked,
  isDark,
}: {
  title: string;
  description: string;
  done: boolean;
  current: boolean;
  locked: boolean;
  isDark: boolean;
}) {
  return (
    <div className={`group relative flex gap-5 ${locked ? "opacity-35" : ""}`}>
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
          {done && <CheckCircle2 className="h-4 w-4 text-[var(--color-dark-main)]" />}
          {current && <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />}
        </div>
        <div
          className={`my-1 min-h-[30px] w-[2px] flex-1 transition-all ${done
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
          className={`mt-1.5 text-sm leading-relaxed ${done || current
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

/* ─── Unified Entry Type ─────────────────────────────────────────────── */
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
  commissionPct?: number | null;
  agencyRole?: string | null;
  closingTimelineDays?: number | null;
  netToSeller?: number | null;
  paymentSource?: string | null;
}

/* ─── Cancel Confirm Modal ───────────────────────────────────────────── */
function CancelConfirmModal({
  open,
  type,
  dealTitle,
  isLoading,
  isDark,
  onConfirm,
  onClose,
}: {
  open: boolean;
  type: "deal" | "agreement";
  dealTitle: string;
  isLoading: boolean;
  isDark: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  const isDeal = type === "deal";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-md rounded-2xl border shadow-[0_25px_60px_rgba(0,0,0,0.45)] ${isDark
          ? "border-white/10 bg-[#0f0f14]"
          : "border-[var(--color-border-light)] bg-white"
          }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b p-5 ${isDark ? "border-white/10" : "border-[var(--color-border-light)]"
          }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)]`}>
                Destructive Action
              </p>
              <h3 className={`mt-0.5 font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}>
                {isDeal ? "Cancel Deal" : "Cancel Agreement"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`rounded-full p-2 transition ${isDark ? "hover:bg-white/8 text-white/40" : "hover:bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
              }`}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className={`text-sm leading-6 ${isDark ? "text-white/70" : "text-[var(--color-text-muted)]"
            }`}>
            You are about to cancel the{" "}
            {isDeal ? "deal" : "listing agreement"} for{" "}
            <span className={`font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}>
              {dealTitle}
            </span>.
          </p>

          <div className={`mt-4 space-y-2.5 rounded-xl border p-4 ${isDark
            ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/8"
            : "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5"
            }`}>
            {(isDeal
              ? [
                "This deal will be permanently cancelled.",
                "The seller will be notified immediately.",
                "This action cannot be undone.",
                "May negatively affect your Professional Score.",
              ]
              : [
                "The listing agreement will be cancelled.",
                "You will lose your exclusive representation status.",
                "The seller will be notified immediately.",
                "This action cannot be undone.",
              ]
            ).map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                <p className={`text-[12px] font-semibold leading-5 ${isDark ? "text-white/65" : "text-[var(--color-text-main)]"
                  }`}>
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 border-t p-5 ${isDark ? "border-white/10" : "border-[var(--color-border-light)]"
          }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 border py-3.5 text-[11px] font-black uppercase tracking-[0.18em] transition disabled:opacity-50 ${isDark
              ? "border-white/15 text-white/60 hover:bg-white/5"
              : "border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
              }`}
          >
            Keep {isDeal ? "Deal" : "Agreement"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 bg-[var(--color-danger)] py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(220,38,38,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isLoading
              ? "Cancelling..."
              : `Confirm — Cancel ${isDeal ? "Deal" : "Agreement"}`}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [cancelModal, setCancelModal] = useState<{ open: boolean; type: "deal" | "agreement" }>(
    { open: false, type: "deal" },
  );

  const {
    data: dealsData,
    isLoading: isLoadingDeals,
    refetch: refetchDeals,
    isFetching: isFetchingDeals,
  } = useGetMyDealsQuery();
  const { data: bidsData, isLoading: isLoadingBids, refetch: refetchBids } = useGetMyBidsQuery();
  const { data: chatRoomsData = [] } = useGetChatRoomsQuery();
  const { data: myContractsData, refetch: refetchContractByBid, isFetching: isFetchingContractByBid } =
    useGetMyContractsQuery();

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

  /* Build unified entries */
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

      const matchingBid = allBids.find((b) => {
        const bList = b?.listing || b?.property_id || b?.listing_id;
        return (
          (typeof bList === "object" ? getId(bList) : String(bList || "")) === listingId
        );
      });

      entries.push({
        _entryKey: listingId,
        _type: "deal",
        _raw: deal,
        address: (typeof listing === "object" ? listing?.address : null) || "Untitled Deal",
        status: String(deal?.status || "active").toLowerCase(),
        bidPrice: matchingBid?.bid_price ?? null,
        dealId: getId(deal),
        contractObj,
        contractId: contractObj ? getId(contractObj) : getId(contract),
        marketLaunchDeadline: deal?.market_launch_deadline || deal?.marketing_deadline,
        proofUrl: deal?.market_launch_proof_url || deal?.marketing_proof_url,
        chatUnlocked: deal?.chat_unlocked,
        commissionPct: matchingBid?.commission_percentage ?? null,
        agencyRole: matchingBid?.agency_role ?? null,
        closingTimelineDays: matchingBid?.closing_timeline_days ?? null,
        netToSeller: matchingBid?.net_to_seller ?? null,
        paymentSource: matchingBid?.payment_source ?? null,
      });
    }

    for (const bid of allBids) {
      const bidId = getId(bid);
      const contractForBid = (myContractsData || []).find((c: any) => {
        const cBidId = typeof c.bid_id === "object" ? (c.bid_id?._id || c.bid_id?.id) : c.bid_id;
        return cBidId === bidId;
      });

      const isSelected = String(bid?.status || "").toLowerCase() === "selected";
      const isContractCancelled = contractForBid?.status === "cancelled";

      if (!isSelected && !isContractCancelled) continue;

      const listing = bid?.listing || bid?.property_id || bid?.listing_id;
      const listingId =
        typeof listing === "object" ? getId(listing) : String(listing || "");
      if (dealListingIds.has(listingId) && !isContractCancelled) continue;

      entries.push({
        _entryKey: isContractCancelled ? `${listingId}-cancelled-${bidId}` : listingId,
        _type: "pending_contract",
        _raw: bid,
        address:
          (typeof listing === "object" ? listing?.address : null) || "Untitled Property",
        status: isContractCancelled ? "cancelled" : "pending_signature",
        bidPrice: bid?.bid_price ?? null,
        bidId: bidId,
        commissionPct: bid?.commission_percentage ?? null,
        agencyRole: bid?.agency_role ?? null,
        closingTimelineDays: bid?.closing_timeline_days ?? null,
        netToSeller: bid?.net_to_seller ?? null,
        paymentSource: bid?.payment_source ?? null,
      });
    }

    return entries;
  }, [allDeals, allBids, myContractsData]);

  const _tempActiveEntryKey =
    listingIdFromUrl || (unifiedEntries.length > 0 ? unifiedEntries[0]._entryKey : "");
  const _tempActiveEntry = unifiedEntries.find((e) => e._entryKey === _tempActiveEntryKey);
  const _pendingBidId =
    _tempActiveEntry?._type === "pending_contract" ? _tempActiveEntry.bidId || "" : "";

  const activeEntryKey =
    listingIdFromUrl || (unifiedEntries.length > 0 ? unifiedEntries[0]._entryKey : "");

  useEffect(() => {
    if (activeEntryKey && !listingIdFromUrl && !isLoading) {
      setSearchParams({ listingId: activeEntryKey }, { replace: true });
    }
  }, [activeEntryKey, listingIdFromUrl, isLoading, setSearchParams]);

  const activeEntry = unifiedEntries.find((e) => e._entryKey === activeEntryKey);
  const isPendingContract = activeEntry?._type === "pending_contract";


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
  // For pending_contract entries the status is always hardcoded "pending_signature".
  // We must also check the fetched contract object's own status so that a cancellation
  // (before either party signs) is correctly reflected in the UI.
  const pendingContractObj = isPendingContract ? contractByBidData : null;
  const contractCancelled = Boolean(
    isPendingContract &&
    (pendingContractObj?.status === "cancelled" ||
      contractByBidData?.status === "cancelled")
  );
  const isCancelled = entryStatus === "cancelled" || contractCancelled;

  const contract = isPendingContract ? pendingContractObj : activeEntry?.contractObj || null;
  const contractId = isPendingContract
    ? contract?._id || contract?.id || ""
    : activeEntry?.contractId || "";
  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);
  const isSigned = sellerSigned && buyerSigned;
  const isPending = Boolean(contractId && !isSigned);

  const marketLaunchDeadline = activeEntry?.marketLaunchDeadline;
  const proofUrl = activeEntry?.proofUrl;
  const hasProof = Boolean(proofUrl);
  const proceedToClosing = entryStatus === "proceeding_to_closing" || entryStatus === "closed";
  const activeCountdown = getCountdownParts(marketLaunchDeadline, now);

  const chatRoomId = getDealChatRoomId(activeEntry?.dealId);
  const chatUnlocked = activeEntry?.chatUnlocked || isSigned;
  const dealTitle = activeEntry?.address || "No Deal Selected";
  const dealId = activeEntry?.dealId || "";

  /* Dynamic tracker steps */
  const pendingHasContract = isPendingContract && Boolean(contractId);
  const pendingSellerSigned = isPendingContract && sellerSigned;
  const pendingBuyerSigned = isPendingContract && buyerSigned;
  const pendingIsSigned = isPendingContract && isSigned;

  const trackerSteps = isPendingContract
    ? [
      {
        title: "Offer Selected",
        description: "Your representation offer was accepted by the seller.",
        done: true,
        current: false,
        locked: false,
      },
      {
        title: "Listing Agreement Created",
        description: pendingHasContract
          ? `Agreement ID: ...${contractId.slice(-8)}`
          : "Waiting for the seller to generate the listing agreement.",
        done: pendingHasContract,
        current: !pendingHasContract,
        locked: false,
      },
      {
        title: "Seller Signature",
        description: pendingSellerSigned
          ? `Seller signed at ${formatDateTime(contract?.seller_signed_at)}.`
          : pendingHasContract
            ? "Waiting for seller to sign the agreement."
            : "Waiting for agreement to be created first.",
        done: pendingSellerSigned,
        current: Boolean(pendingHasContract && !pendingSellerSigned),
        locked: !pendingHasContract,
      },
      {
        title: "Your Signature",
        description: pendingBuyerSigned
          ? `You signed at ${formatDateTime(contract?.buyer_signed_at)}.`
          : pendingSellerSigned
            ? "Action required: Please sign the listing agreement."
            : "Waiting for seller signature first.",
        done: pendingBuyerSigned,
        current: Boolean(pendingSellerSigned && !pendingBuyerSigned),
        locked: !pendingSellerSigned,
      },
      {
        title: "Listing Secured",
        description: pendingIsSigned
          ? "Both parties signed. Listing is officially active."
          : "Both parties must sign to activate the listing.",
        done: pendingIsSigned,
        current: false,
        locked: !pendingIsSigned,
      },
      {
        title: "7-Day Marketing Launch",
        description: "Upload MLS listing, open house schedule, or social media proof within 7 days of signing.",
        done: false,
        current: false,
        locked: !pendingIsSigned,
      },
      {
        title: "Buyer Engagement",
        description: "Manage inquiries, schedule showings, and coordinate with interested buyers.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Negotiation & Offer Review",
        description: "Review buyer offers and negotiate on behalf of the seller.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Under Contract with Buyer",
        description: "A buyer is selected. Purchase contract signed. Closing timeline activated.",
        done: false,
        current: false,
        locked: true,
      },
      {
        title: "Closing",
        description: "Transaction closes. Commission disbursed. Professional Score updated.",
        done: false,
        current: false,
        locked: true,
      },
    ]
    : [
      {
        title: "Offer Selected",
        description: "Your representation offer was accepted by the seller.",
        done: true,
        current: false,
        locked: false,
      },
      {
        title: "Listing Agreement Created",
        description: contractId
          ? `Agreement ID: ...${contractId.slice(-8)}`
          : "Waiting for the seller to generate the listing agreement.",
        done: Boolean(contractId),
        current: !contractId,
        locked: false,
      },
      {
        title: "Seller Signature",
        description: sellerSigned
          ? `Seller signed at ${formatDateTime(contract?.seller_signed_at)}.`
          : "Waiting for seller to sign the agreement.",
        done: sellerSigned,
        current: Boolean(contractId && !sellerSigned),
        locked: !contractId,
      },
      {
        title: "Your Signature",
        description: buyerSigned
          ? `You signed at ${formatDateTime(contract?.buyer_signed_at)}.`
          : sellerSigned
            ? "Action required: Please sign the listing agreement."
            : "Waiting for seller signature first.",
        done: buyerSigned,
        current: Boolean(sellerSigned && !buyerSigned),
        locked: !sellerSigned,
      },
      {
        title: "Listing Secured",
        description: isSigned
          ? "Both parties signed. Listing is officially active."
          : "Both parties must sign to activate the listing.",
        done: isSigned,
        current: false,
        locked: !isSigned,
      },
      {
        title: "7-Day Marketing Launch",
        description: marketLaunchDeadline
          ? hasProof
            ? "Marketing proof uploaded successfully. Listing is visible to buyers."
            : `Kill-switch deadline active. ${activeCountdown?.compact || ""}. Upload MLS or marketing proof now.`
          : "7-day clock starts after both parties sign the agreement.",
        done: hasProof,
        current: Boolean(isSigned && marketLaunchDeadline && !hasProof),
        locked: !isSigned || !marketLaunchDeadline,
      },
      {
        title: "Buyer Engagement",
        description: hasProof
          ? "Property is live. Manage inquiries, showings, and buyer feedback."
          : "Starts after marketing proof is submitted.",
        done: Boolean(hasProof && proceedToClosing),
        current: Boolean(hasProof && !proceedToClosing),
        locked: !hasProof,
      },
      {
        title: "Negotiation & Offer Review",
        description: proceedToClosing
          ? "Negotiation complete. Buyer offer accepted."
          : "Review buyer offers and negotiate on behalf of the seller.",
        done: proceedToClosing,
        current: Boolean(hasProof && !proceedToClosing),
        locked: !hasProof,
      },
      {
        title: "Proceed to Closing",
        description: proceedToClosing
          ? `Confirmed ✓ — Closing process initiated.`
          : "Confirm when buyer and seller have agreed on final terms.",
        done: proceedToClosing,
        current: Boolean(hasProof && !proceedToClosing),
        locked: !hasProof,
      },
      {
        title: "Closing",
        description:
          entryStatus === "closed"
            ? "Transaction closed. Commission disbursed. Professional Score updated."
            : proceedToClosing
              ? "Title & escrow opened. Closing scheduled."
              : "Final stage — transaction closes and commission is disbursed.",
        done: entryStatus === "closed",
        current: proceedToClosing && entryStatus !== "closed",
        locked: !proceedToClosing,
      },
    ];

  /* Handlers */
  const handleUploadMarketLaunchProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEntry?.dealId) return;
    const dummyUrl = `https://mock-storage.com/realtor-proof/${encodeURIComponent(file.name)}`;
    try {
      await uploadMarketLaunchProof({
        dealId: activeEntry.dealId,
        market_launch_proof_url: dummyUrl,
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
    try {
      await cancelDealMutation(activeEntry.dealId).unwrap();
      await refetchDeals();
      setCancelModal({ open: false, type: "deal" });
    } catch (err: any) {
      console.error("Failed to cancel deal:", err);
      alert("Failed to cancel deal. Please try again.");
    }
  };

  async function handleRefresh() {
    await refetchDeals();
    await refetchContractByBid();
  }


  // test this again ?? if doent work remove the await block + settime out
  async function handleDocuSealReturn() {
    try {
      setIsDocuSealRefreshing(true);
      setDocuSealError("");

      // First pass — immediate refetch (may arrive before webhook lands)
      await refetchDeals();
      await refetchContractByBid();

      // Second pass — delayed refetch 3 seconds later.
      // DocuSeal fires onReturnFromSigning only 1 second after window focus,
      // but the DocuSeal → backend webhook can take a few more seconds to
      // update buyer_signed_at. This ensures the UI reflects the signed state.
      await new Promise<void>((resolve) => {
        window.setTimeout(async () => {
          try {
            await refetchDeals();
            await refetchContractByBid();
          } finally {
            resolve();
          }
        }, 3000);
      });
      // await block end 
    } finally {
      setIsDocuSealRefreshing(false);
    }
  }



  async function handleCancelContract() {
    if (!contractId) return;
    setCancelModal({ open: true, type: "agreement" });
  }

  async function executeCancelContract() {
    if (!contractId) return;
    try {
      await cancelContractMutation(contractId).unwrap();
      await Promise.all([refetchBids(), refetchContractByBid(), refetchDeals()]);
      setCancelModal({ open: false, type: "agreement" });
    } catch (err: any) {
      console.error("Error cancelling contract:", err);
    }
  }

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Realtor Portal
          </p>
          <h1
            className={`mt-1 font-serif text-3xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
          >
            Deal Tracker
          </h1>
          <p
            className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? "text-white/55" : "text-[var(--color-text-muted)]"}`}
          >
            Track your listing agreements, 7-day marketing deadlines, and guide your deals to closing.
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
          <RefreshCw className={`h-4 w-4 ${isFetchingDeals ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--color-secondary)]" />
            <p className={`mt-4 text-base font-semibold ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"}`}>
              Loading your deals...
            </p>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm font-semibold text-[var(--color-danger)]">
          This listing agreement is cancelled. Deal tracker actions are disabled.
        </div>
      )}

      {/* 7-Day Marketing Countdown Banner */}
      {marketLaunchDeadline && !hasProof && !isCancelled && !isLoading && (
        <PhaseCountdownBanner
          title="Action Required: 7-Day Marketing Rule"
          subtitle="Upload proof of marketing (MLS listing, open house, social media, etc.) before the Kill Switch activates."
          deadline={marketLaunchDeadline}
          startAt={contract?.buyer_signed_at}
          color="danger"
          isDark={isDark}
          now={now}
        >
          <label
            className={`inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition ${isUploadingProof
              ? "cursor-not-allowed bg-[var(--color-border-light)] text-[var(--color-text-muted)]"
              : "bg-[var(--color-danger)] text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              }`}
          >
            {isUploadingProof ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploadingProof ? "Uploading..." : "Upload Marketing Proof"}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              className="hidden"
              onChange={handleUploadMarketLaunchProof}
              disabled={isUploadingProof}
            />
          </label>
        </PhaseCountdownBanner>
      )}

      {/* Empty state */}
      {!isLoading && unifiedEntries.length === 0 && (
        <div
          className={`rounded-2xl border p-12 text-center shadow-[var(--shadow-card)] ${isDark ? "border-white/8 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-white"}`}
        >
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
                {entry.status
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
      {activeEntry && !isLoading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard
            title="Contract Status"
            value={
              isCancelled
                ? "Cancelled"
                : contractId
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
          <StatCard
            title="Signatures"
            value={`${sellerSigned ? "Seller ✓" : "Seller —"} / ${buyerSigned ? "You ✓" : "You —"}`}
            icon={FileSignature}
            isDark={isDark}
          />
          <StatCard
            title="Sale Price"
            value={formatMoney(activeEntry.bidPrice)}
            icon={ShieldCheck}
            isDark={isDark}
          />
          <StatCard
            title="Marketing Deadline"
            value={
              activeCountdown && !hasProof
                ? activeCountdown.compact
                : hasProof
                  ? "Proof Uploaded ✓"
                  : "—"
            }
            icon={Clock3}
            isDark={isDark}
          />
        </div>
      )}

      {/* Main Dashboard */}
      {activeEntry && !isLoading && (
        <div
          className={`rounded-2xl border shadow-[var(--shadow-premium)] ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-card)]"}`}
        >
          {/* Panel header */}
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
            <div className="flex items-center gap-3">
              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${statusConfig.className}`}
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
                  Listing Agreement
                </p>
                <h3
                  className={`mt-2 font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                >
                  {!contractId
                    ? "Not Created"
                    : isCancelled
                      ? "Cancelled"
                      : isSigned
                        ? "Listing Secured"
                        : isPending
                          ? "Signature Required"
                          : "Created"}
                </h3>

                <div className="mt-5 space-y-4 text-sm">
                  {contractId && (
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                        Agreement ID
                      </p>
                      <p className={`mt-1 break-all font-bold ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                        {contractId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                      Seller Signed
                    </p>
                    <p className={`mt-1 font-bold ${sellerSigned ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
                      {sellerSigned ? formatDateTime(contract?.seller_signed_at) : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                      You Signed
                    </p>
                    <p className={`mt-1 font-bold ${buyerSigned ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
                      {buyerSigned ? formatDateTime(contract?.buyer_signed_at) : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                      Marketing Proof
                    </p>
                    <p className={`mt-1 font-bold ${hasProof ? "text-[#16a34a]" : isDark ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
                      {hasProof ? "✓ Uploaded" : "Not Yet"}
                    </p>
                  </div>

                  {/* Pending contract awaiting contract creation */}
                  {isPendingContract && !contractId && !isFetchingContractByBid && (
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                        Status
                      </p>
                      <p className="mt-1 font-bold text-[var(--color-warning)]">
                        Offer selected — waiting for seller to create listing agreement
                      </p>
                    </div>
                  )}
                  {isPendingContract && isFetchingContractByBid && (
                    <div className={`flex items-center gap-2 ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading agreement...
                    </div>
                  )}

                  {contract?.pdf_url && (
                    <a
                      href={contract.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Agreement PDF
                    </a>
                  )}
                </div>

                {/* DocuSeal Sign Button */}
                {contractId && sellerSigned && !buyerSigned && !isCancelled && (
                  <div className="mt-4">
                    {docuSealError && (
                      <p className="mb-2 rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[11px] font-semibold text-[var(--color-danger)]">
                        {docuSealError}
                      </p>
                    )}
                    <DocuSealSignButton
                      contractId={contractId}
                      label="Sign Agreement (DocuSeal)"
                      loadingLabel="Opening DocuSeal..."
                      disabled={isDocuSealRefreshing}
                      className="flex w-full items-center justify-center gap-2 bg-[var(--color-secondary)] py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
                      onError={(msg) => setDocuSealError(msg)}
                      onSigningOpened={() => setDocuSealError("")}
                      onReturnFromSigning={handleDocuSealReturn}
                    />
                  </div>
                )}

                {/* Cancel Agreement Button */}
                {contractId && !isCancelled && !isSigned && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleCancelContract}
                      disabled={isCancellingContract}
                      className="flex w-full items-center justify-center gap-2 border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/20 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {isCancellingContract ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Cancel Agreement
                    </button>
                  </div>
                )}
              </div>

              {/* Deal Panel — Realtor-specific fields */}
              {!isPendingContract && activeEntry?.dealId && (
                <div
                  className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                  >
                    Deal Info
                  </p>
                  <h3
                    className={`mt-2 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                  >
                    {entryStatus.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      {
                        label: "Proposed Sale Price",
                        value: formatMoney(activeEntry.bidPrice),
                        color: "text-[var(--color-secondary)]",
                      },
                      {
                        label: "Commission",
                        value:
                          activeEntry.commissionPct != null
                            ? `${activeEntry.commissionPct}% ${activeEntry.paymentSource === "Buyer Pays Commission" ? "(Buyer pays)" : "(Seller pays)"}`
                            : "—",
                      },
                      {
                        label: "Net-to-Seller",
                        value: formatMoney(activeEntry.netToSeller),
                      },
                      {
                        label: "Agency Role",
                        value: activeEntry.agencyRole || "—",
                      },
                      {
                        label: "Closing Timeline",
                        value: activeEntry.closingTimelineDays
                          ? `${activeEntry.closingTimelineDays} Days`
                          : "—",
                      },
                      {
                        label: "Deal ID",
                        value: dealId ? `...${dealId.slice(-8)}` : "—",
                      },
                      {
                        label: "Chat",
                        value: chatUnlocked && !isCancelled ? "Unlocked" : "Locked",
                      },
                    ].map((row) => (
                      <div key={row.label}>
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                        >
                          {row.label}
                        </p>
                        <p
                          className={`mt-1 font-bold ${"color" in row && row.color ? row.color : isDark ? "text-white" : "text-[var(--color-primary)]"}`}
                        >
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Panel */}
              {!isCancelled && isSigned && (
                <div
                  className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-black/20" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}
                >
                  <p
                    className={`mb-3 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
                  >
                    Actions
                  </p>
                  <div className="space-y-3">
                    {hasProof && !proceedToClosing && (
                      <button
                        type="button"
                        onClick={handleProceedToClosing}
                        disabled={isProceedingToClosing}
                        className="w-full bg-[var(--color-secondary)] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isProceedingToClosing ? "Processing..." : "Proceed to Closing"}
                      </button>
                    )}
                    {!hasProof && (
                      <label
                        className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 border py-3.5 text-[10px] font-black uppercase tracking-[0.18em] transition hover:scale-[1.01] ${isDark
                          ? "border-[var(--color-secondary)] bg-[var(--color-secondary)] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] hover:opacity-90"
                          : "border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:opacity-90"
                          } ${isUploadingProof ? "pointer-events-none opacity-50" : ""}`}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingProof ? "Uploading..." : "Upload Marketing Proof"}
                        <input
                          type="file"
                          accept="application/pdf,image/png,image/jpeg"
                          className="hidden"
                          onChange={handleUploadMarketLaunchProof}
                          disabled={isUploadingProof}
                        />
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() => setCancelModal({ open: true, type: "deal" })}
                      className={`flex w-full items-center justify-center gap-2 border px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition ${isDark
                        ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                        : "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                        }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Deal
                    </button>
                  </div>
                </div>
              )}

              {/* Awaiting signature info */}
              {!isSigned && !isCancelled && (
                <div className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-5">
                  <div className="flex items-start gap-3">
                    <FileSignature className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
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


              {chatUnlocked && chatRoomId && !isCancelled && entryStatus !== "closed" && (
                <Link
                  to={`/chat/${chatRoomId}`}
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
      {/* Cancel Confirm Modal */}
      <CancelConfirmModal
        open={cancelModal.open}
        type={cancelModal.type}
        dealTitle={dealTitle}
        isLoading={cancelModal.type === "deal" ? isCancellingDeal : isCancellingContract}
        isDark={isDark}
        onConfirm={cancelModal.type === "deal" ? handleCancelDeal : executeCancelContract}
        onClose={() => setCancelModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
}

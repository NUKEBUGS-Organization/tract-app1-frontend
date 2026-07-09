import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSignature,
  FileText,
  HandshakeIcon,
  ShieldCheck,
  XCircle,
  Loader2,
} from "lucide-react";
import { useGetMyBidsQuery } from "../../services/listingService";
import { useGetMyContractsQuery } from "../../services/contractService";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useGetMeQuery } from "../../services/userService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

function formatMoney(value: any) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function normalizeOffers(data: any): any[] {
  const raw: any = data;
  const payload = raw?.data ?? raw;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.bids)) return payload.bids;
  if (typeof payload === "object" && payload !== null) {
    return Object.values(payload).filter((item: any) =>
      Boolean(item && typeof item === "object" && (item._id || item.id))
    );
  }
  return [];
}

function getOfferStatus(bid: any): string {
  return String(bid?.status || "active").toLowerCase();
}

/* ─── Status Config (realtor-specific labels) ────────────────────────── */
function getContractStatusConfig(bid: any, contracts: any[], deals: any[]) {
  const bidId = bid?._id || bid?.id;

  const contract = contracts.find((c: any) => {
    const cBidId =
      typeof c.bid_id === "object" ? c.bid_id?._id || c.bid_id?.id : c.bid_id;
    return cBidId === bidId;
  });

  const contractId = contract?._id || contract?.id;
  const deal = deals.find((d: any) => {
    const dContractId =
      typeof d.contract_id === "object"
        ? d.contract_id?._id || d.contract_id?.id
        : d.contract_id;
    return dContractId === contractId;
  });

  if (!contract) {
    return {
      label: "Awaiting Listing Agreement",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: Clock,
      contract,
      deal,
    };
  }

  const contractStatus = String(contract?.status || "pending").toLowerCase();
  const dealStatus = String(deal?.status || "").toLowerCase();

  if (contractStatus === "cancelled" || dealStatus === "cancelled") {
    return {
      label: dealStatus === "cancelled" ? "Deal Cancelled" : "Agreement Cancelled",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: XCircle,
      contract,
      deal,
    };
  }

  if (contractStatus === "signed") {
    if (dealStatus === "closed") {
      return {
        label: "Deal Closed 🏡",
        className: "bg-[#16a34a]/15 text-[#16a34a] border border-[#16a34a]/30",
        icon: CheckCircle2,
        contract,
        deal,
      };
    }
    return {
      label: "Agreement Signed — Active Listing",
      className:
        "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
      icon: CheckCircle2,
      contract,
      deal,
    };
  }

  // Pending: check who has signed
  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at); // buyer = realtor in this context

  if (sellerSigned && !buyerSigned) {
    return {
      label: "Your Signature Required",
      className:
        "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
      icon: FileSignature,
      contract,
      deal,
    };
  }

  if (!sellerSigned) {
    return {
      label: "Awaiting Seller Signature",
      className:
        "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
      icon: ShieldCheck,
      contract,
      deal,
    };
  }

  return {
    label: "Pending Signatures",
    className:
      "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
    icon: FileSignature,
    contract,
    deal,
  };
}

/* ─── Contract Card ───────────────────────────────────────────────────── */
function ContractCard({
  bid,
  contracts,
  deals,
  isDark,
}: {
  bid: any;
  contracts: any[];
  deals: any[];
  isDark: boolean;
}) {
  const { label, className, icon: StatusIcon, contract, deal } =
    getContractStatusConfig(bid, contracts, deals);

  const offerPrice = bid?.bid_price || bid?.amount;
  const commissionPct = bid?.commission_percentage || 2.5;
  const listingAddress =
    bid?.listing?.address ||
    bid?.property_id?.address ||
    bid?.property_address ||
    "Property";
  const listingId =
    bid?.listing?._id || bid?.property_id?._id || bid?.listing_id || bid?.property_id;
  const listingCity = bid?.listing?.city || bid?.property_id?.city;
  const listingState = bid?.listing?.state_code || bid?.property_id?.state_code;

  const contractStatus = String(contract?.status || "pending").toLowerCase();
  const dealStatus = String(deal?.status || "").toLowerCase();
  const isSigned = contractStatus === "signed";
  const isCancelled = contractStatus === "cancelled" || dealStatus === "cancelled";

  const sellerSigned = Boolean(contract?.seller_signed_at);
  const buyerSigned = Boolean(contract?.buyer_signed_at);
  const needsRealtorSignature =
    contract && sellerSigned && !buyerSigned && !isCancelled;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
        isCancelled
          ? isDark
            ? "border-white/8 bg-white/[0.025] opacity-60"
            : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] opacity-60"
          : isDark
            ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 shadow-[0_0_30px_rgba(212,175,55,0.08)] hover:border-[var(--color-secondary)]/50"
            : "border-[var(--color-secondary)]/40 bg-white shadow-[0_0_30px_rgba(212,175,55,0.12)] hover:border-[var(--color-secondary)]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
      }`}
    >
      {!isCancelled && (
        <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`truncate text-sm font-black ${
                isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
            >
              {listingAddress}
            </p>
            {listingCity && (
              <p
                className={`mt-0.5 text-[11px] ${
                  isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
              >
                {listingCity}
                {listingState ? `, ${listingState}` : ""}
              </p>
            )}
          </div>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {label}
          </span>
        </div>

        {/* Action required */}
        {needsRealtorSignature && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
              isDark
                ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                : "bg-[var(--color-danger)]/8 text-[var(--color-danger)]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Your signature is required to activate this listing.
          </div>
        )}

        {/* Offer price + commission */}
        <div
          className={`mt-4 rounded-xl border p-3 ${
            isDark
              ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8"
              : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5"
          }`}
        >
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
            My Representation Offer
          </p>
          <p className="mt-1 text-xl font-black text-[var(--color-secondary)]">
            {formatMoney(offerPrice)}
          </p>
          {commissionPct && (
            <p
              className={`mt-0.5 text-[10px] font-semibold ${
                isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
              }`}
            >
              {commissionPct}% commission
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {listingId && (
            <Link
              to={`/properties/${listingId}`}
              className={`flex items-center gap-1.5 border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white hover:bg-white/10"
                  : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
              }`}
            >
              View Property
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}

          {needsRealtorSignature && listingId && (
            <Link
              to={`/deals?listingId=${listingId}`}
              className="flex items-center gap-1.5 border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
            >
              Sign Agreement
              <FileSignature className="h-3.5 w-3.5" />
            </Link>
          )}

          {isSigned && listingId && (
            <Link
              to={`/deals?listingId=${listingId}`}
              className={`flex items-center gap-1.5 bg-[var(--color-secondary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] ${
                isDark ? "hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]" : ""
              }`}
            >
              Go to Deal
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {(bid?.submitted_at || bid?.created_at) && (
          <p
            className={`mt-3 text-[10px] ${
              isDark ? "text-white/25" : "text-[var(--color-text-muted)]"
            }`}
          >
            Submitted{" "}
            {new Date(bid.submitted_at || bid.created_at).toLocaleDateString(undefined, {
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

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function RealtorMyContractsPage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const [statusFilter, setStatusFilter] = useState("all");

  const { data: meData } = useGetMeQuery();
  const currentUserId =
    (meData as any)?.data?._id ||
    (meData as any)?.data?.id ||
    (meData as any)?._id ||
    (meData as any)?.id ||
    "";

  const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();
  const { data: contractsData = [], isLoading: isLoadingContracts } =
    useGetMyContractsQuery();
  const { data: dealsData, isLoading: isLoadingDeals } = useGetMyDealsQuery();

  const isLoading = isLoadingBids || isLoadingContracts || isLoadingDeals;
  const allDeals = Array.isArray(dealsData) ? dealsData : [];

  const rawOffers = normalizeOffers(bidsData);
  const allOffers = currentUserId
    ? rawOffers.filter((b: any) => {
        const bidderId =
          typeof b?.bidder_id === "object"
            ? b.bidder_id?._id || b.bidder_id?.id || ""
            : String(b?.bidder_id || "");
        return bidderId === currentUserId;
      })
    : rawOffers;

  // Only show selected offers (those that progressed to listing agreements)
  const contractOffers = allOffers.filter((b) => getOfferStatus(b) === "selected");

  const offersWithStatus = contractOffers.map((bid) => {
    const config = getContractStatusConfig(bid, contractsData, allDeals);
    return { bid, config };
  });

  const filteredOffers = offersWithStatus.filter(({ config }) => {
    if (statusFilter === "all") return true;
    const label = config.label.toLowerCase();
    if (statusFilter === "active" && label.includes("active listing")) return true;
    if (
      statusFilter === "pending" &&
      (label.includes("pending") ||
        label.includes("awaiting") ||
        label.includes("required"))
    )
      return true;
    if (statusFilter === "closed" && label.includes("closed")) return true;
    if (statusFilter === "cancelled" && label.includes("cancelled")) return true;
    return false;
  });

  const totalContracts = contractOffers.length;

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <section
        className={`relative overflow-hidden rounded-2xl p-8 ${
          isDark
            ? "bg-transparent border border-white/5"
            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90"
        }`}
      >
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(${
              isDark ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.45)"
            } 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
          }}
        />
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 ${
            isDark
              ? "border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
              : "border-white/10"
          }`}
        />
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 ${
            isDark
              ? "border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
              : "border-[var(--color-secondary)]/20"
          }`}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${
                isDark
                  ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                  : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15"
              }`}
            >
              <FileText
                className={`h-3 w-3 ${
                  isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                  isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                }`}
              >
                Agreement Tracker
              </span>
            </div>
            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                My Contracts
              </h1>
              <div
                className={`mt-1 h-0.5 w-16 rounded-full ${
                  isDark ? "bg-[#d4af37]/60" : "bg-[var(--color-secondary)]/60"
                }`}
              />
            </div>
            <p
              className={`mt-4 max-w-xl text-sm leading-relaxed ${
                isDark ? "text-white/60" : "text-white/70"
              }`}
            >
              Track your listing agreements, pending signatures, and deal history all in
              one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "Under Agreement",
                value: isLoading ? "—" : totalContracts,
                icon: HandshakeIcon,
                iconColor: isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg ${
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4af37]/30"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                <div>
                  <p
                    className={`text-[9px] font-black uppercase tracking-wider ${
                      isDark ? "text-white/40" : "text-white/50"
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-white tabular-nums">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2
              className={`mx-auto h-8 w-8 animate-spin ${
                isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
              }`}
            />
            <p
              className={`mt-3 text-sm font-semibold ${
                isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
              }`}
            >
              Loading your agreements...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && contractOffers.length === 0 && (
        <div
          className={`rounded-2xl border p-12 text-center ${
            isDark
              ? "border-white/8 bg-white/[0.03]"
              : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
          }`}
        >
          <FileText
            className={`mx-auto h-8 w-8 ${
              isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
            }`}
          />
          <p
            className={`mt-3 text-sm font-bold ${
              isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
          >
            No listing agreements yet. When a seller accepts your offer, it will appear
            here.
          </p>
          <Link
            to="/my-bids"
            className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
          >
            View My Pending Offers →
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      {!isLoading && contractOffers.length > 0 &&
        (() => {
          const counts = {
            all: offersWithStatus.length,
            pending: offersWithStatus.filter(
              (b) =>
                b.config.label.toLowerCase().includes("pending") ||
                b.config.label.toLowerCase().includes("awaiting") ||
                b.config.label.toLowerCase().includes("required"),
            ).length,
            active: offersWithStatus.filter((b) =>
              b.config.label.toLowerCase().includes("active listing"),
            ).length,
            closed: offersWithStatus.filter((b) =>
              b.config.label.toLowerCase().includes("closed"),
            ).length,
            cancelled: offersWithStatus.filter((b) =>
              b.config.label.toLowerCase().includes("cancelled"),
            ).length,
          };

          const tabs = [
            { id: "all", label: "All", count: counts.all },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "active", label: "Active", count: counts.active },
            { id: "closed", label: "Closed", count: counts.closed },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
          ];

          return (
            <div className="w-full overflow-x-auto pb-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-2xl p-1.5 ${
                  isDark
                    ? "bg-white/[0.03] border border-white/5"
                    : "bg-black/[0.03] border border-black/5"
                }`}
              >
                {tabs.map((tab) => {
                  const isActiveTab = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        isActiveTab
                          ? isDark
                            ? "bg-white text-black shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                            : "bg-white text-[var(--color-primary)] shadow-sm"
                          : isDark
                            ? "text-white/50 hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                            : "text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-primary)] hover:shadow-sm"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black tabular-nums transition-colors ${
                          isActiveTab
                            ? isDark
                              ? "bg-black/10 text-black"
                              : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : isDark
                              ? "bg-white/10 text-white/50 group-hover:bg-[#d4af37]/20 group-hover:text-[#d4af37]"
                              : "bg-black/10 text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

      {/* Agreement cards */}
      {!isLoading && contractOffers.length > 0 && (
        <div>
          <p
            className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${
              isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
            }`}
          >
            Showing {filteredOffers.length} Result
            {filteredOffers.length !== 1 && "s"}
          </p>

          {filteredOffers.length === 0 ? (
            <div
              className={`rounded-xl border p-8 text-center ${
                isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-white/40" : "text-black/40"
                }`}
              >
                No agreements match this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredOffers.map(({ bid }) => (
                <ContractCard
                  key={String(bid?._id || bid?.id)}
                  bid={bid}
                  contracts={contractsData}
                  deals={allDeals}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

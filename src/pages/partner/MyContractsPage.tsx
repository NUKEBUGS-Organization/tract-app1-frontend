import { Link } from "react-router";
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    FileSignature,
    FileText,
    HandshakeIcon,
    ShieldCheck,
    XCircle,
    History,
    Loader2,
} from "lucide-react";
import { useGetMyBidsQuery } from "../../services/listingService";
import { useGetMyContractsQuery } from "../../services/contractService";
import { useAppSelector } from "../../redux/hooks";
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

function normalizeBids(bidsData: any): any[] {
    const raw: any = bidsData;
    const payload = raw?.data ?? raw;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.bids)) return payload.bids;
    if (typeof payload === "object" && payload !== null) return Object.values(payload);
    return [];
}

function getBidStatus(bid: any): string {
    return String(bid?.status || "active").toLowerCase();
}

function getCurrentUserId(user: any): string {
    return user?._id || user?.id || user?.user_id || user?.sub || "";
}

/* ─── Contract Status Config ──────────────────────────────────────────────── */
function getContractStatusConfig(bid: any, contracts: any[]) {
    const status = getBidStatus(bid);
    const bidId = bid?._id || bid?.id;

    // Find a contract linked to this bid
    const contract = contracts.find((c: any) => {
        const cBidId = typeof c.bid_id === "object" ? c.bid_id?._id || c.bid_id?.id : c.bid_id;
        return cBidId === bidId;
    });

    if (status === "selected") {
        if (!contract) {
            return {
                label: "Awaiting Contract",
                className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
                icon: Clock,
                contract,
            };
        }
        const sellerSigned = Boolean(contract?.seller_signed_at);
        const buyerSigned = Boolean(contract?.buyer_signed_at);
        if (sellerSigned && buyerSigned) {
            return {
                label: "Contract Signed — Active Deal",
                className: "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
                icon: CheckCircle2,
                contract,
            };
        }
        return {
            label: "Pending Signatures",
            className: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
            icon: FileSignature,
            contract,
        };
    }
    if (status === "backup") {
        return {
            label: "Backup Buyer Queue",
            className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
            icon: ShieldCheck,
            contract,
        };
    }
    if (status === "rejected") {
        return {
            label: "Rejected",
            className: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
            icon: XCircle,
            contract,
        };
    }
    return {
        label: "Past",
        className: "bg-white/8 text-white/40 border border-white/8",
        icon: History,
        contract,
    };
}

/* ─── Contract Card ─────────────────────────────────────────────────────── */
function ContractCard({ bid, contracts, isDark }: { bid: any; contracts: any[]; isDark: boolean }) {
    const status = getBidStatus(bid);
    const { label, className, icon: StatusIcon, contract } = getContractStatusConfig(bid, contracts);

    const isActive = status === "selected";
    const isPast = false; // My Contracts only shows selected bids

    const bidPrice = bid?.bid_price || bid?.amount;
    const listingAddress = bid?.listing?.address || bid?.property_id?.address || bid?.property_address || "Property";
    const listingId = bid?.listing?._id || bid?.property_id?._id || bid?.listing_id || bid?.property_id;
    const listingCity = bid?.listing?.city || bid?.property_id?.city;
    const listingState = bid?.listing?.state_code || bid?.property_id?.state_code;
    const backupPosition = bid?.backup_position;

    const sellerSigned = Boolean(contract?.seller_signed_at);
    const buyerSigned = Boolean(contract?.buyer_signed_at);
    const bothSigned = sellerSigned && buyerSigned;
    const contractId = contract?._id || contract?.id;

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isActive
                ? isDark
                    ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 shadow-[0_0_30px_rgba(212,175,55,0.08)] hover:border-[var(--color-secondary)]/50"
                    : "border-[var(--color-secondary)]/40 bg-white shadow-[0_0_30px_rgba(212,175,55,0.12)] hover:border-[var(--color-secondary)]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                : isPast
                    ? isDark
                        ? "border-white/8 bg-white/[0.025] opacity-60"
                        : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] opacity-70"
                    : isDark
                        ? "border-white/10 bg-white/[0.04] hover:border-white/20"
                        : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] hover:shadow-xl"
                }`}
        >
            {/* Top accent bar */}
            {isActive && (
                <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
            )}

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className={`truncate text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"}`}>
                            {listingAddress}
                        </p>
                        {listingCity && (
                            <p className={`mt-0.5 text-[11px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                                {listingCity}{listingState ? `, ${listingState}` : ""}
                            </p>
                        )}
                    </div>
                    <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {label}
                    </span>
                </div>

                {/* Backup position note */}
                {status === "backup" && backupPosition && (
                    <p className="mt-2 text-[11px] font-semibold text-[var(--color-warning)]">
                        Queue position #{backupPosition} — auto-promoted if primary buyer exits.
                    </p>
                )}

                {/* Bid price */}
                <div className={`mt-4 rounded-xl border p-3 ${isDark ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8" : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5"}`}>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">My Bid</p>
                    <p className="mt-1 text-xl font-black text-[var(--color-secondary)]">{formatMoney(bidPrice)}</p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-2">
                    {listingId && (
                        <Link
                            to={`/properties/${listingId}`}
                            className={`flex items-center gap-1.5 border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${isDark
                                ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10"
                                : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
                                }`}
                        >
                            View Property
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    )}

                    {bothSigned && listingId && (
                        <Link
                            to={`/deals?listingId=${listingId}`}
                            className={`flex items-center gap-1.5 bg-[var(--color-secondary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02] ${isDark ? "hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]" : ""}`}
                        >
                            Go to Deal
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    )}

                    {!bothSigned && contract && contractId && (
                        <Link
                            to={`/deals?listingId=${listingId}`}
                            className={`flex items-center gap-1.5 border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${isDark
                                ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                                : "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                                }`}
                        >
                            Sign Contract
                            <FileSignature className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>

                {(bid?.submitted_at || bid?.created_at) && (
                    <p className={`mt-3 text-[10px] ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]"}`}>
                        Submitted {new Date(bid.submitted_at || bid.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function MyContractsPage() {
    const theme = usePartnerTheme();
    const isDark = theme === "dark";

    const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();
    const { data: contractsData = [], isLoading: isLoadingContracts } = useGetMyContractsQuery();
    const user = useAppSelector((state) => state.auth.user);
    const currentUserId = getCurrentUserId(user);

    const isLoading = isLoadingBids || isLoadingContracts;

    const rawBids = normalizeBids(bidsData);
    const allBids = currentUserId
        ? rawBids.filter((b: any) => {
            const bidderId = typeof b?.bidder_id === "object"
                ? b.bidder_id?._id || b.bidder_id?.id || ""
                : String(b?.bidder_id || "");
            return bidderId === currentUserId;
        })
        : rawBids;

    // Only show selected bids here
    const contractBids = allBids.filter((b) =>
        getBidStatus(b) === "selected",
    );

    const totalContracts = contractBids.length;

    return (
        <div className="space-y-8">
            {/* Hero header */}
            <section
                className={`relative overflow-hidden rounded-2xl p-8 ${isDark
                    ? "bg-transparent border border-white/5"
                    : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90"
                    }`}
            >
                {/* Dot-grid texture */}
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
                            <FileText className={`h-3 w-3 ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"}`}>
                                Contract Tracker
                            </span>
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">My Contracts</h1>
                            <div className={`mt-1 h-0.5 w-16 rounded-full ${isDark ? "bg-[#d4af37]/60" : "bg-[var(--color-secondary)]/60"}`} />
                        </div>
                        <p className={`mt-4 max-w-xl text-sm leading-relaxed ${isDark ? "text-white/60" : "text-white/70"}`}>
                            Track your selected bids, pending contracts, and deal history all in one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: "Under Contract", value: isLoading ? "—" : totalContracts, icon: HandshakeIcon, iconColor: isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]" },
                        ].map((stat) => (
                            <div key={stat.label} className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition hover:scale-[1.02] hover:shadow-lg ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4af37]/30" : "border-white/20 bg-white/10 hover:bg-white/20"}`}>
                                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                <div>
                                    <p className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/40" : "text-white/50"}`}>{stat.label}</p>
                                    <p className="text-xl font-black text-white tabular-nums">{stat.value}</p>
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
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
                        <p className={`mt-3 text-sm font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                            Loading your contracts...
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && contractBids.length === 0 && (
                <div className={`rounded-2xl border p-12 text-center ${isDark ? "border-white/8 bg-white/[0.03]" : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"}`}>
                    <FileText className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"}`} />
                    <p className={`mt-3 text-sm font-bold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                        No contracts yet. When a seller selects your bid, it will appear here.
                    </p>
                    <Link to="/my-bids" className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline">
                        View My Pending Bids →
                    </Link>
                </div>
            )}

            {/* Active contracts / selected bids */}
            {!isLoading && contractBids.length > 0 && (
                <div>
                    <p className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
                        Under Contract ({contractBids.length})
                    </p>
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {contractBids.map((bid: any) => (
                            <ContractCard
                                key={String(bid?._id || bid?.id)}
                                bid={bid}
                                contracts={contractsData}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

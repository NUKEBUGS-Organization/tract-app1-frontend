import { Link } from "react-router";
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    FileText,
    Gavel,
    Loader2,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { useGetMyBidsQuery } from "../../services/listingService";
import { useAppSelector } from "../../redux/hooks";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

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

function normalizeBids(bidsData: any): any[] {
    const allBids: any[] = (() => {
        const raw: any = bidsData;
        const payload = raw?.data ?? raw;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.bids)) return payload.bids;
        if (typeof payload === "object" && payload !== null) {
            return Object.values(payload);
        }
        return [];
    })();
    return allBids;
}


function getBidStatus(bid: any): string {
    return String(bid?.status || "active").toLowerCase();
}


function getBidStatusConfig(status: string) {
    const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
        active: {
            label: "Active Offer",
            className: "bg-white/10 text-white/60 border border-white/10",
            icon: Clock,
        },
        selected: {
            label: "Selected — Under Contract ✓",
            className:
                "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30",
            icon: CheckCircle2,
        },
        backup: {
            label: "Backup Buyer Queue",
            className:
                "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/25",
            icon: ShieldCheck,
        },
        rejected: {
            label: "Rejected",
            className:
                "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/25",
            icon: XCircle,
        },
        deleted: {
            label: "Removed",
            className: "bg-white/8 text-white/40 border border-white/8",
            icon: XCircle,
        },
    };
    return map[status] ?? map.active;
}


function BidCard({ bid, isDark }: { bid: any; isDark: boolean }) {
    const status = getBidStatus(bid);
    const config = getBidStatusConfig(status);
    const StatusIcon = config.icon;

    const isActionRequired = status === "selected" || status === "backup";
    const bidPrice = bid?.bid_price || bid?.amount;
    const listingAddress =
        bid?.listing?.address ||
        bid?.property_id?.address ||
        bid?.property_address ||
        "Property";
    const listingId =
        bid?.listing?._id ||
        bid?.property_id?._id ||
        bid?.listing_id ||
        bid?.property_id;
    const listingCity = bid?.listing?.city || bid?.property_id?.city;
    const listingState = bid?.listing?.state_code || bid?.property_id?.state_code;

    const backupPosition = bid?.backup_position;

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isActionRequired
                ? isDark
                    ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 shadow-[0_0_30px_rgba(212,175,55,0.08)]"
                    : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]"
                : isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] hover:shadow-xl"
                } ${isDark
                    ? "hover:border-white/20"
                    : "hover:-translate-y-1 hover:border-[var(--color-secondary)]/30"
                }`}
        >

            <div
                className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${isDark
                    ? "bg-transparent"
                    : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                    }`}
            />

            {isActionRequired && (
                <div className="h-0.5 w-full bg-gradient-to-r from-[var(--color-secondary)] to-transparent" />
            )}

            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p
                            className={`truncate text-sm font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                                }`}
                        >
                            {listingAddress}
                        </p>
                        {listingCity && (
                            <p
                                className={`mt-0.5 text-[11px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                                    }`}
                            >
                                {listingCity}
                                {listingState ? `, ${listingState}` : ""}
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

                {status === "backup" && backupPosition && (
                    <p className="mt-2 text-[11px] font-semibold text-[var(--color-warning)]">
                        Backup Buyer #{backupPosition} — you'll be auto-promoted if the
                        primary buyer falls through.
                    </p>
                )}

                <div
                    className={`mt-4 rounded-xl border p-3 ${isDark
                        ? "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/8"
                        : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                        }`}
                >
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]/70">
                        My Bid
                    </p>
                    <p className="mt-1 text-xl font-black text-[var(--color-secondary)]">
                        {formatMoney(bidPrice)}
                    </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                    {bid?.inspection_period && (
                        <span
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${isDark
                                ? "border-white/10 bg-white/5 text-white/50"
                                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                                }`}
                        >
                            <Clock className="h-3 w-3" />
                            Inspection: {bid.inspection_period} days
                        </span>
                    )}
                    {bid?.due_diligence_period && (
                        <span
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${isDark
                                ? "border-white/10 bg-white/5 text-white/50"
                                : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                                }`}
                        >
                            <FileText className="h-3 w-3" />
                            DD: {bid.due_diligence_period} business days
                        </span>
                    )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {listingId && (
                        <Link
                            to={`/properties/${listingId}`}
                            className={`flex items-center gap-1.5 border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition ${isDark
                                ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
                                : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
                                }`}
                        >
                            View Property
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    )}

                    {status === "selected" && (
                        <Link
                            to={`/deals?listingId=${listingId}`}
                            className="flex items-center gap-1.5 bg-[var(--color-secondary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
                        >
                            Go to Deal
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>

                {(bid?.submitted_at || bid?.created_at) && (
                    <p
                        className={`mt-3 text-[10px] ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]"
                            }`}
                    >
                        Submitted{" "}
                        {new Date(bid.submitted_at || bid.created_at).toLocaleDateString(
                            undefined,
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}


function getCurrentUserId(user: any): string {
    return user?._id || user?.id || user?.user_id || user?.sub || "";
}

export default function MyBidsPage() {
    const theme = usePartnerTheme();
    const isDark = theme === "dark";

    const { data: bidsData, isLoading } = useGetMyBidsQuery();
    const user = useAppSelector((state) => state.auth.user);
    const currentUserId = getCurrentUserId(user);

    const rawBids = normalizeBids(bidsData);
    const allBids = currentUserId
        ? rawBids.filter((b: any) => {
            const bidderId =
                typeof b?.bidder_id === "object"
                    ? b.bidder_id?._id || b.bidder_id?.id || ""
                    : String(b?.bidder_id || "");
            return bidderId === currentUserId;
        })
        : rawBids;

    const activeBids = allBids.filter((b) =>
        ["active", "selected", "backup"].includes(getBidStatus(b))
    );
    const pastBids = allBids.filter((b) =>
        ["rejected", "deleted"].includes(getBidStatus(b))
    );

    return (
        <div className="space-y-8">

            <section
                className={`relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-card)] ${isDark
                    ? "border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02]"
                    : "bg-[var(--color-primary)]"
                    }`}
            >

                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/5" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/5" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
                            <Gavel className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                                Bid Tracker
                            </span>
                        </div>

                        <h1
                            className={`font-serif text-3xl font-black lg:text-4xl ${isDark ? "text-white" : "text-white"
                                }`}
                        >
                            My Bids
                        </h1>
                        <p
                            className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-white/50" : "text-white/60"
                                }`}
                        >
                            Track every offer you've submitted across the Live Property
                            Stream — active, backup, and past bids.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            {
                                label: "Active Bids",
                                value: isLoading ? "—" : activeBids.length,
                                color: "text-[var(--color-secondary)]",
                            },
                            {
                                label: "Past Bids",
                                value: isLoading ? "—" : pastBids.length,
                                color: isDark ? "text-white/60" : "text-white/70",
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-2xl border px-5 py-3 ${isDark
                                    ? "border-white/10 bg-white/5"
                                    : "border-white/20 bg-white/10"
                                    }`}
                            >
                                <p
                                    className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-white/35" : "text-white/50"
                                        }`}
                                >
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


            {isLoading && (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
                        <p
                            className={`mt-3 text-sm font-semibold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                                }`}
                        >
                            Loading your bids...
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && activeBids.length === 0 && pastBids.length === 0 && (
                <div
                    className={`rounded-2xl border p-12 text-center ${isDark
                        ? "border-white/8 bg-white/[0.03]"
                        : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                        }`}
                >
                    <Gavel
                        className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
                            }`}
                    />
                    <p
                        className={`mt-3 text-sm font-bold ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                            }`}
                    >
                        You haven't submitted any bids yet.
                    </p>
                    <Link
                        to="/properties"
                        className="mt-4 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
                    >
                        Browse Property Stream →
                    </Link>
                </div>
            )}

            {/* Active bids */}
            {!isLoading && activeBids.length > 0 && (
                <div>
                    <p
                        className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                            }`}
                    >
                        Active Bids ({activeBids.length})
                    </p>
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {activeBids.map((bid: any) => (
                            <BidCard key={String(bid?._id || bid?.id)} bid={bid} isDark={isDark} />
                        ))}
                    </div>
                </div>
            )}

            {/* Past bids */}
            {!isLoading && pastBids.length > 0 && (
                <div className="mt-6">
                    <p
                        className={`mb-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                            }`}
                    >
                        Past Bids ({pastBids.length})
                    </p>
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {pastBids.map((bid: any) => (
                            <BidCard key={String(bid?._id || bid?.id)} bid={bid} isDark={isDark} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
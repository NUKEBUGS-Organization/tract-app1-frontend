import { Link } from "react-router";
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    FileText,
    Gavel,
    Loader2,
    XCircle,
} from "lucide-react";
import { useGetMyBidsQuery } from "../../services/listingService";

/* ─── Helpers ── */
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
        return [];
    })();
    return allBids;
}

function getBidStatus(bid: any): string {
    return String(bid?.status || "pending").toLowerCase();
}

/* ─── Status config ─── */
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

/* ─── Bid card ─── */
function BidCard({ bid }: { bid: any }) {
    const status = getBidStatus(bid);
    const config = getBidStatusConfig(status);
    const StatusIcon = config.icon;

    const isActionRequired = status === "accepted" || status === "selected";
    const bidPrice = bid?.bid_price || bid?.amount;
    const listingAddress =
        bid?.listing?.address || bid?.property_address || "Property";
    const listingId = bid?.listing?._id || bid?.listing_id || bid?.property_id;

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isActionRequired
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

                {/* Inspection & DD periods */}
                <div className="mt-3 flex flex-wrap gap-3">
                    {bid?.inspection_period && (
                        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/50">
                            <Clock className="h-3 w-3" />
                            Inspection: {bid.inspection_period} days
                        </span>
                    )}
                    {bid?.due_diligence_period && (
                        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/50">
                            <FileText className="h-3 w-3" />
                            DD: {bid.due_diligence_period} business days
                        </span>
                    )}
                </div>

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

/* ─── Page ─── */
export default function MyBidsPage() {
    const { data: bidsData, isLoading } = useGetMyBidsQuery();
    const allBids = normalizeBids(bidsData);

    const activeBids = allBids.filter((b) =>
        ["pending", "accepted", "selected"].includes(getBidStatus(b))
    );
    const rejectedBids = allBids.filter((b) =>
        ["rejected", "withdrawn"].includes(getBidStatus(b))
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 shadow-2xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
                            <Gavel className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                                Bid Tracker
                            </span>
                        </div>

                        <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
                            My Bids
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                            Track every offer you've submitted across the Live Property
                            Stream — pending, accepted, and past bids.
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
                                value: isLoading ? "—" : rejectedBids.length,
                                color: "text-white/60",
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

            {/* Loading  - may use loader from common folder*/}
            {isLoading && (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
                        <p className="mt-3 text-sm font-semibold text-white/40">
                            Loading your bids...
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && activeBids.length === 0 && rejectedBids.length === 0 && (
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
            )}

            {/* Active bids */}
            {!isLoading && activeBids.length > 0 && (
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

            {/* Past bids */}
            {!isLoading && rejectedBids.length > 0 && (
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
        </div>
    );
}
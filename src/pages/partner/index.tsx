import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Circle,
  Flame,
  Gavel,
  Handshake,
  RefreshCw,
  ShieldCheck,
  Loader2,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useGetListingsQuery } from "../../services/listingService";
import { useGetMyBidsQuery } from "../../services/listingService";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useGetMeQuery } from "../../services/userService";


/* ─── Journey steps for wholesaler ─────────────────────────────────── */
const journeySteps = [
  {
    id: "kyc",
    icon: ShieldCheck,
    label: "Identity Verified",
    desc: "Complete KYC to unlock full deal access.",
    done: true,
    link: "/kyc",
    linkLabel: "View",
  },
  {
    id: "proof_of_activity",
    icon: FileText,
    label: "Upload Proof of Activity",
    desc: "Provide recent transaction history.",
    done: false,
    link: "/proof-of-activity",
    linkLabel: "Upload",
  },
  {
    id: "stream",
    icon: Building2,
    label: "Browse Property Stream",
    desc: "Review live off-market opportunities.",
    done: true,
    link: "/properties",
    linkLabel: "Browse",
  },
  {
    id: "bid",
    icon: Gavel,
    label: "Submit a Bid",
    desc: "Place your first competitive offer.",
    done: true,
    link: "/deals",
    linkLabel: "My Bids",
  },
  {
    id: "contract",
    icon: Handshake,
    label: "Close a Deal",
    desc: "Sign the contract and close your first deal.",
    done: false,
    link: "/deals",
    linkLabel: "Track Deals",
  },
];


/* ─── Sub-components ─────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
}

function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.09]">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[120px] text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
          {label}
        </p>
        <Icon className="h-5 w-5 text-[var(--color-secondary)]" />
      </div>

      <div className="font-serif text-4xl font-black text-white">{value}</div>

      <p className="mt-2 text-xs font-semibold text-[var(--color-secondary)]">
        {note}
      </p>

      {/* Gold bottom accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-secondary)] to-transparent transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export default function PartnerDashboard() {
  // ─── Real API data ───────────────────────────────────────────────
  const { isLoading: isLoadingMe } = useGetMeQuery();

  const { data: listingsData, refetch: refetchListings, isLoading: isLoadingListings } = useGetListingsQuery(
    { status: "live" },
    { refetchOnMountOrArgChange: true }
  );
  const allListings: any[] = (() => {
    const payload = listingsData?.data?.data ?? listingsData?.data ?? listingsData;
    if (Array.isArray(payload?.listings)) return payload.listings;
    if (Array.isArray(payload)) return payload;
    return [];
  })();

  const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();
  const allBids: any[] = (() => {
    const payload = bidsData?.data ?? bidsData;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.bids)) return payload.bids;
    return [];
  })();

  const { data: dealsData, isLoading: isLoadingDeals, refetch: refetchDeals } = useGetMyDealsQuery();
  const allDeals: any[] = Array.isArray(dealsData) ? dealsData : [];

  const isLoading = isLoadingMe || isLoadingListings || isLoadingBids || isLoadingDeals;

  // Derived stats
  const activeBids = allBids.filter((b) =>
    ["pending", "accepted", "selected"].includes(String(b?.status || "").toLowerCase())
  ).length;
  const activeDeals = allDeals.filter((d) =>
    ["active", "under_contract", "closing"].includes(String(d?.status || "").toLowerCase())
  ).length;



  // function getBidCount(listing: any): number {
  //   return (
  //     Number(listing?.bid_count) ||
  //     Number(listing?.bids_summary?.total) ||
  //     (Array.isArray(listing?.bids) ? listing.bids.length : 0)
  //   );
  // }

  // Live stats for cards
  const liveStats = [
    {
      label: "Available Deals",
      value: allListings.length,
      note: "Live off-market stream",
      icon: Building2,
    },
    {
      label: "Bids Submitted",
      value: allBids.length,
      note: `${activeBids} active`,
      icon: Gavel,
    },
    {
      label: "Active Deals",
      value: activeDeals,
      note: "In progress",
      icon: Handshake,
    },
    {
      label: "Partner Score",
      value: 94,
      note: "Trusted Buyer status",
      icon: ShieldCheck,
    },
  ];

  const completedSteps = journeySteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / journeySteps.length) * 100);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-6 text-center shadow-2xl backdrop-blur">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-secondary)]" />
          <p className="mt-3 text-sm font-semibold text-white">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[var(--color-secondary)]/8" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[var(--color-secondary)]/6" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Partner Pro Mode
              </span>
            </div>

            <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
              Your Wholesaler Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Browse live opportunities, submit competitive offers, and manage
              active contracts — all from one focused workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-dark-main)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
            >
              <Flame className="h-4 w-4" />
              Browse Stream
            </Link>

            <button
              type="button"
              onClick={() => refetchListings()}
              className="inline-flex items-center gap-2 border border-white/15 bg-white/8 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/12"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>


      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--color-secondary)]/5 to-transparent p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10">
              <BarChart3 className="h-7 w-7 text-[var(--color-secondary)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif text-3xl font-black text-[var(--color-secondary)]">
                  100
                </p>
                <span className="flex items-center gap-1 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]">
                  <BadgeCheck className="h-3 w-3" />
                  Trusted Buyer
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-white/50">
                Your Reliability Score · Top 8% of partners
              </p>
            </div>
          </div>

          <Link
            to="/score"
            className="inline-flex items-center gap-2 border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition hover:bg-[var(--color-secondary)]/10"
          >
            View Full Report
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Journey tracker */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-black text-white">
              Partner Journey
            </h2>
            <p className="mt-0.5 text-xs text-white/35">
              {completedSteps} of {journeySteps.length} milestones complete
            </p>
          </div>

          <div className="hidden w-36 sm:block">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[#f0d060] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] font-bold text-white/35">
              {progressPct}% done
            </p>
          </div>
        </div>

        <div className="relative space-y-0">
          <div className="absolute left-[19px] top-5 h-[calc(100%-40px)] w-0.5 bg-white/8" />

          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isNext =
              !step.done &&
              journeySteps.slice(0, index).every((item) => item.done);

            return (
              <div
                key={step.id}
                className={`group relative flex items-start gap-4 py-4 ${index < journeySteps.length - 1 ? "border-b border-white/6" : ""
                  }`}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${step.done
                    ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]"
                    : isNext
                      ? "border-[var(--color-secondary)] bg-white/5 shadow-[0_0_0_4px_rgba(212,175,55,0.12)]"
                      : "border-white/15 bg-white/5"
                    }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--color-dark-main)]" />
                  ) : isNext ? (
                    <Icon className="h-4 w-4 text-[var(--color-secondary)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-white/20" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black ${step.done
                        ? "text-[var(--color-secondary)]"
                        : isNext
                          ? "text-white"
                          : "text-white/40"
                        }`}
                    >
                      {step.label}
                      {step.done && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-[var(--color-secondary)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]">
                          Done
                        </span>
                      )}
                      {isNext && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/50">
                          Next
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-white/30">{step.desc}</p>
                  </div>

                  {(step.done || isNext) && (
                    <Link
                      to={step.link}
                      className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:underline"
                    >
                      {step.linkLabel} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* My Deals table */}
      <section className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-black text-white">
            My Deals
          </h2>

          <Link
            to="/deals"
            className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
          >
            View All Deals →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl">
          {allDeals.length === 0 ? (
            <div className="p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm text-white/40">
                No active deals right now.{" "}
                <button
                  type="button"
                  onClick={() => refetchDeals()}
                  className="text-[var(--color-secondary)] hover:underline"
                >
                  Refresh
                </button>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-white/[0.04]">
                  <tr>
                    {["Property", "Status", "Contract", "Deadline", "Action"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-white/35"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {allDeals.slice(0, 3).map((deal: any) => {
                    const listing = deal?.listing_id || {};
                    const id = String(deal?._id || deal?.id || "");
                    const listingId = String(listing?._id || listing?.id || "");

                    let statusLabel = String(deal?.status || "").replace(/_/g, " ");
                    statusLabel = statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);

                    return (
                      <tr
                        key={id}
                        className="border-t border-white/8 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-lg">
                              🤝
                            </div>
                            <div>
                              <Link
                                to={`/deals?listingId=${listingId}`}
                                className="text-sm font-black text-white hover:text-[var(--color-secondary)]"
                              >
                                {listing?.address || "—"}
                              </Link>
                              <p className="text-xs text-white/35">
                                {listing?.state_code || ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6 text-sm font-bold text-white/80">
                          {statusLabel}
                        </td>

                        <td className="px-6 py-6 text-sm font-black text-[#6ee7b7]">
                          {deal?.contract_id ? "Created" : "Pending"}
                        </td>

                        <td className="px-6 py-6 text-sm font-black text-white/50">
                          {deal?.marketing_deadline ? new Date(deal.marketing_deadline).toLocaleDateString() : "—"}
                        </td>

                        <td className="px-6 py-6">
                          <Link
                            to={`/deals?listingId=${listingId}`}
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:underline"
                          >
                            Track Deal
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-white/8 bg-white/[0.03] px-6 py-4">
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
            >
              Go to Deal Tracker
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

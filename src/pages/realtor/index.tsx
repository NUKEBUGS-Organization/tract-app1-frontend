import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Flame,
  Handshake,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useGetListingsQuery, useGetMyBidsQuery } from "../../services/listingService";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useGetMeQuery } from "../../services/userService";

const journeySteps = [
  {
    id: "kyc",
    icon: ShieldCheck,
    label: "Identity & KYC Verified",
    desc: "Complete Jumio ID verification and face-match.",
    done: true,
    link: "/kyc",
    linkLabel: "View",
  },
  {
    id: "license",
    icon: BadgeCheck,
    label: "License Verified",
    desc: "State license number confirmed by admin.",
    done: true,
    link: "/profile",
    linkLabel: "View",
  },
  {
    id: "profile",
    icon: FileText,
    label: "Professional Profile Setup",
    desc: "Configure commission, agency role, and payment source.",
    done: false,
    link: "/profile",
    linkLabel: "Setup",
  },
  {
    id: "stream",
    icon: Building2,
    label: "Browse Seller Opportunities",
    desc: "Review live properties seeking licensed representation.",
    done: true,
    link: "/properties",
    linkLabel: "Browse",
  },
  {
    id: "offer",
    icon: Handshake,
    label: "Submit Representation Offer",
    desc: "Place your first offer to represent a seller.",
    done: true,
    link: "/my-bids",
    linkLabel: "My Offers",
  },
  {
    id: "contract",
    icon: Star,
    label: "Secure Listing Agreement",
    desc: "Sign the agreement and launch marketing.",
    done: false,
    link: "/deals",
    linkLabel: "Track Deals",
  },
];

const PENALTY_TABLE = [
  { violation: "Slow Response to Seller", penalty: -10, icon: Clock },
  { violation: "Missed 7-Day Market Launch", penalty: -15, icon: AlertTriangle },
  { violation: "Deal Failure Due to Negligence", penalty: -20, icon: ShieldCheck },
];

interface StatCardProps {
  label: string;
  value: number | string;
  note: string;
  icon: LucideIcon;
}

function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[150px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>
      <div className="font-serif text-4xl font-black text-[var(--color-primary)]">
        {value}
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]/70">
        {note}
      </p>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export default function RealtorDashboard() {
  const { data: meData, isLoading: isLoadingMe } = useGetMeQuery();
  const userName =
    (meData as any)?.data?.full_name || (meData as any)?.full_name || "Realtor";

  const {
    data: listingsData,
    refetch: refetchListings,
    isLoading: isLoadingListings,
  } = useGetListingsQuery(
    { status: "live" },
    { refetchOnMountOrArgChange: true },
  );

  const allListings: any[] = (() => {
    const payload =
      (listingsData as any)?.data?.data ??
      (listingsData as any)?.data ??
      listingsData;
    if (Array.isArray((payload as any)?.listings)) return (payload as any).listings;
    if (Array.isArray(payload)) return payload as any[];
    return [];
  })();

  const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();
  const allBids: any[] = (() => {
    const payload = (bidsData as any)?.data ?? bidsData;
    if (Array.isArray(payload)) return payload as any[];
    if (Array.isArray((payload as any)?.bids)) return (payload as any).bids;
    return [];
  })();

  const {
    data: dealsData,
    isLoading: isLoadingDeals,
    refetch: refetchDeals,
  } = useGetMyDealsQuery();
  const allDeals: any[] = Array.isArray(dealsData) ? (dealsData as any[]) : [];

  const isLoading = isLoadingMe || isLoadingListings || isLoadingBids || isLoadingDeals;

  const activeDeals = allDeals.filter((d) =>
    ["active", "backup_activated", "under_review", "proceeding_to_closing"].includes(
      String(d?.status || "").toLowerCase(),
    ),
  ).length;

  const activeBids = allBids.filter((b) =>
    ["active", "selected", "backup"].includes(String(b?.status || "").toLowerCase()),
  ).length;

  const completedSteps = journeySteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / journeySteps.length) * 100);

  const liveStats = [
    {
      label: "Seller Opportunities",
      value: allListings.length,
      note: "Live listings seeking representation",
      icon: Building2,
    },
    {
      label: "Offers Submitted",
      value: allBids.length,
      note: `${activeBids} active`,
      icon: Handshake,
    },
    {
      label: "Active Deals",
      value: activeDeals,
      note: "In progress",
      icon: TrendingUp,
    },
    {
      label: "Prof. Score",
      value: 100,
      note: "Elite Licensed Partner",
      icon: ShieldCheck,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-8 py-6 text-center shadow-[var(--shadow-card)]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 p-8">
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(rgba(212,175,55,0.45) 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 border-[var(--color-secondary)]/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Licensed Partner Portal
              </span>
            </div>
            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                {userName.split(" ")[0]}, welcome back!
              </h1>
              <div className="mt-1 h-0.5 w-16 rounded-full bg-[var(--color-secondary)]/60" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              Browse seller opportunities, submit representation offers, and manage active
              listings — all from your professional dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(212,175,55,0.25)]"
            >
              <Flame className="h-4 w-4" />
              Browse Stream
            </Link>
            <button
              type="button"
              onClick={() => { refetchListings(); refetchDeals(); }}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-white/15 hover:border-white/35"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Score + Penalty */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Professional Score */}
        <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-primary)]/8">
              <BarChart3 className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif text-3xl font-black text-[var(--color-primary)]">
                  100
                </p>
                <span className="flex items-center gap-1 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]">
                  <BadgeCheck className="h-3 w-3" />
                  Elite Partner
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                Professional Score · Top 5% of Realtors
              </p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Score Health
              </span>
              <span className="text-[10px] font-black text-[var(--color-primary)]">100 / 100</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-light)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: "100%" }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-2 py-2">
                <p className="font-black text-[var(--color-primary)]">{"< 50"}</p>
                <p className="text-[var(--color-text-muted)]">48h delay</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-2 py-2">
                <p className="font-black text-[var(--color-danger)]">{"< 30"}</p>
                <p className="text-[var(--color-text-muted)]">Permanent ban</p>
              </div>
              <div className="rounded-lg border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2 py-2">
                <p className="font-black text-[var(--color-secondary)]">100</p>
                <p className="text-[var(--color-text-muted)]">Your score</p>
              </div>
            </div>
          </div>
        </section>

        {/* Penalty Table */}
        <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-black text-[var(--color-primary)]">
              Penalty Table
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Score starts at 100. Violations deduct points.
            </p>
          </div>
          <div className="space-y-3">
            {PENALTY_TABLE.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.violation}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-5 py-4 transition-all duration-200 hover:border-[var(--color-danger)]/35 hover:bg-[var(--color-danger)]/12"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--color-danger)]/80" />
                    <span className="text-sm font-bold text-[var(--color-text-main)]">
                      {row.violation}
                    </span>
                  </div>
                  <span className="text-sm font-black text-[var(--color-danger)]">
                    {row.penalty} pts
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Live Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Journey Checklist */}
      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Realtor Journey
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {completedSteps} of {journeySteps.length} milestones complete
            </p>
          </div>
          <div className="hidden w-36 sm:block">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
              {progressPct}% done
            </p>
          </div>
        </div>

        <div className="relative space-y-0">
          <div className="absolute left-[19px] top-5 h-[calc(100%-40px)] w-0.5 bg-[var(--color-border-light)]" />
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isNext =
              !step.done && journeySteps.slice(0, index).every((item) => item.done);
            return (
              <div
                key={step.id}
                className={`group relative flex items-start gap-4 py-4 ${
                  index < journeySteps.length - 1
                    ? "border-b border-[var(--color-border-light)]"
                    : ""
                }`}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    step.done
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : isNext
                        ? "border-[var(--color-secondary)] bg-white shadow-[0_0_0_4px_rgba(212,175,55,0.12)]"
                        : "border-[var(--color-border-light)] bg-white"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isNext ? (
                    <Icon className="h-4 w-4 text-[var(--color-secondary)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--color-border-light)]" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black ${
                        step.done
                          ? "text-[var(--color-primary)]"
                          : isNext
                            ? "text-[var(--color-text-main)]"
                            : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {step.label}
                      {step.done && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                          Done
                        </span>
                      )}
                      {isNext && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-secondary)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#7a5d00]">
                          Next
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {step.desc}
                    </p>
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

      {/* My Deals */}
      <section className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
            My Active Deals
          </h2>
          <Link
            to="/deals"
            className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
          >
            View All Deals →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
          {allDeals.length === 0 ? (
            <div className="p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                No active deals right now.{" "}
                <button
                  type="button"
                  onClick={() => refetchDeals()}
                  className="text-[var(--color-secondary)] hover:underline"
                >
                  Refresh
                </button>
              </p>
              <Link
                to="/properties"
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] hover:underline"
              >
                Browse Opportunities <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Property", "Status", "Contract", "7-Day Deadline", "Action"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {allDeals.slice(0, 3).map((deal: any) => {
                    const listing = deal?.listing_id || {};
                    const id = String(deal?._id || deal?.id || "");
                    const listingId = String(listing?._id || listing?.id || "");

                    let statusLabel = String(deal?.status || "").replace(/_/g, " ");
                    statusLabel =
                      statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);

                    const hasDeadline = Boolean(deal?.market_launch_deadline || deal?.marketing_deadline);
                    const deadlineDate = hasDeadline
                      ? new Date(deal.market_launch_deadline || deal.marketing_deadline)
                      : null;
                    const isUrgent =
                      deadlineDate &&
                      deadlineDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={id}
                        className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[rgba(245,245,241,0.6)]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-xl">
                              🏡
                            </div>
                            <div>
                              <Link
                                to={`/deals?listingId=${listingId}`}
                                className="text-sm font-black text-[var(--color-primary)] transition hover:text-[var(--color-secondary)]"
                              >
                                {listing?.address || "—"}
                              </Link>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {listing?.state_code || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-[var(--color-text-main)]">
                          {statusLabel}
                        </td>
                        <td className="px-5 py-5 text-sm font-black text-[#16a34a]">
                          {deal?.contract_id ? "Created" : "Pending"}
                        </td>
                        <td
                          className={`px-5 py-5 text-sm font-black ${
                            isUrgent
                              ? "text-[var(--color-danger)]"
                              : "text-[var(--color-text-muted)]"
                          }`}
                        >
                          {deadlineDate ? (
                            <div className="flex items-center gap-1.5">
                              {isUrgent && <Clock className="h-3.5 w-3.5" />}
                              {deadlineDate.toLocaleDateString()}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <Link
                            to={`/deals?listingId=${listingId}`}
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:underline"
                          >
                            View <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
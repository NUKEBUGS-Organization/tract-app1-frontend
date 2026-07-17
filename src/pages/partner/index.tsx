import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  FileText,
  Gavel,
  Handshake,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useGetListingsQuery } from "../../services/listingService";
import { useGetMyBidsQuery } from "../../services/listingService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";
import { useGetMyDealsQuery } from "../../services/dealService";
import { useGetMeQuery } from "../../services/userService";
import { useGetProofOfActivityStatusQuery } from "../../services/verificationService";


interface StatCardProps {
  label: string;
  value: number | string;
  note: string;
  icon: LucideIcon;
  isDark: boolean;
}
function StatCard({ label, value, note, icon: Icon, isDark }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 ${isDark
        ? "border-white/10 bg-white/[0.06] backdrop-blur shadow-xl hover:border-[var(--color-secondary)]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:bg-white/[0.12]"
        : "border-[var(--color-border-light)] bg-white hover:shadow-xl"
        }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <p
          className={`max-w-[150px] text-[11px] font-black uppercase tracking-[0.22em] ${isDark ? "text-white/45" : "text-[var(--color-text-muted)]"
            }`}
        >
          {label}
        </p>

        <Icon
          className={`h-5 w-5 ${isDark
            ? "text-[var(--color-secondary)]"
            : "text-[var(--color-primary)]"
            }`}
        />
      </div>

      <div
        className={`font-serif text-4xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
          }`}
      >
        {value}
      </div>

      <p
        className={`mt-2 text-xs font-semibold ${isDark
          ? "text-[var(--color-secondary)]"
          : "text-[var(--color-primary)]/70"
          }`}
      >
        {note}
      </p>

      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${isDark
          ? "bg-gradient-to-r from-[var(--color-secondary)] to-transparent"
          : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
          }`}
      />
    </div>
  );
}

const PENALTY_TABLE = [
  { violation: "Ghosting Seller", penalty: -10, icon: ShieldCheck },
  { violation: "Inspection Cancellation", penalty: -20, icon: Clock },
  { violation: "Missed Deadline", penalty: -15, icon: AlertTriangle },
];

export default function PartnerDashboard() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { data: meData, isLoading: isLoadingMe } = useGetMeQuery();
  const userName =
    (meData as any)?.data?.full_name || (meData as any)?.full_name || "Partner";
  const currentUserId =
    (meData as any)?.data?._id ||
    (meData as any)?.data?.id ||
    (meData as any)?._id ||
    (meData as any)?.id ||
    "";
  const reliabilityScore: number =
    (meData as any)?.data?.reliability_score ??
    (meData as any)?.reliability_score ??
    100;
  const scoreTier =
    reliabilityScore >= 90 ? "Perfect Standing" :
    reliabilityScore >= 70 ? "Good Standing" :
    reliabilityScore >= 50 ? "At Risk" :
    reliabilityScore >= 30 ? "Delayed Access" :
    "Reinstatement Required";

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
    if (Array.isArray((payload as any)?.listings))
      return (payload as any).listings;
    if (Array.isArray(payload)) return payload as any[];
    return [];
  })();

  const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();
  const allBids: any[] = (() => {
    const raw: any = bidsData;
    const payload = raw?.data ?? raw;
    let bidsArr: any[] = [];
    if (Array.isArray(payload)) bidsArr = payload;
    else if (Array.isArray(payload?.bids)) bidsArr = payload.bids;
    else if (typeof payload === "object" && payload !== null) bidsArr = Object.values(payload);
    if (!currentUserId) return bidsArr;
    return bidsArr.filter((b: any) => {
      const bidderId =
        typeof b?.bidder_id === "object"
          ? b.bidder_id?._id || b.bidder_id?.id || ""
          : String(b?.bidder_id || "");
      return bidderId === currentUserId;
    });
  })();

  const {
    data: dealsData,
    isLoading: isLoadingDeals,
    refetch: refetchDeals,
  } = useGetMyDealsQuery();
  const allDeals: any[] = Array.isArray(dealsData) ? (dealsData as any[]) : [];

  const { data: verificationData, isLoading: isLoadingVerification } = useGetProofOfActivityStatusQuery();

  const isLoading =
    isLoadingMe || isLoadingListings || isLoadingBids || isLoadingDeals || isLoadingVerification;

  const activeBids = allBids.filter(
    (b) => String(b?.status || "active").toLowerCase() === "active",
  ).length;

  const activeDeals = allDeals.filter((d) =>
    [
      "active",
      "backup_activated",
      "under_review",
      "proceeding_to_closing",
    ].includes(String(d?.status || "").toLowerCase()),
  ).length;

  const totalBids = allBids.length;
  const wonBids = allBids.filter((b) =>
    ["selected", "under_contract", "closed", "funded"].includes(
      String(b?.status || "").toLowerCase()
    )
  ).length;
  const winRate = totalBids > 0 ? Math.round((wonBids / totalBids) * 100) : 0;

  const kycStatusStr = String((meData as any)?.data?.kyc_status || (meData as any)?.kyc_status || "").toLowerCase();
  const isKycDone = ["verified", "approved"].includes(kycStatusStr);

  const proofStatusStr = String(verificationData?.data?.status || verificationData?.status || "").toLowerCase();
  const isProofDone = proofStatusStr === "approved";

  const isStreamDone = allListings.length > 0;
  const isBidDone = allBids.length > 0;
  const isContractDone = allDeals.length > 0;

  const journeySteps = [
    {
      id: "kyc",
      icon: ShieldCheck,
      label: "Identity Verified",
      desc: "Complete KYC to unlock full deal access.",
      done: isKycDone,
      link: "/kyc",
      linkLabel: "View",
    },
    {
      id: "proof_of_activity",
      icon: FileText,
      label: "Upload Proof of Activity",
      desc: "Provide recent transaction history.",
      done: isProofDone,
      link: "/proof-of-activity",
      linkLabel: "Upload",
    },
    {
      id: "stream",
      icon: Building2,
      label: "Browse Property Stream",
      desc: "Review live off-market opportunities.",
      done: isStreamDone,
      link: "/properties",
      linkLabel: "Browse",
    },
    {
      id: "bid",
      icon: Gavel,
      label: "Submit a Bid",
      desc: "Place your first competitive offer.",
      done: isBidDone,
      link: "/deals",
      linkLabel: "My Bids",
    },
    {
      id: "contract",
      icon: Handshake,
      label: "Close a Deal",
      desc: "Sign the contract and close your first deal.",
      done: isContractDone,
      link: "/deals",
      linkLabel: "Track Deals",
    },
  ];

  const liveStats = [
    {
      label: "Available Deals",
      value: allListings.length,
      note: "Live off-market stream",
      icon: Building2,
    },
    {
      label: "Pending Bids",
      value: activeBids,
      note: "Awaiting seller response",
      icon: Gavel,
    },
    {
      label: "Active Deals",
      value: activeDeals,
      note: "In progress",
      icon: Handshake,
    },
    {
      label: "Offer Win Rate",
      value: `${winRate}%`,
      note: `${wonBids} of ${totalBids} bids accepted`,
      icon: TrendingUp,
    },
  ];

  const completedSteps = journeySteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / journeySteps.length) * 100);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className={`rounded-2xl border px-8 py-6 text-center shadow-[var(--shadow-card)] ${isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[var(--color-border-light)] bg-white"
            }`}
        >
          <Loader2
            className={`mx-auto h-8 w-8 animate-spin ${isDark
              ? "text-[var(--color-secondary)]"
              : "text-[var(--color-primary)]"
              }`}
          />
          <p
            className={`mt-3 text-sm font-semibold ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
            backgroundImage: `radial-gradient(${isDark ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.45)"
              } 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 70% 30%, black 0%, transparent 70%)",
          }}
        />

        {/* Golden Rings */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 ${isDark
            ? "border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
            : "border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            }`}
        />
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 ${isDark
            ? "border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
            : "border-[var(--color-secondary)]/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            }`}
        />
        {isDark && (
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full border border-[#d4af37]/10 shadow-[0_0_80px_rgba(212,175,55,0.05)]" />
        )}

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${isDark
                ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15"
                }`}
            >
              <div
                className={`h-2 w-2 animate-pulse rounded-full ${isDark ? "bg-[#d4af37]" : "bg-[var(--color-secondary)]"
                  }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                  }`}
              >
                Partner Pro Mode
              </span>
            </div>

            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                {userName.split(" ")[0]}, let’s find your next deal!
              </h1>
              <div
                className={`mt-1 h-0.5 w-16 rounded-full ${isDark ? "bg-[#d4af37]/60" : "bg-[var(--color-secondary)]/60"}`}
              />
            </div>

            <p
              className={`mt-4 max-w-xl text-sm leading-relaxed ${isDark ? "text-white/60" : "text-white/70"
                }`}
            >
              Browse live opportunities, submit competitive offers, and manage
              active contracts — all from one focused platform.
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
              onClick={() => refetchListings()}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-white/15 hover:border-white/35"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Score & Activity Rule Column */}
        <div className="flex flex-col gap-6">
          <section
            className={`flex-1 rounded-2xl border p-6 shadow-[var(--shadow-card)] flex flex-col justify-center transition-all duration-200 ${isDark
              ? "border-white/10 bg-gradient-to-br from-[var(--color-secondary)]/5 to-transparent hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
              : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${isDark
                  ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                  : "border-[var(--color-border-light)] bg-[var(--color-primary)]/8"
                  }`}
              >
                <BarChart3
                  className={`h-7 w-7 ${isDark
                    ? "text-[var(--color-secondary)]"
                    : "text-[var(--color-primary)]"
                    }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-serif text-3xl font-black ${isDark
                      ? "text-[var(--color-secondary)]"
                      : "text-[var(--color-primary)]"
                      }`}
                  >
                    {reliabilityScore}
                  </p>
                  <span className="flex items-center gap-1 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]">
                    <BadgeCheck className="h-3 w-3" />
                    {scoreTier}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm font-semibold ${isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                    }`}
                >
                  Your Reliability Score
                </p>
              </div>
            </div>
          </section>

          {/* 30-day activity rule */}
          <div
            className={`rounded-2xl border px-6 py-5 shadow-[var(--shadow-card)] transition-all duration-200 ${isDark
              ? "border-[var(--color-warning)]/25 bg-[var(--color-warning)]/5 hover:border-[var(--color-warning)]/30 hover:bg-[var(--color-warning)]/12 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
              : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 hover:border-[var(--color-warning)]/35 hover:bg-[var(--color-warning)]/12 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              }`}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-warning)]">
                  30-Day Activity Rule
                </p>
                <p
                  className={`mt-1.5 text-xs leading-5 ${isDark
                    ? "text-[var(--color-warning)]/80"
                    : "text-[var(--color-text-muted)]"
                    }`}
                >
                  You must secure at least{" "}
                  <strong>1 contract every 30 days</strong>. Failure to meet
                  this requirement triggers a{" "}
                  <strong>14-day restriction</strong> on new deal access.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Penalty Table Column */}
        <section
          className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] transition-all duration-200 ${isDark
            ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
            : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              className={`font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Penalty Table
            </h2>
            <p
              className={`text-[11px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}
            >
              Score starts at 100. Violations deduct points.
            </p>
          </div>
          <div className="space-y-3">
            {PENALTY_TABLE.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.violation}
                  className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 ${isDark
                    ? "border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/12"
                    : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]/35 hover:bg-[var(--color-danger)]/12"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--color-danger)]/80" />
                    <span
                      className={`text-sm font-bold ${isDark
                        ? "text-white/80"
                        : "text-[var(--color-text-main)]"
                        }`}
                    >
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

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) => (
          <StatCard key={stat.label} {...stat} isDark={isDark} />
        ))}
      </section>

      <section
        className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] transition-all duration-200 ${isDark
          ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
          : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          }`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2
              className={`font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Partner Journey
            </h2>
            <p
              className={`mt-0.5 text-xs ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                }`}
            >
              {completedSteps} of {journeySteps.length} milestones complete
            </p>
          </div>

          <div className="hidden w-36 sm:block">
            <div
              className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-[var(--color-border-light)]"
                }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p
              className={`mt-1 text-right text-[10px] font-bold ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                }`}
            >
              {progressPct}% done
            </p>
          </div>
        </div>

        <div className="relative space-y-0">
          <div
            className={`absolute left-[19px] top-5 h-[calc(100%-40px)] w-0.5 ${isDark ? "bg-white/8" : "bg-[var(--color-border-light)]"
              }`}
          />

          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isNext =
              !step.done &&
              journeySteps.slice(0, index).every((item) => item.done);

            return (
              <div
                key={step.id}
                className={`group relative flex items-start gap-4 py-4 ${index < journeySteps.length - 1
                  ? isDark
                    ? "border-b border-white/6"
                    : "border-b border-[var(--color-border-light)]"
                  : ""
                  }`}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${step.done
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : isNext
                      ? "border-[var(--color-secondary)] bg-white shadow-[0_0_0_4px_rgba(212,175,55,0.12)]"
                      : isDark
                        ? "border-white/15 bg-white/5"
                        : "border-[var(--color-border-light)] bg-white"
                    }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isNext ? (
                    <Icon className="h-4 w-4 text-[var(--color-secondary)]" />
                  ) : (
                    <Circle
                      className={`h-4 w-4 ${isDark
                        ? "text-white/20"
                        : "text-[var(--color-border-light)]"
                        }`}
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black ${step.done
                        ? isDark
                          ? "text-[var(--color-secondary)]"
                          : "text-[var(--color-primary)]"
                        : isNext
                          ? isDark
                            ? "text-white"
                            : "text-[var(--color-text-main)]"
                          : isDark
                            ? "text-white/40"
                            : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      {step.label}

                      {step.done && (
                        <span
                          className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${isDark
                            ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            }`}
                        >
                          Done
                        </span>
                      )}

                      {isNext && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-secondary)]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#7a5d00]">
                          Next
                        </span>
                      )}
                    </p>

                    <p
                      className={`mt-0.5 text-xs ${isDark
                        ? "text-white/30"
                        : "text-[var(--color-text-muted)]"
                        }`}
                    >
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

      <section className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className={`font-serif text-2xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            My Deals
          </h2>

          <Link
            to="/my-contracts"
            className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
          >
            View All Deals →
          </Link>
        </div>

        <div
          className={`overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all duration-200 ${isDark
            ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
            : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            }`}
        >
          {allDeals.length === 0 ? (
            <div className="p-10 text-center">
              <Building2
                className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
                  }`}
              />
              <p
                className={`mt-3 text-sm ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                  }`}
              >
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
                <thead
                  className={
                    isDark ? "bg-white/[0.04]" : "bg-[var(--color-bg-soft)]"
                  }
                >
                  <tr>
                    {[
                      "Property",
                      "Status",
                      "Contract",
                      "Deadline",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDark
                          ? "text-white/35"
                          : "text-[var(--color-text-muted)]"
                          }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allDeals.slice(0, 3).map((deal: any) => {
                    const listing = deal?.listing_id || {};
                    const id = String(deal?._id || deal?.id || "");
                    const listingId = String(listing?._id || listing?.id || "");

                    let statusLabel = String(deal?.status || "").replace(
                      /_/g,
                      " ",
                    );
                    statusLabel =
                      statusLabel.charAt(0).toUpperCase() +
                      statusLabel.slice(1);

                    const hasDeadline = Boolean(deal?.marketing_deadline);
                    const deadlineDate = hasDeadline
                      ? new Date(deal.marketing_deadline)
                      : null;
                    const isUrgent =
                      deadlineDate &&
                      deadlineDate.getTime() - Date.now() < 12 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={id}
                        className={`border-t transition-colors duration-200 ${isDark
                          ? "border-white/8 hover:bg-white/[0.08]"
                          : "border-[var(--color-border-light)] hover:bg-[rgba(245,245,241,0.6)]"
                          }`}
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${isDark
                                ? "bg-white/8"
                                : "bg-[var(--color-bg-soft)]"
                                }`}
                            >
                              🤝
                            </div>
                            <div>
                              <Link
                                to={`/deals?listingId=${listingId}`}
                                className={`text-sm font-black transition hover:text-[var(--color-secondary)] ${isDark
                                  ? "text-white"
                                  : "text-[var(--color-primary)]"
                                  }`}
                              >
                                {listing?.address || "—"}
                              </Link>
                              <p
                                className={`text-xs ${isDark
                                  ? "text-white/35"
                                  : "text-[var(--color-text-muted)]"
                                  }`}
                              >
                                {listing?.state_code || ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td
                          className={`px-5 py-5 text-sm font-bold ${isDark
                            ? "text-white/80"
                            : "text-[var(--color-text-main)]"
                            }`}
                        >
                          {statusLabel}
                        </td>

                        <td className="px-5 py-5 text-sm font-black text-[#16a34a]">
                          {deal?.contract_id ? "Created" : "Pending"}
                        </td>

                        <td
                          className={`px-5 py-5 text-sm font-black ${isUrgent
                            ? "text-[var(--color-danger)]"
                            : isDark
                              ? "text-white/50"
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

          <div
            className={`border-t px-5 py-4 ${isDark
              ? "border-white/8 bg-white/[0.03]"
              : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
              }`}
          >
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

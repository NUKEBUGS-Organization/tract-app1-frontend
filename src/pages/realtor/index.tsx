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
import { useGetRealtorVerificationStatusQuery } from "../../services/verificationService";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

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
  isDark: boolean;
}

function StatCard({ label, value, note, icon: Icon, isDark }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-white/10 bg-white/[0.06] backdrop-blur shadow-xl hover:border-[var(--color-secondary)]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:bg-white/[0.12]"
          : "border-[var(--color-border-light)] bg-white hover:shadow-xl"
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <p
          className={`max-w-[150px] text-[11px] font-black uppercase tracking-[0.22em] ${
            isDark ? "text-white/45" : "text-[var(--color-text-muted)]"
          }`}
        >
          {label}
        </p>
        <Icon
          className={`h-5 w-5 ${
            isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
          }`}
        />
      </div>

      <div
        className={`font-serif text-4xl font-black ${
          isDark ? "text-white" : "text-[var(--color-primary)]"
        }`}
      >
        {value}
      </div>

      <p
        className={`mt-2 text-xs font-semibold ${
          isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]/70"
        }`}
      >
        {note}
      </p>

      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full ${
          isDark
            ? "bg-gradient-to-r from-[var(--color-secondary)] to-transparent"
            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
        }`}
      />
    </div>
  );
}

export default function RealtorDashboard() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  const { data: meData, isLoading: isLoadingMe } = useGetMeQuery();
  const userName =
    (meData as any)?.data?.fullName || ?.data?.full_name || (meData as any)?.fullName || ?.full_name || "Realtor";
  const professionalScore: number =
    (meData as any)?.data?.professional_score ??
    (meData as any)?.professional_score ??
    100;
  const scoreTier =
    professionalScore >= 90 ? "Perfect Standing" :
    professionalScore >= 70 ? "Good Standing" :
    professionalScore >= 50 ? "At Risk" :
    professionalScore >= 30 ? "Delayed Access" :
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
    if (Array.isArray((payload as any)?.listings)) return (payload as any).listings;
    if (Array.isArray(payload)) return payload as any[];
    return [];
  })();

  const { data: bidsData, isLoading: isLoadingBids } = useGetMyBidsQuery();
  const allBids: any[] = (() => {
    const raw: any = bidsData;
    const payload = raw?.data ?? raw;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.bids)) return payload.bids;
    if (typeof payload === "object" && payload !== null) {
      return Object.values(payload).filter((item: any) =>
        Boolean(item && typeof item === "object" && (item._id || item.id))
      );
    }
    return [];
  })();

  const {
    data: dealsData,
    isLoading: isLoadingDeals,
    refetch: refetchDeals,
  } = useGetMyDealsQuery();
  const allDeals: any[] = Array.isArray(dealsData) ? (dealsData as any[]) : [];

  const { data: verificationData, isLoading: isLoadingVerification } = useGetRealtorVerificationStatusQuery();

  const isLoading = isLoadingMe || isLoadingListings || isLoadingBids || isLoadingDeals || isLoadingVerification;

  const activeDeals = allDeals.filter((d) =>
    ["active", "backup_activated", "under_review", "proceeding_to_closing"].includes(
      String(d?.status || "").toLowerCase(),
    ),
  ).length;

  const activeBids = allBids.filter((b) =>
    ["active", "selected", "backup"].includes(String(b?.status || "").toLowerCase()),
  ).length;

  const kycStatusStr = String((meData as any)?.data?.kycStatus || (meData as any)?.data?.kyc_status || (meData as any)?.kycStatus || (meData as any)?.kyc_status || "").toLowerCase();
  const isKycDone = ["verified", "approved"].includes(kycStatusStr);

  const licenseStatusStr = String(verificationData?.data?.status || verificationData?.status || "").toLowerCase();
  const isLicenseDone = licenseStatusStr === "approved";

  const isProfileDone = Boolean((meData as any)?.data?.stateCode || (meData as any)?.data?.state_code || (meData as any)?.stateCode || (meData as any)?.state_code);
  const isStreamDone = allListings.length > 0;
  const isOfferDone = allBids.length > 0;
  const isContractDone = allDeals.length > 0;

  const journeySteps = [
    {
      id: "kyc",
      icon: ShieldCheck,
      label: "Identity & KYC Verified",
      desc: "Complete Jumio ID verification and face-match.",
      done: isKycDone,
      link: "/kyc",
      linkLabel: "View",
    },
    {
      id: "license",
      icon: BadgeCheck,
      label: "License & Brokerage Verified",
      desc: "Submit your State License Number, Brokerage Name, Managing Broker, and Office Address for admin review.",
      done: isLicenseDone,
      link: "/realtor-verification",
      linkLabel: "Submit",
    },
    {
      id: "profile",
      icon: FileText,
      label: "Professional Profile Setup",
      desc: "Configure commission, agency role, and payment source.",
      done: isProfileDone,
      link: "/profile",
      linkLabel: "Setup",
    },
    {
      id: "stream",
      icon: Building2,
      label: "Browse Seller Opportunities",
      desc: "Review live properties seeking licensed representation.",
      done: isStreamDone,
      link: "/properties",
      linkLabel: "Browse",
    },
    {
      id: "offer",
      icon: Handshake,
      label: "Submit Representation Offer",
      desc: "Place your first offer to represent a seller.",
      done: isOfferDone,
      link: "/my-bids",
      linkLabel: "My Offers",
    },
    {
      id: "contract",
      icon: Star,
      label: "Secure Listing Agreement",
      desc: "Sign the agreement and launch marketing.",
      done: isContractDone,
      link: "/deals",
      linkLabel: "Track Deals",
    },
  ];

  const completedSteps = journeySteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / journeySteps.length) * 100);

  const totalOffers = allBids.length;
  const wonOffers = allBids.filter((b) =>
    ["selected", "under_contract", "closed", "funded"].includes(
      String(b?.status || "").toLowerCase()
    )
  ).length;
  const winRate = totalOffers > 0 ? Math.round((wonOffers / totalOffers) * 100) : 0;

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
      label: "Offer Win Rate",
      value: `${winRate}%`,
      note: `${wonOffers} of ${totalOffers} offers accepted`,
      icon: TrendingUp,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className={`rounded-2xl border px-8 py-6 text-center shadow-[var(--shadow-card)] ${
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[var(--color-border-light)] bg-white"
          }`}
        >
          <Loader2
            className={`mx-auto h-8 w-8 animate-spin ${
              isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
            }`}
          />
          <p
            className={`mt-3 text-sm font-semibold ${
              isDark ? "text-white" : "text-[var(--color-primary)]"
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
      {/* Hero Banner */}
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

        {/* Golden Rings */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-2 ${
            isDark
              ? "border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
              : "border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          }`}
        />
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border-2 ${
            isDark
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
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm ${
                isDark
                  ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                  : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15"
              }`}
            >
              <div
                className={`h-2 w-2 animate-pulse rounded-full ${
                  isDark ? "bg-[#d4af37]" : "bg-[var(--color-secondary)]"
                }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                  isDark ? "text-[#d4af37]" : "text-[var(--color-secondary)]"
                }`}
              >
                Licensed Partner Portal
              </span>
            </div>

            <div>
              <h1 className="font-serif text-3xl font-black leading-tight text-white lg:text-4xl">
                {userName.split(" ")[0]}, let's close your next listing!
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
        {/* Score & Activity Rule Column */}
        <div className="flex flex-col gap-6">
          {/* Professional Score */}
          <section
          className={`flex-1 rounded-2xl border p-6 shadow-[var(--shadow-card)] flex flex-col justify-center transition-all duration-200 ${
            isDark
              ? "border-white/10 bg-gradient-to-br from-[var(--color-secondary)]/5 to-transparent hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
              : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${
                isDark
                  ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                  : "border-[var(--color-border-light)] bg-[var(--color-primary)]/8"
              }`}
            >
              <BarChart3
                className={`h-7 w-7 ${
                  isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`font-serif text-3xl font-black ${
                    isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
                  }`}
                >
                  {professionalScore}
                </p>
                <span className="flex items-center gap-1 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-secondary)]">
                  <BadgeCheck className="h-3 w-3" />
                  {scoreTier}
                </span>
              </div>
              <p
                className={`mt-1 text-sm font-semibold ${
                  isDark ? "text-white/50" : "text-[var(--color-text-muted)]"
                }`}
              >
                Your Professional Score
              </p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
                }`}
              >
                Score Health
              </span>
              <span
                className={`text-[10px] font-black ${
                  isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"
                }`}
              >
                {professionalScore} / 100
              </span>
            </div>
            <div
              className={`h-2 overflow-hidden rounded-full ${
                isDark ? "bg-white/10" : "bg-[var(--color-border-light)]"
              }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${professionalScore}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
              {[
                { label: "48h delay", threshold: "< 50", color: isDark ? "text-white/60" : "text-[var(--color-primary)]" },
                { label: "Bids Suspended", threshold: "< 30", color: "text-[var(--color-danger)]" },
                { label: "Your score", threshold: String(professionalScore), color: "text-[var(--color-secondary)]", highlight: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg border px-2 py-2 ${
                    item.highlight
                      ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10"
                      : isDark
                        ? "border-white/8 bg-white/[0.04]"
                        : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                  }`}
                >
                  <p className={`font-black ${item.color}`}>{item.threshold}</p>
                  <p className={`${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          </section>

          {/* 7-day activity rule (realtor equivalent) */}
          <div
            className={`rounded-2xl border px-6 py-5 shadow-[var(--shadow-card)] transition-all duration-200 ${
              isDark
                ? "border-[var(--color-warning)]/25 bg-[var(--color-warning)]/5 hover:border-[var(--color-warning)]/30 hover:bg-[var(--color-warning)]/12 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
                : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 hover:border-[var(--color-warning)]/35 hover:bg-[var(--color-warning)]/12 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            }`}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-warning)]">
                  7-Day Market Launch Rule
                </p>
                <p
                  className={`mt-1.5 text-xs leading-5 ${
                    isDark ? "text-[var(--color-warning)]/80" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  Once the listing agreement is signed, you must launch the property
                  to market within <strong>7 days</strong>. Failure triggers the{" "}
                  <strong>Kill Switch</strong> — seller may cancel the agreement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Penalty Table Column */}
        <section
          className={`flex flex-col h-full rounded-2xl border p-6 shadow-[var(--shadow-card)] transition-all duration-200 ${
            isDark
              ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
              : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              className={`font-serif text-lg font-black ${
                isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
            >
              Penalty Table
            </h2>
            <p className={`text-[11px] ${isDark ? "text-white/40" : "text-[var(--color-text-muted)]"}`}>
              Score starts at 100. Violations deduct points.
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {PENALTY_TABLE.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.violation}
                  className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 ${
                    isDark
                      ? "border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/12"
                      : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]/35 hover:bg-[var(--color-danger)]/12"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--color-danger)]/80" />
                    <span
                      className={`text-sm font-bold ${
                        isDark ? "text-white/80" : "text-[var(--color-text-main)]"
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

      {/* Live Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) => (
          <StatCard key={stat.label} {...stat} isDark={isDark} />
        ))}
      </section>

      {/* Journey Checklist */}
      <section
        className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] transition-all duration-200 ${
          isDark
            ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
            : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2
              className={`font-serif text-xl font-black ${
                isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
            >
              Realtor Journey
            </h2>
            <p
              className={`mt-0.5 text-xs ${
                isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
              }`}
            >
              {completedSteps} of {journeySteps.length} milestones complete
            </p>
          </div>
          <div className="hidden w-36 sm:block">
            <div
              className={`h-1.5 w-full overflow-hidden rounded-full ${
                isDark ? "bg-white/10" : "bg-[var(--color-border-light)]"
              }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p
              className={`mt-1 text-right text-[10px] font-bold ${
                isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
              }`}
            >
              {progressPct}% done
            </p>
          </div>
        </div>

        <div className="relative space-y-0">
          <div
            className={`absolute left-[19px] top-5 h-[calc(100%-40px)] w-0.5 ${
              isDark ? "bg-white/8" : "bg-[var(--color-border-light)]"
            }`}
          />
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isNext =
              !step.done && journeySteps.slice(0, index).every((item) => item.done);
            return (
              <div
                key={step.id}
                className={`group relative flex items-start gap-4 py-4 ${
                  index < journeySteps.length - 1
                    ? isDark
                      ? "border-b border-white/6"
                      : "border-b border-[var(--color-border-light)]"
                    : ""
                }`}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    step.done
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
                      className={`h-4 w-4 ${
                        isDark ? "text-white/20" : "text-[var(--color-border-light)]"
                      }`}
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black ${
                        step.done
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
                          className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            isDark
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
                      className={`mt-0.5 text-xs ${
                        isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
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

      {/* My Deals */}
      <section className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className={`font-serif text-2xl font-black ${
              isDark ? "text-white" : "text-[var(--color-primary)]"
            }`}
          >
            My Active Deals
          </h2>
          <Link
            to="/deals"
            className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
          >
            View All Deals →
          </Link>
        </div>

        <div
          className={`overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all duration-200 ${
            isDark
              ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
              : "border-[var(--color-border-light)] bg-white hover:border-[rgba(23,77,52,0.2)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          }`}
        >
          {allDeals.length === 0 ? (
            <div className="p-10 text-center">
              <Building2
                className={`mx-auto h-8 w-8 ${
                  isDark ? "text-white/20" : "text-[var(--color-text-muted)]"
                }`}
              />
              <p
                className={`mt-3 text-sm ${
                  isDark ? "text-white/40" : "text-[var(--color-text-muted)]"
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
              <Link
                to="/properties"
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] hover:underline"
              >
                Browse Opportunities <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead
                  className={isDark ? "bg-white/[0.04]" : "bg-[var(--color-bg-soft)]"}
                >
                  <tr>
                    {["Property", "Status", "Contract", "7-Day Deadline", "Action"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className={`px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] ${
                            isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                          }`}
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

                    const hasDeadline = Boolean(
                      deal?.market_launch_deadline || deal?.marketing_deadline,
                    );
                    const deadlineDate = hasDeadline
                      ? new Date(deal.market_launch_deadline || deal.marketing_deadline)
                      : null;
                    const isUrgent =
                      deadlineDate &&
                      deadlineDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={id}
                        className={`border-t transition-colors duration-200 ${
                          isDark
                            ? "border-white/8 hover:bg-white/[0.08]"
                            : "border-[var(--color-border-light)] hover:bg-[rgba(245,245,241,0.6)]"
                        }`}
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                                isDark ? "bg-white/8" : "bg-[var(--color-bg-soft)]"
                              }`}
                            >
                              🏡
                            </div>
                            <div>
                              <Link
                                to={`/deals?listingId=${listingId}`}
                                className={`text-sm font-black transition hover:text-[var(--color-secondary)] ${
                                  isDark ? "text-white" : "text-[var(--color-primary)]"
                                }`}
                              >
                                {listing?.address || "—"}
                              </Link>
                              <p
                                className={`text-xs ${
                                  isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                                }`}
                              >
                                {listing?.state_code || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className={`px-5 py-5 text-sm font-bold ${
                            isDark ? "text-white/80" : "text-[var(--color-text-main)]"
                          }`}
                        >
                          {statusLabel}
                        </td>
                        <td className="px-5 py-5 text-sm font-black text-[#16a34a]">
                          {deal?.contract_id ? "Created" : "Pending"}
                        </td>
                        <td
                          className={`px-5 py-5 text-sm font-black ${
                            isUrgent
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
            className={`border-t px-5 py-4 ${
              isDark
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
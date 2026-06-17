import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Handshake,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { usePartnerTheme } from "../../hooks/usePartnerTheme";

const PENALTY_TABLE = [
  { violation: "Ghosting Seller", penalty: -10, icon: ShieldCheck },
  { violation: "Inspection Cancellation", penalty: -20, icon: Clock },
  { violation: "Missed Deadline", penalty: -15, icon: AlertTriangle },
];

const SCORE_BREAKDOWN = [
  {
    label: "On-Time Close Rate",
    score: 97,
    weight: "40%",
    icon: CheckCircle2,
    trend: "up",
    note: "Excellent. You've closed 97% of accepted deals on time.",
  },
  {
    label: "Ghost Penalty",
    score: 100,
    weight: "30%",
    icon: ShieldCheck,
    trend: "stable",
    note: "No ghosting incidents recorded. Keep it up.",
  },
  {
    label: "Deal Close Rate",
    score: 88,
    weight: "20%",
    icon: Handshake,
    trend: "up",
    note: "Slightly below elite threshold. Close 2 more deals to reach 92%.",
  },
  {
    label: "Response Time",
    score: 76,
    weight: "10%",
    icon: Clock,
    trend: "down",
    note: "⚠️ Average response time has slipped. Respond to offers faster.",
    isWarning: true,
  },
];

const ACTIVITY_HISTORY = [
  { month: "Jan", score: 85 },
  { month: "Feb", score: 88 },
  { month: "Mar", score: 87 },
  { month: "Apr", score: 90 },
  { month: "May", score: 92 },
  { month: "Jun", score: 94 },
];

const TOTAL_SCORE = 94;

const TIER_CONFIG = {
  label: "Trusted Buyer",
  range: "90–100",
  perks: [
    "Priority access to high-margin listings",
    "Reduced bid competition on select properties",
    "Verified badge shown to sellers",
    "Early stream access (24h before public)",
  ],
  className:
    "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/8",
  labelClassName: "text-[var(--color-secondary)]",
};

function ScoreGauge({ score, isDark }: { score: number; isDark: boolean }) {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90 transform"
        width="160"
        height="160"
        viewBox="0 0 160 160"
      >

        <circle
          cx="80"
          cy="80"
          r="60"
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(23,77,52,0.1)"}
          strokeWidth="12"
        />

        <circle
          cx="80"
          cy="80"
          r="60"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#f0d060" />
          </linearGradient>
        </defs>
      </svg>

      <div className="text-center">
        <p className="font-serif text-4xl font-black text-white">
          {score}
        </p>
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-secondary)]">
          Score
        </p>
      </div>
    </div>
  );
}

function MiniChart({ isDark }: { isDark: boolean }) {
  const max = Math.max(...ACTIVITY_HISTORY.map((d) => d.score));
  const min = Math.min(...ACTIVITY_HISTORY.map((d) => d.score)) - 5;
  const range = max - min;
  const width = 280;
  const height = 80;
  const padding = 12;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = ACTIVITY_HISTORY.map((d, i) => {
    const x = padding + (i / (ACTIVITY_HISTORY.length - 1)) * innerWidth;
    const y = padding + (1 - (d.score - min) / range) * innerHeight;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = [
    `${padding},${height - padding}`,
    ...ACTIVITY_HISTORY.map((d, i) => {
      const x = padding + (i / (ACTIVITY_HISTORY.length - 1)) * innerWidth;
      const y = padding + (1 - (d.score - min) / range) * innerHeight;
      return `${x},${y}`;
    }),
    `${padding + innerWidth},${height - padding}`,
  ].join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity={isDark ? 0.3 : 0.15} />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#chartGradient)" points={areaPoints} />
      <polyline
        fill="none"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {ACTIVITY_HISTORY.map((d, i) => {
        const x = padding + (i / (ACTIVITY_HISTORY.length - 1)) * innerWidth;
        const y = padding + (1 - (d.score - min) / range) * innerHeight;
        return <circle key={d.month} cx={x} cy={y} r={3} fill="#D4AF37" />;
      })}
    </svg>
  );
}

export default function ScorePage() {
  const theme = usePartnerTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-8">
      <section
        className={`relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-card)] ${isDark
          ? "border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
          : "bg-[var(--color-primary)]"
          }`}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/5" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">

          <div className="flex shrink-0 flex-col items-center gap-4">
            <ScoreGauge score={TOTAL_SCORE} isDark={isDark} />
            <div
              className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-wider ${isDark
                ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/8 text-[var(--color-secondary)]"
                : "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                }`}
            >
              <BadgeCheck className="mr-1.5 inline h-3.5 w-3.5" />
              {TIER_CONFIG.label}
            </div>
          </div>


          <div className="flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <BarChart3 className="h-3.5 w-3.5 text-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Reliability Score
              </span>
            </div>

            <h1
              className={`font-serif text-3xl font-black lg:text-4xl ${isDark ? "text-white" : "text-white"
                }`}
            >
              Your Partner Score
            </h1>

            <p
              className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-white/50" : "text-white/60"
                }`}
            >
              Your score determines your tier, deal access priority, and how
              sellers perceive you. Maintain above 90 to keep Trusted Buyer
              status.
            </p>

            {/* Tier perks */}
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {TIER_CONFIG.perks.map((perk) => (
                <div
                  key={perk}
                  className={`flex items-start gap-2 text-[12px] ${isDark ? "text-white/60" : "text-white/75"
                    }`}
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-secondary)]" />
                  {perk}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Score Trend Chart + Breakdown */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">

        <div
          className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-[var(--color-border-light)] bg-white"
            }`}
        >
          <h2
            className={`mb-5 font-serif text-xl font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
              }`}
          >
            Score Breakdown
          </h2>

          <div className="space-y-5">
            {SCORE_BREAKDOWN.map((item) => {
              const Icon = item.icon;
              const barColor =
                item.score >= 90
                  ? "bg-[#6ee7b7]"
                  : item.score >= 75
                    ? "bg-[var(--color-secondary)]"
                    : "bg-[var(--color-warning)]";

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.isWarning
                          ? isDark
                            ? "bg-[var(--color-warning)]/15"
                            : "bg-[var(--color-warning)]/10"
                          : isDark
                            ? "bg-[var(--color-secondary)]/10"
                            : "bg-[var(--color-secondary)]/10"
                          }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${item.isWarning
                            ? "text-[var(--color-warning)]"
                            : "text-[var(--color-secondary)]"
                            }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[12px] font-black ${isDark ? "text-white" : "text-[var(--color-text-main)]"
                            }`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-[10px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                            }`}
                        >
                          Weight: {item.weight}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.trend === "up" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-[#6ee7b7]" />
                      ) : item.trend === "down" ? (
                        <TrendingDown className="h-3.5 w-3.5 text-[var(--color-warning)]" />
                      ) : null}
                      <span
                        className={`text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                          }`}
                      >
                        {item.score}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? "bg-white/8" : "bg-[var(--color-border-light)]"
                      }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  {item.note && (
                    <p
                      className={`mt-1.5 text-[11px] leading-4 ${item.isWarning
                        ? isDark
                          ? "text-[var(--color-warning)]/80"
                          : "text-[var(--color-warning)]"
                        : isDark
                          ? "text-white/35"
                          : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      {item.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart + Tiers */}
        <div className="flex flex-col gap-5">

          <div
            className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[var(--color-border-light)] bg-white"
              }`}
          >
            <h2
              className={`mb-1 font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Score History
            </h2>
            <p
              className={`mb-4 text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                }`}
            >
              Last 6 months trend
            </p>

            <MiniChart isDark={isDark} />

            <div className="mt-3 flex justify-between">
              {ACTIVITY_HISTORY.map((d) => (
                <span
                  key={d.month}
                  className={`text-[10px] ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                    }`}
                >
                  {d.month}
                </span>
              ))}
            </div>
          </div>

          {/* Tier ladder */}
          <div
            className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[var(--color-border-light)] bg-white"
              }`}
          >
            <h2
              className={`mb-1 font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Score Tiers
            </h2>
            <p
              className={`mb-4 text-[11px] ${isDark ? "text-white/35" : "text-[var(--color-text-muted)]"
                }`}
            >
              Score starts at 100. Violations deduct points.
            </p>

            <div className="space-y-2">
              {[
                {
                  range: "90–100",
                  label: "Trusted Buyer",
                  note: "Priority stream access + verified badge",
                  color: isDark ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]",
                  borderColor: isDark
                    ? "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/8"
                    : "border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10",
                  active: true,
                },
                {
                  range: "75–89",
                  label: "Verified Partner",
                  note: "Standard access, bidding enabled",
                  color: isDark ? "text-white/70" : "text-[var(--color-text-main)]",
                  borderColor: isDark
                    ? "border-white/6 bg-white/[0.02]"
                    : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]",
                  active: false,
                },
                {
                  range: "50–74",
                  label: "Standard Access",
                  note: "Bidding enabled, no priority",
                  color: isDark ? "text-white/50" : "text-[var(--color-text-muted)]",
                  borderColor: isDark
                    ? "border-white/6 bg-white/[0.02]"
                    : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]",
                  active: false,
                },
                {
                  range: "30–49",
                  label: "Restricted — 48h Delay",
                  note: "Live stream disabled for 48 hours",
                  color: "text-[var(--color-warning)]",
                  borderColor: isDark
                    ? "border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5"
                    : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10",
                  active: false,
                },
                {
                  range: "< 30",
                  label: "Permanent Ban",
                  note: "Account flagged — no future access",
                  color: "text-[var(--color-danger)]",
                  borderColor: isDark
                    ? "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5"
                    : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10",
                  active: false,
                },
              ].map((tier) => (
                <div
                  key={tier.range}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${tier.borderColor}`}
                >
                  <div className="flex items-center gap-3">
                    {tier.active && (
                      <BadgeCheck className="h-4 w-4 text-[var(--color-secondary)]" />
                    )}
                    {!tier.active && (
                      <div
                        className={`h-4 w-4 rounded-full border ${isDark
                          ? "border-white/15"
                          : "border-[var(--color-border-light)]"
                          }`}
                      />
                    )}
                    <div>
                      <span className={`text-[12px] font-black ${tier.color}`}>
                        {tier.label}
                      </span>
                      <p
                        className={`text-[10px] ${isDark ? "text-white/25" : "text-[var(--color-text-muted)]"
                          }`}
                      >
                        {tier.note}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] ${isDark ? "text-white/30" : "text-[var(--color-text-muted)]"
                      }`}
                  >
                    {tier.range}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Penalty Table */}
          <div
            className={`rounded-2xl border p-6 shadow-[var(--shadow-card)] ${isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[var(--color-border-light)] bg-white"
              }`}
          >
            <h2
              className={`mb-4 font-serif text-lg font-black ${isDark ? "text-white" : "text-[var(--color-primary)]"
                }`}
            >
              Penalty Table
            </h2>
            <div className="space-y-2">
              {PENALTY_TABLE.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.violation}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isDark
                      ? "border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5"
                      : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[var(--color-danger)]/70" />
                      <span
                        className={`text-[12px] font-bold ${isDark ? "text-white/70" : "text-[var(--color-text-main)]"
                          }`}
                      >
                        {row.violation}
                      </span>
                    </div>
                    <span className="text-[13px] font-black text-[var(--color-danger)]">
                      {row.penalty} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 30-day activity rule */}
          <div
            className={`rounded-xl border px-5 py-4 ${isDark
              ? "border-[var(--color-warning)]/25 bg-[var(--color-warning)]/5"
              : "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
              }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-warning)]">
                  30-Day Activity Rule
                </p>
                <p
                  className={`mt-1 text-[11px] leading-5 ${isDark
                    ? "text-[var(--color-warning)]/70"
                    : "text-[var(--color-text-muted)]"
                    }`}
                >
                  You must secure at least <strong>1 contract every 30 days</strong>.
                  Failure to meet this requirement triggers a{" "}
                  <strong>14-day restriction</strong> on new deal access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
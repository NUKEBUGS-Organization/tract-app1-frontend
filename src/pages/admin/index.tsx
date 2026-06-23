import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  MessageSquareWarning,
  RefreshCcw,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import { useGetAdminDashboardQuery } from "../../services/adminService";
import Button from "../../components/common/Button";
import { PageSkeleton } from "../../components/common/Skeleton";

type DashboardData = {
  users?: number;
  pendingKyc?: number;
  listings?: number;
  deals?: number;
  contracts?: number;
  flaggedMessages?: number;
};

type StatCardProps = {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  path: string;
  featured?: boolean;
  tone?: "primary" | "danger" | "warning" | "neutral";
};

type QueueItem = {
  item: string;
  description: string;
  area: string;
  priority: "High" | "Medium" | "Low";
  status: string;
  path: string;
  icon: LucideIcon;
};

function getDashboardPayload(data: any): DashboardData {
  return data?.data?.data ?? data?.data ?? data ?? {};
}

function formatNumber(value: unknown) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";
  return numberValue.toLocaleString();
}

function getToneClasses(tone: StatCardProps["tone"] = "primary") {
  if (tone === "danger") {
    return {
      soft: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
      border: "hover:border-[var(--color-danger)]/30",
      glow: "bg-[var(--color-danger)]/10",
    };
  }

  if (tone === "warning") {
    return {
      soft: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
      border: "hover:border-[var(--color-warning)]/30",
      glow: "bg-[var(--color-warning)]/10",
    };
  }

  if (tone === "neutral") {
    return {
      soft: "bg-[var(--color-bg-soft)] text-[var(--color-primary)]",
      border: "hover:border-[var(--color-secondary)]/40",
      glow: "bg-[var(--color-secondary)]/10",
    };
  }

  return {
    soft: "bg-[var(--color-primary)]/8 text-[var(--color-primary)]",
    border: "hover:border-[var(--color-primary)]/25",
    glow: "bg-[var(--color-primary)]/10",
  };
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  path,
  featured = false,
  tone = "primary",
}: StatCardProps) {
  const toneClasses = getToneClasses(tone);

  return (
    <Link
      to={path}
      className={`group relative min-w-0 overflow-hidden rounded-3xl border p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40 ${
        featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)] text-white"
          : `border-[var(--color-border-light)] bg-white ${toneClasses.border} hover:bg-[var(--color-bg-soft)]/70`
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 ${
          featured ? "bg-[var(--color-secondary)]/20" : toneClasses.glow
        }`}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[var(--color-secondary)] transition-transform duration-300 group-hover:scale-x-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`max-w-[180px] text-[10px] font-black uppercase tracking-[0.22em] ${
              featured ? "text-white/65" : "text-[var(--color-text-muted)]"
            }`}
          >
            {label}
          </p>

          <div
            className={`mt-4 font-serif text-4xl font-black leading-none transition-transform duration-300 group-hover:scale-[1.03] ${
              featured ? "text-white" : "text-[var(--color-primary)]"
            }`}
          >
            {formatNumber(value)}
          </div>

          <p
            className={`mt-2 text-xs font-semibold ${
              featured ? "text-white/70" : "text-[var(--color-text-muted)]"
            }`}
          >
            {note}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 ${
            featured ? "bg-white/10 text-white" : toneClasses.soft
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div
        className={`relative mt-5 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] transition ${
          featured ? "text-white/80" : "text-[var(--color-secondary)]"
        }`}
      >
        Open
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

function QueueMetric({
  label,
  value,
  priority,
}: {
  label: string;
  value: string;
  priority?: QueueItem["priority"];
}) {
  return (
    <div className="flex min-h-[58px] flex-col justify-center rounded-2xl border border-[var(--color-border-light)] bg-white/90 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {label}
      </p>

      {priority ? (
        <span
          className={`mt-1 inline-flex w-fit rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
            priority === "High"
              ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
              : priority === "Medium"
              ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
              : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          }`}
        >
          {priority}
        </span>
      ) : (
        <p className="mt-1 truncate text-sm font-black text-[var(--color-primary)]">
          {value}
        </p>
      )}
    </div>
  );
}

function QueueCard({ queue }: { queue: QueueItem }) {
  const Icon = queue.icon;

  return (
    <Link
      to={queue.path}
      className="group relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-secondary)]/50 hover:bg-[var(--color-bg-soft)]/60 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      <div className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-[var(--color-secondary)]/10 blur-2xl transition-all duration-500 group-hover:scale-150" />

      <div className="relative grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(430px,520px)_28px] xl:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)] transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-base font-black text-[var(--color-primary)]">
              {queue.item}
            </h3>

            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
              {queue.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QueueMetric label="Area" value={queue.area} />
          <QueueMetric label="Status" value={queue.status} />
          <QueueMetric label="Priority" value={queue.priority} priority={queue.priority} />
        </div>

        <div className="hidden justify-self-end xl:block">
          <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--color-secondary)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useGetAdminDashboardQuery();

if (isLoading) {
  return <PageSkeleton />;
}

  if (isError) {
    return (
      <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-[var(--color-danger)]">
              Failed to load admin dashboard
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Something went wrong while loading dashboard metrics.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="justify-center"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const dashboard = getDashboardPayload(data);

  const stats: StatCardProps[] = [
    {
      label: "Total Users",
      value: dashboard.users ?? 0,
      note: "All platform users",
      icon: Users,
      path: "/users",
      featured: true,
    },
    {
      label: "Pending Verifications",
      value: dashboard.pendingKyc ?? 0,
      note: "Needs admin review",
      icon: ShieldCheck,
      path: "/verifications",
      tone: "warning",
    },
    {
      label: "Listings",
      value: dashboard.listings ?? 0,
      note: "Seller properties",
      icon: FileText,
      path: "/properties",
      tone: "primary",
    },
    {
      label: "Deals",
      value: dashboard.deals ?? 0,
      note: "Deal records",
      icon: Handshake,
      path: "/deals",
      tone: "neutral",
    },
    {
      label: "Contracts",
      value: dashboard.contracts ?? 0,
      note: "Signing records",
      icon: ScrollText,
      path: "/contracts",
      tone: "neutral",
    },
    {
      label: "Chat Flags",
      value: dashboard.flaggedMessages ?? 0,
      note: "Moderation queue",
      icon: MessageSquareWarning,
      path: "/chat-flags",
      tone: "danger",
    },
  ];

  const queues: QueueItem[] = [
    {
      item: "KYC verification queue",
      description: "Review users waiting for identity or account verification.",
      area: "Verification",
      priority: "High",
      status: `${dashboard.pendingKyc ?? 0} Pending`,
      path: "/verifications",
      icon: ShieldCheck,
    },
    {
      item: "Listing approvals",
      description: "Inspect submitted seller properties and listing quality.",
      area: "Listings",
      priority: "High",
      status: "Review",
      path: "/properties",
      icon: Building2,
    },
    {
      item: "Flagged chat messages",
      description: "Check messages flagged for contact sharing or policy risks.",
      area: "Moderation",
      priority: "Medium",
      status: `${dashboard.flaggedMessages ?? 0} Flags`,
      path: "/chat-flags",
      icon: MessageSquareWarning,
    },
  ];

  return (
    <div className="min-w-0 space-y-8 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-primary)]/15 bg-[var(--color-primary)] p-6 text-white shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[var(--color-secondary)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-12 top-10 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />
        <div className="pointer-events-none absolute bottom-10 right-40 hidden h-16 w-16 rounded-full border border-[var(--color-secondary)]/20 lg:block" />

        <div className="relative max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-secondary)] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-secondary)]" />
            </span>

            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              Admin Workspace
            </span>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Your Admin Dashboard
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
            Manage users, review verifications, approve listings, track deals,
            monitor contracts, and handle moderation from one premium control
            center.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/80">
            <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
            Live admin metrics
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
              Platform Overview
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              Key platform totals and admin queues.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-white px-3 py-2 text-xs font-black text-[var(--color-primary)] shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-secondary)]" />
            Live metrics
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
            Admin Review Queue
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
            Items that may require administrative review or action.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {queues.map((queue) => (
            <QueueCard key={queue.item} queue={queue} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
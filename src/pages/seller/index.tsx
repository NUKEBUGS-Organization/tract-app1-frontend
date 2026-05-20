import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Handshake,
  Home,
  Plus,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const stats = [
  {
    label: "Active Listings",
    value: "2",
    note: "Live in network",
    icon: Home,
    trend: "stable",
  },
  {
    label: "Bids Received",
    value: "7",
    note: "+14% this week",
    icon: Gavel,
    trend: "up",
  },
  {
    label: "Deals In Progress",
    value: "1",
    note: "On track for closing",
    icon: Handshake,
    trend: "stable",
  },
  {
    label: "Seller Score",
    value: "98",
    note: "Top 5% of Sellers",
    icon: ShieldCheck,
    trend: "up",
  },
];

const listings = [
  {
    emoji: "🏡",
    address: "123 Aspen Estates",
    city: "Austin, TX",
    status: "Live",
    bids: 3,
    daysLive: 14,
    progress: 65,
  },
  {
    emoji: "🌊",
    address: "456 Riviera Bluff",
    city: "Miami, FL",
    status: "Under Contract",
    bids: 7,
    daysLive: 32,
    progress: 90,
  },
];

const activities = [
  {
    icon: Gavel,
    title: "New bid received — $412,000",
    sub: "123 Aspen Estates",
    time: "2 hours ago",
    type: "bid",
  },
  {
    icon: FileText,
    title: "Document uploaded to vault",
    sub: "Survey.pdf verified",
    time: "5 hours ago",
    type: "doc",
  },
  {
    icon: Building2,
    title: "New inquiry from verified realtor",
    sub: "Licensed partner viewed your listing",
    time: "Yesterday",
    type: "inquiry",
  },
  {
    icon: CheckCircle2,
    title: "Security verification complete",
    sub: "2FA & KYC passed",
    time: "2 days ago",
    type: "security",
  },
];

const pipeline = [
  { label: "Listed", count: 2, active: true },
  { label: "Bids In", count: 7, active: true },
  { label: "Under Contract", count: 1, active: true },
  { label: "Closing", count: 0, active: false },
];

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  trend: string;
}

function StatCard({ label, value, note, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[120px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/8">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
      </div>
      <div className="font-serif text-4xl font-black text-[var(--color-primary)]">
        {value}
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]/70">
        {trend === "up" && (
          <TrendingUp className="h-3 w-3 text-[var(--color-success)]" />
        )}
        {note}
      </p>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export default function SellerDashboard() {
  const [notifCount] = useState(2);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] p-8 shadow-[var(--shadow-card)]">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-5">
          <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-secondary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)]">
                Verified Seller
              </span>
            </div>
            <h1 className="font-serif text-3xl font-black text-white lg:text-4xl">
              Your Seller Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Manage your listings, review offers, and track your deals — all in
              one secure place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/list-property"
              className="inline-flex items-center gap-2 bg-[var(--color-secondary)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
            <Link
              to="/bids"
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
            >
              {notifCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-black text-white">
                  {notifCount}
                </span>
              )}
              <Bell className="h-4 w-4" />
              View Bids
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Pipeline Funnel */}
      <section className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-6 font-serif text-xl font-black text-[var(--color-primary)]">
          Deal Pipeline
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pipeline.map((stage, i) => (
            <div key={stage.label} className="relative">
              <div
                className={`rounded-xl p-5 text-center transition ${
                  stage.active
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                }`}
              >
                <div
                  className={`font-serif text-3xl font-black ${stage.active ? "text-[var(--color-secondary)]" : "text-[var(--color-text-muted)]/40"}`}
                >
                  {stage.count}
                </div>
                <p
                  className={`mt-1 text-[10px] font-black uppercase tracking-wider ${stage.active ? "text-white/70" : "text-[var(--color-text-muted)]/60"}`}
                >
                  {stage.label}
                </p>
              </div>
              {i < pipeline.length - 1 && (
                <div className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 sm:block">
                  <ArrowUpRight className="h-4 w-4 rotate-45 text-[var(--color-text-muted)]/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Listings + Activity */}
      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-black text-[var(--color-primary)]">
              Active Listings
            </h2>
            <Link
              to="/list-property"
              className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
            >
              + Add Listing
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Property", "Status", "Bids", "Days Live", "Progress", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing.address}
                      className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/50"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-xl">
                            {listing.emoji}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--color-primary)]">
                              {listing.address}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {listing.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            listing.status === "Live"
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                              : "bg-[var(--color-secondary)]/15 text-[#7a5d00]"
                          }`}
                        >
                          {listing.status === "Live" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                          )}
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {listing.bids}
                      </td>
                      <td className="px-5 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {listing.daysLive}d
                      </td>
                      <td className="px-5 py-5">
                        <div className="w-24">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                listing.progress > 75
                                  ? "bg-[var(--color-secondary)]"
                                  : "bg-[var(--color-primary)]"
                              }`}
                              style={{ width: `${listing.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                            {listing.progress}%
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <Link
                          to="/bids"
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]"
                        >
                          View Bids
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <aside>
          <h2 className="mb-5 font-serif text-2xl font-black text-[var(--color-primary)]">
            Recent Activity
          </h2>
          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="relative space-y-7 before:absolute before:left-[19px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-[var(--color-border-light)]">
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.title} className="relative flex gap-4">
                    <div
                      className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        activity.type === "bid"
                          ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                          : activity.type === "security"
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "bg-[var(--color-secondary)]/15 text-[var(--color-primary)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-5 text-[var(--color-text-main)]">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {activity.sub}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-text-muted)]">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-3">
            <Link
              to="/document-vault"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="text-sm font-bold text-[var(--color-text-main)]">
                  Document Vault
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </Link>
            <Link
              to="/deal-tracker"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border-light)] bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Handshake className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="text-sm font-bold text-[var(--color-text-main)]">
                  Deal Tracker
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
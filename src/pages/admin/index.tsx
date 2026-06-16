import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  FileText,
  Handshake,
  MessageSquareWarning,
  ShieldCheck,
  UserCheck,
  Users,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import { useGetAdminDashboardQuery } from "../../services/adminService";
import Loader from "../../components/common/Loader";

interface StatCardProps {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
}

function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[150px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <div className="font-serif text-4xl font-black text-[var(--color-primary)]">
        {value ?? 0}
      </div>

      <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]/75">
        {note}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminDashboardQuery();

  if (isLoading) {
    return <Loader label="Loading admin dashboard..." />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-[var(--color-danger)]/20 bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
        Failed to load admin dashboard.
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: data?.users ?? 0,
      note: "All platform users",
      icon: Users,
    },
    {
      label: "Pending Verifications",
      value: data?.pendingKyc ?? 0,
      note: "Needs review",
      icon: ShieldCheck,
    },
    {
      label: "Listings",
      value: data?.listings ?? 0,
      note: "Seller properties",
      icon: FileText,
    },
    {
      label: "Deals",
      value: data?.deals ?? 0,
      note: "All deal records",
      icon: Handshake,
    },
    {
      label: "Contracts",
      value: data?.contracts ?? 0,
      note: "Contract records",
      icon: ScrollText,
    },
    {
      label: "Chat Flags",
      value: data?.flaggedMessages ?? 0,
      note: "Moderation queue",
      icon: MessageSquareWarning,
    },
  ];

  const queues = [
    {
      item: "KYC verification queue",
      owner: "Verification",
      priority: "High",
      status: `${data?.pendingKyc ?? 0} Pending`,
      path: "/verifications",
    },
    {
      item: "Listing approvals",
      owner: "Listings",
      priority: "High",
      status: "Review",
      path: "/properties",
    },
    {
      item: "Flagged chat messages",
      owner: "Moderation",
      priority: "Medium",
      status: `${data?.flaggedMessages ?? 0} Flags`,
      path: "/chat-flags",
    },
  ];

  const activity = [
    {
      icon: UserCheck,
      title: "Admin dashboard loaded",
      time: "Live backend stats",
    },
    {
      icon: AlertTriangle,
      title: "Review pending KYC and chat flags",
      time: "Requires admin action",
    },
    {
      icon: Building2,
      title: "Monitor listings and deals",
      time: "Operational overview",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
              Admin Review Queue
            </h1>

            <Link
              to="/verification"
              className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8"
            >
              View All
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  {["Queue Item", "Owner", "Priority", "Status", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {queues.map((queue) => (
                  <tr
                    key={queue.item}
                    className="border-t border-[var(--color-border-light)]"
                  >
                    <td className="px-6 py-6 text-sm font-black text-[var(--color-primary)]">
                      {queue.item}
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-[var(--color-text-main)]">
                      {queue.owner}
                    </td>

                    <td className="px-6 py-6">
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                          queue.priority === "High"
                            ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                            : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                        }`}
                      >
                        {queue.priority}
                      </span>
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-[var(--color-text-main)]">
                      {queue.status}
                    </td>

                    <td className="px-6 py-6">
                      <Link
                        to={queue.path}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00]"
                      >
                        Open
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <h2 className="mb-5 font-serif text-3xl font-black text-[var(--color-primary)]">
            Recent Activity
          </h2>

          <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="space-y-7">
              {activity.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-primary)]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold leading-6 text-[var(--color-text-main)]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default AdminDashboard;
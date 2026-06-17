import {
  ArrowUpRight,
  Building2,
  FileText,
  Handshake,
  MessageSquareWarning,
  ShieldCheck,
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

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <p className="max-w-[160px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" />
        </div>
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
  const {
    data,
    isLoading,
    isError,
  } = useGetAdminDashboardQuery();

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



  return (
    <div className="space-y-8">
      {/* Admin dashboard welcome banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-32 right-16 h-64 w-64 rounded-full bg-white/[0.03]" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />

            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              Admin Workspace
            </span>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-black leading-tight text-white sm:text-4xl">
            Your Admin Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            Manage users, review identity verifications, approve listings,
            monitor contracts and deals, and handle platform moderation from one
            place.
          </p>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Queue and activity */}
     <section className="w-full">
  <div className="mb-5">
    <h2 className="font-serif text-3xl font-black text-[var(--color-primary)]">
      Admin Review Queue
    </h2>

    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
      Items that may require administrative review or action.
    </p>
  </div>

  <div className="w-full overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead className="bg-[var(--color-bg-soft)]">
          <tr>
            {[
              "Queue Item",
              "Owner",
              "Priority",
              "Status",
              "Action",
            ].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
              >
                {heading}
              </th>
            ))}
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
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
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
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00] transition hover:text-[var(--color-primary)]"
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
</section>
    </div>
  );
}

export default AdminDashboard;


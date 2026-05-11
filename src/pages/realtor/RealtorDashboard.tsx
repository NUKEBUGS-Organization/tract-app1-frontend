import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  Handshake,
  Home,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const stats = [
  {
    label: "Active Clients",
    value: "12",
    note: "3 high-priority leads",
    icon: Users,
  },
  {
    label: "Properties Matched",
    value: "28",
    note: "+8 this week",
    icon: Building2,
  },
  {
    label: "Deals Supported",
    value: "6",
    note: "2 closing soon",
    icon: Handshake,
  },
  {
    label: "License Status",
    value: "OK",
    note: "Verified profile",
    icon: ShieldCheck,
  },
];

const clients = [
  {
    name: "Morgan Client",
    target: "Austin, TX",
    budget: "$450K",
    status: "Matched",
  },
  {
    name: "Harper Client",
    target: "Dallas, TX",
    budget: "$620K",
    status: "Reviewing",
  },
  {
    name: "Noah Client",
    target: "Houston, TX",
    budget: "$390K",
    status: "New",
  },
];

const activity = [
  {
    icon: BadgeCheck,
    title: "License profile verified",
    time: "Today",
  },
  {
    icon: Home,
    title: "New property matched with client",
    time: "2 hours ago",
  },
  {
    icon: ClipboardCheck,
    title: "Commission setup reviewed",
    time: "Yesterday",
  },
];

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
}

function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[130px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>

      <div className="font-serif text-4xl font-black text-[var(--color-primary)]">
        {value}
      </div>

      <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]/75">
        {note}
      </p>
    </div>
  );
}

function RealtorDashboard() {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
              Client Match Pipeline
            </h1>

            <button className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8">
              View All Clients
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  {["Client", "Target Area", "Budget", "Status", "Action"].map(
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
                {clients.map((client) => (
                  <tr key={client.name} className="border-t border-[var(--color-border-light)]">
                    <td className="px-6 py-6 text-sm font-black text-[var(--color-primary)]">
                      {client.name}
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-[var(--color-text-main)]">
                      {client.target}
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-[var(--color-text-main)]">
                      {client.budget}
                    </td>

                    <td className="px-6 py-6">
                      <span className="bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                        {client.status}
                      </span>
                    </td>

                    <td className="px-6 py-6">
                      <button className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00]">
                        Review
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
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

export default RealtorDashboard;
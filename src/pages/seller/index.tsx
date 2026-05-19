import {
  ArrowUpRight,
  Building2,
  CircleCheck,
  FileText,
  Gavel,
  Handshake,
  Home,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const stats = [
  {
    label: "Active Listings",
    value: "2",
    note: "0% from last month",
    icon: Home,
  },
  {
    label: "Bids Received",
    value: "7",
    note: "+14% from last month",
    icon: Gavel,
  },
  {
    label: "Deals In Progress",
    value: "1",
    note: "On track for closing",
    icon: Handshake,
  },
  {
    label: "Reliability Score",
    value: "98",
    note: "Top 5% of Agents",
    icon: ShieldCheck,
  },
];

const listings = [
  {
    image: "🏡",
    address: "123 Aspen Estates",
    status: "Live",
    bids: 3,
    daysLive: 14,
  },
  {
    image: "🌊",
    address: "456 Riviera Bluff",
    status: "Under Contract",
    bids: 5,
    daysLive: 32,
  },
];

const activities = [
  {
    icon: Gavel,
    title: "Bid received for 123 Aspen Estates",
    time: "2 hours ago",
  },
  {
    icon: FileText,
    title: 'Document "Escrow_Final.pdf" uploaded',
    time: "5 hours ago",
  },
  {
    icon: Building2,
    title: "New inquiry from verified realtor",
    time: "Yesterday",
  },
  {
    icon: CircleCheck,
    title: "Account security verification complete",
    time: "2 days ago",
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
        <p className="max-w-[120px] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
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

export default function SellerDashboard() {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
              Your Active Listings
            </h1>

            <button className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8">
              View All Portfolio
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Property Address
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Bids
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Days Live
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {listings.map((listing) => (
                  <tr
                    key={listing.address}
                    className="border-t border-[var(--color-border-light)]"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-2xl">
                          {listing.image}
                        </div>

                        <p className="max-w-[150px] text-sm font-black leading-6 text-[var(--color-primary)]">
                          {listing.address}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                          listing.status === "Live"
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "bg-[var(--color-secondary)]/20 text-[#8a6a00]"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-[var(--color-text-main)]">
                      {listing.bids}
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-[var(--color-text-main)]">
                      {listing.daysLive}
                    </td>

                    <td className="px-6 py-6 text-right">
                      <button className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00]">
                        View Details
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
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-[var(--color-border-light)]">
              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.title} className="relative flex gap-4">
                    <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-primary)]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold leading-6 text-[var(--color-text-main)]">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
                        {activity.time}
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
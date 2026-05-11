import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Clock3,
  Gavel,
  Handshake,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const stats = [
  {
    label: "Available Deals",
    value: "18",
    note: "Fresh property stream",
    icon: Building2,
  },
  {
    label: "Bids Submitted",
    value: "9",
    note: "+3 this week",
    icon: Gavel,
  },
  {
    label: "Active Deals",
    value: "4",
    note: "2 nearing contract",
    icon: Handshake,
  },
  {
    label: "Partner Score",
    value: "94",
    note: "Trusted buyer status",
    icon: ShieldCheck,
  },
];

const deals = [
  {
    property: "782 Willow Ridge",
    price: "$420K",
    margin: "12%",
    deadline: "18 hrs",
    status: "Hot",
  },
  {
    property: "90 Lakeview Oaks",
    price: "$610K",
    margin: "9%",
    deadline: "1 day",
    status: "Review",
  },
  {
    property: "233 Cedar Heights",
    price: "$355K",
    margin: "15%",
    deadline: "2 days",
    status: "New",
  },
];

const activity = [
  {
    icon: TrendingUp,
    title: "Reliability score increased by 4%",
    time: "Today",
  },
  {
    icon: CircleDollarSign,
    title: "New high-margin deal added to stream",
    time: "3 hours ago",
  },
  {
    icon: Clock3,
    title: "Offer deadline approaching",
    time: "6 hours ago",
  },
  {
    icon: BadgeCheck,
    title: "Seller accepted document review",
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.09]">
      <div className="mb-5 flex items-start justify-between">
        <p className="max-w-[120px] text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
          {label}
        </p>

        <Icon className="h-5 w-5 text-[var(--color-secondary)]" />
      </div>

      <div className="font-serif text-4xl font-black text-white">{value}</div>

      <p className="mt-2 text-xs font-semibold text-[var(--color-secondary)]">
        {note}
      </p>
    </div>
  );
}

function PartnerDashboard() {
  return (
    <div className="space-y-10">
      <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-7 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">
              Partner Pro Mode
            </p>

            <h1 className="mt-2 font-serif text-4xl font-black text-white">
              Find profitable off-market deals
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Review live opportunities, submit offers, and manage active
              contracts from a focused buyer workspace.
            </p>
          </div>

          <button className="bg-[var(--color-secondary)] px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[var(--shadow-premium)]">
            Browse Stream
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-3xl font-black text-white">
              Property Stream
            </h2>

            <button className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] underline decoration-[var(--color-secondary)]/40 underline-offset-8">
              View All
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-white/[0.06]">
                <tr>
                  {["Property", "Price", "Margin", "Deadline", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-white/40"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.property} className="border-t border-white/10">
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-white">
                        {deal.property}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Status: {deal.status}
                      </p>
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-white/80">
                      {deal.price}
                    </td>

                    <td className="px-6 py-6 text-sm font-black text-[var(--color-secondary)]">
                      {deal.margin}
                    </td>

                    <td className="px-6 py-6 text-sm font-bold text-white/80">
                      {deal.deadline}
                    </td>

                    <td className="px-6 py-6">
                      <button className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                        Submit Bid
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
          <h2 className="mb-5 font-serif text-3xl font-black text-white">
            Recent Activity
          </h2>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl">
            <div className="space-y-7">
              {activity.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold leading-6 text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
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

export default PartnerDashboard;
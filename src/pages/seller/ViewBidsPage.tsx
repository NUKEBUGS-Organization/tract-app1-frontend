import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gavel,
  Info,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

/* ────────────────────────────────────────────────────────── */
/* Types & Mock Data                                         */
/* ────────────────────────────────────────────────────────── */
type BidStatus = "pending" | "selected" | "backup1" | "backup2" | "deleted";

interface Bid {
  id: string;
  rank: number;
  bidderName: string;
  type: "Wholesaler" | "Licensed Partner";
  reliabilityScore: number;
  bidAmount: number;
  timeline: string;
  inspectionDays: number;
  netToSeller: number;
  status: BidStatus;
  closings: number;
}

const MOCK_BIDS: Bid[] = [
  {
    id: "b1", rank: 1, bidderName: "Marcus J.", type: "Wholesaler", reliabilityScore: 97,
    bidAmount: 435000, timeline: "30 days", inspectionDays: 7, netToSeller: 435000, status: "pending", closings: 14,
  },
  {
    id: "b2", rank: 2, bidderName: "Sandra K. | Realtor", type: "Licensed Partner", reliabilityScore: 91,
    bidAmount: 455000, timeline: "45 days", inspectionDays: 10, netToSeller: 443850, status: "pending", closings: 28,
  },
  {
    id: "b3", rank: 3, bidderName: "Tyler R.", type: "Wholesaler", reliabilityScore: 88,
    bidAmount: 420000, timeline: "21 days", inspectionDays: 3, netToSeller: 420000, status: "pending", closings: 9,
  },
  {
    id: "b4", rank: 4, bidderName: "Chen Investments", type: "Wholesaler", reliabilityScore: 85,
    bidAmount: 415000, timeline: "30 days", inspectionDays: 7, netToSeller: 415000, status: "pending", closings: 6,
  },
  {
    id: "b5", rank: 5, bidderName: "Diana M. | Realtor", type: "Licensed Partner", reliabilityScore: 79,
    bidAmount: 448000, timeline: "45 days", inspectionDays: 10, netToSeller: 436560, status: "pending", closings: 19,
  },
  {
    id: "b6", rank: 6, bidderName: "Jordan Capital", type: "Wholesaler", reliabilityScore: 76,
    bidAmount: 410000, timeline: "30 days", inspectionDays: 7, netToSeller: 410000, status: "pending", closings: 4,
  },
  {
    id: "b7", rank: 7, bidderName: "Premier Group", type: "Wholesaler", reliabilityScore: 72,
    bidAmount: 405000, timeline: "60 days", inspectionDays: 10, netToSeller: 405000, status: "pending", closings: 2,
  },
];

function scoreColor(score: number): string {
  if (score >= 90) return "text-[var(--color-primary)]";
  if (score >= 75) return "text-[var(--color-secondary)]";
  return "text-[var(--color-warning)]";
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-[var(--color-primary)]"
      : score >= 75
        ? "bg-[var(--color-secondary)]"
        : "bg-[var(--color-warning)]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border-light)]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-black ${scoreColor(score)}`}>{score}%</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Confirm Modal                                             */
/* ────────────────────────────────────────────────────────── */
function ConfirmModal({
  bid,
  action,
  onConfirm,
  onCancel,
}: {
  bid: Bid;
  action: "select" | "backup";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${action === "select"
              ? "bg-[var(--color-secondary)]/15"
              : "bg-[var(--color-primary)]/10"
              }`}
          >
            {action === "select" ? (
              <CheckCircle2 className="h-6 w-6 text-[var(--color-secondary)]" />
            ) : (
              <Shield className="h-6 w-6 text-[var(--color-primary)]" />
            )}
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="font-serif text-xl font-black text-[var(--color-primary)]">
          {action === "select" ? "Confirm Primary Selection" : "Add to Backup Queue"}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {action === "select"
            ? "This will initiate the contract process. The remaining bids (except 2 backups) will be automatically deleted."
            : "This bidder will join the Backup Buyer Queue and will be notified if the primary deal falls through."}
        </p>

        <div className="mt-5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Selected Bidder
          </p>
          <p className="mt-1 text-base font-black text-[var(--color-primary)]">
            {bid.bidderName}
          </p>
          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            Net-to-Seller: ${bid.netToSeller.toLocaleString()}
          </p>
        </div>

        {action === "select" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
            <p className="text-xs text-[var(--color-text-muted)]">
              The 1-2-Delete Rule applies: 1 primary, up to 2 backups, all others deleted.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-none border border-[var(--color-border-light)] py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] ${action === "select"
              ? "bg-[var(--color-secondary)] text-[var(--color-primary-dark)]"
              : "bg-[var(--color-primary)]"
              }`}
          >
            {action === "select" ? "Accept & Lock In" : "Add to Backup"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main Component                                            */
/* ────────────────────────────────────────────────────────── */
export default function ViewBidsPage() {
  const [bids, setBids] = useState<Bid[]>(MOCK_BIDS);
  const [modal, setModal] = useState<{ bid: Bid; action: "select" | "backup" } | null>(null);
  const [sortKey, setSortKey] = useState<"netToSeller" | "reliabilityScore">("netToSeller");
  const [sortAsc, setSortAsc] = useState(false);

  const primaryBid = bids.find((b) => b.status === "selected");
  const backupBids = bids.filter((b) => b.status === "backup1" || b.status === "backup2");
  const activeBids = bids.filter((b) => b.status === "pending");
  const deletedBids = bids.filter((b) => b.status === "deleted");

  const backupCount = backupBids.length;
  const dealLocked = !!primaryBid;

  function toggleSort(key: "netToSeller" | "reliabilityScore") {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...activeBids].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  function handleConfirm() {
    if (!modal) return;
    const { bid, action } = modal;
    setBids((prev) =>
      prev.map((b) => {
        if (b.id === bid.id) {
          return { ...b, status: action === "select" ? "selected" : backupCount === 0 ? "backup1" : "backup2" };
        }
        // 1-2-Delete rule: delete all non-selected non-backup pending bids
        if (action === "select" && b.status === "pending") {
          return { ...b, status: "deleted" };
        }
        return b;
      })
    );
    setModal(null);
  }

  return (
    <div className="space-y-8">
      {modal && (
        <ConfirmModal
          bid={modal.bid}
          action={modal.action}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Seller Portal
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
            Incoming Bids
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {activeBids.length + backupBids.length + (primaryBid ? 1 : 0)} of 10 bid slots active
          </p>
        </div>
        {dealLocked && (
          <div className="flex items-center gap-2 rounded-none border border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 px-5 py-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-secondary)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Partnership Secured
            </span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Bids", value: bids.length, icon: Gavel, color: "text-[var(--color-primary)]" },
          { label: "Slots Remaining", value: Math.max(0, 10 - bids.length), icon: Users, color: "text-[var(--color-text-muted)]" },
          { label: "Backup Queue", value: backupCount, icon: Shield, color: "text-[var(--color-secondary)]" },
          { label: "Highest Net", value: `$${Math.max(...bids.map(b => b.netToSeller)).toLocaleString()}`, icon: TrendingUp, color: "text-[var(--color-primary)]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {label}
              </p>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`mt-2 font-serif text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Primary Selected */}
      {primaryBid && (
        <div className="rounded-xl border-2 border-[var(--color-secondary)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 text-white shadow-[var(--shadow-premium)]">
          <div className="flex items-center gap-2 text-[var(--color-secondary)]">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Primary Partner — Under Contract
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-black">{primaryBid.bidderName}</h2>
              <p className="mt-1 text-sm text-white/60">{primaryBid.type}</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Net-to-Seller</p>
                <p className="font-serif text-2xl font-black text-[var(--color-secondary)]">
                  ${primaryBid.netToSeller.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Timeline</p>
                <p className="font-serif text-2xl font-black">{primaryBid.timeline}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Score</p>
                <p className="font-serif text-2xl font-black">{primaryBid.reliabilityScore}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Queue */}
      {backupBids.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Shield className="h-5 w-5 text-[var(--color-secondary)]" />
            <h2 className="font-serif text-lg font-black">
              Backup Buyer Queue ({backupBids.length}/2)
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {backupBids.map((bid, idx) => (
              <div
                key={bid.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[11px] font-black text-[var(--color-primary)]">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-black text-[var(--color-text-main)]">{bid.bidderName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{bid.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[var(--color-text-muted)]">Net-to-Seller</p>
                    <p className="font-bold text-[var(--color-primary)]">${bid.netToSeller.toLocaleString()}</p>
                  </div>
                  <span className="rounded-none border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                    Waiting
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1-2-Delete Rule Info */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-secondary)]" />
        <div>
          <p className="text-sm font-black text-[var(--color-primary)]">The 1-2-Delete Rule</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Select 1 Primary Partner (locks the contract). You may add up to 2 Backup Buyers.
            All remaining bids are automatically removed to protect deal exclusivity.
          </p>
        </div>
      </div>

      {/* Active Bids Table */}
      {sorted.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-black text-[var(--color-primary)]">
              Offer Comparison
            </h2>
            {!dealLocked && (
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                <span>Sort by:</span>
                <button
                  onClick={() => toggleSort("netToSeller")}
                  className={`flex items-center gap-1 transition ${sortKey === "netToSeller" ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)]"}`}
                >
                  Net-to-Seller
                  {sortKey === "netToSeller" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </button>
                <span className="text-[var(--color-border-light)]">|</span>
                <button
                  onClick={() => toggleSort("reliabilityScore")}
                  className={`flex items-center gap-1 transition ${sortKey === "reliabilityScore" ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)]"}`}
                >
                  Reliability
                  {sortKey === "reliabilityScore" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Rank", "Bidder", "Reliability Score", "Net-to-Seller", "Timeline", "Inspect.", "Closings", "Action"].map((h) => (
                      <th key={h} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((bid, i) => (
                    <tr
                      key={bid.id}
                      className="border-t border-[var(--color-border-light)] transition hover:bg-[var(--color-bg-soft)]/50"
                    >
                      <td className="px-4 py-5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[11px] font-black text-[var(--color-primary)]">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div>
                          <p className="text-sm font-black text-[var(--color-text-main)]">{bid.bidderName}</p>
                          <span className={`mt-0.5 inline-block text-[10px] font-bold ${bid.type === "Licensed Partner" ? "text-[var(--color-secondary)]" : "text-[var(--color-text-muted)]"}`}>
                            {bid.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <ScoreBar score={bid.reliabilityScore} />
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-black text-[var(--color-primary)]">
                          ${bid.netToSeller.toLocaleString()}
                        </p>
                        {bid.bidAmount !== bid.netToSeller && (
                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            Offer: ${bid.bidAmount.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {bid.timeline}
                      </td>
                      <td className="px-4 py-5 text-sm font-bold text-[var(--color-text-main)]">
                        {bid.inspectionDays}d
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-[var(--color-secondary)] text-[var(--color-secondary)]" />
                          <span className="text-sm font-bold text-[var(--color-text-main)]">{bid.closings}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        {dealLocked ? (
                          backupCount < 2 ? (
                            <button
                              onClick={() => setModal({ bid, action: "backup" })}
                              className="rounded-none border border-[var(--color-primary)] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                            >
                              Add Backup
                            </button>
                          ) : (
                            <span className="text-[10px] text-[var(--color-text-muted)]">—</span>
                          )
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setModal({ bid, action: "select" })}
                              className="rounded-none bg-[var(--color-secondary)] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary-dark)] shadow-[var(--shadow-premium)] transition hover:scale-[1.02]"
                            >
                              Select
                            </button>
                            {backupCount < 2 && (
                              <button
                                onClick={() => setModal({ bid, action: "backup" })}
                                className="rounded-none border border-[var(--color-border-light)] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                              >
                                Backup
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Deleted bids count */}
      {deletedBids.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-5 py-3">
          <Trash2 className="h-4 w-4 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text-main)]">{deletedBids.length} bids</strong> automatically removed by the 1-2-Delete Rule.
          </p>
        </div>
      )}
    </div>
  );
}

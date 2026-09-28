import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2, Send, UserCog } from "lucide-react";
import {
  useClaimTicketMutation,
  useGetTicketQuery,
  useUpdateTicketMutation,
} from "../../services/ticketService";
import { useAppSelector } from "../../redux/hooks";
import { ADMIN_ROLES } from "../../constants/roles";

const STATUS_STYLE = {
  open: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
} as const;

export default function SupportDetailPage() {
  const { id = "" } = useParams();
  const role = useAppSelector((s) => s.auth.user?.role);
  const userId = useAppSelector(
    (s) =>
      s.auth.user?.id ??
      s.auth.user?._id ??
      s.auth.user?.user_id ??
      s.auth.user?.sub,
  );
  const isAdmin = role && ADMIN_ROLES.includes(role as never);

  const { data: ticket, isLoading, isError } = useGetTicketQuery(id, {
    skip: !id,
  });
  const [updateTicket, { isLoading: updating }] = useUpdateTicketMutation();
  const [claimTicket, { isLoading: claiming }] = useClaimTicketMutation();
  const [reply, setReply] = useState("");

  const onReply = async () => {
    if (!reply.trim() || !id) return;
    await updateTicket({ id, reply: reply.trim() }).unwrap();
    setReply("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-secondary)]" />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Loading ticket…
        </p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="text-sm font-semibold text-red-600">
          Ticket not found.{" "}
          <Link to="/support" className="underline">
            Back to tickets
          </Link>
        </p>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLE[ticket.status as keyof typeof STATUS_STYLE] ??
    STATUS_STYLE.open;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* ── Breadcrumb ──────────────────────────────────── */}
      <Link
        to="/support"
        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)] transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        My Tickets
      </Link>

      {/* ── Ticket card ───────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="border-b border-[var(--color-border-light)] px-7 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl font-black text-[var(--color-primary)]">
                {ticket.subject}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyle}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {ticket.status.replace("_", " ")}
                </span>
                {ticket.sourceApp && (
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    · {ticket.sourceApp}
                  </span>
                )}
              </div>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                {!ticket.assignedTo && (
                  <button
                    type="button"
                    disabled={claiming}
                    onClick={() => claimTicket(id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-primary)] transition-all hover:bg-white hover:shadow-sm disabled:opacity-60"
                  >
                    <UserCog className="h-3.5 w-3.5" />
                    {claiming ? "Claiming…" : "Claim"}
                  </button>
                )}
                {ticket.status !== "resolved" && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => updateTicket({ id, status: "resolved" })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Resolved
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="space-y-3 p-7">
          {ticket.messages.map((m, idx) => {
            const mine = m.senderId === userId;
            const initials = (m.senderRole ?? "?")[0].toUpperCase();

            return (
              <div
                key={`${m.createdAt}-${idx}`}
                className={`group flex items-start gap-3.5 rounded-2xl p-2.5 -mx-2.5 transition-all duration-200 ease-out hover:bg-[var(--color-bg-soft)]/60 ${
                  mine ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black shadow-sm transition-all duration-200 group-hover:scale-105 ${
                    mine
                      ? "bg-[var(--color-primary)] text-white group-hover:shadow-md"
                      : "bg-[var(--color-secondary)]/20 text-[var(--color-primary)] group-hover:bg-[var(--color-secondary)]/35"
                  }`}
                >
                  {initials}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] transition-colors duration-200 group-hover:text-[var(--color-primary)]">
                    {m.senderRole} &middot;{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-7 transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md ${
                      mine
                        ? "rounded-tr-sm bg-[var(--color-primary)] text-white group-hover:bg-[var(--color-primary-dark)]"
                        : "rounded-tl-sm border border-[var(--color-border-light)] bg-white text-[var(--color-text-main)] group-hover:border-[var(--color-secondary)]/50"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply compose */}
        {ticket.status !== "closed" && (
          <div className="border-t border-[var(--color-border-light)] p-7 pt-5">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder="Write a reply…"
              className="w-full resize-none rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-medium text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:shadow-sm"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Our team monitors replies around the clock.
              </p>
              <button
                type="button"
                disabled={updating || !reply.trim()}
                onClick={onReply}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg disabled:opacity-50"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {updating ? "Sending…" : "Send Reply"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

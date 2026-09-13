import { useState } from "react";
import { Link, useParams } from "react-router";
import { Loader2, Send } from "lucide-react";
import {
  useClaimTicketMutation,
  useGetTicketQuery,
  useUpdateTicketMutation,
} from "../../services/ticketService";
import { useAppSelector } from "../../redux/hooks";
import { ADMIN_ROLES } from "../../constants/roles";

export default function SupportDetailPage() {
  const { id = "" } = useParams();
  const role = useAppSelector((s) => s.auth.user?.role);
  const userId =
    useAppSelector(
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
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-secondary)]" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <p className="text-sm text-[var(--color-danger)]">
        Ticket not found.{" "}
        <Link to="/support" className="underline">
          Back
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/support"
        className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] underline"
      >
        Back to tickets
      </Link>

      <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-black text-[var(--color-primary)]">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              {ticket.status.replace("_", " ")}
              {ticket.sourceApp ? ` · ${ticket.sourceApp}` : ""}
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {!ticket.assignedTo && (
                <button
                  type="button"
                  disabled={claiming}
                  onClick={() => claimTicket(id)}
                  className="rounded-xl border px-3 py-2 text-xs font-bold uppercase"
                >
                  Claim
                </button>
              )}
              {ticket.status !== "resolved" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateTicket({ id, status: "resolved" })}
                  className="rounded-xl bg-[var(--color-secondary)] px-3 py-2 text-xs font-bold uppercase text-[var(--color-primary-dark)]"
                >
                  Mark resolved
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {ticket.messages.map((m, idx) => {
            const mine = m.senderId === userId;
            return (
              <div
                key={`${m.createdAt}-${idx}`}
                className={`rounded-2xl border p-4 ${
                  mine
                    ? "border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10"
                    : "border-[var(--color-border-light)] bg-[var(--color-bg-soft)]"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  {m.senderRole} · {new Date(m.createdAt).toLocaleString()}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text-main)]">
                  {m.body}
                </p>
              </div>
            );
          })}
        </div>

        {ticket.status !== "closed" && (
          <div className="mt-6 space-y-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder="Write a reply…"
              className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-secondary)]"
            />
            <button
              type="button"
              disabled={updating || !reply.trim()}
              onClick={onReply}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

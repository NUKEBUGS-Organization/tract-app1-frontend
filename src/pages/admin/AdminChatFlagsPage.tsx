import { useState } from "react";
import { Link } from "react-router";

import { useGetAdminFlaggedMessagesQuery } from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  getApiList,
  getApiPagination,
  getMongoId,
  getPersonName,
} from "../../utils/adminUtils";

function getRelationId(value: any) {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value._id || value.id || "";
}

function getRelationEmail(value: any) {
  if (!value || typeof value !== "object") return "-";

  return value.email || value._doc?.email || "-";
}

function getMessageText(message: any) {
  return message.content || message.message || message.text || "-";
}

function getRoomState(message: any) {
  if (!message?.room_id || typeof message.room_id !== "object") return {};

  return {
    room: message.room_id,
  };
}

function AdminFlagMobileCard({ message }: { message: any }) {
  const messageId = getMongoId(message);
  const roomId = getRelationId(message.room_id);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Sender
          </p>

          <p className="mt-1 break-words font-black text-[var(--color-primary)]">
            {getPersonName(message.sender_id)}
          </p>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            {getRelationEmail(message.sender_id)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Message
          </p>

          <p className="mt-1 break-words text-sm font-semibold leading-6 text-[var(--color-text-main)]">
            {getMessageText(message)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Room
            </p>

            <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
              {roomId || "-"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Created
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
              {formatDateTime(message.createdAt)}
            </p>
          </div>
        </div>

        {roomId && (
          <Link
            to={`/chat/${roomId}`}
            state={getRoomState(message)}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
          >
            Open Room
          </Link>
        )}
      </div>
    </div>
  );
}

function AdminChatFlagsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAdminFlaggedMessagesQuery({
    page,
    limit: 20,
  });

  const messages = getApiList(data);
  const pagination = getApiPagination(data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Chat Flags
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Review flagged messages containing possible phone, email, link, or
          circumvention patterns.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading flagged messages..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load flagged messages.
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No flagged messages found.
        </div>
      ) : (
        <>
          {/* Mobile / small screen cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {messages.map((message: any, index: number) => (
              <AdminFlagMobileCard
                key={getMongoId(message) || index}
                message={message}
              />
            ))}
          </div>

          {/* Desktop / tablet table with horizontal scroll */}
          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {["Sender", "Message", "Room", "Created"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-6 py-5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {messages.map((message: any, index: number) => {
                    const roomId = getRelationId(message.room_id);

                    return (
                      <tr
                        key={getMongoId(message) || index}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black text-[var(--color-primary)]">
                            {getPersonName(message.sender_id)}
                          </p>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {getRelationEmail(message.sender_id)}
                          </p>
                        </td>

                        <td className="max-w-[360px] px-6 py-5 text-sm font-semibold text-[var(--color-text-main)]">
                          <p className="line-clamp-3 break-words">
                            {getMessageText(message)}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm">
                          {roomId ? (
                            <Link
                              to={`/chat/${roomId}`}
                              state={getRoomState(message)}
                              className="font-bold text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                            >
                              Open Room
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDateTime(message.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Page {pagination.page} of {pagination.totalPages || 1}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="justify-center"
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="justify-center"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminChatFlagsPage;
import { useState } from "react";
import { useLocation, useParams } from "react-router";

import { useGetAdminRoomMessagesQuery } from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  getApiPagination,
  getMongoId,
  getPersonName,
} from "../../utils/adminUtils";

function getMessagesFromResponse(response: any) {
  if (!response) return [];

  // After adminService transformResponse:
  // { data: [messages], pagination: {...} }
  if (Array.isArray(response?.data)) return response.data;

  // Raw array
  if (Array.isArray(response)) return response;

  // Extra safety for possible nested shapes
  if (Array.isArray(response?.messages)) return response.messages;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.messages)) return response.data.messages;

  return [];
}

function getMessageText(message: any) {
  return (
    message?.content ||
    message?.message ||
    message?.text ||
    message?.body ||
    "-"
  );
}

function getSenderLabel(message: any, room: any) {
  const senderId =
    typeof message?.sender_id === "string"
      ? message.sender_id
      : message?.sender_id?._id || message?.sender_id?.id;

  const sellerId =
    typeof room?.seller_id === "string"
      ? room.seller_id
      : room?.seller_id?._id || room?.seller_id?.id;

  const buyerId =
    typeof room?.buyer_id === "string"
      ? room.buyer_id
      : room?.buyer_id?._id || room?.buyer_id?.id;

  if (senderId && sellerId && senderId === sellerId) {
    return `Seller · ${getPersonName(message.sender_id)}`;
  }

  if (senderId && buyerId && senderId === buyerId) {
    return `Buyer · ${getPersonName(message.sender_id)}`;
  }

  return getPersonName(message.sender_id);
}

function AdminRoomMessagesPage() {
  const { roomId = "" } = useParams();
  const location = useLocation();

  const state = location.state as any;
  const room = state?.room ?? null;
  const listingName = state?.listingName ?? "Listing";

  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAdminRoomMessagesQuery(
    {
      roomId,
      page,
      limit: 50,
    },
    {
      skip: !roomId,
    }
  );

  const messagesFromApi = getMessagesFromResponse(data);

  // Backend sorts newest first. Reverse to show normal chat order.
  const messages = [...messagesFromApi].reverse();

  const pagination = getApiPagination(data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Room Messages
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Listing:{" "}
          <span className="font-bold text-[var(--color-primary)]">
            {listingName}
          </span>
        </p>

        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Room: {roomId}
        </p>

        {room && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Seller: {getPersonName(room.seller_id)} · Buyer:{" "}
            {getPersonName(room.buyer_id)}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
        {isLoading ? (
          <Loader label="Loading messages..." />
        ) : isError ? (
          <div className="text-sm font-semibold text-[var(--color-danger)]">
            Failed to load room messages.
          </div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)]">
            No messages found.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any, index: number) => (
              <div
                key={getMongoId(message) || index}
                className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-[var(--color-primary)]">
                    {getSenderLabel(message, room)}
                  </p>

                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>

                <p className="text-sm leading-6 text-[var(--color-text-main)]">
                  {getMessageText(message)}
                </p>

                {message.flagged && (
                  <p className="mt-3 rounded-xl bg-[var(--color-danger)]/10 px-3 py-2 text-xs font-semibold text-[var(--color-danger)]">
                    Flagged: {message.flag_reason || "No reason provided"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Page {pagination.page} of {pagination.totalPages || 1}
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminRoomMessagesPage;
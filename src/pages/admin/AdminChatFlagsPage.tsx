import { useMemo, useState } from "react";
import { Link } from "react-router";

import {
  useGetAdminChatRoomsQuery,
  useGetAdminDealsQuery,
  useGetAdminFlaggedMessagesQuery,
} from "../../services/adminService";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  getApiList,
  getApiPagination,
  getListingTitle,
  getMongoId,
  getPersonName,
} from "../../utils/adminUtils";

type AdminPerson = {
  _id: string;
  email?: string;
  full_name?: string;
};

type AdminListing = {
  _id: string;
  title?: string;
  address?: string;
  property_address?: string;
  street_address?: string;
  city?: string;
  state_code?: string;
  state?: string;
  zip_code?: string;
  zipCode?: string;
};

type AdminDeal = {
  _id: string;
  listing_id?: AdminListing | string;
  property_id?: AdminListing | string;
};

type AdminRoom = {
  _id: string;
  deal_id?: string | AdminDeal;
  seller_id?: string | AdminPerson;
  buyer_id?: string | AdminPerson;
  is_active?: boolean;
  is_locked?: boolean;
  last_message_at?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AdminFlaggedMessage = {
  _id: string;
  room_id: AdminRoom | null;
  sender_id: AdminPerson;
  content: string;
  type: string;
  flagged: boolean;
  flag_reason: string;
  is_read: boolean;
  read_at?: string | null;
  createdAt: string;
  updatedAt: string;
};

function getPersonId(value: string | AdminPerson | undefined | null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

function getRoomId(message: AdminFlaggedMessage) {
  return message.room_id?._id || "";
}

function getSenderId(message: AdminFlaggedMessage) {
  return message.sender_id?._id || "";
}

function getSenderEmail(message: AdminFlaggedMessage) {
  return message.sender_id?.email || "-";
}

function getSenderName(message: AdminFlaggedMessage) {
  return message.sender_id?.full_name || "-";
}

function getMessageText(message: AdminFlaggedMessage) {
  return message.content || "-";
}

function getFlagReason(message: AdminFlaggedMessage) {
  return message.flag_reason || "-";
}

function getDealIdFromRoom(room: AdminRoom | null | undefined) {
  if (!room?.deal_id) return "";

  if (typeof room.deal_id === "string") {
    return room.deal_id;
  }

  return room.deal_id._id || "";
}

function getListingFromDeal(deal: AdminDeal | undefined) {
  if (!deal) return null;

  const listing = deal.listing_id || deal.property_id;

  if (!listing || typeof listing === "string") {
    return null;
  }

  return listing;
}

function getMatchedRoom(
  message: AdminFlaggedMessage,
  roomMap: Record<string, AdminRoom>
) {
  const roomId = getRoomId(message);

  if (!roomId) return null;

  return roomMap[roomId] || message.room_id || null;
}

function getRoomListingName(
  room: AdminRoom | null,
  dealMap: Record<string, AdminDeal>
) {
  const dealId = getDealIdFromRoom(room);

  if (!dealId) return "Listing";

  const dealFromRoom =
    room?.deal_id && typeof room.deal_id === "object"
      ? room.deal_id
      : undefined;

  const deal = dealFromRoom || dealMap[dealId];
  const listing = getListingFromDeal(deal);

  if (!listing) return "Listing";

  return getListingTitle(listing);
}

function getSenderChatRole(
  message: AdminFlaggedMessage,
  room: AdminRoom | null
) {
  const senderId = getSenderId(message);
  const sellerId = getPersonId(room?.seller_id);
  const buyerId = getPersonId(room?.buyer_id);

  if (senderId && sellerId && senderId === sellerId) {
    return "Seller";
  }

  if (senderId && buyerId && senderId === buyerId) {
    return "Buyer";
  }

  return "-";
}

// function getRoomState(
//   room: AdminRoom | null,
//   listingName: string
// ) {
//   if (!room) return {};

//   return {
//     room,
//     listingName,
//   };
// }

function AdminFlagMobileCard({
  message,
  room,
  listingName,
}: {
  message: AdminFlaggedMessage;
  room: AdminRoom | null;
  listingName: string;
}) {
  const roomId = room?._id || getRoomId(message);
  const senderRole = getSenderChatRole(message, room);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                Sender
              </p>

              <p className="mt-1 break-words font-black text-[var(--color-primary)]">
                {getSenderName(message)}
              </p>

              <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
                {getSenderEmail(message)}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-primary)]">
              {senderRole}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Flag Reason
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[var(--color-danger)]">
            {getFlagReason(message)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Message
          </p>

          <p className="mt-1 break-words rounded-xl bg-[var(--color-bg-soft)] p-3 text-sm font-semibold leading-6 text-[var(--color-text-main)]">
            {getMessageText(message)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Listing
            </p>

            <p className="mt-1 break-words text-sm font-black text-[var(--color-primary)]">
              {listingName}
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
            // state={getRoomState(room, listingName)}
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

  const {
    data,
    isLoading,
    isError,
  } = useGetAdminFlaggedMessagesQuery({
    page,
    limit: 20,
  });

  const {
    data: roomsResponse,
    isLoading: isRoomsLoading,
  } = useGetAdminChatRoomsQuery({
    page: 1,
    limit: 500,
  });

  const {
    data: dealsResponse,
    isLoading: isDealsLoading,
  } = useGetAdminDealsQuery({
    page: 1,
    limit: 500,
  });

  const messages = getApiList(data) as AdminFlaggedMessage[];
  const rooms = getApiList(roomsResponse) as AdminRoom[];
  const deals = getApiList(dealsResponse) as AdminDeal[];
  const pagination = getApiPagination(data);

  const roomMap = useMemo(() => {
    return rooms.reduce((map: Record<string, AdminRoom>, room) => {
      if (room._id) {
        map[room._id] = room;
      }

      return map;
    }, {});
  }, [rooms]);

  const dealMap = useMemo(() => {
    return deals.reduce((map: Record<string, AdminDeal>, deal) => {
      if (deal._id) {
        map[deal._id] = deal;
      }

      return map;
    }, {});
  }, [deals]);

  const isPageLoading = isLoading || isRoomsLoading || isDealsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Chat Flags
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Review flagged messages with sender role, flag reason, linked room,
          and listing context.
        </p>
      </div>

      {isPageLoading ? (
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
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {messages.map((message, index) => {
              const room = getMatchedRoom(message, roomMap);
              const listingName = getRoomListingName(room, dealMap);

              return (
                <AdminFlagMobileCard
                  key={message._id || index}
                  message={message}
                  room={room}
                  listingName={listingName}
                />
              );
            })}
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {[
                      "Sender",
                      "Role",
                      "Flag Reason",
                      "Message",
                      "Listing / Room",
                      "Created",
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
                  {messages.map((message, index) => {
                    const room = getMatchedRoom(message, roomMap);
                    const roomId = room?._id || getRoomId(message);
                   // const listingName = getRoomListingName(room, dealMap);
                    const senderRole = getSenderChatRole(message, room);

                    return (
                      <tr
                        key={message._id || index}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black text-[var(--color-primary)]">
                            {getSenderName(message)}
                          </p>

                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {getSenderEmail(message)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-primary)]">
                            {senderRole}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-[var(--color-danger)]">
                          {getFlagReason(message)}
                        </td>

                        <td className="max-w-[320px] px-6 py-5 text-sm font-semibold text-[var(--color-text-main)]">
                          <p className="line-clamp-3 break-words">
                            {getMessageText(message)}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm">
                          {/* <p className="font-black text-[var(--color-primary)]">
                            {listingName}
                          </p> */}

                          {roomId ? (
                            <>
                              <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--color-text-muted)]">
                                Room: {roomId}
                              </p>

                              <Link
                                to={`/chat/${roomId}`}
                                // state={getRoomState(room, listingName)}
                                className="mt-2 inline-block text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                              >
                                Open Room
                              </Link>
                            </>
                          ) : (
                            <p className="text-xs text-[var(--color-text-muted)]">
                              No room linked
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
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
            disabled={page >= (pagination.totalPages || 1)}
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
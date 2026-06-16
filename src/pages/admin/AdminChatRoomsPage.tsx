import { useMemo, useState } from "react";
import { Link } from "react-router";

import {
  useGetAdminChatRoomsQuery,
  useGetAdminDealsQuery,
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

function getRelationId(value: any) {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value._id || value.id || "";
}

function getDealProperty(deal: any) {
  return deal?.listing_id || deal?.property_id || null;
}

function getRoomListingName(room: any, dealMap: Record<string, any>) {
  const roomDeal = room?.deal_id;

  if (!roomDeal) return "Listing";

  if (typeof roomDeal === "object") {
    const propertyFromRoomDeal = getDealProperty(roomDeal);

    if (propertyFromRoomDeal && typeof propertyFromRoomDeal === "object") {
      return getListingTitle(propertyFromRoomDeal);
    }

    const dealId = getRelationId(roomDeal);
    const matchedDeal = dealMap[dealId];

    if (matchedDeal) {
      return getListingTitle(getDealProperty(matchedDeal));
    }

    return getListingTitle(propertyFromRoomDeal);
  }

  const matchedDeal = dealMap[roomDeal];

  if (matchedDeal) {
    return getListingTitle(getDealProperty(matchedDeal));
  }

  return "Listing";
}

function AdminRoomMobileCard({
  room,
  listingName,
}: {
  room: any;
  listingName: string;
}) {
  const roomId = getMongoId(room);

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Listing
          </p>

          <Link
            to={`/chat/${roomId}`}
            state={{
              room,
              listingName,
            }}
            className="mt-1 block break-words font-black text-[var(--color-primary)] hover:text-[var(--color-secondary)]"
          >
            {listingName}
          </Link>

          <p className="mt-1 break-words text-xs text-[var(--color-text-muted)]">
            Room: {roomId}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Seller
            </p>

            <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
              {getPersonName(room.seller_id)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Buyer
            </p>

            <p className="mt-1 break-words text-sm font-bold text-[var(--color-text-main)]">
              {getPersonName(room.buyer_id)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Updated
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
              {formatDateTime(room.updatedAt)}
            </p>
          </div>
        </div>

        <Link
          to={`/chat/${roomId}`}
          state={{
            room,
            listingName,
          }}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] hover:text-[var(--color-primary)]"
        >
          Open Messages
        </Link>
      </div>
    </div>
  );
}

function AdminChatRoomsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAdminChatRoomsQuery({
    page,
    limit: 20,
  });

  const { data: dealsResponse } = useGetAdminDealsQuery({
    page: 1,
    limit: 500,
  });

  const rooms = getApiList(data);
  const deals = getApiList(dealsResponse);
  const pagination = getApiPagination(data);

  const dealMap = useMemo(() => {
    return deals.reduce((map: Record<string, any>, deal: any) => {
      const dealId = getMongoId(deal);

      if (dealId) {
        map[dealId] = deal;
      }

      return map;
    }, {});
  }, [deals]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">
          Chat Rooms
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          View all chat rooms and open messages for moderation.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading chat rooms..." />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-6 text-sm font-semibold text-[var(--color-danger)] shadow-[var(--shadow-card)]">
          Failed to load chat rooms.
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          No chat rooms found.
        </div>
      ) : (
        <>
          {/* Mobile / small screen cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {rooms.map((room: any) => {
              const roomId = getMongoId(room);
              const listingName = getRoomListingName(room, dealMap);

              return (
                <AdminRoomMobileCard
                  key={roomId}
                  room={room}
                  listingName={listingName}
                />
              );
            })}
          </div>

          {/* Desktop / tablet table with horizontal scroll */}
          <div className="hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] lg:block">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-[var(--color-bg-soft)]">
                  <tr>
                    {[
                      "Room",
                      "Listing",
                      "Seller",
                      "Buyer",
                      "Updated",
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
                  {rooms.map((room: any) => {
                    const roomId = getMongoId(room);
                    const listingName = getRoomListingName(room, dealMap);

                    return (
                      <tr
                        key={roomId}
                        className="border-t border-[var(--color-border-light)]"
                      >
                        <td className="max-w-[260px] px-6 py-5 font-black text-[var(--color-primary)]">
                          <p className="break-words">{roomId}</p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-black text-[var(--color-primary)]">
                            {listingName}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getPersonName(room.seller_id)}
                        </td>

                        <td className="px-6 py-5 text-sm font-bold">
                          {getPersonName(room.buyer_id)}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                          {formatDateTime(room.updatedAt)}
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            to={`/chat/${roomId}`}
                            state={{
                              room,
                              listingName,
                            }}
                            className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                          >
                            Open Messages
                          </Link>
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

export default AdminChatRoomsPage;
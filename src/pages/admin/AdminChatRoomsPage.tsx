import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Eye,
  FilterX,
  Home,
  MessageSquareText,
  MessagesSquare,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

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

function getRoomId(room: any) {
  return getMongoId(room);
}

function getRoomSeller(room: any) {
  return room?.seller_id || null;
}

function getRoomBuyer(room: any) {
  return room?.buyer_id || null;
}

function getRoomUpdatedAt(room: any) {
  return room?.updatedAt || room?.last_message_at || room?.lastMessageAt || room?.createdAt;
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

function getLatestUpdatedAt(rooms: any[]) {
  const timestamps = rooms
    .map((room) => new Date(getRoomUpdatedAt(room)).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return "-";

  return formatDateTime(new Date(Math.max(...timestamps)).toISOString());
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  featured = false,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-3xl border p-4 shadow-[var(--shadow-card)] transition-all duration-200 ${
        featured
          ? "border-[var(--color-primary)]/20 bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border-light)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${
              featured ? "text-white/65" : "text-[var(--color-text-muted)]"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 break-words text-lg font-black leading-tight ${
              featured ? "text-white" : "text-[var(--color-primary)]"
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${
              featured ? "text-white/65" : "text-[var(--color-text-muted)]"
            }`}
          >
            {helper}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            featured
              ? "bg-white/10 text-white"
              : "bg-[var(--color-bg-soft)] text-[var(--color-primary)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function OpenChatButton({
  room,
  listingName,
}: {
  room: any;
  listingName: string;
}) {
  const roomId = getRoomId(room);

  return (
    <Link
      to={`/chat/${roomId}`}
      state={{
        room,
        listingName,
      }}
      aria-label="Open messages"
      title="Open Messages"
      className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-primary)] transition-all duration-200 hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
    >
      <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />

      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        Open Messages
      </span>
    </Link>
  );
}

function AdminChatRoomFilters({
  searchValue,
  shownCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onClear,
}: {
  searchValue: string;
  shownCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="relative">
          <label htmlFor="admin-chat-room-search" className="sr-only">
            Search chat rooms
          </label>

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />

          <input
            id="admin-chat-room-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by listing, seller, buyer, or updated date..."
            className="h-11 w-full rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] pl-11 pr-4 text-sm font-semibold text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-secondary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-secondary)]/30"
          />
        </div>

        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={onClear}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FilterX className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing{" "}
          <strong className="text-[var(--color-primary)]">{shownCount}</strong>{" "}
          of{" "}
          <strong className="text-[var(--color-primary)]">{totalCount}</strong>{" "}
          chat rooms on this page.
        </span>

        {hasActiveFilters && (
          <span className="text-[var(--color-primary)]">
            Search is applied to the current loaded page.
          </span>
        )}
      </div>
    </section>
  );
}

function AdminRoomCard({
  room,
  listingName,
}: {
  room: any;
  listingName: string;
}) {
  const roomId = getRoomId(room);

  return (
    <article className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/chat/${roomId}`}
            state={{
              room,
              listingName,
            }}
            className="break-words text-base font-black leading-6 text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
          >
            {listingName}
          </Link>

          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            Updated {formatDateTime(getRoomUpdatedAt(room))}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Seller
          </p>

          <p className="mt-1 break-words text-sm font-black text-[var(--color-text-main)]">
            {getPersonName(getRoomSeller(room))}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Buyer
          </p>

          <p className="mt-1 break-words text-sm font-black text-[var(--color-text-main)]">
            {getPersonName(getRoomBuyer(room))}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/chat/${roomId}`}
          state={{
            room,
            listingName,
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-light)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Open Messages
        </Link>
      </div>
    </article>
  );
}

function AdminChatRoomsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAdminChatRoomsQuery({
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
  const totalPages = pagination.totalPages || 1;

  const dealMap = useMemo(() => {
    return deals.reduce((map: Record<string, any>, deal: any) => {
      const dealId = getMongoId(deal);

      if (dealId) {
        map[dealId] = deal;
      }

      return map;
    }, {});
  }, [deals]);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) return rooms;

    return rooms.filter((room: any) => {
      const listingName = getRoomListingName(room, dealMap);

      const searchText = [
        listingName,
        getPersonName(getRoomSeller(room)),
        getPersonName(getRoomBuyer(room)),
        formatDateTime(getRoomUpdatedAt(room)),
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [rooms, dealMap, searchValue]);

  const hasActiveFilters = searchValue.trim().length > 0;

  function clearFilters() {
    setSearchValue("");
    setPage(1);
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-3xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Chat Review
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight text-[var(--color-primary)] sm:text-4xl">
              Chat Rooms
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Review buyer-seller conversations connected to deals and open
              message threads for moderation.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Current View
            </p>

            <p className="mt-1 text-sm font-black text-[var(--color-primary)]">
              All Chat Rooms
            </p>
          </div>
        </div>
      </section>

      {!isLoading && !isError && rooms.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Shown Rooms"
              value={filteredRooms.length}
              helper="After current search"
              featured
              icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Loaded Rooms"
              value={rooms.length}
              helper="Rooms on this page"
              icon={<MessageSquareText className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Mapped Deals"
              value={Object.keys(dealMap).length}
              helper="Used for listing names"
              icon={<Home className="h-5 w-5" aria-hidden="true" />}
            />

            <SummaryCard
              label="Latest Update"
              value={getLatestUpdatedAt(rooms)}
              helper="Most recent room activity"
              icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <AdminChatRoomFilters
            searchValue={searchValue}
            shownCount={filteredRooms.length}
            totalCount={rooms.length}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchValue}
            onClear={clearFilters}
          />
        </>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
          <Loader label="Loading chat rooms..." />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[var(--color-danger)]/15 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--color-danger)]">
                Failed to load chat rooms
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                Something went wrong while loading chat room records.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="justify-center"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-soft)] text-[var(--color-primary)]">
            <MessagesSquare className="h-5 w-5" aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-primary)]">
            No chat rooms found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {hasActiveFilters
              ? "No chat rooms match your current search."
              : "There are no chat rooms available right now."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-[var(--color-border-light)] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] transition hover:bg-[var(--color-bg-soft)]"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 2xl:hidden">
            {filteredRooms.map((room: any) => {
              const roomId = getRoomId(room);
              const listingName = getRoomListingName(room, dealMap);

              return (
                <AdminRoomCard
                  key={roomId}
                  room={room}
                  listingName={listingName}
                />
              );
            })}
          </div>

          <div className="hidden rounded-3xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] 2xl:block">
            <div className="border-b border-[var(--color-border-light)] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-[var(--color-primary)]">
                    Chat Room Queue
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Open conversations to review messages and moderation context.
                  </p>
                </div>

                <span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
                  {filteredRooms.length} shown
                </span>
              </div>
            </div>

            <table className="w-full table-fixed text-left">
              <thead className="bg-[var(--color-bg-soft)]">
                <tr>
                  <th className="w-[34%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Listing
                  </th>

                  <th className="w-[22%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Seller
                  </th>

                  <th className="w-[22%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Buyer
                  </th>

                  <th className="w-[16%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Updated
                  </th>

                  <th className="w-[6%] px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRooms.map((room: any) => {
                  const roomId = getRoomId(room);
                  const listingName = getRoomListingName(room, dealMap);

                  return (
                    <tr
                      key={roomId}
                      className="border-t border-[var(--color-border-light)] transition-colors duration-200 hover:bg-[var(--color-bg-soft)]/60"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/chat/${roomId}`}
                          state={{
                            room,
                            listingName,
                          }}
                          className="line-clamp-1 font-black text-[var(--color-primary)] transition-colors hover:text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40"
                        >
                          {listingName}
                        </Link>

                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">
                          Deal conversation
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)]">
                          {getPersonName(getRoomSeller(room))}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-text-main)]">
                          {getPersonName(getRoomBuyer(room))}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[var(--color-text-muted)]">
                        {formatDateTime(getRoomUpdatedAt(room))}
                      </td>

                      <td className="px-4 py-5 text-center">
                        <div className="flex min-w-[44px] items-center justify-center">
                          <OpenChatButton
                            room={room}
                            listingName={listingName}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">
          Page{" "}
          <span className="font-black text-[var(--color-primary)]">
            {pagination.page}
          </span>{" "}
          of{" "}
          <span className="font-black text-[var(--color-primary)]">
            {totalPages}
          </span>
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
            disabled={page >= totalPages}
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
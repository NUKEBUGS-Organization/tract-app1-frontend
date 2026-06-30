import { baseApi } from "./baseApi";

type PaginationQuery = {
  page?: number;
  limit?: number;
};

type UsersQuery = PaginationQuery & {
  role?: string;
};

type RoomMessagesQuery = PaginationQuery & {
  roomId: string;
};

function isNumericKeyObject(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((key) => /^\d+$/.test(key));
}

function numericKeyObjectToArray(value: any) {
  return Object.keys(value)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
    .filter(Boolean);
}

function normalizeMongoRecord(item: any): any {
  if (!item) return item;

  const doc = item?._doc ?? item;

  if (doc && typeof doc === "object") {
    return {
      ...doc,
      _id: doc._id ?? item._id,
      id: doc.id ?? doc._id ?? item._id ?? item.id,
    };
  }

  return item;
}

function normalizeAdminPayload(payload: any): any {
  if (!payload) return payload;

  if (isNumericKeyObject(payload)) {
    return numericKeyObjectToArray(payload).map(normalizeMongoRecord);
  }

  if (Array.isArray(payload?.data)) {
    return {
      ...payload,
      data: payload.data.map(normalizeMongoRecord),
    };
  }

  if (isNumericKeyObject(payload?.data)) {
    return {
      ...payload,
      data: numericKeyObjectToArray(payload.data).map(normalizeMongoRecord),
    };
  }

  if (Array.isArray(payload)) {
    return payload.map(normalizeMongoRecord);
  }

  return normalizeMongoRecord(payload);
}

function unwrapAdminResponse(response: any) {
  const payload =
    response &&
    typeof response === "object" &&
    "success" in response &&
    "data" in response
      ? response.data
      : response;

  return normalizeAdminPayload(payload);
}

export const adminService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ================= DASHBOARD =================
    getAdminDashboard: builder.query<any, void>({
      query: () => ({
        url: "admin/dashboard",
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin"],
    }),

    // ================= USERS =================
    getAdminUsers: builder.query<any, UsersQuery | void>({
      query: (params) => ({
        url: "admin/users",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "User"],
    }),

    getAdminUser: builder.query<any, string>({
      query: (id) => ({
        url: `admin/users/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "User"],
    }),

    banAdminUser: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `admin/users/${id}/ban`,
        method: "POST",
        body: { reason },
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "User"],
    }),

    unbanAdminUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/users/${id}/unban`,
        method: "POST",
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "User"],
    }),

    // ================= KYC =================
    getPendingKycUsers: builder.query<any, void>({
      query: () => ({
        url: "admin/kyc/pending",
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "User"],
    }),

    approveKycUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/kyc/${id}/approve`,
        method: "POST",
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "User"],
    }),

    rejectKycUser: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `admin/kyc/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "User"],
    }),

    // ================= LISTINGS =================
    getAdminListings: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/listings",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Property"],
    }),

    getPendingAdminListings: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/listings/pending",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Property"],
    }),

    getAdminListing: builder.query<any, string>({
      query: (id) => ({
        url: `admin/listings/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Property"],
    }),

    approveAdminListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/listings/${id}/approve`,
        method: "POST",
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "Property", "Notification" as any],
    }),

    rejectAdminListing: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `admin/listings/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "Property", "Notification" as any],
    }),

    deleteAdminListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/listings/${id}`,
        method: "DELETE",
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "Property"],
    }),

    updateAdminListing: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `admin/listings/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "Property"],
    }),

    updateAdminListingStatus: builder.mutation<
      any,
      {
        id: string;
        status: string;
        reason?: string;
      }
    >({
      query: ({ id, status, reason }) => ({
        url: `admin/listings/${id}/status`,
        method: "PATCH",
        body: {
          status,
          ...(reason ? { reason } : {}),
        },
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "Property"],
    }),

    // ================= BIDS =================
    getAdminBids: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/bids",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Bid"],
    }),

    getAdminBid: builder.query<any, string>({
      query: (id) => ({
        url: `admin/bids/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Bid"],
    }),

    // ================= CONTRACTS =================
    getAdminContracts: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/contracts",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Contract"],
    }),

    getAdminContract: builder.query<any, string>({
      query: (id) => ({
        url: `admin/contracts/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Contract"],
    }),

    // ================= DEALS =================
    getAdminDeals: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/deals",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Deal"],
    }),

    getAdminDeal: builder.query<any, string>({
      query: (id) => ({
        url: `admin/deals/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Deal"],
    }),

    closeAdminDeal: builder.mutation<any, string>({
      query: (id) => ({
        url: `admin/deals/${id}/close`,
        method: "POST",
      }),
      transformResponse: unwrapAdminResponse,
      invalidatesTags: ["Admin", "Deal"],
    }),

    // ================= CHAT =================
    getAdminFlaggedMessages: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/chat/flagged",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Chat"],
    }),

    getAdminChatRooms: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "admin/chat/rooms",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Chat"],
    }),

    getAdminRoomMessages: builder.query<any, RoomMessagesQuery>({
      query: ({ roomId, page, limit }) => ({
        url: `admin/chat/rooms/${roomId}/messages`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: unwrapAdminResponse,
      providesTags: ["Admin", "Chat"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,

  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useBanAdminUserMutation,
  useUnbanAdminUserMutation,

  useGetPendingKycUsersQuery,
  useApproveKycUserMutation,
  useRejectKycUserMutation,

  useGetAdminListingsQuery,
  useGetPendingAdminListingsQuery,
  useGetAdminListingQuery,
  useApproveAdminListingMutation,
  useRejectAdminListingMutation,
  useDeleteAdminListingMutation,
  useUpdateAdminListingMutation,
  useUpdateAdminListingStatusMutation,

  useGetAdminBidsQuery,
  useGetAdminBidQuery,

  useGetAdminContractsQuery,
  useGetAdminContractQuery,

  useGetAdminDealsQuery,
  useGetAdminDealQuery,
  useCloseAdminDealMutation,

  useGetAdminFlaggedMessagesQuery,
  useGetAdminChatRoomsQuery,
  useGetAdminRoomMessagesQuery,
} = adminService;

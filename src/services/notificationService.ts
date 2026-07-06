import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type NotificationItem = {
  _id?: string;
  id?: string;
  recipient_id?: string;
  type?: string;
  title?: string;
  body?: string;
  action_url?: string | null;
  metadata?: Record<string, any>;
  is_read?: boolean;
  read_at?: string | null;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationsResponse = {
  data: NotificationItem[];
  unread_count: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
    totalPages?: number;
    has_next?: boolean;
  } | null;
};

function normalizeNotification(item: any): NotificationItem {
  return item?._doc ?? item;
}

function getPayload(response: ApiEnvelope<any> | any) {
  return response?.data ?? response;
}

function unwrapNotifications(
  response: ApiEnvelope<any> | any
): NotificationsResponse {
  const payload = getPayload(response);

  const nestedPayload =
    payload?.data && !Array.isArray(payload.data) && typeof payload.data === "object"
      ? payload.data
      : payload;

  const list = Array.isArray(nestedPayload)
    ? nestedPayload
    : Array.isArray(nestedPayload?.data)
      ? nestedPayload.data
      : Array.isArray(nestedPayload?.notifications)
        ? nestedPayload.notifications
        : [];

  return {
    data: list.map(normalizeNotification),
    unread_count:
      nestedPayload?.unread_count ??
      
      payload?.unread_count ??
   
      0,
    pagination: nestedPayload?.pagination ?? payload?.pagination ?? null,
  };
}

function unwrapUnreadCount(response: ApiEnvelope<any> | any) {
  const payload = getPayload(response);

  const nestedPayload =
    payload?.data && !Array.isArray(payload.data) && typeof payload.data === "object"
      ? payload.data
      : payload;

  return Number(nestedPayload?.count ?? payload?.count ?? 0);
}

function unwrapMutation(response: ApiEnvelope<any> | any) {
  return response?.data ?? response;
}

export const notificationService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;

        return {
          url: "notifications",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      transformResponse: unwrapNotifications,
      providesTags: ["Notification"],
    }),

    getUnreadNotificationCount: builder.query<number, void>({
      query: () => ({
        url: "notifications/unread-count",
        method: "GET",
      }),
      transformResponse: unwrapUnreadCount,
      providesTags: ["Notification"],
    }),

    markNotificationRead: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      transformResponse: unwrapMutation,
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({
        url: "notifications/read-all",
        method: "PATCH",
      }),
      transformResponse: unwrapMutation,
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}`,
        method: "DELETE",
      }),
      transformResponse: unwrapMutation,
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useLazyGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationService;
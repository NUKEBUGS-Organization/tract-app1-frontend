import { baseApi } from "./baseApi";

function unwrapApiResponse(response: any) {
  let payload = response;

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    ("success" in payload || "statusCode" in payload || "message" in payload)
  ) {
    payload = payload.data;
  }

  if (payload?._doc) {
    payload = payload._doc;
  }

  return payload;
}

function unwrapArrayResponse(response: any) {
  const payload = unwrapApiResponse(response);

  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.map((item) => item?._doc ?? item);
  }

  if (typeof payload === "object") {
    return Object.values(payload).map((item: any) => item?._doc ?? item);
  }

  return [];
}

export const chatService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatRooms: builder.query<any[], void>({
      query: () => ({
        url: "chat/rooms",
        method: "GET",
      }),
      transformResponse: unwrapArrayResponse,
      providesTags: ["Chat"],
    }),

    getChatRoomById: builder.query<any, string>({
      query: (roomId) => ({
        url: `chat/rooms/${roomId}`,
        method: "GET",
      }),
      transformResponse: unwrapApiResponse,
      providesTags: ["Chat"],
    }),

    getChatRoomMessages: builder.query<any[], string>({
      query: (roomId) => ({
        url: `chat/rooms/${roomId}/messages`,
        method: "GET",
      }),
      transformResponse: unwrapArrayResponse,
      providesTags: ["Chat"],
    }),

    markChatRoomAsRead: builder.mutation<any, string>({
      query: (roomId) => ({
        url: `chat/rooms/${roomId}/read`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetChatRoomByIdQuery,
  useGetChatRoomMessagesQuery,
  useMarkChatRoomAsReadMutation,
} = chatService;
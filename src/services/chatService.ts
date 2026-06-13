import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

function unwrapChatItem(response: ApiEnvelope<any>) {
  return response.data;
}

function unwrapChatList(response: ApiEnvelope<Record<string, any> | null>) {
  if (!response.data) return [];

  return Object.values(response.data);
}

export const chatService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatRooms: builder.query<any[], void>({
      query: () => ({
        url: "chat/rooms",
        method: "GET",
      }),
      transformResponse: unwrapChatList,
      providesTags: ["Chat"],
    }),

    getChatRoomById: builder.query<any, string>({
      query: (roomId) => ({
        url: `chat/rooms/${roomId}`,
        method: "GET",
      }),
      transformResponse: unwrapChatItem,
      providesTags: ["Chat"],
    }),

    getChatRoomMessages: builder.query<any[], string>({
      query: (roomId) => ({
        url: `chat/rooms/${roomId}/messages`,
        method: "GET",
      }),
      transformResponse: unwrapChatList,
      providesTags: ["Chat"],
    }),

    markChatRoomAsRead: builder.mutation<any, string>({
      query: (roomId) => ({
        url: `chat/rooms/${roomId}/read`,
        method: "POST",
      }),
      transformResponse: unwrapChatItem,
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
import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketMessage {
  senderId: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userRole: string;
  sourceApp?: "app1" | "app2";
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

function unwrap<T>(response: ApiEnvelope<T>) {
  return response.data;
}

function unwrapList(response: ApiEnvelope<SupportTicket[] | Record<string, SupportTicket> | null>) {
  if (!response.data) return [];
  if (Array.isArray(response.data)) return response.data;
  return Object.values(response.data);
}

export const ticketService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<SupportTicket[], { sourceApp?: "app1" | "app2" } | void>({
      query: (params) => ({
        url: "tickets",
        method: "GET",
        params: params?.sourceApp ? { sourceApp: params.sourceApp } : undefined,
      }),
      transformResponse: unwrapList,
      providesTags: ["Ticket"],
    }),

    getTicket: builder.query<SupportTicket, string>({
      query: (id) => ({ url: `tickets/${id}`, method: "GET" }),
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "Ticket", id }],
    }),

    createTicket: builder.mutation<
      SupportTicket,
      { subject: string; description: string; priority?: TicketPriority }
    >({
      query: (body) => ({ url: "tickets", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Ticket", "Notification"],
    }),

    updateTicket: builder.mutation<
      SupportTicket,
      { id: string; reply?: string; status?: TicketStatus; assignedTo?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `tickets/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Ticket", "Notification"],
    }),

    claimTicket: builder.mutation<SupportTicket, string>({
      query: (id) => ({ url: `tickets/${id}/claim`, method: "PATCH" }),
      transformResponse: unwrap,
      invalidatesTags: ["Ticket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useClaimTicketMutation,
} = ticketService;

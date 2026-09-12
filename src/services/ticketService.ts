import { baseApi } from "./baseApi";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketMessage {
  senderId: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  id?: string;
  userId: string;
  userRole: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketBody {
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export interface UpdateTicketBody {
  status?: TicketStatus;
  assignedTo?: string;
  reply?: string;
}

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

function unwrap<T>(response: ApiEnvelope<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
}

function normalizeTicket(ticket: SupportTicket): SupportTicket {
  return {
    ...ticket,
    _id: ticket._id || ticket.id || "",
  };
}

export const ticketService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<SupportTicket[], void>({
      query: () => ({ url: "tickets", method: "GET" }),
      transformResponse: (raw: ApiEnvelope<SupportTicket[]> | SupportTicket[]) => {
        const tickets = unwrap<SupportTicket[]>(raw as ApiEnvelope<SupportTicket[]>);
        return Array.isArray(tickets) ? tickets.map(normalizeTicket) : [];
      },
      providesTags: ["Ticket"],
    }),

    getTicketById: builder.query<SupportTicket, string>({
      query: (id) => ({ url: `tickets/${id}`, method: "GET" }),
      transformResponse: (raw: ApiEnvelope<SupportTicket> | SupportTicket) => {
        const ticket = unwrap<SupportTicket>(raw as ApiEnvelope<SupportTicket>);
        return normalizeTicket(ticket);
      },
      providesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),

    createTicket: builder.mutation<SupportTicket, CreateTicketBody>({
      query: (body) => ({ url: "tickets", method: "POST", body }),
      transformResponse: (raw: ApiEnvelope<SupportTicket> | SupportTicket) => {
        const ticket = unwrap<SupportTicket>(raw as ApiEnvelope<SupportTicket>);
        return normalizeTicket(ticket);
      },
      invalidatesTags: ["Ticket"],
    }),

    updateTicket: builder.mutation<
      SupportTicket,
      { id: string; body: UpdateTicketBody }
    >({
      query: ({ id, body }) => ({
        url: `tickets/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (raw: ApiEnvelope<SupportTicket> | SupportTicket) => {
        const ticket = unwrap<SupportTicket>(raw as ApiEnvelope<SupportTicket>);
        return normalizeTicket(ticket);
      },
      invalidatesTags: (_result, _error, { id }) => [
        "Ticket",
        { type: "Ticket", id },
      ],
    }),

    claimTicket: builder.mutation<SupportTicket, string>({
      query: (id) => ({ url: `tickets/${id}/claim`, method: "PATCH" }),
      transformResponse: (raw: ApiEnvelope<SupportTicket> | SupportTicket) => {
        const ticket = unwrap<SupportTicket>(raw as ApiEnvelope<SupportTicket>);
        return normalizeTicket(ticket);
      },
      invalidatesTags: (_result, _error, id) => [
        "Ticket",
        { type: "Ticket", id },
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useClaimTicketMutation,
} = ticketService;

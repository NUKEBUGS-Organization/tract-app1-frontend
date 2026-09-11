import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type { RootState } from "../redux/store";
import { getTicketsApiBaseUrl } from "../utils/apiBaseUrl";
import {
  refreshAuthSession,
  blockAuthRefresh,
  allowAuthRefresh,
} from "./baseApi";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Raw base query (tickets → app2-backend) ─────────────────────────────────

const rawTicketsBaseQuery = fetchBaseQuery({
  baseUrl: getTicketsApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// ─── Re-auth wrapper (mirrors baseApi behaviour) ─────────────────────────────

const AUTH_PUBLIC = ["auth/login", "auth/register", "auth/refresh"];

function isTicketsPublicApi(url: string) {
  return AUTH_PUBLIC.some((p) => url.includes(p));
}

function getUrl(args: string | FetchArgs): string {
  if (typeof args === "string") return args;
  return args.url;
}

const ticketsBaseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = getUrl(args);

  let result = await rawTicketsBaseQuery(args, api, extraOptions);

  const status = result.error?.status;

  if (status === 429) return result;

  if (status === 401 && !isTicketsPublicApi(requestUrl)) {
    const refreshed = await refreshAuthSession(api, extraOptions);

    if (refreshed) {
      result = await rawTicketsBaseQuery(args, api, extraOptions);
    } else {
      blockAuthRefresh();
      api.dispatch({ type: "auth/logout" });
      if (window.location.pathname !== "/auth/signin") {
        window.location.href = "/auth/signin";
      }
    }
  }

  return result;
};

// ─── RTK Query API ───────────────────────────────────────────────────────────

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: ticketsBaseQueryWithReAuth,
  tagTypes: ["Ticket"],
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
} = ticketsApi;

// Re-export helpers so consumers can allow refresh after login if needed
export { allowAuthRefresh };

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

  if (payload?.deal?._doc) {
    payload = payload.deal._doc;
  }

  if (payload?.deal) {
    payload = payload.deal;
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

export const dealService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyDeals: builder.query<any[], void>({
      query: () => ({
        url: "deals/my-deals",
        method: "GET",
      }),
      transformResponse: unwrapArrayResponse,
      providesTags: ["Deal"],
    }),

    getDealById: builder.query<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}`,
        method: "GET",
      }),
      transformResponse: unwrapApiResponse,
      providesTags: ["Deal"],
    }),

    uploadMarketingProof: builder.mutation<
      any,
      {
        dealId: string;
        marketing_proof_url: string;
      }
    >({
      query: ({ dealId, marketing_proof_url }) => ({
        url: `deals/${dealId}/marketing-proof`,
        method: "POST",
        body: {
          marketing_proof_url,
        },
      }),
      transformResponse: unwrapApiResponse,
      invalidatesTags: ["Deal"],
    }),

    uploadMarketLaunchProof: builder.mutation<
      any,
      {
        dealId: string;
        market_launch_proof_url: string;
      }
    >({
      query: ({ dealId, market_launch_proof_url }) => ({
        url: `deals/${dealId}/market-launch-proof`,
        method: "POST",
        body: {
          market_launch_proof_url,
        },
      }),
      transformResponse: unwrapApiResponse,
      invalidatesTags: ["Deal"],
    }),

    proceedToClosing: builder.mutation<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}/proceed-to-closing`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
      invalidatesTags: ["Deal"],
    }),

    cancelDeal: builder.mutation<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}/cancel`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
      invalidatesTags: ["Deal"],
    }),

    closeDeal: builder.mutation<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}/close`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
      invalidatesTags: ["Deal"],
    }),
  }),
});

export const {
  useGetMyDealsQuery,
  useGetDealByIdQuery,
  useUploadMarketingProofMutation,
  useUploadMarketLaunchProofMutation,
  useProceedToClosingMutation,
  useCancelDealMutation,
  useCloseDealMutation,
} = dealService;
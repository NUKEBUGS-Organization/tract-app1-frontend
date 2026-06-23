import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

function unwrapDeal(response: ApiEnvelope<any>) {
  return response.data;
}

function unwrapDealList(response: ApiEnvelope<Record<string, any> | null>) {
  if (!response.data) return [];

  return Object.values(response.data);
}

export const dealService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyDeals: builder.query<any[], void>({
      query: () => ({
        url: "deals/my-deals",
        method: "GET",
      }),
      transformResponse: unwrapDealList,
      providesTags: ["Deal"],
    }),

    getDealById: builder.query<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}`,
        method: "GET",
      }),
      transformResponse: unwrapDeal,
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
      transformResponse: unwrapDeal,
      invalidatesTags: ["Deal", "Chat"],
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
      transformResponse: unwrapDeal,
      invalidatesTags: ["Deal", "Chat"],
    }),

    proceedToClosing: builder.mutation<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}/proceed-to-closing`,
        method: "POST",
      }),
      transformResponse: unwrapDeal,
      invalidatesTags: ["Deal", "Chat"],
    }),

    cancelDeal: builder.mutation<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}/cancel`,
        method: "POST",
      }),
      transformResponse: unwrapDeal,
      invalidatesTags: ["Deal", "Chat"],
    }),

    closeDeal: builder.mutation<any, string>({
      query: (dealId) => ({
        url: `deals/${dealId}/close`,
        method: "POST",
      }),
      transformResponse: unwrapDeal,
      invalidatesTags: ["Deal", "Chat"],
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
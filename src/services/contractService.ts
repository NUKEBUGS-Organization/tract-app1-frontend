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

 
  if (payload?.contract?._doc) {
    payload = payload.contract._doc;
  }

  if (payload?.contract) {
    payload = payload.contract;
  }

  return payload;
}

export const contractService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation<
      any,
      {
        listingId: string;
        body: {
          bid_id: string;
          pdf_url?: string;
        };
      }
    >({
      query: ({ listingId, body }) => ({
        url: `contracts/listing/${listingId}`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapApiResponse,
    }),

    getContractById: builder.query<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}`,
        method: "GET",
      }),
      transformResponse: unwrapApiResponse,
    }),

    signContractAsSeller: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/seller`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
    }),

    signContractAsBuyer: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/buyer`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
    }),

    cancelContract: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/cancel`,
        method: "POST",
      }),
      transformResponse: unwrapApiResponse,
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractByIdQuery,
  useSignContractAsSellerMutation,
  useSignContractAsBuyerMutation,
  useCancelContractMutation,
} = contractService;
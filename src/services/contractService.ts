
import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

type ContractSignUrlResponse = {
  embed_src: string;
};

function unwrapContract(response: ApiEnvelope<any>) {
  return response.data;
}

function unwrapContractList(response: ApiEnvelope<Record<string, any> | any[] | null>) {
  if (!response.data) return [];

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return Object.values(response.data);
}

export const contractService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation<
      any,
      {
        listingId: string;
        body: any;
      }
    >({
      query: ({ listingId, body }) => ({
        url: `contracts/listing/${listingId}`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapContract,
      invalidatesTags: ["Contract", "Deal"],
    }),

    getContractsByListing: builder.query<any[], string>({
      query: (listingId) => ({
        url: `contracts/listing/${listingId}`,
        method: "GET",
      }),
      transformResponse: unwrapContractList,
      providesTags: ["Contract"],
    }),

    getContractById: builder.query<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}`,
        method: "GET",
      }),
      transformResponse: unwrapContract,
      providesTags: ["Contract"],
    }),

    getContractSignUrl: builder.query<ContractSignUrlResponse, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign-url`,
        method: "GET",
      }),
      transformResponse: unwrapContract,
      providesTags: ["Contract"],
    }),

    getSignedContractPdf: builder.query<{ signed_pdf_url: string }, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/signed-pdf`,
        method: "GET",
      }),
      transformResponse: unwrapContract,
      providesTags: ["Contract"],
    }),

    cancelContract: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/cancel`,
        method: "POST",
      }),
      transformResponse: unwrapContract,
      invalidatesTags: ["Contract", "Deal"],
    }),





    // Keep these only if you still need local testing.
    // Do not use these from production frontend signing UI.
    signContractAsSeller: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/seller`,
        method: "POST",
      }),
      transformResponse: unwrapContract,
      invalidatesTags: ["Contract", "Deal"],
    }),

    signContractAsBuyer: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/buyer`,
        method: "POST",
      }),
      transformResponse: unwrapContract,
      invalidatesTags: ["Contract", "Deal"],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractsByListingQuery,
  useGetContractByIdQuery,
  useLazyGetContractSignUrlQuery,
  useGetSignedContractPdfQuery,
  useCancelContractMutation,
  useSignContractAsSellerMutation,
  useSignContractAsBuyerMutation,

} = contractService;
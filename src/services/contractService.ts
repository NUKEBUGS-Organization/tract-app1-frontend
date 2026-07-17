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
  const payload = response?.data ?? response;

  return payload?._doc ?? payload;
}

function normalizeContractList(payload: any) {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.map((item: any) => item?._doc ?? item);
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.map((item: any) => item?._doc ?? item);
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data.map((item: any) => item?._doc ?? item);
  }

  if (typeof payload === "object") {
    return Object.values(payload)
      .filter((item: any) => item && typeof item === "object" && !item?.page)
      .map((item: any) => item?._doc ?? item);
  }

  return [];
}

function unwrapContractList(response: ApiEnvelope<any>) {
  const payload = response?.data ?? response;

  return normalizeContractList(payload);
}

function unwrapPaginatedContracts(response: ApiEnvelope<any>) {
  const payload = response?.data ?? response;

  return normalizeContractList(payload);
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
      invalidatesTags: ["Contract", "Deal", "Chat"],
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
      invalidatesTags: ["Contract", "Deal", "Chat", "Property", "Bid"],
    }),

    getMyContracts: builder.query<any[], void>({
      query: () => ({
        url: "contracts/my-contracts",
        method: "GET",
      }),
      transformResponse: unwrapPaginatedContracts,
      providesTags: ["Contract"],
    }),

    // Keep these only if you still need local testing.
    // Do not use these from production frontend signing UI.
    signContractAsSeller: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/seller`,
        method: "POST",
      }),
      transformResponse: unwrapContract,
      invalidatesTags: ["Contract", "Deal", "Chat"],
    }),

    signContractAsBuyer: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/buyer`,
        method: "POST",
      }),
      transformResponse: unwrapContract,
      invalidatesTags: ["Contract", "Deal", "Chat"],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractsByListingQuery,
  useGetContractByIdQuery,
  useLazyGetContractSignUrlQuery,
  useGetSignedContractPdfQuery,
  useGetMyContractsQuery,
  useCancelContractMutation,
  useSignContractAsSellerMutation,
  useSignContractAsBuyerMutation,
} = contractService;
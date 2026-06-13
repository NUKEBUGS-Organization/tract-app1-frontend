import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

type MongooseDocEnvelope = {
  _doc: any;
};

function unwrapContractDoc(response: ApiEnvelope<MongooseDocEnvelope>) {
  return response.data._doc;
}

// function unwrapContract(response: ApiEnvelope<any>) {
//   return response.data;
// }

function unwrapContractList(response: ApiEnvelope<Record<string, any> | null>) {
  if (!response.data) return [];

  return Object.values(response.data);
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
      transformResponse: unwrapContractDoc,
      invalidatesTags: ["Contract", "Deal"],
    }),

   getContractById: builder.query<any, string>({
  query: (contractId) => ({
    url: `contracts/${contractId}`,
    method: "GET",
  }),
  transformResponse: unwrapContractDoc,
  providesTags: ["Contract"],
}),

    getContractsByListing: builder.query<any[], string>({
      query: (listingId) => ({
        url: `contracts/listing/${listingId}`,
        method: "GET",
      }),
      transformResponse: unwrapContractList,
      providesTags: ["Contract"],
    }),

    signContractAsSeller: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/seller`,
        method: "POST",
      }),
      transformResponse: unwrapContractDoc,
      invalidatesTags: ["Contract", "Deal"],
    }),

    signContractAsBuyer: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/buyer`,
        method: "POST",
      }),
      transformResponse: unwrapContractDoc,
      invalidatesTags: ["Contract", "Deal"],
    }),

    cancelContract: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/cancel`,
        method: "POST",
      }),
      transformResponse: unwrapContractDoc,
      invalidatesTags: ["Contract", "Deal"],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractByIdQuery,
  useGetContractsByListingQuery,
  useSignContractAsSellerMutation,
  useSignContractAsBuyerMutation,
  useCancelContractMutation,
} = contractService;
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

function unwrapPaginatedContracts(response: ApiEnvelope<any>) {
  if (!response?.data) return [];
  if (Array.isArray(response.data.data)) return response.data.data;
  if (Array.isArray(response.data)) return response.data;
  return [];
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

    // getMyContracts: builder.query<any[], void>({
    //   query: () => ({
    //     url: `contracts/my-contracts`,
    //     method: "GET",
    //   }),
    //   transformResponse: unwrapPaginatedContracts,
    //   providesTags: ["Contract"],
    // }),
    getMyContracts: builder.query<any[], void>({
      query: () => ({
        url: `contracts/my-contracts`,
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<any>) => {
        const list = unwrapPaginatedContracts(response);
        // Unwrap each Mongoose _doc if present
        return list.map((item: any) => item?._doc ?? item);
      },
      providesTags: ["Contract"],
    }),





  }),
});

export const {
  useCreateContractMutation,
  useGetContractByIdQuery,
  useGetContractsByListingQuery,
  useGetMyContractsQuery,
  useSignContractAsSellerMutation,
  useSignContractAsBuyerMutation,
  useCancelContractMutation,
} = contractService;
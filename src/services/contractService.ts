import { baseApi } from "./baseApi";

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
    }),

    getContractById: builder.query<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}`,
        method: "GET",
      }),
    }),

    signContractAsSeller: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/seller`,
        method: "POST",
      }),
    }),

    signContractAsBuyer: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/sign/buyer`,
        method: "POST",
      }),
    }),

    cancelContract: builder.mutation<any, string>({
      query: (contractId) => ({
        url: `contracts/${contractId}/cancel`,
        method: "POST",
      }),
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
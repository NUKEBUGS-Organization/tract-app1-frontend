import { baseApi } from "./baseApi";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

function unwrapData(response: ApiEnvelope<any>) {
  return response.data;
}

function unwrapBidList(response: ApiEnvelope<Record<string, any> | null>) {
  if (!response.data) return [];

  return Object.values(response.data);
}

function unwrapMongooseDoc(response: ApiEnvelope<{ _doc: any }>) {
  return response.data._doc;
}

export const listingService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createListing: builder.mutation<any, any>({
      query: (body) => ({
        url: "listings",
        method: "POST",
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Property"],
    }),

    getListings: builder.query<any, any>({
      query: (params) => ({
        url: "listings",
        method: "GET",
        params,
      }),
      transformResponse: unwrapData,
      providesTags: ["Property"],
    }),

    getListingsDashboard: builder.query<any, void>({
      query: () => ({
        url: "listings/dashboard",
        method: "GET",
      }),
      transformResponse: unwrapData,
      providesTags: ["Property"],
    }),

    getListingById: builder.query<any, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapData,
      providesTags: ["Property"],
    }),

    updateListing: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `listings/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Property"],
    }),

    deleteListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "DELETE",
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Property"],
    }),

    submitListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `listings/${id}/submit`,
        method: "POST",
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Property"],
    }),

    uploadListingDocuments: builder.mutation<
      any,
      {
        listingId: string;
        files: File[];
        documentTypes: string[];
      }
    >({
      query: ({ listingId, files, documentTypes }) => {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append("files", file);
        });

        documentTypes.forEach((documentType) => {
          formData.append("document_types", documentType);
        });

        return {
          url: `listings/${listingId}/documents`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: unwrapData,
      invalidatesTags: ["Property"],
    }),

    getListingDocuments: builder.query<any, string>({
      query: (listingId) => ({
        url: `listings/${listingId}/documents`,
        method: "GET",
      }),
      transformResponse: unwrapData,
      providesTags: ["Property"],
    }),

    submitBid: builder.mutation<any, { listingId: string; body: any }>({
      query: ({ listingId, body }) => ({
        url: `listings/${listingId}/bids`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Bid", "Property"],
    }),

    getListingBids: builder.query<any[], string>({
      query: (listingId) => ({
        url: `listings/${listingId}/bids`,
        method: "GET",
      }),
      transformResponse: unwrapBidList,
      providesTags: ["Bid"],
    }),

    getMyBids: builder.query<any, void>({
      query: () => ({
        url: "bids/my-bids",
        method: "GET",
      }),
      transformResponse: unwrapData,
      providesTags: ["Bid"],
    }),

   getBidById: builder.query<any, string>({
  query: (bidId) => ({
    url: `bids/${bidId}`,
    method: "GET",
  }),
  transformResponse: unwrapMongooseDoc,
  providesTags: ["Bid"],
}),
    deleteOwnBid: builder.mutation<any, string>({
      query: (bidId) => ({
        url: `bids/${bidId}`,
        method: "DELETE",
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Bid", "Property"],
    }),

    selectBid: builder.mutation<
      any,
      {
        listingId: string;
        bidId: string;
        selection: 1 | 2 | 3;
      }
    >({
      query: ({ listingId, bidId, selection }) => ({
        url: `listings/${listingId}/bids/${bidId}/select`,
        method: "POST",
        body: {
          selection,
        },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Bid", "Property", "Contract", "Deal"],
    }),

    rejectBid: builder.mutation<
      any,
      {
        listingId: string;
        bidId: string;
      }
    >({
      query: ({ listingId, bidId }) => ({
        url: `listings/${listingId}/bids/${bidId}`,
        method: "DELETE",
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Bid", "Property"],
    }),
  }),
});

export const {
  useCreateListingMutation,
  useGetListingsQuery,
  useGetListingsDashboardQuery,
  useGetListingByIdQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useSubmitListingMutation,
  useUploadListingDocumentsMutation,
  useGetListingDocumentsQuery,

  useSubmitBidMutation,
  useGetListingBidsQuery,
  useGetMyBidsQuery,
  useGetBidByIdQuery,
  useDeleteOwnBidMutation,
  useSelectBidMutation,
  useRejectBidMutation,
} = listingService;
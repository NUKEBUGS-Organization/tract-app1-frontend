import { baseApi } from "./baseApi";

export const listingService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createListing: builder.mutation<any, any>({
      query: (body) => ({
        url: "listings",
        method: "POST",
        body,
      }),
    }),

    getListings: builder.query<any, any>({
      query: (params) => ({
        url: "listings",
        method: "GET",
        params,
      }),
    }),

    getListingsDashboard: builder.query<any, void>({
      query: () => ({
        url: "listings/dashboard",
        method: "GET",
      }),
    }),

    getListingById: builder.query<any, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "GET",
      }),
    }),

    updateListing: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `listings/${id}`,
        method: "PATCH",
        body,
      }),
    }),

    deleteListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "DELETE",
      }),
    }),

    submitListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `listings/${id}/submit`,
        method: "POST",
      }),
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
    }),

    getListingDocuments: builder.query<any, string>({
      query: (listingId) => ({
        url: `listings/${listingId}/documents`,
        method: "GET",
      }),
    }),

    // ─────────────────────────────────────────────
    // Bids APIs
    // ─────────────────────────────────────────────

    submitBid: builder.mutation<any, { listingId: string; body: any }>({
      query: ({ listingId, body }) => ({
        url: `listings/${listingId}/bids`,
        method: "POST",
        body,
      }),
    }),

    getListingBids: builder.query<any, string>({
      query: (listingId) => ({
        url: `listings/${listingId}/bids`,
        method: "GET",
      }),
    }),

    getMyBids: builder.query<any, void>({
      query: () => ({
        url: "bids/my-bids",
        method: "GET",
      }),
    }),

    getBidById: builder.query<any, string>({
      query: (bidId) => ({
        url: `bids/${bidId}`,
        method: "GET",
      }),
    }),

    deleteOwnBid: builder.mutation<any, string>({
      query: (bidId) => ({
        url: `bids/${bidId}`,
        method: "DELETE",
      }),
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
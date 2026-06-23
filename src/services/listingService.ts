import { baseApi } from "./baseApi";

export const listingService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createListing: builder.mutation<any, any>({
      query: (body) => ({
        url: "listings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Property"],
    }),

    getListings: builder.query<any, any>({
      query: (params) => ({
        url: "listings",
        method: "GET",
        params,
      }),
      providesTags: ["Property"],
    }),

    getListingsDashboard: builder.query<any, void>({
      query: () => ({
        url: "listings/dashboard",
        method: "GET",
      }),
      providesTags: ["Property"],
    }),

    getListingById: builder.query<any, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "GET",
      }),
      providesTags: ["Property"],
    }),

    updateListing: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `listings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Property"],
    }),

    deleteListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `listings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property"],
    }),

    submitListing: builder.mutation<any, string>({
      query: (id) => ({
        url: `listings/${id}/submit`,
        method: "POST",
      }),
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
      invalidatesTags: ["Property"],
    }),

    getListingDocuments: builder.query<any, string>({
      query: (listingId) => ({
        url: `listings/${listingId}/documents`,
        method: "GET",
      }),
      providesTags: ["Property"],
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
      invalidatesTags: ["Property", "Bid"],
    }),

    getListingBids: builder.query<any[], string>({
      query: (listingId) => ({
        url: `listings/${listingId}/bids`,
        method: "GET",
      }),

      providesTags: ["Property", "Bid"],

      transformResponse: (response: any) => {
        function unwrapBid(item: any): any {
          if (!item) return null;

          if (item?._doc) return unwrapBid(item._doc);
          if (item?.bid?._doc) return unwrapBid(item.bid._doc);
          if (item?.bid) return unwrapBid(item.bid);
          if (item?.data?._doc) return unwrapBid(item.data._doc);
          if (item?.data) return unwrapBid(item.data);

          return item;
        }

        function isRealBid(item: any) {
          const bid = unwrapBid(item);

          return Boolean(
            bid &&
              typeof bid === "object" &&
              (bid._id || bid.id) &&
              (bid.bid_price !== undefined ||
                bid.property_id !== undefined ||
                bid.bidder_id !== undefined ||
                bid.status !== undefined)
          );
        }

        const payload = response?.data ?? response;

        if (!payload) return [];

        if (Array.isArray(payload)) {
          return payload.map(unwrapBid).filter(isRealBid);
        }

        if (Array.isArray(payload?.bids)) {
          return payload.bids.map(unwrapBid).filter(isRealBid);
        }

        if (Array.isArray(payload?.data)) {
          return payload.data.map(unwrapBid).filter(isRealBid);
        }

        const single = unwrapBid(payload);

        if (isRealBid(single)) {
          return [single];
        }

        if (typeof payload === "object") {
          return Object.values(payload).map(unwrapBid).filter(isRealBid);
        }

        return [];
      },
    }),

    getMyBids: builder.query<any, void>({
      query: () => ({
        url: "bids/my-bids",
        method: "GET",
      }),
      providesTags: ["Bid"],
    }),

    getBidById: builder.query<any, string>({
      query: (bidId) => ({
        url: `bids/${bidId}`,
        method: "GET",
      }),
      providesTags: ["Bid"],
    }),

    deleteOwnBid: builder.mutation<any, string>({
      query: (bidId) => ({
        url: `bids/${bidId}`,
        method: "DELETE",
      }),
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
      invalidatesTags: ["Bid", "Property"],
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
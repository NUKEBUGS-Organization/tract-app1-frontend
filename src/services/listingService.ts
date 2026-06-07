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
} = listingService;
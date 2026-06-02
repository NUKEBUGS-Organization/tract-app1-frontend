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
import { baseApi } from "./baseApi";

export const verificationService = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ─────────────────────────────────────────────
        // Proof of Activity (Wholesaler professional verification)
        // ─────────────────────────────────────────────

        uploadProofOfActivity: builder.mutation<any, { file: File }>({
            query: ({ file }) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("document_type", "proof_of_activity");

                return {
                    url: "verifications/proof-of-activity",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["User"],
        }),

        getProofOfActivityStatus: builder.query<any, void>({
            query: () => ({
                url: "verifications/proof-of-activity",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
    }),
});

export const {
    useUploadProofOfActivityMutation,
    useGetProofOfActivityStatusQuery,
} = verificationService;
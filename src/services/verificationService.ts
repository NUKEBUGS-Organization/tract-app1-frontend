import { baseApi } from "./baseApi";

export const verificationService = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // POST verifications/wholesaler — Wholesaler uploads proof-of-activity document (multipart/form-data)
        uploadProofOfActivity: builder.mutation<any, { file: File }>({
            query: ({ file }) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: "verifications/wholesaler",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["User"],
        }),

        // GET verifications/me — Returns the authenticated user's own verification record
        getProofOfActivityStatus: builder.query<any, void>({
            query: () => ({
                url: "verifications/me",
                method: "GET",
            }),
            providesTags: ["User"],
        }),

        // POST verifications/realtor — Realtor submits license credentials (JSON body)
        uploadRealtorVerification: builder.mutation<
            any,
            {
                state_license_number: string;
                brokerage_name: string;
                managing_broker: string;
                office_address: string;
            }
        >({
            query: ({ state_license_number, brokerage_name, managing_broker, office_address }) => ({
                url: "verifications/realtor",
                method: "POST",
                body: { state_license_number, brokerage_name, managing_broker, office_address },
            }),
            invalidatesTags: ["User"],
        }),

        // GET verifications/me — Returns the authenticated user's own verification record
        getRealtorVerificationStatus: builder.query<any, void>({
            query: () => ({
                url: "verifications/me",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
    }),
});

export const {
    useUploadProofOfActivityMutation,
    useGetProofOfActivityStatusQuery,
    useUploadRealtorVerificationMutation,
    useGetRealtorVerificationStatusQuery,
} = verificationService;
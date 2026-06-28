import { baseApi } from "./baseApi";

export const verificationService = baseApi.injectEndpoints({
    endpoints: (builder) => ({

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


        uploadRealtorVerification: builder.mutation<
            any,
            {
                license_number: string;
                brokerage_name: string;
                managing_broker: string;
                office_address: string;
            }
        >({
            query: ({ license_number, brokerage_name, managing_broker, office_address }) => ({
                url: "verifications/realtor-credentials",
                method: "POST",
                body: { license_number, brokerage_name, managing_broker, office_address },
            }),
            invalidatesTags: ["User"],
        }),

        getRealtorVerificationStatus: builder.query<any, void>({
            query: () => ({
                url: "verifications/realtor-credentials",
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
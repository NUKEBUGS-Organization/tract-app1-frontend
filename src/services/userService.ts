import { baseApi } from "./baseApi";

export const userService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<any, void>({
      query: () => ({
        url: "users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    updateMe: builder.mutation<
      any,
      {
        full_name?: string;
        state_code?: string;
        dob?: string;
      }
    >({
      query: (body) => ({
        url: "users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<
      any,
      {
        current_password: string;
        new_password: string;
      }
    >({
      query: (body) => ({
        url: "users/me/password",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = userService;
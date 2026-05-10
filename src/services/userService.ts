import { baseApi } from "./baseApi";

export const userService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<any, void>({
      query: () => ({
        url: "/api/v1/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery } = userService;
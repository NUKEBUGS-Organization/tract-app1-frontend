import { baseApi } from "./baseApi";
import { logout, setCredentials } from "../features/auth/authSlice";

export const authService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      any,
      {
        email: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const responseData = data?.data ?? data;

          dispatch(
            setCredentials({
              user: responseData?.user ?? null,
              accessToken: responseData?.accessToken ?? null,
            })
          );
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    register: builder.mutation<
      any,
      {
        fullName: string;
        email: string;
        phone: string;
        password: string;
        role: string;
        state: string;
      }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<any, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),

      providesTags: ["Auth"],
    }),

    logoutUser: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
        }
      },
    }),

    refreshToken: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutUserMutation,
  useRefreshTokenMutation,
} = authService;
import { baseApi } from "./baseApi";
import { logout, setCredentials, type AuthUser } from "../features/auth/authSlice";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: AuthUser;
  accessToken?: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  state: string;
}

interface RegisterResponse {
  message: string;
  user?: AuthUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;

        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken ?? null,
          })
        );
      },
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<LoginResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),

      providesTags: ["Auth"],
    }),

    logoutUser: builder.mutation<{ message: string }, void>({
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutUserMutation,
} = authApi;
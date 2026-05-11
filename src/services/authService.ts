import { baseApi } from "./baseApi";
import { logout, setCredentials } from "../redux/auth/authSlice";
import { normalizeAuthResponse } from "../redux/auth/authResponse";

export const authService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      any,
      {
        full_name: string;
        email: string;
        phone: string;
        password: string;
        role: string;
        state_code: string;
        dob: string;
      }
    >({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),

    sendOtp: builder.mutation<
      any,
      {
        email: string;
        purpose: "login" | "forgot_password";
      }
    >({
      query: (body) => ({
        url: "auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation<
      any,
      {
        email: string;
        otp: string;
        purpose: "login" | "forgot_password";
      }
    >({
      query: (body) => ({
        url: "auth/verify-otp",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const authData = normalizeAuthResponse(data);

          if (authData.accessToken || authData.refreshToken) {
            dispatch(
              setCredentials({
                user: authData.user,
                accessToken: authData.accessToken,
                refreshToken: authData.refreshToken,
              })
            );
          }
        } catch (error) {
          console.error("OTP verification failed:", error);
        }
      },
    }),

    login: builder.mutation<
      any,
      {
        email: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
    }),

    refreshToken: builder.mutation<
      any,
      {
        refresh_token: string;
      }
    >({
      query: (body) => ({
        url: "auth/refresh",
        method: "POST",
        body,
      }),
    }),

    logoutUser: builder.mutation<any, void>({
      query: () => ({
        url: "auth/logout",
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

    resetPassword: builder.mutation<
      any,
      {
        reset_token: string;
        new_password: string;
      }
    >({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    initiateKyc: builder.mutation<any, void>({
      query: () => ({
        url: "auth/kyc/initiate",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutUserMutation,
  useResetPasswordMutation,
  useInitiateKycMutation,
} = authService;
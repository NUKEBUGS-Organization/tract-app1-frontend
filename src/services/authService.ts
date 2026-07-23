import { baseApi } from "./baseApi";
import { logout } from "../redux/auth/authSlice";

export const authService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      any,
      {
        fullName: string;
        email: string;
        phone: string;
        password: string;
        role: string;
        stateCode: string;
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

    refreshToken: builder.mutation<any, void>({
      query: () => ({
        url: "auth/refresh",
        method: "POST",
        body: {},
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
        resetToken: string;
        newPassword: string;
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

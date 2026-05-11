import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type { RootState } from "../redux/store";
import { logout, setCredentials } from "../redux/auth/authSlice";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { normalizeAuthResponse } from "../redux/auth/authResponse";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const accessToken =
      (getState() as RootState).auth.accessToken ??
      tokenStorage.getAccessToken();

    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }

    headers.set("content-type", "application/json");

    return headers;
  },
});

function getUrl(args: string | FetchArgs) {
  if (typeof args === "string") return args;
  return args.url;
}

function isAuthPublicApi(url: string) {
  return (
    url.includes("/api/v1/auth/login") ||
    url.includes("/api/v1/auth/register") ||
    url.includes("/api/v1/auth/send-otp") ||
    url.includes("/api/v1/auth/verify-otp") ||
    url.includes("/api/v1/auth/reset-password")
  );
}

function forceLogout(api: any) {
  tokenStorage.clearTokens();
  api.dispatch(logout());

  if (window.location.pathname !== "/auth/signin") {
    window.location.href = "/auth/signin";
  }
}

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = getUrl(args);

  let result = await rawBaseQuery(args, api, extraOptions);

  const status = result.error?.status;
  const hasAccessToken = Boolean(
    (api.getState() as RootState).auth.accessToken ||
      tokenStorage.getAccessToken()
  );

  /**
   * If a protected API returns 400 while user has a token,
   * backend may be telling us token/session is invalid/blacklisted.
   *
   * Do NOT apply this to public auth APIs like login/register/verify,
   * because those can return normal 400 validation errors.
   */
  if (
    status === 400 &&
    hasAccessToken &&
    !isAuthPublicApi(requestUrl)
  ) {
    forceLogout(api);
    return result;
  }

  /**
   * If access token is expired/invalid, backend returns 401.
   * Then we call refresh API using refresh token from cookie.
   */
  if (status === 401) {
    const refreshToken =
      (api.getState() as RootState).auth.refreshToken ??
      tokenStorage.getRefreshToken();

    if (!refreshToken) {
      forceLogout(api);
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/api/v1/auth/refresh",
        method: "POST",
        body: {
          refresh_token: refreshToken,
        },
      },
      api,
      extraOptions
    );

    /**
     * If refresh token is expired/blacklisted/invalid,
     * backend can return 400 or 401.
     * In both cases, logout.
     */
    if (
      refreshResult.error?.status === 400 ||
      refreshResult.error?.status === 401
    ) {
      forceLogout(api);
      return result;
    }

    if (refreshResult.data) {
      const authData = normalizeAuthResponse(refreshResult.data);

      if (!authData.accessToken) {
        forceLogout(api);
        return result;
      }

      api.dispatch(
        setCredentials({
          user: authData.user ?? (api.getState() as RootState).auth.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken ?? refreshToken,
        })
      );

    
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      forceLogout(api);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReAuth,
  tagTypes: ["Auth", "User", "Property", "Bid", "Deal", "Admin"],
  endpoints: () => ({}),
});
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

    return headers;
  },
});

function getUrl(args: string | FetchArgs) {
  if (typeof args === "string") return args;
  return args.url;
}

function isAuthPublicApi(url: string) {
  return (
    url.includes("auth/login") ||
    url.includes("auth/register") ||
    url.includes("auth/send-otp") ||
    url.includes("auth/verify-otp") ||
    url.includes("auth/reset-password") ||
    url.includes("auth/refresh")
  );
}

function forceLogout(api: any) {
  tokenStorage.clearTokens();
  api.dispatch(logout());

  if (window.location.pathname !== "/auth/signin") {
    window.location.href = "/auth/signin";
  }
}

let refreshPromise: Promise<boolean> | null = null;

function refreshAuthSession(api: any, extraOptions: any) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken =
        (api.getState() as RootState).auth.refreshToken ??
        tokenStorage.getRefreshToken();

      if (!refreshToken) {
        forceLogout(api);
        return false;
      }

      const refreshResult = await rawBaseQuery(
        {
          url: "auth/refresh",
          method: "POST",
          body: {
            refresh_token: refreshToken,
          },
        },
        api,
        extraOptions
      );

      if (
        refreshResult.error?.status === 400 ||
        refreshResult.error?.status === 401
      ) {
        forceLogout(api);
        return false;
      }

      if (!refreshResult.data) {
        forceLogout(api);
        return false;
      }

      const authData = normalizeAuthResponse(refreshResult.data);

      if (!authData.accessToken) {
        forceLogout(api);
        return false;
      }

      api.dispatch(
        setCredentials({
          user: authData.user ?? (api.getState() as RootState).auth.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken ?? refreshToken,
        })
      );

      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = getUrl(args);

  let result = await rawBaseQuery(args, api, extraOptions);

  const status = result.error?.status;

  /*
    Only refresh on 401 for protected APIs.

    Do not force logout on normal protected 400 errors because listing validation
    can return 400 and user should see validation message instead of logout.
  */
  if (status === 401 && !isAuthPublicApi(requestUrl)) {
    const refreshed = await refreshAuthSession(api, extraOptions);

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
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
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type { RootState } from "../redux/store";
import { logout, setCredentials } from "../redux/auth/authSlice";
import { normalizeAuthResponse } from "../redux/auth/authResponse";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;

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
  api.dispatch(logout());

  if (window.location.pathname !== "/auth/signin") {
    window.location.href = "/auth/signin";
  }
}

let refreshPromise: Promise<boolean> | null = null;

export function refreshAuthSession(api: any, extraOptions: any = {}) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        {
          url: "auth/refresh",
          method: "POST",
          body: {},
        },
        api,
        extraOptions
      );

      if (
        refreshResult.error?.status === 400 ||
        refreshResult.error?.status === 401
      ) {
        return false;
      }

      if (!refreshResult.data) {
        return false;
      }

      const authData = normalizeAuthResponse(refreshResult.data);

      if (!authData.accessToken) {
        return false;
      }

      api.dispatch(
        setCredentials({
          user: authData.user ?? (api.getState() as RootState).auth.user,
          accessToken: authData.accessToken,
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

  if (status === 401 && !isAuthPublicApi(requestUrl)) {
    const refreshed = await refreshAuthSession(api, extraOptions);

    if (refreshed) {
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
  tagTypes: [
    "Auth",
    "User",
    "Property",
    "Bid",
    "Contract",
    "Deal",
    "Chat",
    "Admin",
    "Notification",
  ],
  endpoints: () => ({}),
});

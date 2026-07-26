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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Detect concurrent refresh rotation (sibling app/tab already rotated cookie). */
function isTokenRotatedError(error: FetchBaseQueryError | undefined): boolean {
  if (!error || error.status !== 401) return false;
  const data = error.data as
    | { code?: string; message?: string | { code?: string } }
    | undefined;
  if (!data) return false;
  if (data.code === "TOKEN_ROTATED") return true;
  if (
    typeof data.message === "object" &&
    data.message &&
    (data.message as { code?: string }).code === "TOKEN_ROTATED"
  ) {
    return true;
  }
  return false;
}

/** After a failed refresh, do not attempt again until login or full page load. */
let refreshBlocked = false;
let refreshPromise: Promise<boolean> | null = null;

/** StrictMode / remount guard — boot refresh runs once per page load. */
let bootRefreshStarted = false;

/** Call after a successful interactive login so 401 re-auth can work again. */
export function allowAuthRefresh() {
  refreshBlocked = false;
}

export function blockAuthRefresh() {
  refreshBlocked = true;
  refreshPromise = null;
}

/**
 * Local session clear only — never POST /auth/logout here.
 * A failed refresh means our view of the token is stale; logging out
 * would blacklist a sibling tab/app's still-valid session.
 */
function clearLocalSession(api: { dispatch: (action: unknown) => unknown }) {
  blockAuthRefresh();
  api.dispatch(logout());
  api.dispatch(baseApi.util.resetApiState());
}

function redirectToSignInIfNeeded() {
  if (window.location.pathname !== "/auth/signin") {
    window.location.href = "/auth/signin";
  }
}

async function postRefresh(api: any, extraOptions: any) {
  return rawBaseQuery(
    {
      url: "auth/refresh",
      method: "POST",
      body: {},
    },
    api,
    extraOptions
  );
}

/**
 * Single-flight session refresh. Shares one in-flight promise across callers.
 * On TOKEN_ROTATED, retries once after 500ms (cookie should hold the newer token).
 * On hard failure, blocks further refresh until allowAuthRefresh() / page reload.
 */
export function refreshAuthSession(api: any, extraOptions: any = {}) {
  if (refreshBlocked) {
    return Promise.resolve(false);
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      let refreshResult = await postRefresh(api, extraOptions);

      if (isTokenRotatedError(refreshResult.error)) {
        await sleep(500);
        refreshResult = await postRefresh(api, extraOptions);
      }

      const status = refreshResult.error?.status;

      if (
        status === 429 ||
        status === 400 ||
        status === 401 ||
        status === 403
      ) {
        refreshBlocked = true;
        return false;
      }

      if (!refreshResult.data) {
        refreshBlocked = true;
        return false;
      }

      const authData = normalizeAuthResponse(refreshResult.data);

      if (!authData.accessToken) {
        refreshBlocked = true;
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

/**
 * Boot-time silent refresh — at most once per page load (StrictMode-safe).
 * Returns true if session restored, false if logged out locally.
 */
export function bootRefreshAuthSession(api: any, extraOptions: any = {}) {
  if (bootRefreshStarted) {
    return refreshPromise ?? Promise.resolve(!refreshBlocked && Boolean(
      (api.getState() as RootState).auth.accessToken
    ));
  }
  bootRefreshStarted = true;
  return refreshAuthSession(api, extraOptions);
}

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = getUrl(args);

  let result = await rawBaseQuery(args, api, extraOptions);

  const status = result.error?.status;

  // Never auto-retry or refresh on rate limit.
  if (status === 429) {
    return result;
  }

  if (status === 401 && !isAuthPublicApi(requestUrl)) {
    if (refreshBlocked) {
      clearLocalSession(api);
      redirectToSignInIfNeeded();
      return result;
    }

    const refreshed = await refreshAuthSession(api, extraOptions);

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearLocalSession(api);
      redirectToSignInIfNeeded();
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

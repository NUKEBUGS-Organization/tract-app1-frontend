const ACCESS_TOKEN_KEY = "tract_access_token";
const REFRESH_TOKEN_KEY = "tract_refresh_token";

const isProduction = import.meta.env.PROD;

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date();

  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  if (isProduction) {
    cookie += "; Secure";
  }

  document.cookie = cookie;
}

function getCookie(name: string) {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();

    if (trimmedCookie.startsWith(cookieName)) {
      return decodeURIComponent(trimmedCookie.substring(cookieName.length));
    }
  }

  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export const tokenStorage = {
  getAccessToken: () => {
    return getCookie(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    return getCookie(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken?: string | null, refreshToken?: string | null) => {
    if (accessToken) {
      setCookie(ACCESS_TOKEN_KEY, accessToken, 1);
    }

    if (refreshToken) {
      setCookie(REFRESH_TOKEN_KEY, refreshToken, 7);
    }
  },

  clearTokens: () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  },
};
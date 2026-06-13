const ACCESS_TOKEN_KEY = "tract_access_token";
const REFRESH_TOKEN_KEY = "tract_refresh_token";

const isProduction = import.meta.env.PROD;

function setCookie(name: string, value: string) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;

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
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
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
      setCookie(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      setCookie(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens: () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  },
};
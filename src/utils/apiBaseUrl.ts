/** CapRover may set VITE_API_URL; local dev uses VITE_API_BASE_URL. */
export function getApiBaseUrl(): string {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api/v1"
  );
}

/** Origin without /api/v1 suffix (Google OAuth handoff, etc.). */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, "");
}

export function normalizeAuthResponse(response: any) {
  const data = response?.data;

  return {
    user: data?.user ?? null,
    accessToken: data?.access_token ?? null,
    refreshToken: data?.refresh_token ?? null,
    resetToken: data?.reset_token ?? null,
  };
}
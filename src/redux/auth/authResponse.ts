export function normalizeAuthResponse(response: any) {
  const data = response?.data ?? response;

  return {
    user: data?.user ?? null,

    accessToken:
      data?.access_token ??
      data?.accessToken ??
      data?.token ??
      null,

    refreshToken:
      data?.refresh_token ??
      data?.refreshToken ??
      null,

    resetToken:
      data?.reset_token ??
      data?.resetToken ??
      null,
  };
}
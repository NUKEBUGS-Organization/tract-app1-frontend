export function normalizeAuthResponse(response: any) {
  const data = response?.data ?? response;

  return {
    user: data?.user ?? null,
    accessToken: data?.accessToken ?? data?.access_token ?? null,
    resetToken: data?.resetToken ?? data?.reset_token ?? null,
  };
}

/** Display helpers — prefer canonical camelCase with legacy snake_case fallback. */
export function userFullName(user: any): string {
  return user?.fullName || user?.full_name || "";
}

export function userStateCode(user: any): string {
  return user?.stateCode || user?.state_code || "";
}

export function userKycStatus(user: any): string {
  return String(user?.kycStatus || user?.kyc_status || "pending").toLowerCase();
}

export function isKycApproved(user: any): boolean {
  const status = userKycStatus(user);
  return status === "approved" || status === "verified";
}

import { jwtDecode } from "jwt-decode";

export type TokenUserRole =
  | "seller"
  | "partner"
  | "licensed"
  | "admin"
  | "private_partner"
  | "licensed_partner"
  | "wholesaler"
  | string;

export interface DecodedAccessToken {
  id?: string;
  user_id?: string;
  sub?: string;
  email?: string;
  role?: TokenUserRole;
  full_name?: string;
  fullName?: string;
  exp?: number;
  iat?: number;

  user?: {
    id?: string;
    email?: string;
    role?: TokenUserRole;
    full_name?: string;
    fullName?: string;
  };

  data?: {
    id?: string;
    email?: string;
    role?: TokenUserRole;
  };
}

export function decodeAccessToken(token?: string | null) {
  if (!token) return null;

  try {
    return jwtDecode<DecodedAccessToken>(token);
  } catch (error) {
    console.error("Invalid access token:", error);
    return null;
  }
}

export function getRoleFromToken(token?: string | null): string | null {
  const decodedToken = decodeAccessToken(token);

  const role =
    decodedToken?.role ||
    decodedToken?.user?.role ||
    decodedToken?.data?.role ||
    null;

  return role ? role.toLowerCase() : null;
}

export function isTokenExpired(token?: string | null) {
  const decodedToken = decodeAccessToken(token);

  if (!decodedToken?.exp) return true;

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  return decodedToken.exp < currentTimeInSeconds;
}
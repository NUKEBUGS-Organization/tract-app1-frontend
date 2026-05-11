import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken, isTokenExpired } from "../redux/auth/jwtUtils";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

function normalizeRole(role?: string | null) {
  return role?.toLowerCase().trim() ?? "";
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { role, accessToken } = useAuthContext();

  const token = accessToken || tokenStorage.getAccessToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/auth/signin" replace />;
  }

  const userRole = normalizeRole(role || getRoleFromToken(token));

  if (!userRole) {
    return <Navigate to="/auth/signin" replace />;
  }

  const normalizedAllowedRoles = allowedRoles.map((allowedRole) =>
    normalizeRole(allowedRole)
  );

  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
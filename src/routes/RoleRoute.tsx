import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken, isTokenExpired } from "../redux/auth/jwtUtils";
import { isAllowedRole, normalizeRole } from "../constants/roles";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { role, accessToken } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const activeAccessToken = accessToken || storedAccessToken;

  if (!activeAccessToken || isTokenExpired(activeAccessToken)) {
    return <Navigate to="/auth/signin" replace />;
  }

  const userRole = normalizeRole(role || getRoleFromToken(activeAccessToken));

  if (!userRole) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!isAllowedRole(userRole, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
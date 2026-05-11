import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../../contexts/AuthContext";
import { tokenStorage } from "./tokenStorage";
import { getRoleFromToken, isTokenExpired } from "./jwtUtils";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

function normalizeRole(role?: string | null) {
  return role?.toLowerCase().trim() ?? null;
}

export default function RoleProtectedRoute({
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { isAuthenticated, accessToken, role } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const activeAccessToken = accessToken || storedAccessToken;

  if (!isAuthenticated && !activeAccessToken) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!activeAccessToken || isTokenExpired(activeAccessToken)) {
    return <Navigate to="/auth/signin" replace />;
  }

  const tokenRole = normalizeRole(role || getRoleFromToken(activeAccessToken));

  const normalizedAllowedRoles = allowedRoles.map((allowedRole) =>
    normalizeRole(allowedRole)
  );

  const hasAccess = Boolean(
    tokenRole && normalizedAllowedRoles.includes(tokenRole)
  );

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
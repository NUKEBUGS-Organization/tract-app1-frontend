import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken } from "../redux/auth/jwtUtils";
import { isAllowedRole, normalizeRole } from "../constants/roles";

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { role, accessToken, refreshToken } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const storedRefreshToken = tokenStorage.getRefreshToken();

  const activeAccessToken = accessToken || storedAccessToken;
  const activeRefreshToken = refreshToken || storedRefreshToken;

  const hasSession = Boolean(activeAccessToken || activeRefreshToken);

  if (!hasSession) {
    return <Navigate to="/auth/signin" replace />;
  }

  const userRole = normalizeRole(role || getRoleFromToken(activeAccessToken));

  if (!userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)]">
        <div className="rounded-2xl border border-[var(--color-border-light)] bg-white px-6 py-5 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Restoring your session...
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Please wait while we verify your access.
          </p>
        </div>
      </div>
    );
  }

  if (!isAllowedRole(userRole, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { getRoleFromToken } from "../redux/auth/jwtUtils";

import {
  ADMIN_ROLES,
  PARTNER_ROLES,
  REALTOR_ROLES,
  SELLER_ROLES,
  isAllowedRole,
  normalizeRole,
} from "../constants/roles";

interface RoleContent {
  seller?: ReactNode;
  partner?: ReactNode;
  realtor?: ReactNode;
  admin?: ReactNode;
}

interface RoleRouteProps {
  allowedRoles: string[];

  // Use children when every allowed role sees the same component.
  children?: ReactNode;

  // Use roleContent when the same route must show different UI by role.
  roleContent?: RoleContent;
}

export default function RoleRoute({
  allowedRoles,
  children,
  roleContent,
}: RoleRouteProps) {
  const { role, accessToken, authReady } = useAuthContext();

  if (!authReady) {
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

  if (!accessToken) {
    return <Navigate to="/auth/signin" replace />;
  }

  const userRole = normalizeRole(role || getRoleFromToken(accessToken));

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

  /*
   * Shared route with different UI according to role.
   */
  if (roleContent) {
    if (isAllowedRole(userRole, SELLER_ROLES) && roleContent.seller) {
      return <>{roleContent.seller}</>;
    }

    if (isAllowedRole(userRole, PARTNER_ROLES) && roleContent.partner) {
      return <>{roleContent.partner}</>;
    }

    if (isAllowedRole(userRole, REALTOR_ROLES) && roleContent.realtor) {
      return <>{roleContent.realtor}</>;
    }

    if (isAllowedRole(userRole, ADMIN_ROLES) && roleContent.admin) {
      return <>{roleContent.admin}</>;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  /*
   * Normal route where all allowed roles see the same component.
   */
  if (children) {
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" replace />;
}

import { Navigate, Outlet } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { getRoleFromToken, isTokenExpired } from "../redux/auth/jwtUtils";

function getDashboardPath(role?: string | null) {
  const normalizedRole = role?.toLowerCase().trim() ?? "";

  if (normalizedRole === "seller") {
    return "/seller/dashboard";
  }

  if (["wholesaler", "partner", "private_partner"].includes(normalizedRole)) {
    return "/partner/dashboard";
  }

  if (["realtor", "licensed", "licensed_partner"].includes(normalizedRole)) {
    return "/realtor/dashboard";
  }

  if (normalizedRole === "admin") {
    return "/admin/dashboard";
  }

  return "/seller/dashboard";
}

function PublicRoute() {
  const { accessToken, role } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const activeAccessToken = accessToken || storedAccessToken || null;

  const isLoggedIn = Boolean(
    activeAccessToken && !isTokenExpired(activeAccessToken)
  );

  if (isLoggedIn) {
    const activeRole = role || getRoleFromToken(activeAccessToken);

    return <Navigate to={getDashboardPath(activeRole)} replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
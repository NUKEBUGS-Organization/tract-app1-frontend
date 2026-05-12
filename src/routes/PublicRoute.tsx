import { Navigate, Outlet } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";
import { isTokenExpired } from "../redux/auth/jwtUtils";

function PublicRoute() {
  const { accessToken } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const activeAccessToken = accessToken || storedAccessToken || null;

  const isLoggedIn = Boolean(
    activeAccessToken && !isTokenExpired(activeAccessToken)
  );

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
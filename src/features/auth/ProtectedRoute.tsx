import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "./AuthContext";
import { tokenStorage } from "./tokenStorage";
import { isTokenExpired } from "./jwtUtils";

function ProtectedRoute() {
  const { isAuthenticated, accessToken } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const activeAccessToken = accessToken || storedAccessToken;

  const isLoggedIn = Boolean(
    isAuthenticated || activeAccessToken
  );

  if (!isLoggedIn || !activeAccessToken || isTokenExpired(activeAccessToken)) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
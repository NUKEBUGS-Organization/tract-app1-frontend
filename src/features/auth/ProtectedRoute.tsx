import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "./AuthContext";
import { tokenStorage } from "./tokenStorage";

function ProtectedRoute() {
  const { isAuthenticated, accessToken } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();

  const isLoggedIn = Boolean(
    isAuthenticated || accessToken || storedAccessToken
  );

  if (!isLoggedIn) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
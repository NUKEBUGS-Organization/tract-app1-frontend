import { Navigate, Outlet } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";
import { tokenStorage } from "../redux/auth/tokenStorage";

function PublicRoute() {
  const { accessToken, refreshToken } = useAuthContext();

  const storedAccessToken = tokenStorage.getAccessToken();
  const storedRefreshToken = tokenStorage.getRefreshToken();

  const activeAccessToken = accessToken || storedAccessToken;
  const activeRefreshToken = refreshToken || storedRefreshToken;

  const hasSession = Boolean(activeAccessToken || activeRefreshToken);

  if (hasSession) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
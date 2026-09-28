import { Navigate, Outlet } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";

function PublicRoute() {
  const { accessToken, authReady } = useAuthContext();

  if (!authReady) {
    return null;
  }

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;

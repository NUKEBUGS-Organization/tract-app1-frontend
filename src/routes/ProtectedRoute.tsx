import { Navigate, Outlet } from "react-router";

import { useAuthContext } from "../contexts/AuthContext";

function SessionRestoring() {
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

function ProtectedRoute() {
  const { accessToken, authReady } = useAuthContext();

  if (!authReady) {
    return <SessionRestoring />;
  }

  if (!accessToken) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

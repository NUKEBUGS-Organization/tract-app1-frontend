import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import tractLogo from "../../assets/tract-logo.png";
import { useAuthContext } from "../../contexts/AuthContext";
import { allowAuthRefresh } from "../../services/baseApi";
import { store } from "../../redux/store";
import { setCredentials } from "../../redux/auth/authSlice";
import { normalizeAuthResponse } from "../../redux/auth/authResponse";
import { getApiOrigin } from "../../utils/apiBaseUrl";

const API_BASE = getApiOrigin();

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthContext();
  const ran = useRef(false); // StrictMode guard

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function finishLogin() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include", // send the httpOnly cookie the backend just set
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) throw new Error("refresh failed");

        const raw = await res.json();
        const { accessToken, user } = normalizeAuthResponse(raw);

        if (!accessToken) throw new Error("no access token in refresh response");

        // Unblock future 401-triggered refreshes, then hydrate Redux.
        allowAuthRefresh();
        store.dispatch(setCredentials({ user: user ?? undefined, accessToken }));

        // setAuth is a thin wrapper over the same dispatch — use it for consistency.
        setAuth({ user: user ?? undefined, accessToken });

        navigate("/dashboard", { replace: true });
      } catch {
        navigate(
          "/auth/signin?error=" +
          encodeURIComponent("Google sign-in failed. Please try again."),
          { replace: true }
        );
      }
    }

    finishLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-main)]">
      {/* Brand mark */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-secondary)]/30 bg-white shadow-[var(--shadow-card)]">
          <img src={tractLogo} alt="TRACT logo" className="h-9 w-9 object-contain" />
        </div>
        <div className="text-left">
          <div className="text-xl font-extrabold tracking-tight text-[var(--color-primary)]">
            TRACT
          </div>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            Buy the best
            <br />
            skip the Rest
          </p>
        </div>
      </div>

      {/* Spinner card */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border-light)] bg-white px-10 py-10 shadow-[var(--shadow-card)]">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-secondary)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-main)]">
          Signing you in…
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Setting up your session, just a moment.
        </p>
      </div>
    </div>
  );
}

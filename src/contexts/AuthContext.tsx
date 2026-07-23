import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  logout,
  setAuthReady,
  setCredentials,
} from "../redux/auth/authSlice";
import type { AuthUser } from "../redux/auth/authSlice";
import { useLogoutUserMutation } from "../services/authService";
import { refreshAuthSession } from "../services/baseApi";
import { store } from "../redux/store";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  authReady: boolean;
  setAuth: (payload: {
    user?: AuthUser | null;
    accessToken?: string | null;
  }) => void;
  logoutAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, accessToken, role, isAuthenticated, authReady } =
    useAppSelector((state) => state.auth);

  const [logoutUser] = useLogoutUserMutation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ok = await refreshAuthSession(
          { getState: store.getState, dispatch: store.dispatch },
          {}
        );
        if (cancelled) return;
        if (!ok) {
          dispatch(setAuthReady(true));
          if (
            !window.location.pathname.startsWith("/auth") &&
            window.location.pathname !== "/unauthorized"
          ) {
            navigate("/auth/signin", { replace: true });
          }
        }
      } catch {
        if (!cancelled) {
          dispatch(setAuthReady(true));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  const setAuth: AuthContextValue["setAuth"] = (payload) => {
    dispatch(setCredentials(payload));
  };

  const logoutAuth = async () => {
    try {
      await logoutUser().unwrap();
    } catch {
      // Cookie may already be cleared / session expired
    } finally {
      dispatch(logout());
      navigate("/auth/signin", { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role,
        isAuthenticated,
        authReady,
        setAuth,
        logoutAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}

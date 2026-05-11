import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, setCredentials } from "../redux/auth/authSlice";
import type { AuthUser } from "../redux/auth/authSlice";
import { useLogoutUserMutation } from "../services/authService";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: {
    user?: AuthUser | null;
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => void;
  logoutAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, accessToken, refreshToken, role, isAuthenticated } =
    useAppSelector((state) => state.auth);

  const [logoutUser] = useLogoutUserMutation();

  const setAuth: AuthContextValue["setAuth"] = (payload) => {
    dispatch(setCredentials(payload));
  };

  const logoutAuth = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
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
        refreshToken,
        role,
        isAuthenticated,
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
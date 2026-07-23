import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { decodeAccessToken, getRoleFromToken } from "./jwtUtils";

export type UserRole =
  | "seller"
  | "partner"
  | "licensed"
  | "admin"
  | "private_partner"
  | "licensed_partner"
  | "wholesaler"
  | string;

export interface AuthUser {
  id?: string;
  _id?: string;
  user_id?: string;
  sub?: string;
  fullName?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  /** False until the silent /auth/refresh boot attempt finishes. */
  authReady: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  authReady: false,
};

interface SetCredentialsPayload {
  user?: AuthUser | null;
  accessToken?: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken;
      }

      const decodedToken = decodeAccessToken(state.accessToken);

      if (action.payload.user !== undefined && action.payload.user !== null) {
        state.user = action.payload.user;
      } else if (decodedToken) {
        state.user = {
          id: decodedToken.id,
          user_id: decodedToken.user_id,
          sub: decodedToken.sub,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          full_name: decodedToken.fullName || decodedToken.full_name,
          role: decodedToken.role,
        };
      }

      state.role = getRoleFromToken(state.accessToken);
      state.isAuthenticated = Boolean(state.accessToken);
      state.authReady = true;
    },

    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.authReady = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.authReady = true;
    },
  },
});

export const { setCredentials, setAuthReady, logout } = authSlice.actions;
export default authSlice.reducer;

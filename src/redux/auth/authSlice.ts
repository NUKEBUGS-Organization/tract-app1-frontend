import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { tokenStorage } from "./tokenStorage";
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
  refreshToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

const storedAccessToken = tokenStorage.getAccessToken();
const storedRefreshToken = tokenStorage.getRefreshToken();
const decodedStoredToken = decodeAccessToken(storedAccessToken);

const initialState: AuthState = {
  user: decodedStoredToken
    ? {
        id: decodedStoredToken.id,
        user_id: decodedStoredToken.user_id,
        sub: decodedStoredToken.sub,
        email: decodedStoredToken.email,
        fullName: decodedStoredToken.fullName,
        full_name: decodedStoredToken.full_name,
        role: decodedStoredToken.role,
      }
    : null,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  role: getRoleFromToken(storedAccessToken),
  isAuthenticated: Boolean(storedAccessToken || storedRefreshToken),
};

interface SetCredentialsPayload {
  user?: AuthUser | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken;
      }

      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
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
          full_name: decodedToken.full_name,
          role: decodedToken.role,
        };
      }

      state.role = getRoleFromToken(state.accessToken);
      state.isAuthenticated = Boolean(state.accessToken);

      tokenStorage.setTokens(state.accessToken, state.refreshToken);
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;

      tokenStorage.clearTokens();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
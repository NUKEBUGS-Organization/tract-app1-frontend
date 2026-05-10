import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { tokenStorage } from "./tokenStorage";

export type UserRole =
  | "SELLER"
  | "PRIVATE_PARTNER"
  | "LICENSED_PARTNER"
  | "ADMIN"
  | "seller"
  | "partner"
  | "licensed"
  | "admin";

export interface AuthUser {
  id?: string;
  _id?: string;
  fullName?: string;
  full_name?: string;
  email: string;
  phone?: string;
  role?: UserRole | string;
  isVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
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
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
      }

      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken;
      }

      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }

      tokenStorage.setTokens(state.accessToken, state.refreshToken);

      state.isAuthenticated = Boolean(state.accessToken);
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      tokenStorage.clearTokens();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
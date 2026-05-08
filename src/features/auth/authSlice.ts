import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "SELLER" | "PRIVATE_PARTNER" | "LICENSED_PARTNER" | "ADMIN";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
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
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
      }

      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken;
      }

      state.isAuthenticated = Boolean(state.user || state.accessToken);
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
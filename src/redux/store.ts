import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import { baseApi } from "../services/baseApi";
import { ticketsApi } from "../services/ticketService";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [ticketsApi.reducerPath]: ticketsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(ticketsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
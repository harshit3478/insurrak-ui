"use client";
import { AUTH_STORAGE_KEY, AuthState, User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  rememberMe: false,
};

interface LoginPayload {
  user: User;
  rememberMe: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<LoginPayload>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.rememberMe = action.payload.rememberMe;
      if (state.rememberMe) {
        localStorage.setItem(
          AUTH_STORAGE_KEY      ,
          JSON.stringify({
            isAuthenticated: true,
            user: state.user,
            rememberMe: true,
          }),
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      const prev = localStorage.getItem(AUTH_STORAGE_KEY);
      if (prev) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
    hydrate(state) {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(AUTH_STORAGE_KEY)
          : null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AuthState;
          state.isAuthenticated = parsed.isAuthenticated;
          state.user = parsed.user;
          state.rememberMe = parsed.rememberMe;
        } catch {}
      }
    },
  },
});

export const { loginSuccess, logout, hydrate } = authSlice.actions;
export default authSlice.reducer;

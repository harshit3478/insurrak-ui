"use client";

import { apiClient } from "@/lib/apiClient";
import { adaptUser } from "@/lib/adapters";
import { RootState, store } from "@/lib/store";
import {
  loginSuccess,
  logout as logoutAction,
} from "../lib/features/auth/authSlice";

import { AuthContextType, Role, ROLE_HIERARCHY } from "@/types";
import { isBypassActive } from "@/types/permissions";
import { setAuthCookie, clearAuthCookie } from "@/app/actions/auth";
import { createContext, useContext, useActionState } from "react";
import { useSelector } from "react-redux";

type AuthState = {
  success?: boolean;
  error?: string;
};

const initialState: AuthState = {
  success: undefined,
  error: undefined,
};

/** Map user role to the correct dashboard route */
function getDashboardRoute(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/system";
    case "COMPANY_ADMIN":
    case "BRANCH_ADMIN":
    case "COMPANY_USER":
      return "/company/policies";
    default:
      return "/company/policies";
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  /** Step 1 — send OTP to the given email */
  const requestOtp = async (email: string): Promise<{ error?: string }> => {
    try {
      await apiClient.requestOtp(email);
      return {};
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send OTP";
      return { error: msg };
    }
  };

  /** Step 2 — verify OTP and establish session (called via form action) */
  const loginAction = async (
    _prevState: AuthState,
    formData: FormData,
  ): Promise<AuthState> => {
    try {
      const email = formData.get("email") as string;
      const otp = formData.get("otp") as string;

      const loginResponse = await apiClient.verifyOtp({ email, otp });

      const token = loginResponse.access_token;
      if (!token) {
        return { error: "Login failed: No token received." };
      }

      const apiUser = loginResponse.user;
      if (!apiUser) {
        return { error: "Login failed: No user details received." };
      }

      localStorage.setItem("token", token);
      const user = adaptUser(apiUser, apiUser.role_name);

      await setAuthCookie(token, user.role);

      store.dispatch(loginSuccess({ user, rememberMe: true }));

      window.location.href = getDashboardRoute(user.role as Role);

      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Invalid OTP";
      return { error: msg };
    }
  };

  const [loginState, login, isLoginPending] = useActionState(
    loginAction,
    initialState,
  );

  const logout = async () => {
    try {
      await apiClient.logout();
      store.dispatch(logoutAction());
      await clearAuthCookie();
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const hasPermission = (requiredRole: Role): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        requestOtp,
        login,
        loginState,
        isLoginPending,
        logout,
        hasPermission,
        isBypassActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

"use client";

import { api } from "@/lib/api";
import { RootState, store } from "@/lib/store";
import {
  loginSuccess,
  logout as logoutAction,
} from "../lib/features/auth/authSlice";

import { AuthContextType, Role, ROLE_HIERARCHY, User } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useActionState,
  useState,
} from "react";
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
      return "/dashboard/admin";
    case "COMPANY_ADMIN":
      return "/dashboard/manager";
    default:
      return "/dashboard/user";
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  // Login action
  const loginAction = async (
    prevState: AuthState,
    formData: FormData,
  ): Promise<AuthState> => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const loginResponse = await api.login({ email, password });

      const token = loginResponse.access_token;
      if (!token) {
        return { error: "Login failed: No token received." };
      }

      localStorage.setItem("token", token);

      const user = await api.getCurrentUser();

      if (!user) {
        return { error: "Login failed: Could not fetch user details." };
      }

      // Always persist so state survives the page navigation
      store.dispatch(
        loginSuccess({
          user,
          rememberMe: true,
        })
      );

      // Redirect to the role-specific dashboard
      window.location.href = getDashboardRoute(user.role as Role);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      return { error: errorMessage };
    }
  };

  const [loginState, login, isLoginPending] = useActionState(
    loginAction,
    initialState,
  );

  /* ===================== SIGNUP ACTION ===================== */
  const signupAction = async (
    prevState: AuthState,
    formData: FormData,
  ): Promise<AuthState> => {
    // Real API does not support public signup. User must be created by Admin.
    return { error: "Signup is not supported. Please contact your administrator." };
  };

  const [signupState, signup, isSignupPending] = useActionState(
    signupAction,
    initialState,
  );

  const logout = async () => {
    try {
      await api.logout();
      store.dispatch(logoutAction());
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
        login,
        loginState,
        isLoginPending,
        signup,
        signupState,
        isSignupPending,
        logout,
        hasPermission,
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


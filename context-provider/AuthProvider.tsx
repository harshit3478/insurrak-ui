"use client";

import { api } from "@/lib/api";
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
      return "/dashboard/manager";
    default:
      return "/dashboard/user";
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider manages the global authentication state and user session.
 * It coordinates with Redux for persistence and provides utility methods for
 * role-based permission checks and secure navigation.
 */
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
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      const isSystemLogin = formData.get("system_login") === "true";

      const loginResponse = isSystemLogin
        ? await api.systemLogin({ username, password })
        : await api.login({ username, password });

      const token = loginResponse.access_token;
      if (!token) {
        return { error: "Login failed: No token received." };
      }

      localStorage.setItem("token", token);

      const apiUser = loginResponse.user;
      if (!apiUser) {
        localStorage.removeItem("token");
        return { error: "Login failed: No user details received." };
      }

      const user = adaptUser(apiUser, apiUser.role_name);

      if (isSystemLogin && user.role !== "SUPER_ADMIN") {
        localStorage.removeItem("token");
        await clearAuthCookie();
        return { error: "Only SUPER_ADMIN can use system login." };
      }

      // Sync the cookie to the Next.js server securely for Server Component routing
      await setAuthCookie(token, user.role);

      // Always persist so state survives the page navigation
      store.dispatch(
        loginSuccess({
          user,
          rememberMe: true,
        }),
      );

      // Redirect to the role-specific dashboard
      window.location.href = isSystemLogin
        ? "/system"
        : getDashboardRoute(user.role as Role);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid credentials";
      return { error: errorMessage };
    }
  };

  const [loginState, login, isLoginPending] = useActionState(
    loginAction,
    initialState,
  );

  const signupAction = async (
    _prevState: AuthState,
    _formData: FormData,
  ): Promise<AuthState> => {
    // Public user registration is restricted. All new users must be established by a system administrator to maintain organizational hierarchy.
    return {
      error: "Signup is not supported. Please contact your administrator.",
    };
  };

  const [signupState, signup, isSignupPending] = useActionState(
    signupAction,
    initialState,
  );

  const logout = async () => {
    try {
      await api.logout();
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
        login,
        loginState,
        isLoginPending,
        signup,
        signupState,
        isSignupPending,
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

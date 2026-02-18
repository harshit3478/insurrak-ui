"use client";

import { apiClient } from "@/lib/apiClient";
import { store } from "@/lib/store";
import { loginSuccess, logout as logoutAction } from "../lib/features/auth/authSlice";

import { AuthContextType, Role, ROLE_HIERARCHY, User } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useActionState,
  useState,
} from "react";

type AuthState = {
  success?: boolean;
  error?: string;
};

const initialState: AuthState = {
  success: undefined,
  error: undefined,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  // Login action
  const loginAction = async (
    prevState: AuthState,
    formData: FormData,
  ): Promise<AuthState> => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const rememberMe = Boolean(formData.get("rememberMe"));

      const { user } = await apiClient.login(email, password);

      store.dispatch(
        loginSuccess({
          user,
          rememberMe,
        }),
      );
      window.location.href = "/dashboard";

      return { success: true };
    } catch (error) {
      return { error: "Invalid credentials" };
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
    try {
      const name = String(formData.get("name"));
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));

      const data = (await apiClient.signup({ name, email, password })) as {
        user: User;
      };
       store.dispatch(
        loginSuccess({
          user: data.user,
          rememberMe: true,
        })
      );

      window.location.href = "/dashboard";
      return { success: true };
    } catch {
      return { error: "Signup failed" };
    }
  };

  const [signupState, signup, isSignupPending] = useActionState(
    signupAction,
    initialState,
  );

  const logout = async () => {
    try {
      await apiClient.logout();
      store.dispatch(logoutAction());
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const hasPermission = (requiredRole: Role): boolean => {
    const user = store.getState().auth.user;
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
  };

  return (
    <AuthContext.Provider
      value={{
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

"use client";

import { apiClient } from "@/lib/apiClient";
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
      const rememberMe = Boolean(formData.get("rememberMe"));

      // The apiClient.login function expects an object with email and password properties.
      const loginResponse = await apiClient.login({ email, password });

      const token = loginResponse.access_token;
      if (!token) {
        return { error: "Login failed: No token received." };
      }

      // Store the token so subsequent API calls are authenticated.
      localStorage.setItem("token", token);

      // After getting the token, fetch the user's details.
      const user = await apiClient.getCurrentUser();

      if (!user) {
        return { error: "Login failed: Could not fetch user details." };
      }

      store.dispatch(
        loginSuccess({
          user,
          rememberMe,
        })
      );
      window.location.href = "/dashboard";

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
    try {
      const name = String(formData.get("name"));
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));

      // Assuming signup creates the user, then we log them in to get a token.
      await apiClient.signup({ name, email, password });
      const loginResponse = await apiClient.login({ email, password });

      const token = loginResponse.access_token;
      if (!token) {
        return { error: "Signup succeeded, but automatic login failed." };
      }

      localStorage.setItem("token", token);
      const user = await apiClient.getCurrentUser();

      store.dispatch(
        loginSuccess({
          user,
          rememberMe: true,
        })
      );

      window.location.href = "/dashboard";
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      return { error: errorMessage };
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

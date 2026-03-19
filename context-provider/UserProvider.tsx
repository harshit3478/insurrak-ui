"use client";

import { createContext, useContext, useActionState, useState } from "react";
import { Role, UsersContextType, User } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { store } from "@/lib/store";
import {
  addUser,
  updateUser as updateUserInStore,
} from "@/lib/features/user/userSlice";

type UsersActionState = {
  error?: string;
  success?: boolean;
  data?: Record<string, any>;
};

const initialState: UsersActionState = {};

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  /* ================= CREATE USER ================= */
  const createUserAction = async (
    prevState: UsersActionState,
    formData: FormData,
  ): Promise<UsersActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const user = await apiClient.createUser({
        name: String(formData.get("username") || formData.get("name")),
        email: String(formData.get("email")),
        role: formData.get("role") as Role,
        password: String(formData.get("password")),
      });

      store.dispatch(addUser(user));
      return { 
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: user.id,
          role: user.role,
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      return { error: msg };
    }
  };

  const [createState, createUserBase, isCreating] = useActionState(
    createUserAction,
    initialState,
  );

  const createUser = async (formData: FormData) => {
    await createUserBase(formData);
  };

  const resetCreateState = () => {
    const fd = new FormData();
    fd.append("_reset", "true");
    createUserBase(fd);
  };

  /* ================= UPDATE USER ================= */
  const updateUserAction = async (
    prevState: UsersActionState,
    formData: FormData,
  ): Promise<UsersActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const userId = String(formData.get("id"));
      if (!userId || userId === "null") {
        throw new Error("User ID is missing for update");
      }

      const updateData: Partial<User> = {};
      const name = formData.get("name");
      const email = formData.get("email");
      const role = formData.get("role");

      if (name) updateData.name = String(name);
      if (email) updateData.email = String(email);
      if (role) updateData.role = role as Role;

      const updatedUser = await apiClient.updateProfile(userId, updateData);

      store.dispatch(updateUserInStore(updatedUser));
      
      return { 
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: updatedUser.id,
          role: updatedUser.role,
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user';
      return { error: msg };
    }
  };

  const [updateState, updateUserBase, isUpdating] = useActionState(
    updateUserAction,
    initialState,
  );

  const updateUser = (_userId: string) => async (formData: FormData) => {
    await updateUserBase(formData);
  };

  const resetUpdateState = () => {
    const fd = new FormData();
    fd.append("_reset", "true");
    updateUserBase(fd);
  };

  return (
    <UsersContext.Provider
      value={{
        createUserAction,
        updateUserAction,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used inside UsersProvider");
  }
  return context;
}

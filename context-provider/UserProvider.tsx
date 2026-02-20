"use client";

import { createContext, useContext, useActionState } from "react";
import { Role, UsersContextType } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { store } from "@/lib/store";
import {
  addUser,
  updateUser as updateUserInStore,
} from "@/lib/features/user/userSlice";

type UsersActionState = {
  error?: string;
  success?: boolean;
};

const initialState: UsersActionState = {};

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  /* ================= CREATE USER ================= */
  const createUserAction = async (
    prevState: UsersActionState,
    formData: FormData,
  ): Promise<UsersActionState> => {
    try {
      const user = await apiClient.createUser({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        role: formData.get("role") as Role,
        password: String(formData.get("password")),
      });

      store.dispatch(addUser(user));
      return { success: true };
    } catch {
      return { error: "Failed to create user" };
    }
  };

  const [createState, createUserBase, isCreating] = useActionState(
    createUserAction,
    initialState,
  );
  const createUser = async (formData: FormData) => {
    await createUserBase(formData);
  };

  /* ================= UPDATE USER ================= */
  const updateUserAction =
    (userId: string) =>
    async (
      prevState: UsersActionState,
      formData: FormData,
    ): Promise<UsersActionState> => {
      try {
        const updatedUser = await apiClient.updateProfile(userId, {
          name: String(formData.get("name")),
          email: String(formData.get("email")),
          // password: String(formData.get("password")),
          role: formData.get("role") as Role,
        });

        store.dispatch(updateUserInStore(updatedUser));
        return { success: true };
      } catch {
        return { error: "Failed to update user" };
      }
    };

  const [updateState, updateUserBase, isUpdating] = useActionState(
    updateUserAction(""),
    initialState,
  );

  const updateUser = (userId: string) => async (formData: FormData) => {
    const action = updateUserAction(userId);
    await action(updateState, formData);
  };

  return (
    <UsersContext.Provider
      value={{
        createUser,
        updateUser,

        createState,
        updateState,

        isCreating,
        isUpdating,
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

"use client";

import { createContext, useContext, useActionState } from "react";
import { UsersContextType, User } from "@/types";
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

/**
 * UsersProvider manages the lifecycle of platform users.
 * It handles account creation, profile updates, and role assignments,
 * orchestrating the synchronization between the UI state and the backend
 * administrative user endpoints.
 */
export function UsersProvider({ children }: { children: React.ReactNode }) {
  /* ================= CREATE USER ================= */
  const createUserAction = async (
    prevState: UsersActionState,
    formData: FormData,
  ): Promise<UsersActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const roleId = Number(formData.get("role_id"));
      if (!roleId) {
        throw new Error("Please select a role");
      }

      const permissionIds = formData
        .getAll("permission_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);

      const user = await apiClient.createUser({
        name: String(formData.get("username") || formData.get("name")),
        email: String(formData.get("email")),
        role: "COMPANY_USER",
        role_id: roleId,
        password: String(formData.get("password")),
        mobile_number: String(formData.get("mobile") || "") || null,
        designation: String(formData.get("designation") || "") || null,
        reports_to: Number(formData.get("reportsTo") || 0) || null,
        unit_id: Number(formData.get("unit_id") || 0) || null,
        permission_ids: permissionIds,
      });

      store.dispatch(addUser(user));
      return {
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: user.id,
          role: user.role,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user";
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

      const roleId = Number(formData.get("role_id"));
      if (!roleId) {
        throw new Error("Please select a role");
      }

      const permissionIds = formData
        .getAll("permission_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);

      const updatedUser = await apiClient.updateProfile(userId, {
        name: String(formData.get("name") || formData.get("username") || ""),
        email: String(formData.get("email") || ""),
        mobile: String(formData.get("mobile") || "") || null,
        designation: String(formData.get("designation") || "") || null,
        reportsTo: String(formData.get("reportsTo") || "") || null,
        roleId,
        permissionIds,
      });

      store.dispatch(updateUserInStore(updatedUser));

      return {
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: updatedUser.id,
          role: updatedUser.role,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update user";
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

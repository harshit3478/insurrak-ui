"use client";

import { createContext, useContext, useActionState } from "react";
import { ActionState, BranchesContextType, initialState } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { BranchCreate, BranchUpdate } from "@/types/api";

const BranchesContext = createContext<BranchesContextType | undefined>(undefined);

/**
 * BranchesProvider manages the organizational hierarchy of corporate branches.
 * It facilitates the creation and updating of branch-level metadata, ensuring 
 * that geographical and tax-specific data is correctly synchronized.
 */
export function BranchesProvider({ children }: { children: React.ReactNode }) {
  const createBranchAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const payload: BranchCreate = {
        name: String(formData.get("name")),
        state: String(formData.get("state") || ""),
        gst_number: String(formData.get("gst_number") || ""),
        address: String(formData.get("address") || ""),
        is_active: true,
      };

      const newBranch = await apiClient.createBranch(payload);
      
      return {
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: newBranch.id,
        },
      };
    } catch (err: any) {
      return { error: err.message || "Failed to create branch" };
    }
  };

  const updateBranchAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const id = Number(formData.get("id"));
      const payload: BranchUpdate = {
        name: String(formData.get("name")),
        state: String(formData.get("state") || ""),
        gst_number: String(formData.get("gst_number") || ""),
        address: String(formData.get("address") || ""),
      };

      await apiClient.updateBranch(id, payload);

      return { success: true };
    } catch (err: any) {
      return { error: err.message || "Failed to update branch" };
    }
  };

  return (
    <BranchesContext.Provider value={{ createBranchAction, updateBranchAction }}>
      {children}
    </BranchesContext.Provider>
  );
}

export function useBranches() {
  const context = useContext(BranchesContext);
  if (!context) {
    throw new Error("useBranches must be used within a BranchesProvider");
  }
  return context;
}

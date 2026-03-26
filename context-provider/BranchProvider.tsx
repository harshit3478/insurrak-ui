"use client";

import { createContext, useContext } from "react";
import { ActionState, BranchesContextType, initialState } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { UnitCreate, UnitUpdate } from "@/types/api";

const BranchesContext = createContext<BranchesContextType | undefined>(undefined);

export function BranchesProvider({ children }: { children: React.ReactNode }) {
  const createBranchAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const payload: UnitCreate = {
        name: String(formData.get("name")),
        state: String(formData.get("state") || "") || null,
        gstin: String(formData.get("gstin") || "") || null,
        address: String(formData.get("address") || "") || null,
        contact_person_name: String(formData.get("contact_person_name") || "") || null,
        contact_person_email: String(formData.get("contact_person_email") || "") || null,
        contact_person_phone: String(formData.get("contact_person_phone") || "") || null,
        is_active: true,
      };

      const newUnit = await apiClient.createUnit(payload);

      return {
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: newUnit.id,
        },
      };
    } catch (err: any) {
      return { error: err.message || "Failed to create unit" };
    }
  };

  const updateBranchAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const id = Number(formData.get("id"));
      const payload: UnitUpdate = {
        name: String(formData.get("name")),
        state: String(formData.get("state") || "") || null,
        gstin: String(formData.get("gstin") || "") || null,
        address: String(formData.get("address") || "") || null,
        contact_person_name: String(formData.get("contact_person_name") || "") || null,
        contact_person_email: String(formData.get("contact_person_email") || "") || null,
        contact_person_phone: String(formData.get("contact_person_phone") || "") || null,
      };

      await apiClient.updateUnit(id, payload);

      return { success: true };
    } catch (err: any) {
      return { error: err.message || "Failed to update unit" };
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

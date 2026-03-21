"use client";

import { createContext, useContext, useActionState } from "react";
import { ActionState, PoliciesContextType, initialState } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { PolicyRequestCreate, PolicyRequestUpdate } from "@/types/api";

const PoliciesContext = createContext<PoliciesContextType | undefined>(undefined);

/**
 * PoliciesProvider facilitates the procurement workflow for insurance policies.
 * It manages the submission of new policy requests and coordinates 
 * updates to existing procurement records.
 */
export function PoliciesProvider({ children }: { children: React.ReactNode }) {
  const createPolicyAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const payload: PolicyRequestCreate = {
        company_id: Number(formData.get("company_id")),
        unit_id: Number(formData.get("unit_id")),
        broker_id: Number(formData.get("broker_id")),
        line_of_business: String(formData.get("line_of_business")),
        asset_description: String(formData.get("asset_description") || ""),
        notes: String(formData.get("notes") || ""),
      };

      const newPolicy = await apiClient.createPolicyRequest(payload);

      return {
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: newPolicy.id,
          status: newPolicy.status,
        },
      };
    } catch (err: any) {
      return { error: err.message || "Failed to create policy" };
    }
  };

  const updatePolicyAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const id = Number(formData.get("id"));
      const payload: PolicyRequestUpdate = {
        line_of_business: String(formData.get("line_of_business")),
        asset_description: String(formData.get("asset_description") || ""),
        notes: String(formData.get("notes") || ""),
        policy_number: String(formData.get("policy_number") || ""),
        sum_insured: formData.get("sum_insured") ? Number(formData.get("sum_insured")) : undefined,
        policy_start_date: formData.get("policy_start_date") ? String(formData.get("policy_start_date")) : undefined,
        policy_end_date: formData.get("policy_end_date") ? String(formData.get("policy_end_date")) : undefined,
      };

      await apiClient.updatePolicyRequest(id, payload);

      return { success: true };
    } catch (err: any) {
      return { error: err.message || "Failed to update policy" };
    }
  };

  return (
    <PoliciesContext.Provider value={{ createPolicyAction, updatePolicyAction }}>
      {children}
    </PoliciesContext.Provider>
  );
}

export function usePolicies() {
  const context = useContext(PoliciesContext);
  if (!context) {
    throw new Error("usePolicies must be used within a PoliciesProvider");
  }
  return context;
}

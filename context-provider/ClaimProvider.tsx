"use client";

import { createContext, useContext, useActionState } from "react";
import { ActionState, ClaimsContextType, initialState } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { ClaimCreate, ClaimUpdate } from "@/types/api";

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

/**
 * ClaimsProvider orchestrates the insurance claim lifecycle.
 * It manages the registration of new claims and facilitates updates to 
 * ongoing claim files, linking them to their parent policy requests.
 */
export function ClaimsProvider({ children }: { children: React.ReactNode }) {
  const createClaimAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const payload: ClaimCreate = {
        policy_request_id: Number(formData.get("policy_request_id")),
        claim_type: String(formData.get("claim_type")),
        incident_date: String(formData.get("incident_date")),
        incident_description: String(formData.get("incident_description")),
        estimated_loss: formData.get("estimated_loss") ? Number(formData.get("estimated_loss")) : null,
        notes: String(formData.get("notes") || ""),
      };

      const newClaim = await apiClient.claims.create(payload);

      return {
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          id: newClaim.id,
          status: newClaim.status,
          company_id: newClaim.company_id,
        },
      };
    } catch (err: any) {
      return { error: err.message || "Failed to register claim" };
    }
  };

  const updateClaimAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      const id = Number(formData.get("id"));
      const payload: ClaimUpdate = {
        claim_type: String(formData.get("claim_type")),
        incident_date: String(formData.get("incident_date")),
        incident_description: String(formData.get("incident_description")),
        estimated_loss: formData.get("estimated_loss") ? Number(formData.get("estimated_loss")) : null,
        notes: String(formData.get("notes") || ""),
      };

      await apiClient.claims.update(id, payload);

      return { success: true };
    } catch (err: any) {
      return { error: err.message || "Failed to update claim" };
    }
  };

  return (
    <ClaimsContext.Provider value={{ createClaimAction, updateClaimAction }}>
      {children}
    </ClaimsContext.Provider>
  );
}

export function useClaims() {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error("useClaims must be used within a ClaimsProvider");
  }
  return context;
}

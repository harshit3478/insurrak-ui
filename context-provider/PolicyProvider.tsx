"use client";

import { createContext, useContext, useActionState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { ActionState, PoliciesContextType, initialState } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { PolicyRequestCreate, PolicyRequestUpdate } from "@/types/api";
import { invalidatePolicyCache } from "@/lib/features/policy/policySlice";

const PoliciesContext = createContext<PoliciesContextType | undefined>(undefined);

/**
 * PoliciesProvider facilitates the procurement workflow for insurance policies.
 * It manages the submission of new policy requests and coordinates
 * updates to existing procurement records.
 */
export function PoliciesProvider({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();

  const createPolicyAction = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    if (formData.has("_reset")) return initialState;

    try {
      // company_id comes from the authenticated user's profile, not the form,
      // because the form never exposes it and it must match the logged-in user's company.
      const companyId = user?.companyId ? Number(user.companyId) : 0;

      const payload: PolicyRequestCreate = {
        company_id: companyId,
        unit_id: Number(formData.get("unit_id")),
        broker_id: formData.get("broker_id") ? Number(formData.get("broker_id")) : null,
        line_of_business: String(formData.get("line_of_business")),
        asset_description: String(formData.get("asset_description") || "") || null,
        notes: String(formData.get("notes") || "") || null,
        sum_insured: formData.get("sum_insured") ? Number(formData.get("sum_insured")) : null,
        premium: formData.get("premium") ? Number(formData.get("premium")) : null,
        policy_start_date: formData.get("policy_start_date") ? String(formData.get("policy_start_date")) : null,
        policy_end_date: formData.get("policy_end_date") ? String(formData.get("policy_end_date")) : null,
        renewal_of_policy_id: formData.get("renewal_of_policy_id") ? Number(formData.get("renewal_of_policy_id")) : null,
      };

      const newPolicy = await apiClient.createPolicyRequest(payload);

      dispatch(invalidatePolicyCache());
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

      dispatch(invalidatePolicyCache());
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

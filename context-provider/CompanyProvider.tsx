"use client";

import { createContext, useContext, useActionState } from "react";
import { Company, CompaniesContextType } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { store } from "@/lib/store";
import {
  addCompany,
  updateCompany as updateCompanyInStore,
} from "@/lib/features/company/companySlice";

type CompanyActionState = {
  error?: string;
  success?: boolean;
};

const initialState: CompanyActionState = {};

const CompanyContext = createContext<CompaniesContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  /* ================= CREATE COMPANY ================= */
  const createCompanyAction = async (
    prevState: CompanyActionState,
    formData: FormData,
  ): Promise<CompanyActionState> => {
    try {
      const company = await apiClient.createCompany({
        name: String(formData.get("name")),
        companyId: String(formData.get("companyId")),
        admin: String(formData.get("admin")),
        adminEmail: String(formData.get("adminEmail")),
        branches: String(formData.get("branches")),
        activePolicies: String(formData.get("activePolicies")),
        status: 'Active', // Default status
      });

      store.dispatch(addCompany(company));
      return { success: true };
    } catch {
      return { error: "Failed to create company" };
    }
  };

  const [createState, createCompanyBase, isCreating] = useActionState(
    createCompanyAction,
    initialState,
  );
  const createCompany = async (formData: FormData) => {
    await createCompanyBase(formData);
  };

  /* ================= UPDATE COMPANY ================= */
  const updateCompanyAction =
    (companyId: number) =>
    async (
      prevState: CompanyActionState,
      formData: FormData,
    ): Promise<CompanyActionState> => {
      try {
        const updatedCompany = await apiClient.updateCompany(companyId, {
          name: String(formData.get("name")),
          companyId: String(formData.get("companyId")),
          admin: String(formData.get("admin")),
          adminEmail: String(formData.get("adminEmail")),
          branches: String(formData.get("branches")),
          activePolicies: String(formData.get("activePolicies")),
        });

        store.dispatch(updateCompanyInStore(updatedCompany));
        return { success: true };
      } catch {
        return { error: "Failed to update company" };
      }
    };

  const [updateState, , isUpdating] = useActionState(
    updateCompanyAction(0),
    initialState,
  );

  const updateCompany = (companyId: number) => async (formData: FormData) => {
    const action = updateCompanyAction(companyId);
    await action(updateState, formData);
  };

  return (
    <CompanyContext.Provider
      value={{
        createCompany,
        updateCompany,
        createState,
        updateState,
        isCreating,
        isUpdating,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useCompanies() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanies must be used inside CompanyProvider");
  }
  return context;
}
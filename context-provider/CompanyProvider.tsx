"use client";

import { createContext, useContext, useState, useActionState } from "react";
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
  data?: Record<string, any>;
};

const initialState: CompanyActionState = {};

const CompanyContext = createContext<CompaniesContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  /* ================= CREATE COMPANY ================= */
  const [createState, setCreateState] = useState<CompanyActionState>(initialState);
  const [isCreating, setIsCreating] = useState(false);

  const createCompany = async (formData: FormData) => {
    setIsCreating(true);
    setCreateState({});
    try {
      // 1. Onboard Company Super Admin
      const superAdminUser = await apiClient.onboardCompanySuperAdmin({
        company_name: String(formData.get("name")),
        username: String(formData.get("admin") || 'admin'),
        email: String(formData.get("adminEmail")),
        password: String(formData.get("adminPassword")),
      });
      
      const companyId = superAdminUser.company_id;

      // 2. Update remaining fields
      let company = await apiClient.updateCompany(companyId, {
        name: String(formData.get("name")),
        email: String(formData.get("email") || ''),
        mobile_number: String(formData.get("mobile_number") || ''),
        address: String(formData.get("address") || ''),
        gst_number: String(formData.get("gst_number") || ''),
        status: 'Active', 
      });

      // 3. Keep frontend properties
      company = {
        ...company,
        companyId: String(formData.get("companyId")),
        admin: String(formData.get("admin")),
        adminEmail: String(formData.get("adminEmail")),
        branches: String(formData.get("branches")),
        activePolicies: String(formData.get("activePolicies")),
      };

      store.dispatch(addCompany(company));
      setCreateState({ 
        success: true, 
        data: { 
          ...Object.fromEntries(formData.entries()), 
          assignedCompanyId: `COM${String(companyId).padStart(8, '0')}`
        } 
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create company';
      setCreateState({ error: msg });
    } finally {
      setIsCreating(false);
    }
  };

  /* ================= UPDATE COMPANY ================= */
  const [updateState, setUpdateState] = useState<CompanyActionState>(initialState);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCompany = (companyId: number) => async (formData: FormData) => {
    setIsUpdating(true);
    setUpdateState({});
    try {
      let updatedCompany = await apiClient.updateCompany(companyId, {
        name: String(formData.get("name")),
        email: String(formData.get("email") || ''),
        mobile_number: String(formData.get("mobile_number") || ''),
        address: String(formData.get("address") || ''),
        gst_number: String(formData.get("gst_number") || ''),
      });
      
      updatedCompany = {
        ...updatedCompany,
        companyId: String(formData.get("companyId")),
        admin: String(formData.get("admin")),
        adminEmail: String(formData.get("adminEmail")),
        branches: String(formData.get("branches")),
        activePolicies: String(formData.get("activePolicies")),
      };

      store.dispatch(updateCompanyInStore(updatedCompany));
      setUpdateState({ success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update company';
      setUpdateState({ error: msg });
    } finally {
      setIsUpdating(false);
    }
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
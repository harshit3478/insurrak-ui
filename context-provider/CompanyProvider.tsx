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
  const [createState, setCreateState] =
    useState<CompanyActionState>(initialState);
  const [isCreating, setIsCreating] = useState(false);

  const createCompany = async (formData: FormData) => {
    setIsCreating(true);
    setCreateState({});
    try {
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const adminUsername = String(formData.get("admin") || "").trim();
      const adminEmail = String(formData.get("adminEmail") || "").trim();
      const adminPassword = String(formData.get("adminPassword") || "").trim();

      if (!name || !email || !adminUsername || !adminEmail || !adminPassword) {
        setCreateState({
          error:
            "Please fill required fields: company name, company email, admin username, admin email, and admin password.",
        });
        return;
      }

      // Use the dedicated backend company onboarding endpoint.
      let company = await apiClient.createCompany({
        name,
        companyId: String(formData.get("companyId") || ""),
        admin: adminUsername,
        adminEmail,
        adminPassword,
        branches: String(formData.get("branches") || "0"),
        activePolicies: String(formData.get("activePolicies") || "0"),
        email,
        mobile_number: String(formData.get("mobile_number") || ""),
        address: String(formData.get("address") || ""),
        gst_number: String(formData.get("gst_number") || ""),
        adminDesignation: String(formData.get("adminDesignation") || ""),
      });

      // Keep frontend-only fields for table view.
      company = {
        ...company,
        companyId: String(formData.get("companyId")),
        admin: adminUsername,
        adminEmail,
        branches: String(formData.get("branches")),
        activePolicies: String(formData.get("activePolicies")),
      };

      store.dispatch(addCompany(company));
      setCreateState({
        success: true,
        data: {
          ...Object.fromEntries(formData.entries()),
          assignedCompanyId: `COM${String(company.id).padStart(8, "0")}`,
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create company";
      setCreateState({ error: msg });
    } finally {
      setIsCreating(false);
    }
  };

  /* ================= UPDATE COMPANY ================= */
  const [updateState, setUpdateState] =
    useState<CompanyActionState>(initialState);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCompany = (companyId: number) => async (formData: FormData) => {
    setIsUpdating(true);
    setUpdateState({});
    try {
      let updatedCompany = await apiClient.updateCompany(companyId, {
        name: String(formData.get("name")),
        email: String(formData.get("email") || ""),
        mobile_number: String(formData.get("mobile_number") || ""),
        address: String(formData.get("address") || ""),
        gst_number: String(formData.get("gst_number") || ""),
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
      setUpdateState({ success: true, data: updatedCompany });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update company";
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

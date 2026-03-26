"use client";

import { createContext, useContext, useState } from "react";
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

  const createCompany = async (data: { name: string; adminEmail: string }) => {
    setIsCreating(true);
    setCreateState({});
    try {
      const company = await apiClient.createCompany({
        name: data.name,
        adminEmail: data.adminEmail,
      });

      store.dispatch(addCompany(company));
      setCreateState({
        success: true,
        data: {
          name: data.name,
          adminEmail: data.adminEmail,
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

  const resetCreateState = () => setCreateState(initialState);

  /* ================= UPDATE COMPANY ================= */
  const [updateState, setUpdateState] =
    useState<CompanyActionState>(initialState);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCompany =
    (companyId: number) => async (data: Partial<Company>) => {
      setIsUpdating(true);
      setUpdateState({});
      try {
        const updatedCompany = await apiClient.updateCompany(companyId, {
          name: data.name,
          email: data.email,
          mobile_number: data.mobile_number,
          address: data.address,
          gst_number: data.gst_number,
        });

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

  const resetUpdateState = () => setUpdateState(initialState);

  return (
    <CompanyContext.Provider
      value={{
        createCompany,
        updateCompany,
        createState,
        updateState,
        isCreating,
        isUpdating,
        resetCreateState,
        resetUpdateState,
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

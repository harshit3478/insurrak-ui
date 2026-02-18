"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/context-provider/CompanyProvider";
import { CompanyForm } from "@/components/Company/CompanyForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";

export default function AddCompanyPage() {
  const { createCompany, createState, isCreating } = useCompanies();
  const router = useRouter();

  if (createState.success) {
    return (
      <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
        <SuccessHeader
          title="Company Registered"
          subtitle="Successfully registered a new company!"
        />
        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm min-h-[400px] flex items-center justify-center">
          <button
            onClick={() => router.push('/company')}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
      <FormHeader
        title="Add Company"
        subtitle="Register a new Company into the platform"
      />
      <CompanyForm action={createCompany} pending={isCreating} />

      {createState.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">{createState.error}</p>
      )}
    </div>
  );
}

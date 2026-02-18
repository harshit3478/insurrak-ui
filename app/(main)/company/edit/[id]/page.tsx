"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useCompanies } from "@/context-provider/CompanyProvider";
import { CompanyForm } from "@/components/Company/CompanyForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { selectCompanies } from "@/lib/features/company/companySelectors";
import { Company } from "@/types";

export default function EditCompanyPage() {
  const { updateCompany, updateState, isUpdating } = useCompanies();
  const router = useRouter();
  const companies = useSelector(selectCompanies);
  const params = useParams();

  // The `params` object can be undefined on initial render in some Next.js versions/setups.
  // Accessing it safely prevents runtime errors.
  const companyId = params.id as string;

  // Find the company to edit from the Redux store.
  const companyToEdit = companyId
    ? companies.find((c: Company) => String(c.id) === companyId)
    : undefined;

  if (updateState.success) {
    return (
      <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
        <SuccessHeader
          title="Company Updated"
          subtitle="Successfully updated company details!"
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

  // Handle case where company is not found or params are not yet available.
  if (!companyToEdit && companyId) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Company not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-primary hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
      <FormHeader
        title="Edit Company"
        subtitle={companyToEdit ? `Update details for ${companyToEdit.name}` : "Loading..."}
      />
      {companyToEdit && (
        <CompanyForm
          action={updateCompany(Number(companyId))}
          pending={isUpdating}
          defaultValues={companyToEdit}
          isEdit
        />
      )}
      {updateState.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
          {updateState.error}
        </p>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCompanies } from "@/context-provider/CompanyProvider";
import { useAuth } from "@/context-provider/AuthProvider";
import { CompanyForm } from "@/components/Company/CompanyForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { Company } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { Loading } from "@/components/ui/Loading";

export default function EditCompanyPage() {
  const { updateCompany, updateState, isUpdating } = useCompanies();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const basePath = user?.role === "SUPER_ADMIN" ? "/system" : "/company";

  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const updatedCompany =
    (updateState.data as Partial<Company> | undefined) ?? undefined;

  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      try {
        const data = await apiClient.getCompanyById(Number(companyId));
        setCompanyToEdit(data);
      } catch (error) {
        console.error("Failed to fetch company", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [companyId]);

  if (updateState.success) {
    return (
      <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
        <SuccessHeader
          title="Company Updated"
          subtitle={`Updated values for ${updatedCompany?.name || companyToEdit?.name || "company"}`}
        />
        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Company Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {updatedCompany?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Company Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {updatedCompany?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Mobile Number</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {updatedCompany?.mobile_number || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">GST Number</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {updatedCompany?.gst_number || "-"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-400 mb-1">Address</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {updatedCompany?.address || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-3">
            <button
              onClick={() => router.push(basePath)}
              className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

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
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title={companyToEdit ? companyToEdit.name : "Edit Company"}
        subtitle={companyToEdit ? "Update company details" : "Loading..."}
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

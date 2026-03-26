"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormHeader } from "@/components/ui/FormCommon";
import { Loading } from "@/components/ui/Loading";
import { apiClient } from "@/lib/apiClient";
import { Company } from "@/types";

export default function ViewCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = Number(params.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const data = await apiClient.getCompanyById(companyId);
        setCompany(data);
      } catch (error) {
        console.error("Failed to fetch company", error);
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(companyId)) {
      fetchCompany();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  if (loading) return <Loading />;

  if (!company) {
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
        title="View Company"
        subtitle={`Details for ${company.name}`}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">Company Name</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.email || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mobile Number</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.mobile_number || "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.address || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">GST Number</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.gst_number || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.status || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Company Superadmin</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.admin || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Superadmin Email</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {company.adminEmail || "-"}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-dark-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-3 dark:text-gray-300 dark:hover:bg-dark-2"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

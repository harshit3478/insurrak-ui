"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/context-provider/CompanyProvider";
import { CompanyForm } from "@/components/Company/CompanyForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { Building2 } from "lucide-react";

export default function AddCompanyPage() {
  const { createCompany, createState, isCreating } = useCompanies();
  const router = useRouter();

  if (createState.success) {
    const summaryData = createState.data || {};

    return (
      <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
        <SuccessHeader
          title="Company Registered"
          subtitle="Successfully added a new company!"
        />

        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm mt-8 relative">
          {/* Header Title with Icon */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Registration Summary</h2>
          </div>

          <hr className="mb-8 border-gray-200 dark:border-dark-3" />

          {/* Three-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Column 1 */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Details</h3>
              <div>
                <p className="text-sm text-gray-400 mb-1">Company Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Assigned Company ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.assignedCompanyId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.mobile_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">CIN Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.companyId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Company Website</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.website || '-'}</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <h3 className="font-semibold text-transparent select-none mb-4 hidden md:block">Spacer</h3>
              <div>
                <p className="text-sm text-gray-400 mb-1">Company Address</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">State</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.state || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">City</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.city || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Pincode</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.pincode || '-'}</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Admin Details</h3>
              <div>
                <p className="text-sm text-gray-400 mb-1">Admin Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.adminName || summaryData.admin || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email Address</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.adminEmail || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.adminPhone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Designation</p>
                <p className="font-medium text-gray-900 dark:text-white">{summaryData.adminDesignation || '-'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-3">
            <button
              onClick={() => router.push('/company')}
              className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
            >
              Go to Company List
            </button>
          </div>
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

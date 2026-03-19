"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/context-provider/UserProvider";
import { UserForm } from "@/components/Users/UserForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { User2 } from "lucide-react";
import { initialState } from "@/types";

export default function AddUserPage() {
  const { createUserAction } = useUsers();
  const [createState, createUser, isCreating] = useActionState(createUserAction, initialState);
  const router = useRouter();

  if (createState.success) {
    const summaryData = createState.data || {};

    return (
      <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
        <SuccessHeader
          title="Employee Added"
          subtitle="Successfully added a new employee to the platform!"
        />

        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm mt-8 relative">
          {/* Header Title with Icon */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
              <User2 className="w-6 h-6 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Employee Registration Summary</h2>
          </div>

          <hr className="mb-8 border-gray-200 dark:border-dark-3" />

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Employee Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.name || summaryData.username || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Username / ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.username || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.email || '-'}</p>
                </div>
              </div>
            </div>

            <div className="md:pt-12">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Designation</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.designation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Role Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.role || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Reports To</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.reportsTo || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-3">
            <button
              onClick={() => router.push('/users')}
              className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
            >
              Go to Employee List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
      <FormHeader
        title="Add Employee"
        subtitle="Register a new Employee into the platform"
      />
      <UserForm action={createUser} pending={isCreating} />
      {createState.error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">{createState.error}</p>
      )}
    </div>
  );
}

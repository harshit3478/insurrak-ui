"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/context-provider/UserProvider";
import { UserForm } from "@/components/Users/UserForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";

export default function AddUserPage() {
  const { createUser, createState, isCreating } = useUsers();
  const router = useRouter();

  if (createState.success) {
    return (
      <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
        <SuccessHeader
          title="Employee Added"
          subtitle="Successfully added a new employee!"
        />
        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm min-h-[400px] flex items-center justify-center">
          <button
            onClick={() => router.push('/users')}
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

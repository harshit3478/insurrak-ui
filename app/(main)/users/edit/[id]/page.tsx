"use client";
import { useActionState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useUsers } from "@/context-provider/UserProvider";
import { UserForm } from "@/components/Users/UserForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { selectUsers } from "@/lib/features/user/userSelectors";
import { User, initialState } from "@/types";

export default function EditUserPage() {
  const router = useRouter();
  const users = useSelector(selectUsers);
  const params = useParams();

  const userId = params.id as string;
  const { updateUserAction } = useUsers();
  const [updateState, updateUser, isUpdating] = useActionState(updateUserAction, initialState);

  // Find the user to edit from the Redux store.
  const userToEdit = userId
    ? users.find((u: User) => u.id === userId)
    : undefined;

  if (updateState.success) {
    const summaryData = updateState.data || {};

    return (
      <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
        <SuccessHeader
          title="Employee Updated"
          subtitle="Successfully updated employee details!"
        />
        
        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm mt-8 relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Updated Employee Summary</h2>
          </div>

          <hr className="mb-8 border-gray-200 dark:border-dark-3" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Updated Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userToEdit?.name || summaryData.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userToEdit?.email || summaryData.email || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Updated Roles</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Role Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{summaryData.role || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">User ID</p>
                  <p className="font-medium text-gray-900 dark:text-white text-xs">{userId}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-3">
            <button
              onClick={() => router.push('/users')}
              className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userToEdit && userId) {
    return (
      <div className="p-8">
        <p className="text-gray-500">User not found.</p>
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
        title="Edit Employee"
        subtitle={userToEdit ? `Update details for ${userToEdit.name}` : "Loading..."}
      />

      {userToEdit && (
        <UserForm
          action={updateUser}
          pending={isUpdating}
          defaultValues={userToEdit}
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

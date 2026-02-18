"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useUsers } from "@/context-provider/UserProvider";
import { UserForm } from "@/components/Users/UserForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { selectUsers } from "@/lib/features/user/userSelectors";
import { User } from "@/types";

export default function EditUserPage() {
  const { updateUser, updateState, isUpdating } = useUsers();
  const router = useRouter();
  const users = useSelector(selectUsers);
  const params = useParams();

  const userId = params.id as string;

  // Find the user to edit from the Redux store.
  const userToEdit = userId
    ? users.find((u: User) => u.id === userId)
    : undefined;

  if (updateState.success) {
    return (
      <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
        <SuccessHeader
          title="Employee Updated"
          subtitle="Successfully updated employee details!"
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
    <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-full">
      <FormHeader
        title="Edit Employee"
        subtitle={userToEdit ? `Update details for ${userToEdit.name}` : "Loading..."}
      />

      {userToEdit && (
        <UserForm
          action={updateUser(userId)}
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

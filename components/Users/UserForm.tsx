"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput } from "@/components/ui/FormCommon";
import { User } from "@/types";
import { Select } from "../ui-elements/FormElements/select";

type UserFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<User>;
  isEdit?: boolean;
  onSuccess?: () => void;
};

/**
 * UserForm manages the creation and modification of user accounts.
 * It handles basic identity details, role assignments (RBAC), and 
 * organizational context such as reporting lines and company associations.
 */
export function UserForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: UserFormProps) {
  const router = useRouter();

  return (
    <form action={action}>
      <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {isEdit && defaultValues?.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Basic Details */}
          <div className="flex-1">
            <FormSection title="Basic Details">
              <div className="flex gap-4">
                <FormInput
                  label="Full Name"
                  name="name"
                  defaultValue={defaultValues?.name}
                  required
                  className="flex-1"
                  disabled={isEdit}
                />
              </div>
              <FormInput
                label="Email"
                name="email"
                type="email"
                defaultValue={defaultValues?.email}
                required
                disabled={isEdit}
              />
              {/* Note: Additional fields like phone and designation can be enabled here if required by the User schema. */}
            </FormSection>

            <FormSection title="Role Assignment" className="mt-8">
              <Select
                label=""
                name="role"
                items={[
                  { label: "User", value: "COMPANY_USER" },
                  { label: "Manager", value: "BRANCH_ADMIN" },
                  { label: "Admin", value: "COMPANY_ADMIN" },
                ]}
                defaultValue={defaultValues?.role || "COMPANY_USER"}
                className="col-span-2 sm:col-span-1"
              />
            </FormSection>
          </div>

          {/* Divider (Visual only) */}
          <div className="hidden lg:block w-px bg-gray-100 dark:bg-dark-3" />

          {/* Right Column - Organizational Context */}
          <div className="flex-1">
            <FormSection title="Organizational Context">
              <FormInput
                label="Designation"
                name="designation"
                defaultValue={defaultValues?.designation || ""}
                disabled={isEdit}
              />
              <FormInput
                label="Reports To (User ID)"
                name="reportsTo"
                defaultValue={defaultValues?.reportsTo || ""}
                disabled={isEdit}
              />
              <FormInput
                label="Assigned Company ID"
                name="companyId"
                defaultValue={defaultValues?.companyId || ""}
                disabled={isEdit}
              />
            </FormSection>
            {!isEdit && (
              <FormSection title="Security">
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  required
                />
              </FormSection>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
          >
            {pending
              ? "Saving..."
              : isEdit
                ? "Update Employee"
                : "Create Employee"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 border border-gray-200 dark:border-dark-3 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput } from "@/components/ui/FormCommon";
import { UnitRead } from "@/types/api";

type UnitFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<UnitRead>;
  isEdit?: boolean;
};

export function BranchForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: UnitFormProps) {
  const router = useRouter();

  return (
    <form action={action}>
      <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {isEdit && defaultValues?.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="Unit Details">
            <FormInput
              label="Unit Name*"
              name="name"
              defaultValue={defaultValues?.name}
              placeholder="e.g. Mumbai Plant"
              required
              fullWidth
            />

            <FormInput
              label="GSTIN"
              name="gstin"
              defaultValue={defaultValues?.gstin || ""}
              placeholder="27AAAAAAAAAAAAA"
              fullWidth
            />

            <FormInput
              label="State / Region"
              name="state"
              defaultValue={defaultValues?.state || ""}
              placeholder="e.g. Maharashtra"
              fullWidth
            />
          </FormSection>

          <FormSection title="Location & Contact">
            <FormInput
              label="Address"
              name="address"
              defaultValue={defaultValues?.address || ""}
              placeholder="Full street address..."
              fullWidth
            />

            <FormInput
              label="Contact Person"
              name="contact_person_name"
              defaultValue={defaultValues?.contact_person_name || ""}
              placeholder="e.g. Ramesh Kumar"
              fullWidth
            />

            <FormInput
              label="Contact Email"
              name="contact_person_email"
              defaultValue={defaultValues?.contact_person_email || ""}
              placeholder="contact@company.com"
              fullWidth
            />

            <FormInput
              label="Contact Phone"
              name="contact_person_phone"
              defaultValue={defaultValues?.contact_person_phone || ""}
              placeholder="+91 98765 43210"
              fullWidth
            />
          </FormSection>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50"
          >
            {pending ? "Saving..." : isEdit ? "Update Unit" : "Add Unit"}
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

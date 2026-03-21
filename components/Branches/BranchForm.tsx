"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput } from "@/components/ui/FormCommon";
import { BranchRead } from "@/types/api";

type BranchFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<BranchRead>;
  isEdit?: boolean;
};

/**
 * BranchForm enables the management of corporate branch locations.
 * It captures essential geographical and tax-related metadata (GST, State) 
 * for organizational units.
 */
export function BranchForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: BranchFormProps) {
  const router = useRouter();

  return (
    <form action={action}>
      <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {isEdit && defaultValues?.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="Branch Details">
            <FormInput
              label="Branch Name*"
              name="name"
              defaultValue={defaultValues?.name}
              placeholder="e.g. Mumbai Head Office"
              required
              fullWidth
            />
            
            <FormInput
              label="GST Number"
              name="gst_number"
              defaultValue={defaultValues?.gst_number || ""}
              placeholder="27AAAAAAAAAAAAA"
              fullWidth
            />

            <FormInput
              label="State/Region"
              name="state"
              defaultValue={defaultValues?.state || ""}
              placeholder="e.g. Maharashtra"
              fullWidth
            />
          </FormSection>

          <FormSection title="Location & Contact">
            <FormInput
              label="Branch Address"
              name="address"
              defaultValue={defaultValues?.address || ""}
              placeholder="Full street address..."
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
            {pending ? "Saving..." : isEdit ? "Update Branch" : "Add Branch"}
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

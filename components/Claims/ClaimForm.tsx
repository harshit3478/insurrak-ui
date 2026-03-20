"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, FormTextarea } from "@/components/ui/FormCommon";
import { Select } from "@/components/ui-elements/FormElements/select";
import { ClaimRead } from "@/types/api";

type ClaimFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<ClaimRead>;
  isEdit?: boolean;
};

const CLAIM_TYPES = [
  { value: "Fire", label: "Fire" },
  { value: "Marine", label: "Marine" },
  { value: "Motor", label: "Motor" },
  { value: "Health", label: "Health" },
  { value: "Liability", label: "Liability" },
  { value: "Engineering", label: "Engineering" },
  { value: "Miscellaneous", label: "Miscellaneous" },
];

/**
 * ClaimForm facilitates the registration and management of insurance claims.
 * It links claims to specific policy requests and records incident details, 
 * estimated losses, and professional notes.
 */
export function ClaimForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: ClaimFormProps) {
  const router = useRouter();

  return (
    <form action={action}>
      <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {isEdit && defaultValues?.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="Claim Information">
            {!isEdit && (
              <FormInput
                label="Policy Request ID*"
                name="policy_request_id"
                type="number"
                defaultValue={defaultValues?.policy_request_id}
                required
                placeholder="e.g. 1042"
              />
            )}
            
            <Select
              label="Claim Type*"
              name="claim_type"
              items={CLAIM_TYPES}
              defaultValue={defaultValues?.claim_type || ""}
              placeholder="Select Type"
              required
            />

            <FormInput
              label="Date of Incident*"
              name="incident_date"
              type="date"
              defaultValue={defaultValues?.incident_date?.split("T")[0]}
              required
            />

            <FormInput
              label="Estimated Loss Amount (INR)"
              name="estimated_loss"
              type="number"
              defaultValue={defaultValues?.estimated_loss || ""}
              placeholder="e.g. 500000"
            />
          </FormSection>

          <FormSection title="Incident Details">
            <FormTextarea
              label="Incident Description*"
              name="incident_description"
              defaultValue={defaultValues?.incident_description || ""}
              required
              rows={4}
              placeholder="Describe what happened..."
            />
            
            <FormTextarea
              label="Additional Notes"
              name="notes"
              defaultValue={defaultValues?.notes || ""}
              rows={3}
              placeholder="Any extra context or surveyor details..."
            />
          </FormSection>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50"
          >
            {pending ? "Saving..." : isEdit ? "Update Claim" : "Register Claim"}
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

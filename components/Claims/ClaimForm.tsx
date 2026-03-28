"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, FormTextarea } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";
import { ClaimRead, PolicyRequestRead } from "@/types/api";

type ClaimFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<ClaimRead>;
  isEdit?: boolean;
  defaultPolicyRequestId?: number;
};

const CLAIM_TYPES = [
  "Standard Fire & Special Perils Policy",
  "Industrial All Risk Policy",
  "Burglary / Theft Insurance",
  "Machinery Breakdown Insurance",
  "Boiler & Pressure Plant Insurance",
  "Electronic Equipment Insurance",
  "Marine Cargo (Transit) Insurance",
  "Marine Open Policy / Annual Marine Policy",
  "Erection All Risk (EAR) Insurance",
  "Contractors All Risk (CAR) Insurance",
  "Loss of Profit / Business Interruption Policy",
  "Group Mediclaim / Group Health Insurance",
  "Group Personal Accident Policy",
  "Group Term Life Insurance",
  "Workmen Compensation Policy",
  "Public Liability Insurance",
  "Product Liability Insurance",
  "Commercial General Liability (CGL)",
  "Directors & Officers (D&O) Liability Insurance",
  "Professional Indemnity Insurance",
  "Cyber Risk / Data Breach Insurance",
  "Fidelity Guarantee Insurance",
  "Money Insurance",
  "Vehicle / Motor Insurance (Fleet Policy)",
  "Keyman Insurance Policy",
  "Trade Credit Insurance",
  "Environmental Liability Insurance",
  "Property All Risk Policy",
  "Terrorism Insurance Cover",
  "Stock Deterioration Insurance",
];

const CLAIMABLE_STATUSES = new Set([
  "RISK_HELD",
  "POLICY_ISSUED_SOFT",
  "POLICY_ISSUED_HARD",
  "ACTIVE",
  "EXPIRING",
]);

export function ClaimForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
  defaultPolicyRequestId,
}: ClaimFormProps) {
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyRequestRead[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    defaultPolicyRequestId ? String(defaultPolicyRequestId) : ""
  );

  useEffect(() => {
    if (!isEdit) {
      apiClient.getPolicyRequests().then((all) => {
        setPolicies(all.filter((p) => CLAIMABLE_STATUSES.has(p.status)));
      }).catch(console.error);
    }
  }, [isEdit]);

  return (
    <form action={action}>
      <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {isEdit && defaultValues?.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="Claim Information">
            {!isEdit && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Policy*
                </label>
                <select
                  name="policy_request_id"
                  value={selectedPolicyId}
                  onChange={e => setSelectedPolicyId(e.target.value)}
                  required
                  className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
                >
                  <option value="">Select Policy</option>
                  {policies.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      PR-{p.id} — {p.line_of_business}{p.unit_name ? ` (${p.unit_name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Claim Type*
              </label>
              <select
                name="claim_type"
                defaultValue={defaultValues?.claim_type || ""}
                required
                className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
              >
                <option value="">Select Claim Type</option>
                {CLAIM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="Date of Incident*"
              name="incident_date"
              type="date"
              defaultValue={defaultValues?.incident_date?.split("T")[0]}
              required
            />

            <FormInput
              label="Estimated Loss Amount (₹)"
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

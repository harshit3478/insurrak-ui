"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, FormTextarea } from "@/components/ui/FormCommon";
import { Select } from "@/components/ui-elements/FormElements/select";
import { apiClient } from "@/lib/apiClient";
import { Policy } from "@/types";
import { UnitRead, PolicyRequestRead } from "@/types/api";

type PolicyFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<Policy>;
  isEdit?: boolean;
  defaultUnitId?: number;
};

const POLICY_TYPES = [
  { label: "Fire", value: "Fire" },
  { label: "Marine", value: "Marine" },
  { label: "Motor", value: "Motor" },
  { label: "Health", value: "Health" },
  { label: "Liability", value: "Liability" },
  { label: "Engineering", value: "Engineering" },
  { label: "Miscellaneous", value: "Miscellaneous" },
];

export function PolicyForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
  defaultUnitId,
}: PolicyFormProps) {
  const router = useRouter();
  const [units, setUnits] = useState<UnitRead[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    defaultUnitId ? String(defaultUnitId) : ""
  );
  const [unitPolicies, setUnitPolicies] = useState<PolicyRequestRead[]>([]);
  const [isRenewal, setIsRenewal] = useState(false);

  useEffect(() => {
    apiClient.getAllUnits().then(setUnits).catch(console.error);
  }, []);

  // Load existing policies for the selected unit (for renewal dropdown)
  useEffect(() => {
    const uid = defaultUnitId || (selectedUnitId ? Number(selectedUnitId) : null);
    if (!uid || isEdit) return;
    apiClient.getUnitPolicies(uid).then(setUnitPolicies).catch(console.error);
  }, [selectedUnitId, defaultUnitId, isEdit]);

  return (
    <form action={action}>
      <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {isEdit && defaultValues?.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="Core Information">
            {!isEdit && (
              <>
                {defaultUnitId ? (
                  <>
                    <input type="hidden" name="unit_id" value={defaultUnitId} />
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Unit</p>
                      <p className="text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-dark-3 rounded-lg border border-gray-200 dark:border-dark-3">
                        {units.find(u => u.id === defaultUnitId)?.name || `Unit #${defaultUnitId}`}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Unit*</label>
                    <select
                      name="unit_id"
                      value={selectedUnitId}
                      onChange={(e) => { setSelectedUnitId(e.target.value); setIsRenewal(false); }}
                      className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
                    >
                      <option value="">Choose Unit</option>
                      {units.map(u => (
                        <option key={u.id} value={String(u.id)}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <Select
              label="Line of Business*"
              name="line_of_business"
              items={POLICY_TYPES}
              defaultValue={defaultValues?.type || ""}
              placeholder="Select Policy Type"
              className="mb-4"
            />

            {/* Renewal section (create mode only) */}
            {!isEdit && unitPolicies.length > 0 && (
              <div className="mb-4 border border-gray-100 dark:border-dark-3 rounded-lg p-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRenewal}
                    onChange={(e) => { setIsRenewal(e.target.checked); }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Renewing an existing policy?
                  </span>
                </label>
                {isRenewal && (
                  <Select
                    label="Policy to renew"
                    name="renewal_of_policy_id"
                    items={unitPolicies.map(p => ({
                      label: `${p.policy_number || "#" + p.id} — ${p.line_of_business} (${p.status.replace(/_/g, " ")})`,
                      value: String(p.id),
                    }))}
                    defaultValue=""
                    placeholder="Choose existing policy..."
                  />
                )}
              </div>
            )}
          </FormSection>

          <FormSection title="Policy Details">
            <FormInput
              label="Policy Number"
              name="policy_number"
              defaultValue={defaultValues?.policyNumber}
              placeholder="TBD or Existing Number"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Sum Insured (₹)"
                name="sum_insured"
                type="number"
                defaultValue={defaultValues?.sumInsured}
              />
              <FormInput
                label="Premium (₹)"
                name="premium"
                type="number"
                defaultValue={defaultValues?.premium}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                name="policy_start_date"
                type="date"
                defaultValue={defaultValues?.startDate?.split("T")[0]}
              />
              <FormInput
                label="End Date"
                name="policy_end_date"
                type="date"
                defaultValue={defaultValues?.endDate?.split("T")[0]}
              />
            </div>

            <FormTextarea
              label="Asset Description & Risk Details"
              name="asset_description"
              placeholder="Describe the insured asset..."
              rows={3}
            />
          </FormSection>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50"
          >
            {pending ? "Saving..." : isEdit ? "Update Policy" : "Create Policy Request"}
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

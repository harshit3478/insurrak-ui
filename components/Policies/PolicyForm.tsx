"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, FormTextarea } from "@/components/ui/FormCommon";
import { Select } from "@/components/ui-elements/FormElements/select";
import { apiClient } from "@/lib/apiClient";
import { Policy } from "@/types";
import { CompanyRead, BranchRead, UnitRead, BrokerRead } from "@/types/api";

type PolicyFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<Policy>;
  isEdit?: boolean;
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

/**
 * PolicyForm provides a standardized interface for both creating and editing 
 * insurance policy requests. It handles dynamic data loading for companies, 
 * branches, and units, and manages complex form state for policy metadata.
 */
export function PolicyForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: PolicyFormProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRead[]>([]);
  const [branches, setBranches] = useState<BranchRead[]>([]);
  const [units, setUnits] = useState<UnitRead[]>([]);
  const [brokers, setBrokers] = useState<BrokerRead[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(defaultValues?.companyId || "");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [cData, bData, brData] = await Promise.all([
          apiClient.getAllCompanies(),
          apiClient.getAllBranches(),
          apiClient.getAllBrokers(),
        ]);
        setCompanies(cData as any);
        setBranches(bData);
        setBrokers(brData);
      } catch (err) {
        console.error("Failed to load form masters:", err);
      }
    };
    loadMasters();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      apiClient.getUnitsByBranch(Number(selectedBranchId)).then(setUnits).catch(console.error);
    } else {
      setUnits([]);
    }
  }, [selectedBranchId]);

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
                <Select
                  label="Select Company*"
                  name="company_id"
                  items={companies.map(c => ({ label: c.name, value: String(c.id) }))}
                  defaultValue={selectedCompanyId}
                  placeholder="Choose Company"
                  className="mb-4"
                />
                <Select
                  label="Select Branch"
                  name="branch_id"
                  items={branches.map(b => ({ label: b.name, value: String(b.id) }))}
                  defaultValue={selectedBranchId}
                  placeholder="Choose Branch (Optional)"
                  className="mb-4"
                />
                <Select
                  label="Select Unit*"
                  name="unit_id"
                  items={units.map(u => ({ label: u.name, value: String(u.id) }))}
                  defaultValue=""
                  placeholder={selectedBranchId ? "Choose Unit" : "Select Branch First"}
                  className="mb-4"
                />
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

            <Select
              label="Select Broker*"
              name="broker_id"
              items={brokers.map(b => ({ label: b.name, value: String(b.id) }))}
              defaultValue={defaultValues?.broker || ""}
              placeholder="Choose Broker"
            />
          </FormSection>

          <FormSection title="Policy Details">
            <FormInput
              label="Policy Number"
              name="policy_number"
              defaultValue={defaultValues?.policyNumber}
              placeholder="TBD or Existing Number"
              // Note: Initial policy requests typically do not have a policy number assigned yet.
              disabled={!isEdit && false} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Sum Insured (INR)"
                name="sum_insured"
                type="number"
                defaultValue={defaultValues?.sumInsured}
              />
              <FormInput
                label="Premium (INR)"
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
              defaultValue={defaultValues?.companyName} // Maps company name as a fallback for asset description in legacy contexts.
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

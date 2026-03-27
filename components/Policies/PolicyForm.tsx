"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, FormTextarea } from "@/components/ui/FormCommon";
import { Select } from "@/components/ui-elements/FormElements/select";
import { apiClient } from "@/lib/apiClient";
import { Policy } from "@/types";
import { UnitRead, PolicyRequestRead, BrokerRead } from "@/types/api";
import { Info } from "lucide-react";

type PolicyFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<Policy>;
  isEdit?: boolean;
  defaultUnitId?: number;
};

const POLICY_CATEGORIES = [
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

const CATEGORY_INFO: Record<string, { coverage: string; interest: string }> = {
  "Standard Fire & Special Perils Policy": {
    coverage: "Fire, explosion, lightning, riot, storm, flood etc.",
    interest: "Buildings, plant & machinery, furniture, stock and other physical assets",
  },
  "Industrial All Risk Policy": {
    coverage: "Comprehensive coverage for industrial assets",
    interest: "Entire industrial facility including buildings, machinery and inventory",
  },
  "Burglary / Theft Insurance": {
    coverage: "Loss of property due to burglary or theft",
    interest: "Movable assets such as stock, raw materials, finished goods, office equipment",
  },
  "Machinery Breakdown Insurance": {
    coverage: "Sudden and accidental breakdown of machinery",
    interest: "Plant & machinery owned or operated by the company",
  },
  "Boiler & Pressure Plant Insurance": {
    coverage: "Explosion or collapse of boilers/pressure vessels",
    interest: "Boilers and pressure equipment installed in factory",
  },
  "Electronic Equipment Insurance": {
    coverage: "Damage to computers, servers, telecom equipment",
    interest: "Electronic and IT infrastructure owned by the company",
  },
  "Marine Cargo (Transit) Insurance": {
    coverage: "Loss or damage during transportation of goods",
    interest: "Goods owned by the company while in transit (import/export or domestic)",
  },
  "Marine Open Policy / Annual Marine Policy": {
    coverage: "Multiple shipments under one policy",
    interest: "Company's goods transported frequently through sea/air/road",
  },
  "Erection All Risk (EAR) Insurance": {
    coverage: "Installation and commissioning risks",
    interest: "Machinery or equipment being installed at project sites",
  },
  "Contractors All Risk (CAR) Insurance": {
    coverage: "Construction project risks",
    interest: "Construction works executed by the company",
  },
  "Loss of Profit / Business Interruption Policy": {
    coverage: "Loss of revenue due to operational disruption",
    interest: "Business income and profit streams affected due to insured damage",
  },
  "Group Mediclaim / Group Health Insurance": {
    coverage: "Medical expenses of employees",
    interest: "Employer–employee relationship and welfare obligations",
  },
  "Group Personal Accident Policy": {
    coverage: "Accidental death or disability of employees",
    interest: "Employees working for the company and employer's financial interest",
  },
  "Group Term Life Insurance": {
    coverage: "Death benefit to employees' nominees",
    interest: "Employer's interest in providing employee benefits",
  },
  "Workmen Compensation Policy": {
    coverage: "Statutory liability for employee injury/death",
    interest: "Employer's legal liability under the Employees Compensation Act",
  },
  "Public Liability Insurance": {
    coverage: "Injury or damage to third parties",
    interest: "Company's legal liability towards members of public",
  },
  "Product Liability Insurance": {
    coverage: "Liability arising from defective products",
    interest: "Company's liability from manufacturing or supplying products",
  },
  "Commercial General Liability (CGL)": {
    coverage: "Broad third-party liability coverage",
    interest: "Legal liability for bodily injury or property damage from operations",
  },
  "Directors & Officers (D&O) Liability Insurance": {
    coverage: "Liability of directors for management decisions",
    interest: "Personal liability of directors and officers of the company",
  },
  "Professional Indemnity Insurance": {
    coverage: "Negligence in professional services",
    interest: "Company's liability from professional advice or engineering services",
  },
  "Cyber Risk / Data Breach Insurance": {
    coverage: "Cyber attacks, data loss, ransomware",
    interest: "Company's digital infrastructure and data assets",
  },
  "Fidelity Guarantee Insurance": {
    coverage: "Fraud or dishonesty by employees",
    interest: "Financial loss suffered due to employee misconduct",
  },
  "Money Insurance": {
    coverage: "Loss of money in transit or safe",
    interest: "Cash handled by the company",
  },
  "Vehicle / Motor Insurance (Fleet Policy)": {
    coverage: "Damage or liability arising from company vehicles",
    interest: "Vehicles owned or leased by the company",
  },
  "Keyman Insurance Policy": {
    coverage: "Financial loss due to death of key personnel",
    interest: "Company's financial interest in key executives",
  },
  "Trade Credit Insurance": {
    coverage: "Non-payment by buyers",
    interest: "Company's receivables / debtor risk",
  },
  "Environmental Liability Insurance": {
    coverage: "Pollution-related claims",
    interest: "Liability arising from environmental damage",
  },
  "Property All Risk Policy": {
    coverage: "Comprehensive property coverage",
    interest: "All physical assets owned or controlled by the company",
  },
  "Terrorism Insurance Cover": {
    coverage: "Damage caused by acts of terrorism",
    interest: "Company property and infrastructure",
  },
  "Stock Deterioration Insurance": {
    coverage: "Spoilage due to refrigeration failure",
    interest: "Perishable stock stored in cold storage",
  },
};

export function PolicyForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
  defaultUnitId,
}: PolicyFormProps) {
  const router = useRouter();
  const [units, setUnits] = useState<UnitRead[]>([]);
  const [brokers, setBrokers] = useState<BrokerRead[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    defaultUnitId ? String(defaultUnitId) : ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultValues?.type || ""
  );
  const [unitPolicies, setUnitPolicies] = useState<PolicyRequestRead[]>([]);
  const [isRenewal, setIsRenewal] = useState(false);

  useEffect(() => {
    apiClient.getAllUnits().then(setUnits).catch(console.error);
    apiClient.getAllBrokers().then(setBrokers).catch(console.error);
  }, []);

  useEffect(() => {
    const uid = defaultUnitId || (selectedUnitId ? Number(selectedUnitId) : null);
    if (!uid || isEdit) return;
    apiClient.getUnitPolicies(uid).then(setUnitPolicies).catch(console.error);
  }, [selectedUnitId, defaultUnitId, isEdit]);

  const categoryInfo = selectedCategory ? CATEGORY_INFO[selectedCategory] : null;

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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Category*</label>
              <select
                name="line_of_business"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
              >
                <option value="">Select Policy Category</option>
                {POLICY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {categoryInfo && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-dark-2 rounded-lg border border-blue-100 dark:border-dark-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <p><span className="font-medium text-gray-900 dark:text-white">Coverage:</span> {categoryInfo.coverage}</p>
                  <p><span className="font-medium text-gray-900 dark:text-white">Insurable Interest:</span> {categoryInfo.interest}</p>
                </div>
              </div>
            )}

            {/* Optional Broker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker (optional)</label>
              <select
                name="broker_id"
                defaultValue=""
                className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
              >
                <option value="">No broker</option>
                {brokers.map(b => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            </div>

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

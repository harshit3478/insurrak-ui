"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import { useAuth } from "@/context-provider/AuthProvider";
import { UnitRead, BrokerRead, ExtractedPolicyData } from "@/types/api";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import {
  Upload, Loader2, Sparkles, AlertCircle, CheckCircle2, ArrowRight, List,
} from "lucide-react";

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

export default function OnboardPolicyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [units, setUnits] = useState<UnitRead[]>([]);
  const [brokers, setBrokers] = useState<BrokerRead[]>([]);

  // Form state
  const [unitId, setUnitId] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [lineOfBusiness, setLineOfBusiness] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [sumInsured, setSumInsured] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Document upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [autoFilledFrom, setAutoFilledFrom] = useState<string | null>(null);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successData, setSuccessData] = useState<{ id: number; policy_number: string } | null>(null);

  useEffect(() => {
    apiClient.getAllUnits().then(setUnits).catch(console.error);
    apiClient.getAllBrokers().then(setBrokers).catch(console.error);
  }, []);

  const handleFileChange = async (file: File) => {
    setDocFile(file);
    setExtractError("");
    setAutoFilledFrom(null);
    setIsExtracting(true);
    try {
      const publicUrl = await uploadToR2(file, "policies");
      const data: ExtractedPolicyData = await apiClient.extractExistingPolicyData(publicUrl);

      if (data.policy_number) setPolicyNumber(data.policy_number);
      if (data.line_of_business) setLineOfBusiness(data.line_of_business);
      if (data.sum_insured != null) setSumInsured(String(data.sum_insured));
      if (data.premium != null) setPremium(String(data.premium));
      if (data.policy_start_date) setStartDate(data.policy_start_date);
      if (data.policy_end_date) setEndDate(data.policy_end_date);
      if (data.special_conditions) setNotes(data.special_conditions);

      setAutoFilledFrom(file.name);
    } catch {
      setExtractError("Could not extract data from the document. You can still fill in the form manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !lineOfBusiness || !policyNumber) {
      setSubmitError("Unit, Policy Category, and Policy Number are required.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      // If a document was uploaded, we already have the R2 URL from extraction
      // Re-upload to get the final file_path (or reuse from extraction step)
      let docFilePath: string | undefined;
      let docFileName: string | undefined;
      if (docFile) {
        docFilePath = await uploadToR2(docFile, "policies");
        docFileName = docFile.name;
      }

      const result = await apiClient.onboardExistingPolicy({
        company_id: user!.companyId ? Number(user!.companyId) : 0,
        unit_id: Number(unitId),
        broker_id: brokerId ? Number(brokerId) : null,
        line_of_business: lineOfBusiness,
        policy_number: policyNumber,
        asset_description: assetDescription || null,
        notes: notes || null,
        sum_insured: sumInsured ? Number(sumInsured) : null,
        premium: premium ? Number(premium) : null,
        policy_start_date: startDate || null,
        policy_end_date: endDate || null,
        document_file_name: docFileName || null,
        document_file_path: docFilePath || null,
      });

      setSuccessData({ id: result.id, policy_number: result.policy_number || `PRQ-${result.id}` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to onboard policy. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
        <SuccessHeader
          title="Policy Onboarded Successfully!"
          subtitle="The existing policy has been added to Insurrack and is now active."
        />
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{successData.policy_number}</p>
              <p className="text-sm text-gray-400">Policy is now ACTIVE in the system</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/policies")}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
            >
              <List className="w-4 h-4" /> Go to Policy List
            </button>
            <button
              onClick={() => router.push(`/policies/${successData.id}/documents`)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              View Policy Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title="Onboard Existing Policy"
        subtitle="Register an already-active policy into Insurrack. The policy will be created in ACTIVE status immediately."
      />

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-8 space-y-8">

          {/* Step 1: Upload Document */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Step 1 — Upload Policy Document
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload the existing policy document (PDF or image). GPT-4o will auto-extract details to pre-fill the form below. Large documents are supported.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isExtracting}
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-dark-3 rounded-xl py-10 text-sm text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-gray-600 transition-colors disabled:opacity-60"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  <span className="font-medium text-amber-600">Extracting data with GPT-4o...</span>
                  <span className="text-xs text-gray-400">This may take 15–30 seconds for large documents</span>
                </>
              ) : docFile ? (
                <>
                  <Upload className="w-6 h-6 text-emerald-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{docFile.name}</span>
                  <span className="text-xs">Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span>Click to select policy document (PDF or image)</span>
                  <span className="text-xs">Supports large multi-page PDFs</span>
                </>
              )}
            </button>

            {extractError && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {extractError}
              </div>
            )}

            {autoFilledFrom && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                Pre-filled from <span className="font-semibold">{autoFilledFrom}</span>. Review and adjust below.
              </div>
            )}
          </div>

          <hr className="border-gray-100 dark:border-dark-3" />

          {/* Step 2: Policy Details */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Step 2 — Policy Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Unit *</label>
                <select
                  value={unitId}
                  onChange={e => setUnitId(e.target.value)}
                  required
                  className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
                >
                  <option value="">Choose Unit</option>
                  {units.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Policy Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Number *</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={e => setPolicyNumber(e.target.value)}
                  required
                  placeholder="e.g. POL/FIRE/2024/001"
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all"
                />
              </div>

              {/* Policy Category */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Category *</label>
                <select
                  value={lineOfBusiness}
                  onChange={e => setLineOfBusiness(e.target.value)}
                  required
                  className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
                >
                  <option value="">Select Policy Category</option>
                  {POLICY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Broker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker (optional)</label>
                <select
                  value={brokerId}
                  onChange={e => setBrokerId(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary text-dark dark:text-white"
                >
                  <option value="">No broker</option>
                  {brokers.map(b => (
                    <option key={b.id} value={String(b.id)}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Sum Insured */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sum Insured (₹)</label>
                <input
                  type="number"
                  value={sumInsured}
                  onChange={e => setSumInsured(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all"
                />
              </div>

              {/* Premium */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Premium (₹)</label>
                <input
                  type="number"
                  value={premium}
                  onChange={e => setPremium(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all"
                />
              </div>

              {/* Asset Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Description</label>
                <textarea
                  value={assetDescription}
                  onChange={e => setAssetDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the insured asset or risk..."
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all resize-none"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Special Conditions</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-gray-100 dark:border-dark-3 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isExtracting}
              className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Onboarding..." : "Onboard Policy"}
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
    </div>
  );
}

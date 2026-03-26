"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { SuccessHeader } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";

export function MultiStepBranchForm() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [hazardDetails, setHazardDetails] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Unit name is required");
      return;
    }
    if (!contactEmail.trim()) {
      setError("Contact email is required (used for branch admin login)");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.createUnit({
        name,
        gstin: gstin || null,
        address: address || null,
        state: state || null,
        contact_person_name: contactName || null,
        contact_person_email: contactEmail || null,
        contact_person_phone: contactPhone || null,
        occupancy: occupancy || null,
        hazard_details: hazardDetails || null,
        is_active: true,
      });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to create unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0B1727] dark:focus:ring-gray-400 transition-all";
  const labelClass = "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="w-full">
      {step === 1 ? (
        <div className="bg-linear-to-r from-[#0E3B5E] to-[#40E0D0] px-8 py-8 rounded-2xl text-white shadow-sm mb-6">
          <h1 className="text-3xl font-bold font-display mb-1">Add Unit / Branch</h1>
          <p className="text-white/80 text-sm">
            Register a new physical location or operational unit for your organization.
          </p>
        </div>
      ) : (
        <SuccessHeader
          title="Unit Registered"
          subtitle={`Unit created. A Branch Admin account has been created for ${contactEmail}.`}
        />
      )}

      <div className="bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-2xl p-8 shadow-sm">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Basic Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Details</h3>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Unit Name*</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mumbai Plant"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>GSTIN</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="27AAAAAAAAAAAAA"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Occupancy Type</label>
                    <input
                      type="text"
                      value={occupancy}
                      onChange={(e) => setOccupancy(e.target.value)}
                      placeholder="e.g. Manufacturing"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Hazard Details</label>
                    <input
                      type="text"
                      value={hazardDetails}
                      onChange={(e) => setHazardDetails(e.target.value)}
                      placeholder="e.g. Flammable materials stored on-site"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="relative">
                <div className="hidden md:block absolute -left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-dark-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Location & Contact</h3>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>State / Region</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full street address..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Person</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Email (used for login)*</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Phone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-10 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50 dark:bg-white dark:text-[#0B1727] dark:hover:bg-gray-200"
              >
                {isSubmitting ? "Creating..." : "Create Unit"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unit Registration Summary</h2>
            </div>

            <hr className="mb-8 border-gray-200 dark:border-dark-3" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Unit Details</h3>
                <div className="space-y-4">
                  {[
                    ["Unit Name", name],
                    ["GSTIN", gstin],
                    ["State", state],
                    ["Address", address],
                    ["Occupancy", occupancy],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-1">{label}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Contact Details</h3>
                <div className="space-y-4">
                  {[
                    ["Contact Person", contactName],
                    ["Email", contactEmail],
                    ["Phone", contactPhone],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-1">{label}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-3">
              <button
                onClick={() => router.push("/branches")}
                className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors dark:bg-white dark:text-[#0B1727] dark:hover:bg-gray-200"
              >
                Go to Units List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

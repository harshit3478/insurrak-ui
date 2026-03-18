"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, FormTextarea, FormSelect } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";
import type { ClaimCreate } from "@/types/api";

const CLAIM_TYPES = [
  { value: "Fire", label: "Fire" },
  { value: "Marine", label: "Marine" },
  { value: "Motor", label: "Motor" },
  { value: "Health", label: "Health" },
  { value: "Liability", label: "Liability" },
  { value: "Engineering", label: "Engineering" },
  { value: "Miscellaneous", label: "Miscellaneous" },
];

export function ClaimForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    policy_request_id: "",
    claim_type: "",
    incident_date: "",
    incident_description: "",
    estimated_loss: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload: ClaimCreate = {
        policy_request_id: Number(formData.policy_request_id),
        claim_type: formData.claim_type,
        incident_date: formData.incident_date,
        incident_description: formData.incident_description,
        estimated_loss: formData.estimated_loss ? Number(formData.estimated_loss) : null,
        notes: formData.notes || null,
      };

      const newClaim = await apiClient.claims.create(payload);
      router.push(`/claims/${newClaim.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm">
      <FormSection title="Claim Registration">
        <FormInput
          label="Policy Request ID*"
          name="policy_request_id"
          type="number"
          value={formData.policy_request_id}
          onChange={handleChange}
          required
          placeholder="e.g. 1042"
        />
        
        <FormSelect
          label="Claim Type*"
          name="claim_type"
          value={formData.claim_type}
          onChange={handleChange}
          options={CLAIM_TYPES.map(o => o.value)}
          required
        />

        <FormInput
          label="Date of Incident*"
          name="incident_date"
          type="date"
          value={formData.incident_date}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Estimated Loss Amount (INR)"
          name="estimated_loss"
          type="number"
          value={formData.estimated_loss}
          onChange={handleChange}
          placeholder="e.g. 500000"
        />

        <div className="md:col-span-2">
          <FormTextarea
            label="Incident Description*"
            name="incident_description"
            value={formData.incident_description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe what happened..."
          />
        </div>

        <div className="md:col-span-2">
          <FormTextarea
            label="Additional Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any extra context or surveyor details..."
          />
        </div>
      </FormSection>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Register Claim"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 border border-gray-200 dark:border-dark-3 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

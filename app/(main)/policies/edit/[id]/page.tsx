"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePolicies } from "@/context-provider/PolicyProvider";
import { PolicyForm } from "@/components/Policies/PolicyForm";
import { FormHeader } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";
import { Policy, initialState } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function EditPolicyPage() {
  const { updatePolicyAction } = usePolicies();
  const [updateState, updatePolicy, isUpdating] = useActionState(updatePolicyAction, initialState);
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (policyId) {
      apiClient.getPolicyRequestById(Number(policyId))
        .then((data) => {
          // Adapt manual mapping if needed or use as is if schema matches
          setPolicy({
            id: String(data.id),
            policyNumber: data.policy_number || "",
            companyId: String(data.company_id),
            companyName: data.asset_description || "", // Using asset desc as name proxy for form
            insurer: "",
            type: data.line_of_business as any,
            sumInsured: data.sum_insured || 0,
            premium: 0,
            startDate: data.policy_start_date || "",
            endDate: data.policy_end_date || "",
            status: data.status as any,
            broker: String(data.broker_id),
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch policy", err);
          router.push("/policies");
        });
    }
  }, [policyId, router]);

  if (loading) return <Loading />;

  if (updateState.success) {
    router.push("/policies");
    return null;
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title="Edit Policy Details"
        subtitle={`Updating details for Request PR-${policyId}`}
      />
      {updateState.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {updateState.error}
        </div>
      )}
      <PolicyForm 
        action={updatePolicy} 
        pending={isUpdating} 
        defaultValues={policy || undefined} 
        isEdit 
      />
    </div>
  );
}

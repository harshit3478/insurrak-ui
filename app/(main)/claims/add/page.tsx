"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useClaims } from "@/context-provider/ClaimProvider";
import { ClaimForm } from "@/components/Claims/ClaimForm";
import { FormHeader, SuccessHeader } from "@/components/ui/FormCommon";
import { AlertCircle, ArrowRight, List } from "lucide-react";
import { initialState } from "@/types";

export default function AddClaimPage() {
  const { createClaimAction } = useClaims();
  const [createState, createClaim, isCreating] = useActionState(createClaimAction, initialState);
  const router = useRouter();

  if (createState.success) {
    const data = createState.data || {};
    return (
      <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
        <SuccessHeader
          title="Claim Registered Successfully!"
          subtitle="The claim has been initiated and a surveyor will be assigned shortly."
        />

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 dark:border-dark-3 bg-gray-50/50 dark:bg-dark-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B1727] flex items-center justify-center text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Claim Summary</h2>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Claim ID</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Assigned ID</div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">CLM-{data.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Policy Ref</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">PR-{data.policy_request_id}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Incident Info</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Claim Type</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{data.claim_type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Date of Loss</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{data.incident_date}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Financials & Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Estimated Loss</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.estimated_loss ? `₹${Number(data.estimated_loss).toLocaleString("en-IN")}` : "0"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Current Status</div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {data.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 dark:bg-dark-2 border-t border-gray-100 dark:border-dark-3 flex justify-between items-center">
            <button
              onClick={() => router.push("/claims")}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors shadow-sm"
            >
              <List className="w-4 h-4" /> Go to Claim List
            </button>
            <button
              onClick={() => router.push(`/claims/${data.id}`)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              View Full Progress <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title="Register New Claim"
        subtitle="Provide the necessary incident details to initiate the claim settlement process."
      />
      {createState.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {createState.error}
        </div>
      )}
      <ClaimForm action={createClaim} pending={isCreating} />
    </div>
  );
}

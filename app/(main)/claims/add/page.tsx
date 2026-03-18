"use client";

import { FormHeader } from "@/components/ui/FormCommon";
import { ClaimForm } from "@/components/Claims/ClaimForm";

export default function AddClaimPage() {
  return (
    <div className="p-8 bg-gray-50/50 dark:bg-dark-4 min-h-screen">
      <FormHeader
        title="Register New Claim"
        subtitle="Fill in the incident details to initiate the claim workflow."
      />
      <ClaimForm />
    </div>
  );
}

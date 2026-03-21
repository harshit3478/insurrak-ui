"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useClaims } from "@/context-provider/ClaimProvider";
import { ClaimForm } from "@/components/Claims/ClaimForm";
import { FormHeader } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";
import { ClaimRead } from "@/types/api";
import { initialState } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function EditClaimPage() {
  const { updateClaimAction } = useClaims();
  const [updateState, updateClaim, isUpdating] = useActionState(updateClaimAction, initialState);
  const router = useRouter();
  const params = useParams();
  const claimId = params.id as string;

  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (claimId) {
      apiClient.claims.getById(Number(claimId))
        .then(setClaim)
        .catch((err) => {
          console.error("Failed to fetch claim", err);
          router.push("/claims");
        })
        .finally(() => setLoading(false));
    }
  }, [claimId, router]);

  if (loading) return <Loading />;

  if (updateState.success) {
    router.push("/claims");
    return null;
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title="Edit Claim Details"
        subtitle={`Updating incident records for Claim CLM-${claimId}`}
      />
      {updateState.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {updateState.error}
        </div>
      )}
      <ClaimForm 
        action={updateClaim} 
        pending={isUpdating} 
        defaultValues={claim || undefined} 
        isEdit 
      />
    </div>
  );
}

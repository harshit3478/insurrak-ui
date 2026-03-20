"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBranches } from "@/context-provider/BranchProvider";
import { BranchForm } from "@/components/Branches/BranchForm";
import { FormHeader } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";
import { BranchRead } from "@/types/api";
import { initialState } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function EditBranchPage() {
  const { updateBranchAction } = useBranches();
  const [updateState, updateBranch, isUpdating] = useActionState(updateBranchAction, initialState);
  const router = useRouter();
  const params = useParams();
  const branchId = params.branchId as string;

  const [branch, setBranch] = useState<BranchRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (branchId) {
      apiClient.getBranchById(Number(branchId))
        .then(setBranch)
        .catch((err) => {
          console.error("Failed to fetch branch", err);
          router.push("/branches");
        })
        .finally(() => setLoading(false));
    }
  }, [branchId, router]);

  if (loading) return <Loading />;

  if (updateState.success) {
    router.push("/branches");
    return null;
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title="Edit Branch Details"
        subtitle={`Updating information for Branch BR-${branchId}`}
      />
      {updateState.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {updateState.error}
        </div>
      )}
      <BranchForm
        action={updateBranch}
        pending={isUpdating}
        defaultValues={branch || undefined}
        isEdit
      />
    </div>
  );
}

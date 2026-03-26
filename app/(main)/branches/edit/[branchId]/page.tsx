"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBranches } from "@/context-provider/BranchProvider";
import { BranchForm } from "@/components/Branches/BranchForm";
import { FormHeader } from "@/components/ui/FormCommon";
import { apiClient } from "@/lib/apiClient";
import { UnitRead } from "@/types/api";
import { initialState } from "@/types";
import { Loading } from "@/components/ui/Loading";

export default function EditUnitPage() {
  const { updateBranchAction } = useBranches();
  const [updateState, updateUnit, isUpdating] = useActionState(updateBranchAction, initialState);
  const router = useRouter();
  const params = useParams();
  const unitId = params.branchId as string;

  const [unit, setUnit] = useState<UnitRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unitId) {
      apiClient.getUnitById(Number(unitId))
        .then(setUnit)
        .catch(() => router.push("/branches"))
        .finally(() => setLoading(false));
    }
  }, [unitId, router]);

  if (loading) return <Loading />;

  if (updateState.success) {
    router.push("/branches");
    return null;
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <FormHeader
        title="Edit Unit Details"
        subtitle={`Updating information for unit #${unitId}`}
      />
      {updateState.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {updateState.error}
        </div>
      )}
      <BranchForm
        action={updateUnit}
        pending={isUpdating}
        defaultValues={unit || undefined}
        isEdit
      />
    </div>
  );
}

"use client";

import { MultiStepBranchForm } from "@/components/Branches/MultiStepBranchForm";

export default function AddBranchPage() {
  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <MultiStepBranchForm />
    </div>
  );
}

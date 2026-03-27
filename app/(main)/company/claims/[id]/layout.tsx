"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

const STATUS_COLORS: Record<string, string> = {
  INITIATED: "bg-gray-100 text-gray-600",
  AWAITING_DOCS: "bg-amber-50 text-amber-700",
  SENT_TO_BROKER: "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-purple-50 text-purple-700",
  QUERY_RAISED: "bg-orange-50 text-orange-700",
  APPROVED_FULL: "bg-emerald-50 text-emerald-700",
  APPROVED_PARTIAL: "bg-teal-50 text-teal-700",
  REJECTED: "bg-red-50 text-red-700",
  SETTLEMENT_PENDING: "bg-yellow-50 text-yellow-700",
  CREDITED: "bg-green-50 text-green-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

const TABS = [
  { label: "Overview", path: "overview" },
  { label: "Documents", path: "documents" },
  { label: "Communications", path: "communications" },
];

export default function ClaimDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const claimId = Number(params.id);

  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.claims.getById(claimId)
      .then(setClaim)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [claimId]);

  const activeTab = TABS.find((t) => pathname.endsWith(t.path))?.path || "overview";
  const basePath = `/company/claims/${claimId}`;

  if (loading) return <Loading />;

  if (!claim) {
    return (
      <div className="p-8 text-center text-gray-500">
        Claim not found.
        <button onClick={() => router.back()} className="ml-2 text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  const statusClass = STATUS_COLORS[claim.status] || "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-0">
      {/* Header card */}
      <div className="bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-2xl shadow-sm mb-4">
        <div className="p-6 border-b border-gray-100 dark:border-dark-3">
          <button
            onClick={() => router.push("/company/claims")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Claims
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {claim.insurer_claim_number || `CLM-${claim.id}`}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusClass}`}>
                  {claim.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-6 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Reported {new Date(claim.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <nav className="flex px-6 gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => router.push(`${basePath}/${tab.path}`)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#5750F1] text-[#5750F1]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content — pass claim via context workaround: re-fetch in children */}
      {children}
    </div>
  );
}

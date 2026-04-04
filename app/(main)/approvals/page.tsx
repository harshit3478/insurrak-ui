"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context-provider/AuthProvider";
import type { PolicyRequestRead } from "@/types/api";
import { ClipboardCheck, ArrowRight, Loader2 } from "lucide-react";

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<PolicyRequestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "COMPANY_ADMIN") {
      router.replace("/policies");
      return;
    }
    const companyId = user.companyId ? Number(user.companyId) : undefined;
    apiClient
      .getPolicyRequests(companyId, "APPROVAL_PENDING")
      .then(setPolicies)
      .catch(() => setError("Failed to load pending approvals."))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user || user.role !== "COMPANY_ADMIN") return null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Policy Approvals</h1>
          <p className="text-sm text-gray-400">Policies waiting for your approval decision</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-500">{error}</div>
        ) : policies.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ClipboardCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No policies awaiting approval</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Policy / ID</th>
                <th className="text-left px-6 py-3">Line of Business</th>
                <th className="text-left px-6 py-3">Unit</th>
                <th className="text-left px-6 py-3">Submitted</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {p.policy_number || `PRQ-${p.id}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{p.line_of_business}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{p.unit_name || `Unit ${p.unit_id}`}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(p.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/policies/${p.id}/approvals`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B1727] dark:bg-white dark:text-[#0B1727] rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors ml-auto"
                    >
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

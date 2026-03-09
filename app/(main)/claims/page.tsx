"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { setMockClaims } from "@/lib/features/claim/claimSlice";
import { ClaimStatus, PolicyType } from "@/types";
import { Search, ChevronDown } from "lucide-react";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  Open: "bg-blue-50 text-blue-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Settled: "bg-gray-100 text-gray-600 dark:bg-dark-3 dark:text-gray-400",
};

const TYPE_STYLES: Record<PolicyType, string> = {
  Fire: "bg-orange-50 text-orange-700",
  Marine: "bg-blue-50 text-blue-700",
  Motor: "bg-cyan-50 text-cyan-700",
  Health: "bg-pink-50 text-pink-700",
  Liability: "bg-indigo-50 text-indigo-700",
  Engineering: "bg-yellow-50 text-yellow-700",
  Miscellaneous: "bg-gray-100 text-gray-600",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function SLABadge({ deadline }: { deadline: string }) {
  const today = new Date();
  const due = new Date(deadline);
  const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isWarning = daysLeft >= 0 && daysLeft <= 7;
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${isOverdue ? "bg-red-50 text-red-700" : isWarning ? "bg-amber-50 text-amber-700" : "text-gray-500 dark:text-dark-6"}`}>
      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
    </span>
  );
}

export default function ClaimsPage() {
  const dispatch = useAppDispatch();
  const claims = useSelector((s: RootState) => s.claim.items);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(setMockClaims());
  }, [dispatch]);

  const filtered = claims.filter(
    c =>
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white dark:bg-gray-dark p-6 md:p-10 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Claims</h1>
          <p className="text-sm text-gray-500 dark:text-dark-6 mt-0.5">{claims.length} claims registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search claims..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-gray-50 dark:bg-dark-2 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C6F200]"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-100 dark:border-dark-3 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 dark:bg-dark-2 border-b border-gray-100 dark:border-dark-3">
              <tr>
                {["Claim No.", "Policy No.", "Company", "Type", "Date of Loss", "Claim Amount", "SLA Deadline", "Status"].map(h => (
                  <th key={h} className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 dark:text-dark-6">
                    <div className="flex items-center gap-1">{h} <ChevronDown className="w-3 h-3" /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                  <td className="py-4 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{c.claimNumber}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">{c.policyNumber}</td>
                  <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{c.companyName}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[c.type]}`}>{c.type}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">{c.dateOfLoss}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">{formatCurrency(c.claimAmount)}</td>
                  <td className="py-4 px-4"><SLABadge deadline={c.slaDeadline} /></td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-sm text-gray-400">No claims found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

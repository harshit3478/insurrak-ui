"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { setMockPolicies, selectPolicy } from "@/lib/features/policy/policySlice";
import { Policy, PolicyStatus, PolicyType } from "@/types";
import { FileText, Search, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<PolicyStatus, string> = {
  Active: "bg-green-50 text-green-700",
  "Expiring Soon": "bg-amber-50 text-amber-700",
  Expired: "bg-red-50 text-red-700",
  "Pending Renewal": "bg-purple-50 text-purple-700",
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

export default function PoliciesPage() {
  const dispatch = useAppDispatch();
  const policies = useSelector((s: RootState) => s.policy.items);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(setMockPolicies());
  }, [dispatch]);

  const filtered = policies.filter(
    p =>
      p.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName.toLowerCase().includes(search.toLowerCase()) ||
      p.insurer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white dark:bg-gray-dark p-6 md:p-10 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Policies</h1>
          <p className="text-sm text-gray-500 dark:text-dark-6 mt-0.5">
            {policies.length} policies across all companies
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#C6F200] text-black px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#b0d600] transition-colors">
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search policies..."
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
                {["Policy No.", "Company", "Type", "Insurer", "Sum Insured", "Premium", "End Date", "Status"].map(h => (
                  <th key={h} className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 dark:text-dark-6">
                    <div className="flex items-center gap-1">{h} <ChevronDown className="w-3 h-3" /></div>
                  </th>
                ))}
                <th className="py-3.5 px-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                  <td className="py-4 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{p.policyNumber}</td>
                  <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{p.companyName}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">{p.insurer}</td>
                  <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{formatCurrency(p.sumInsured)}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">{formatCurrency(p.premium)}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">{p.endDate}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-green-500" : p.status === "Expiring Soon" ? "bg-amber-500" : p.status === "Expired" ? "bg-red-500" : "bg-purple-500"}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-gray-400">No policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

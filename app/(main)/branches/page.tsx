"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { BranchRead } from "@/types/api";
import { Building2, Search, Filter, Download, Plus, MoreVertical } from "lucide-react";
import { Loading } from "@/components/ui/Loading";
import { SkeletonRows } from "@/components/ui/SkeletonRows";

/**
 * BranchesPage manages the physical and operational locations of a company.
 * It allows company administrators to track branch-level data, including 
 * SPOC information, unit counts, and policy coverage status.
 */
export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<BranchRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadBranches() {
      try {
        setLoading(true);
        const currentUser = await apiClient.getCurrentUser();
        if (currentUser.companyId) {
          const data = await apiClient.getAllBranches(Number(currentUser.companyId));
          setBranches(data);
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBranches();
  }, []);

  const activeCount = React.useMemo(() => branches.filter((b) => b.is_active).length, [branches]);

  const filteredBranches = React.useMemo(() => branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.state || "").toLowerCase().includes(search.toLowerCase())
  ), [branches, search]);

  if (loading) {
// Removing block loader to allow the shell to render
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[600px] overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 border-b border-gray-100 dark:border-dark-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Branch Management</h1>
          <p className="text-sm text-gray-500 dark:text-dark-6">
            Manage the physical locations and registered entities of your organization.
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-8 pb-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl p-6 border border-gray-200 dark:border-dark-3 inline-block min-w-[320px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-3 flex items-center justify-center text-gray-700 dark:text-gray-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Total Branches</h3>
                <p className="text-xs text-gray-500 dark:text-dark-6">Lorem ipsum dolor sit amet.</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-white leading-none">{branches.length}</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                {activeCount} <br />
                <span className="text-xs">Active Branches</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search & Actions Toolbar */}
        <div className="px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-dark-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Name, City, or SPOC"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-gray-50 dark:bg-dark-2 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => router.push("/branches/add")}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Branch
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-8 pb-8 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                <th className="py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Branch Name ↓</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">City ↓</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Branch SPOC ↓</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Units ↓</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Policies ↓</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status ↓</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {loading ? (
                <SkeletonRows columns={7} rows={5} />
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-400">No branches found.</td>
                </tr>
              ) : (
                filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors group">
                  <td className="py-4 text-sm font-bold text-gray-900 dark:text-white">{b.name}</td>
                  <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{b.state || "N/A"}</td>
                  <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{"N/A"}</td>
                  <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{0}</td>
                  <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{0}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className={b.is_active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => router.push(`/branches/edit/${b.id}`)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

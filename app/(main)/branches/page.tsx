"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { UnitRead } from "@/types/api";
import { Building2, Search, Plus, MoreVertical, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { getClientCache, setClientCache, invalidateClientCache } from "@/lib/cache";
import { SkeletonRows } from "@/components/ui/SkeletonRows";
import { useAuth } from "@/context-provider/AuthProvider";

export default function BranchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user && user.role !== "COMPANY_ADMIN") {
      router.replace("/policies");
      return;
    }
    const cached = getClientCache<UnitRead[]>("units");
    if (cached) {
      setUnits(cached);
      setLoading(false);
      return;
    }
    apiClient.getAllUnits()
      .then(data => { setClientCache("units", data); setUnits(data); })
      .catch((err) => console.error("Failed to load units:", err))
      .finally(() => setLoading(false));
  }, [user, router]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleActive = async (u: UnitRead) => {
    setTogglingId(u.id);
    setOpenMenuId(null);
    try {
      const updated = await apiClient.updateUnit(u.id, { is_active: !u.is_active });
      setUnits((prev) => {
        const next = prev.map((x) => (x.id === u.id ? updated : x));
        setClientCache("units", next);
        return next;
      });
    } catch (err) {
      console.error("Failed to update unit:", err);
      invalidateClientCache("units");
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = React.useMemo(() => units.filter((u) => u.is_active).length, [units]);

  const filtered = React.useMemo(
    () =>
      units.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          (u.state || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.contact_person_name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [units, search]
  );

  return (
    <div className="p-0 min-h-screen font-sans">
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[600px] overflow-hidden">

        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-dark-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Unit / Branch Management</h1>
          <p className="text-sm text-gray-500 dark:text-dark-6">
            Manage the registered locations and operational units of your organization.
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
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Total Units</h3>
                <p className="text-xs text-gray-500 dark:text-dark-6">Registered under your company</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-white leading-none">{units.length}</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                {activeCount} <br />
                <span className="text-xs">Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-dark-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, state, or contact"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-gray-50 dark:bg-dark-2 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500"
            />
          </div>

          <button
            onClick={() => router.push("/branches/add")}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Unit
          </button>
        </div>

        {/* Table */}
        <div className="px-8 pb-8 overflow-x-auto" ref={menuRef}>
          <table className="w-full min-w-175">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                <th className="py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Unit Name</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">State</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Contact Person</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">GSTIN</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {loading ? (
                <SkeletonRows columns={6} rows={5} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    {units.length === 0 ? "No units yet. Add your first unit." : "No units match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors cursor-pointer"
                    onDoubleClick={() => router.push(`/branches/${u.id}`)}
                  >
                    <td className="py-4 text-sm font-bold text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{u.state || "—"}</td>
                    <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{u.contact_person_name || "—"}</td>
                    <td className="py-4 text-sm text-gray-500 dark:text-gray-300">{u.gstin || "—"}</td>
                    <td className="py-4">
                      {togglingId === u.id ? (
                        <span className="text-xs text-gray-400">Updating...</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                          <span className={u.is_active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === u.id ? null : u.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === u.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white dark:bg-dark-2 rounded-lg border border-gray-200 dark:border-dark-3 shadow-lg py-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); router.push(`/branches/edit/${u.id}`); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(u); }}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                              u.is_active
                                ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`}
                          >
                            {u.is_active ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useState, useMemo, useRef } from "react";
import { setPolicies } from "@/lib/features/policy/policySlice";
import { isStale } from "@/lib/cache";
import { apiClient } from "@/lib/apiClient";
import { PolicyRequestRead } from "@/types/api";
import { Search, Filter, Download, Plus, MoreVertical, FileText, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SkeletonRows } from "@/components/ui/SkeletonRows";
import { isBypassActive } from "@/types/permissions";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  APPROVAL_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  PAYMENT_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  DRAFT: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  QUOTING: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
  DATA_COLLECTION: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  RISK_HELD: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  POLICY_ISSUED_SOFT: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  POLICY_ISSUED_HARD: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  EXPIRING: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const PIPELINE_STATUSES = ["DRAFT", "DATA_COLLECTION", "QUOTING", "APPROVAL_PENDING", "APPROVED", "PAYMENT_PENDING"];
const ACTIVE_STATUSES = ["RISK_HELD", "POLICY_ISSUED_SOFT", "POLICY_ISSUED_HARD", "ACTIVE", "EXPIRING"];

const FILTER_CATEGORIES = [
  { label: "Pipeline", description: "Not yet covered — in negotiation or awaiting payment", statuses: PIPELINE_STATUSES },
  { label: "Active", description: "Company is protected against risk", statuses: ACTIVE_STATUSES },
  { label: "Archived", description: "Coverage period has ended", statuses: ["ARCHIVED"] },
];

export default function PoliciesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);

  const policies = useSelector((s: RootState) => s.policy.items) as unknown as PolicyRequestRead[];
  const lastFetched = useSelector((s: RootState) => s.policy.lastFetched);
  const [loading, setLoading] = useState(() => isStale(lastFetched));
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const companyId = authUser?.companyId
      ? Number(authUser.companyId)
      : isBypassActive() ? 1 : null;
    if (!companyId) {
      // authUser is null during hydration — don't show error yet, just wait
      if (authUser !== null) {
        setError("No company associated with your account.");
      }
      setLoading(false);
      return;
    }
    setError(null);
    if (!isStale(lastFetched)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient.getPolicyRequests(companyId)
      .then(data => dispatch(setPolicies(data as any)))
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, [lastFetched, authUser, dispatch]);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Stats
  const totalSumInsured = useMemo(() =>
    policies
      .filter(p => [...ACTIVE_STATUSES].includes(p.status))
      .reduce((acc, p) => acc + (p.sum_insured || 0), 0),
    [policies]
  );
  const actionRequired = useMemo(() =>
    policies.filter(p => p.status === "APPROVAL_PENDING").length,
    [policies]
  );

  // Filtering
  const filtered = useMemo(() => {
    let result = policies;
    if (activeFilters.length > 0) {
      const allowedStatuses = new Set(
        FILTER_CATEGORIES
          .filter(c => activeFilters.includes(c.label))
          .flatMap(c => c.statuses)
      );
      result = result.filter(p => allowedStatuses.has(p.status));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.policy_number || "").toLowerCase().includes(q) ||
        (p.asset_description || "").toLowerCase().includes(q) ||
        (p.line_of_business || "").toLowerCase().includes(q) ||
        (p.unit_name || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [policies, activeFilters, search]);

  const toggleFilter = (label: string) => {
    setActiveFilters(prev =>
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    );
  };

  if (error) return <div className="p-8 text-center text-gray-500">{error}</div>;

  return (
    <div className="p-8 min-h-screen font-sans">
      <div className="space-y-6">
        <div className="text-gray-900 dark:text-white">
          <span className="text-lg font-bold">Welcome back, {authUser?.name}</span>
        </div>

        {/* Summary Cards */}
        <div data-tour="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 — Total Sum Insured */}
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-2 flex items-center justify-center text-gray-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Sum Insured (Active)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "—" : `₹${totalSumInsured.toLocaleString("en-IN")}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">Across all active & issued policies</p>
            </div>
          </div>

          {/* Card 2 — Action Required */}
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-2 flex items-center justify-center text-gray-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Action Required</p>
                  <p className="text-xs text-gray-400">Policies awaiting your approval</p>
                </div>
              </div>
              {actionRequired > 0 && (
                <button
                  onClick={() => { setActiveFilters(["Pipeline"]); setSearch(""); }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Review →
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "—" : actionRequired}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Approval Pending
              </span>
            </div>
          </div>
        </div>

        {/* Policies Table */}
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[500px]">
          <div className="p-6 border-b border-gray-100 dark:border-dark-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Policies</h2>
          </div>

          <div className="px-6 py-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-100 dark:border-dark-3">
            {/* Search */}
            <div className="relative w-full xl:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by policy no., unit, LOB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-gray-50 dark:bg-dark-2 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>

            <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 w-full xl:w-auto">
              {/* Active filter chips */}
              {activeFilters.map(f => (
                <button
                  key={f}
                  onClick={() => toggleFilter(f)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727] rounded-full text-xs font-medium"
                >
                  {f} <X className="w-3 h-3" />
                </button>
              ))}

              {/* Filters dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 border border-gray-200 dark:border-dark-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                >
                  <Filter className="w-4 h-4" /> Filters
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-xl shadow-xl z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Filter by Category</p>
                      {activeFilters.length > 0 && (
                        <button onClick={() => setActiveFilters([])} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                          Clear all
                        </button>
                      )}
                    </div>
                    {FILTER_CATEGORIES.map(cat => (
                      <label key={cat.label} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={activeFilters.includes(cat.label)}
                          onChange={() => toggleFilter(cat.label)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0B1727] focus:ring-[#0B1727]"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.label}</p>
                          <p className="text-xs text-gray-400">{cat.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
              <Link
                href="/policies/add"
                className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Policy
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto pb-8">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-3">
                  {["Policy No.", "Unit", "Line of Business", "Asset Description", "Policy Period", "Premium", "Status"].map(h => (
                    <th key={h} className="py-4 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                {loading ? (
                  <SkeletonRows columns={8} rows={5} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                      No policies found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/policies/${item.id}/documents`)}
                      className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white font-mono">
                        {item.policy_number || `#${item.id}`}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.unit_name || `Unit #${item.unit_id}`}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">{item.line_of_business}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-[150px]" title={item.asset_description || ""}>
                        {item.asset_description || "—"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.policy_start_date && item.policy_end_date
                          ? `${new Date(item.policy_start_date).toLocaleDateString("en-IN")} – ${new Date(item.policy_end_date).toLocaleDateString("en-IN")}`
                          : item.policy_start_date
                          ? `From ${new Date(item.policy_start_date).toLocaleDateString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                        {item.premium != null ? `₹${item.premium.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${STATUS_STYLES[item.status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                          {item.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useState, useMemo } from "react";
import { setClaims } from "@/lib/features/claim/claimSlice";
import { isStale } from "@/lib/cache";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { Search, Plus, Scale, CheckCircle2 } from "lucide-react";
import { SkeletonRows } from "@/components/ui/SkeletonRows";
import type { ClaimRead } from "@/types/api";

const STATUS_LABELS: Record<string, string> = {
  INITIATED: "Initiated",
  AWAITING_DOCS: "Awaiting Docs",
  SENT_TO_BROKER: "With Broker",
  UNDER_REVIEW: "Under Review",
  QUERY_RAISED: "Query Raised",
  APPROVED_FULL: "Approved (Full)",
  APPROVED_PARTIAL: "Approved (Partial)",
  REJECTED: "Rejected",
  SETTLEMENT_PENDING: "Settlement Pending",
  CREDITED: "Credited",
  CLOSED: "Closed",
};

const STATUS_STYLES: Record<string, string> = {
  INITIATED: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  AWAITING_DOCS: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  SENT_TO_BROKER: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  UNDER_REVIEW: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  QUERY_RAISED: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  APPROVED_FULL: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  APPROVED_PARTIAL: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  SETTLEMENT_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  CREDITED: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-dark-3 dark:text-gray-400",
};

const STATUS_DOT: Record<string, string> = {
  INITIATED: "bg-blue-500", AWAITING_DOCS: "bg-amber-500", SENT_TO_BROKER: "bg-purple-500",
  UNDER_REVIEW: "bg-indigo-500", QUERY_RAISED: "bg-orange-500",
  APPROVED_FULL: "bg-emerald-500", APPROVED_PARTIAL: "bg-teal-500",
  REJECTED: "bg-red-500", SETTLEMENT_PENDING: "bg-yellow-500",
  CREDITED: "bg-green-500", CLOSED: "bg-gray-400",
};

type QuickFilter = "all" | "open" | "settled" | "action";

const OPEN_STATUSES = new Set(["INITIATED", "AWAITING_DOCS", "SENT_TO_BROKER", "UNDER_REVIEW"]);
const SETTLED_STATUSES = new Set(["CREDITED", "CLOSED"]);
const ACTION_STATUSES = new Set(["QUERY_RAISED"]);

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function ClaimsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const claims = useSelector((s: RootState) => s.claim.items) as unknown as ClaimRead[];
  const lastFetched = useSelector((s: RootState) => s.claim.lastFetched);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [loading, setLoading] = useState(() => isStale(lastFetched));

  useEffect(() => {
    if (!isStale(lastFetched)) { setLoading(false); return; }
    setLoading(true);
    apiClient.claims.getAll()
      .then(data => dispatch(setClaims(data as any)))
      .catch(err => console.error("Failed to fetch claims:", err))
      .finally(() => setLoading(false));
  }, [lastFetched, dispatch]);

  // Summary stats
  const pendingClaims = useMemo(() => claims.filter(c => !SETTLED_STATUSES.has(c.status)), [claims]);
  const pendingTotal = useMemo(() => pendingClaims.reduce((s, c) => s + (c.estimated_loss || 0), 0), [pendingClaims]);
  const currentYear = new Date().getFullYear();
  const fiscalStart = new Date(currentYear - (new Date().getMonth() < 3 ? 1 : 0), 3, 1); // April 1
  const settledYTD = useMemo(() =>
    claims.filter(c => SETTLED_STATUSES.has(c.status) && new Date(c.created_at) >= fiscalStart),
    [claims]);
  const settledTotal = useMemo(() => settledYTD.reduce((s, c) => s + (c.settled_amount || 0), 0), [settledYTD]);

  const filtered = useMemo(() => {
    let base = claims;
    if (quickFilter === "open") base = base.filter(c => OPEN_STATUSES.has(c.status));
    else if (quickFilter === "settled") base = base.filter(c => SETTLED_STATUSES.has(c.status));
    else if (quickFilter === "action") base = base.filter(c => ACTION_STATUSES.has(c.status));
    if (search) {
      const q = search.toLowerCase();
      base = base.filter(c =>
        (c.insurer_claim_number || "").toLowerCase().includes(q) ||
        c.claim_type.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        `clm-${c.id}`.includes(q)
      );
    }
    return base;
  }, [claims, search, quickFilter]);

  return (
    <div className="p-4 md:p-8 min-h-screen font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claims Center</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and track all insurance claims for your organisation.</p>
        </div>
        <button
          onClick={() => router.push("/claims/add")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Pending Settlements</p>
            <p className="text-xs text-gray-400">Current Fiscal Year</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(pendingTotal)}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {pendingClaims.length} Active Claims
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Settled (YTD)</p>
            <p className="text-xs text-gray-400">Current Fiscal Year</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(settledTotal)}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {settledYTD.length} Claims Closed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        {/* Table toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-dark-3">
          <div className="flex items-center gap-2">
            {(["all", "open", "settled", "action"] as QuickFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setQuickFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  quickFilter === f
                    ? "bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727]"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2"
                }`}
              >
                {f === "all" ? "All" : f === "open" ? "Open" : f === "settled" ? "Settled" : "Action Required"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-dark-3 rounded-lg bg-gray-50 dark:bg-dark-2 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1727]/20 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                {["Claim ID", "Related Policy", "Incident", "Estimated Loss", "Incident Date", "Status"].map(h => (
                  <th key={h} className="py-3 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {loading ? (
                <SkeletonRows columns={6} rows={5} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">No claims found.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/claims/${c.id}/overview`)}
                    className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-6 text-sm font-bold text-[#0B1727] dark:text-white">
                      {c.insurer_claim_number || `CLM-${c.id}`}
                    </td>
                    <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-400">PR-{c.policy_request_id}</td>
                    <td className="py-3.5 px-6 text-sm text-gray-700 dark:text-gray-300 max-w-[220px] truncate">
                      {c.incident_description}
                    </td>
                    <td className="py-3.5 px-6 text-sm font-medium text-gray-900 dark:text-white">
                      {c.estimated_loss ? formatCurrency(c.estimated_loss) : "—"}
                    </td>
                    <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(c.incident_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[c.status] || "bg-gray-100 text-gray-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status] || "bg-gray-400"}`} />
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
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

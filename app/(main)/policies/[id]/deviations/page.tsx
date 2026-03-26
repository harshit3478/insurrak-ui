"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { QuotationRead, InsurerRead, DeviationRead } from "@/types/api";
import {
  GitCompare, Plus, Minus, ArrowRight, CheckCircle2,
  AlertTriangle, Info, FileText,
} from "lucide-react";
import { Loading } from "@/components/ui/Loading";

const SEVERITY_CONFIG: Record<string, { label: string; className: string }> = {
  HIGH: { label: "High", className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  LOW: { label: "Low", className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
};

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; className: string }> = {
  ADDED: {
    icon: <Plus className="w-3 h-3" />,
    className: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30",
  },
  REMOVED: {
    icon: <Minus className="w-3 h-3" />,
    className: "text-red-500 bg-red-50 dark:bg-red-900/30",
  },
  CHANGED: {
    icon: <ArrowRight className="w-3 h-3" />,
    className: "text-amber-500 bg-amber-50 dark:bg-amber-900/30",
  },
};

export default function PolicyDeviationsPage() {
  const { id } = useParams();
  const prId = Number(id);

  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [insurerMap, setInsurerMap] = useState<Record<number, InsurerRead>>({});
  const [selectedQuotId, setSelectedQuotId] = useState<number | null>(null);
  const [deviations, setDeviations] = useState<DeviationRead[] | null>(null);
  const [loadingDeviations, setLoadingDeviations] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [quots, allInsurers] = await Promise.all([
          apiClient.getQuotations(prId),
          apiClient.getAllInsurers().catch(() => [] as InsurerRead[]),
        ]);
        setQuotations(quots);
        const map: Record<number, InsurerRead> = {};
        allInsurers.forEach(ins => { map[ins.id] = ins; });
        setInsurerMap(map);
        // Auto-select second quotation (first one has nothing to compare against)
        if (quots.length >= 2) {
          setSelectedQuotId(quots[1].id);
        } else if (quots.length === 1) {
          setSelectedQuotId(quots[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch deviations data", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Fetch deviations when a quotation is selected
  useEffect(() => {
    if (!selectedQuotId) { setDeviations(null); return; }
    let cancelled = false;
    async function fetchDeviations() {
      setLoadingDeviations(true);
      try {
        const devs = await apiClient.getQuotationDeviations(prId, selectedQuotId!);
        if (!cancelled) setDeviations(devs);
      } catch {
        if (!cancelled) setDeviations([]);
      } finally {
        if (!cancelled) setLoadingDeviations(false);
      }
    }
    fetchDeviations();
    return () => { cancelled = true; };
  }, [selectedQuotId, prId]);

  if (loading) return <Loading />;

  const selectedQuot = quotations.find(q => q.id === selectedQuotId);

  const renderDeviationsContent = () => {
    if (quotations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <FileText className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No quotations added yet.</p>
          <p className="text-xs">Add quotations from the Quotations tab to see deviation analysis.</p>
        </div>
      );
    }

    if (!selectedQuotId) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
          <GitCompare className="w-8 h-8 opacity-30" />
          <p className="text-xs">Select a quotation to view deviations.</p>
        </div>
      );
    }

    if (loadingDeviations) {
      return (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading deviations...
        </div>
      );
    }

    if (!deviations) return null;

    // Check if selected quotation has terms
    const hasTerms = !!selectedQuot?.terms;
    if (!hasTerms) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
          <Info className="w-6 h-6 opacity-40" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Coverage terms not recorded.</p>
          <p className="text-xs text-center max-w-xs">Edit the quotation on the Quotations tab to add coverage terms before running deviation analysis.</p>
        </div>
      );
    }

    if (deviations.length === 0) {
      // Check if there's a prior quotation to compare against
      const quotIdx = quotations.findIndex(q => q.id === selectedQuotId);
      if (quotIdx <= 0) {
        return (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <GitCompare className="w-6 h-6 opacity-40" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No baseline to compare against.</p>
            <p className="text-xs text-center max-w-xs">Deviations appear once a second quotation exists for the same insurer.</p>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
          <CheckCircle2 className="w-6 h-6 opacity-40 text-emerald-400" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No deviations found.</p>
          <p className="text-xs">This quotation's terms match the prior version exactly.</p>
        </div>
      );
    }

    const highCount = deviations.filter(d => d.severity === "HIGH").length;
    const medCount = deviations.filter(d => d.severity === "MEDIUM").length;

    return (
      <div className="space-y-4">
        {/* Summary bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{deviations.length} deviation{deviations.length !== 1 ? "s" : ""} found</span>
          {highCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="w-2.5 h-2.5" />{highCount} High
            </span>
          )}
          {medCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {medCount} Medium
            </span>
          )}
        </div>

        {/* Deviations table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-dark-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-5 w-48">Parameter</th>
                <th className="py-3 px-5">Prior Value</th>
                <th className="py-3 px-5">Current Value</th>
                <th className="py-3 px-5 w-24">Change</th>
                <th className="py-3 px-5 w-24">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {deviations.map(dev => {
                const typeConf = TYPE_CONFIG[dev.deviation_type] ?? TYPE_CONFIG.CHANGED;
                const sevConf = SEVERITY_CONFIG[dev.severity] ?? SEVERITY_CONFIG.LOW;
                return (
                  <tr key={dev.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-2/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-gray-700 dark:text-gray-300">
                      {dev.field_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </td>
                    <td className="py-3.5 px-5 text-gray-400 dark:text-gray-500 max-w-[200px]">
                      <span className="line-clamp-2">{dev.prior_value || "—"}</span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-700 dark:text-gray-300 max-w-[200px]">
                      <span className="line-clamp-2">{dev.current_value || "—"}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConf.className}`}>
                        {typeConf.icon}
                        {dev.deviation_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${sevConf.className}`}>
                        {sevConf.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[500px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-dark-3">
      {/* Sidebar */}
      <div className="w-full lg:w-64 p-6 shrink-0 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quotations</h3>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Select a quotation to view its deviations from the prior version.</p>
        </div>

        {quotations.length === 0 ? (
          <p className="text-xs text-gray-400">No quotations yet.</p>
        ) : (
          <div className="space-y-2">
            {quotations.map(quot => {
              const isSelected = selectedQuotId === quot.id;
              const insName = insurerMap[quot.insurer_id]?.name || `Insurer ${quot.insurer_id}`;
              return (
                <button
                  key={quot.id}
                  onClick={() => setSelectedQuotId(quot.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#0B1727] dark:border-white bg-[#0B1727]/5 dark:bg-white/5 shadow-sm"
                      : "border-gray-100 dark:border-dark-3 bg-white dark:bg-dark-2 hover:border-gray-300 dark:hover:border-dark-5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{insName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">v{quot.version} · ₹{quot.total_premium.toLocaleString()}</p>
                    </div>
                    {quot.is_selected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main panel */}
      <div className="flex-1 p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Deviation Analysis</h3>
          {selectedQuot && (
            <p className="text-[11px] text-gray-400 mt-1">
              {insurerMap[selectedQuot.insurer_id]?.name || "Quotation"} v{selectedQuot.version} — comparing against prior version
            </p>
          )}
        </div>
        {renderDeviationsContent()}
      </div>
    </div>
  );
}

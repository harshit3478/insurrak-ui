"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { PolicyRequestRead, UnitRead, BrokerRead } from "@/types/api";
import { User } from "@/types";
import { ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { Loading } from "@/components/ui/Loading";

/**
 * Policy lifecycle stages used for the horizontal progress stepper.
 * Each step corresponds to a potential policy status.
 */
const STEPS = [
  { label: "Draft", status: "DRAFT" },
  { label: "Data Collection", status: "DATA_COLLECTION" },
  { label: "Quoting", status: "QUOTING" },
  { label: "Approval", status: "APPROVAL_PENDING" },
  { label: "Active", status: "ACTIVE" },
];

/**
 * Visual styles for policy status badges, supporting both light and dark modes.
 */
const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  APPROVAL_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  PAYMENT_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  DRAFT: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  QUOTING: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
  DATA_COLLECTION: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  RISK_HELD: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  EXPIRING: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const getStatusDotColor = (status: string) => {
  if (status === "ACTIVE" || status === "APPROVED") return "bg-green-500";
  if (["APPROVAL_PENDING", "PAYMENT_PENDING", "EXPIRING"].includes(status)) return "bg-yellow-500";
  if (status === "QUOTING") return "bg-purple-500";
  if (status === "DRAFT") return "bg-blue-500";
  if (status === "DATA_COLLECTION") return "bg-indigo-500";
  if (status === "RISK_HELD") return "bg-red-500";
  return "bg-gray-400";
};

/**
 * Navigation tabs for different aspects of a specific policy request.
 */
const TABS = [
  { label: "Documents", href: "documents" },
  { label: "Quotations", href: "quotations" },
  { label: "Deviations", href: "deviations" },
  { label: "Approvals", href: "approvals" },
  { label: "Activity", href: "activity" },
  { label: "Financials", href: "financials" },
];

export default function PolicyDetailsLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [policy, setPolicy] = useState<PolicyRequestRead | null>(null);
  const [unit, setUnit] = useState<UnitRead | null>(null);
  const [broker, setBroker] = useState<BrokerRead | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const p = await apiClient.getPolicyRequestById(Number(id));
        setPolicy(p);

        // Parallel fetch for associated data
        const [u, b, c] = await Promise.all([
          apiClient.getUnitById(p.unit_id).catch(() => null),
          apiClient.getBrokerById(p.broker_id).catch(() => null),
          apiClient.getById(p.requested_by_id).catch(() => null),
        ]);
        setUnit(u);
        setBroker(b);
        setCreator(c);
      } catch (err) {
        console.error("Failed to fetch policy details", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <Loading />;
  if (!policy) return <div className="p-8 text-center text-gray-500 font-medium">Policy not found.</div>;

  const currentStepIndex = STEPS.findIndex(s => s.status === policy.status);
  const activeTab = TABS.find(tab => pathname.includes(tab.href))?.href || "documents";

  return (
    <div className="p-4 md:p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/policies')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium border border-gray-200 dark:border-dark-3 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-dark transition-colors shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-4 md:p-8 space-y-8">
        {/* Title and Status */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Policy Request: {policy.policy_number || `PRQ-${policy.id}`}
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[policy.status] || STATUS_STYLES.DRAFT}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(policy.status)}`}></span>
            {policy.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Progress Bar (Stepper) */}
        <div className="relative pt-4 pb-12 overflow-x-hidden">
          <div className="flex items-center justify-between w-full relative">
            {STEPS.map((step, idx) => {
              // A step is considered completed if its index is before the current status index or if the policy is fully active.
              const isCompleted = idx < currentStepIndex || policy.status === "ACTIVE"; 
              const isActive = idx === currentStepIndex;
              
              return (
                <React.Fragment key={step.status}>
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? "bg-[#00B69B] text-white" : 
                      isActive ? "border-2 border-[#00B69B] bg-white text-[#00B69B]" : 
                      "bg-gray-200 text-gray-400 dark:bg-dark-3"
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${isActive ? "bg-[#00B69B]" : "bg-transparent"}`} />}
                    </div>
                    <span className={`absolute top-8 text-[10px] sm:text-[11px] font-bold whitespace-nowrap text-center ${
                      isCompleted || isActive ? "text-gray-900 dark:text-gray-200" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${
                      idx < currentStepIndex ? "bg-[#00B69B]" : "bg-gray-200 dark:bg-dark-3"
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="pt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Policy Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-12">
            <div>
              <p className="text-xs text-gray-400 mb-1">Unit</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{unit?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Broker</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{broker?.name || 'SecureRisk Brokers'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Sum Insured</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">₹{policy.sum_insured?.toLocaleString() || '5,00,00,000'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created By</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{creator?.name || 'Rajesh Kumar'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Asset</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{policy.asset_description || 'Heavy Machinery (2)'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Line of Business</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{policy.line_of_business || 'Fire & Burglary'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(policy.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full overflow-hidden">
        <nav className="grid grid-cols-6 w-full gap-0.5 sm:gap-2" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.href;
            return (
              <button
                key={tab.href}
                onClick={() => router.push(`/policies/${id}/${tab.href}`)}
                className={`
                  w-full px-0.5 sm:px-4 py-2 sm:py-2.5 text-[7px] min-[340px]:text-[8px] min-[380px]:text-[10px] min-[480px]:text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-200 text-center truncate
                  ${isActive 
                    ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727] shadow-md shadow-[#0B1727]/10 border-none" 
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-dark-2 border-none dark:border dark:border-dark-3 hover:border-gray-300 dark:hover:border-dark-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"}
                `}
                title={tab.label}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[400px]">
        {children}
      </div>
    </div>
  );
}

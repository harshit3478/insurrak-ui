"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead } from "@/types/api";
import {
  ChevronLeft, Check, Loader2, X, ArrowRight,
  AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { Loading } from "@/components/ui/Loading";

const STEPS: Array<{ label: string; statuses: string[] }> = [
  { label: "Intimated",       statuses: ["INITIATED", "AWAITING_DOCS"] },
  { label: "Survey",          statuses: ["SENT_TO_BROKER"] },
  { label: "Doc Review",      statuses: ["UNDER_REVIEW", "QUERY_RAISED"] },
  { label: "Approval",        statuses: ["APPROVED_FULL", "APPROVED_PARTIAL", "REJECTED"] },
  { label: "Settled",         statuses: ["SETTLEMENT_PENDING", "CREDITED", "CLOSED"] },
];

const STATUS_LABELS: Record<string, string> = {
  INITIATED: "Initiated", AWAITING_DOCS: "Awaiting Docs",
  SENT_TO_BROKER: "With Broker", UNDER_REVIEW: "Under Review",
  QUERY_RAISED: "Query Raised", APPROVED_FULL: "Approved (Full)",
  APPROVED_PARTIAL: "Approved (Partial)", REJECTED: "Rejected",
  SETTLEMENT_PENDING: "Settlement Pending", CREDITED: "Credited", CLOSED: "Closed",
};

const STATUS_STYLES: Record<string, string> = {
  INITIATED: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  AWAITING_DOCS: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  SENT_TO_BROKER: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
  UNDER_REVIEW: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  QUERY_RAISED: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800",
  APPROVED_FULL: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  APPROVED_PARTIAL: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-teal-100 dark:border-teal-800",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
  SETTLEMENT_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  CREDITED: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-dark-3 dark:text-gray-400 border-gray-200 dark:border-dark-4",
};

const STATUS_DOT: Record<string, string> = {
  INITIATED: "bg-blue-500", AWAITING_DOCS: "bg-amber-500",
  SENT_TO_BROKER: "bg-purple-500", UNDER_REVIEW: "bg-indigo-500",
  QUERY_RAISED: "bg-orange-500", APPROVED_FULL: "bg-emerald-500",
  APPROVED_PARTIAL: "bg-teal-500", REJECTED: "bg-red-500",
  SETTLEMENT_PENDING: "bg-yellow-500", CREDITED: "bg-green-500", CLOSED: "bg-gray-400",
};

type ActionVariant = "primary" | "success" | "danger";
type ActionConfig = { label: string; nextStatus: string; variant: ActionVariant };

const STATUS_ACTIONS: Partial<Record<string, ActionConfig[]>> = {
  AWAITING_DOCS: [{ label: "Send to Broker", nextStatus: "SENT_TO_BROKER", variant: "primary" }],
  SENT_TO_BROKER: [{ label: "Start Document Review", nextStatus: "UNDER_REVIEW", variant: "primary" }],
  UNDER_REVIEW: [
    { label: "Record Decision", nextStatus: "", variant: "success" },
    { label: "Raise Query", nextStatus: "QUERY_RAISED", variant: "danger" },
  ],
  QUERY_RAISED: [{ label: "Resubmit to Broker", nextStatus: "SENT_TO_BROKER", variant: "primary" }],
  SETTLEMENT_PENDING: [{ label: "Record Settlement", nextStatus: "", variant: "success" }],
  CREDITED: [{ label: "Close Claim", nextStatus: "CLOSED", variant: "primary" }],
};

const STATUS_DESCRIPTIONS: Partial<Record<string, string>> = {
  AWAITING_DOCS: "Gather all supporting documents for the claim and send the case to the broker for survey.",
  SENT_TO_BROKER: "Broker has the case. Once the surveyor assessment is ready, start the document review.",
  UNDER_REVIEW: "Review the surveyor's findings and record the insurer's approval decision.",
  QUERY_RAISED: "Insurer has raised a query. Compile the response and resubmit to the broker.",
  SETTLEMENT_PENDING: "Approval recorded. Record the settlement amount once the insurer transfers funds.",
  CREDITED: "Settlement credited. Close this claim to complete the lifecycle.",
};

const TABS = [
  { label: "Overview", href: "overview" },
  { label: "Surveyor", href: "surveyor" },
  { label: "Documents", href: "documents" },
  { label: "Settlement", href: "settlement" },
  { label: "Activity", href: "activity" },
];

export default function ClaimDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Decision modal state (UNDER_REVIEW)
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<"APPROVED_FULL" | "APPROVED_PARTIAL" | "REJECTED">("APPROVED_FULL");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [insurerClaimNumber, setInsurerClaimNumber] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState("");

  // Settlement modal state
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settledAmount, setSettledAmount] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);
  const [settlementError, setSettlementError] = useState("");

  const fetchClaim = useCallback(async () => {
    try {
      const data = await apiClient.claims.getById(Number(id));
      setClaim(data);
    } catch (err) {
      console.error("Failed to fetch claim", err);
    }
  }, [id]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchClaim();
      setLoading(false);
    }
    if (id) load();
  }, [id, fetchClaim]);

  useEffect(() => {
    const handler = () => fetchClaim();
    window.addEventListener("claim:refresh", handler);
    return () => window.removeEventListener("claim:refresh", handler);
  }, [fetchClaim]);

  const handleTransition = async (nextStatus: string) => {
    if (!claim) return;
    setIsTransitioning(true);
    try {
      await apiClient.claims.transition(claim.id, { new_status: nextStatus });
      await fetchClaim();
    } catch (err) {
      console.error("Transition failed", err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleSubmitDecision = async () => {
    if (!claim) return;
    if ((decision === "APPROVED_FULL" || decision === "APPROVED_PARTIAL") && !approvedAmount) {
      setDecisionError("Approved amount is required.");
      return;
    }
    setIsSubmittingDecision(true);
    setDecisionError("");
    try {
      await apiClient.claims.recordApproval(claim.id, {
        decision,
        approved_amount: approvedAmount ? Number(approvedAmount) : null,
        insurer_claim_number: insurerClaimNumber.trim() || null,
        notes: decisionNotes.trim() || null,
      });
      setShowDecisionModal(false);
      await fetchClaim();
    } catch (err) {
      setDecisionError("Failed to record decision. Please try again.");
      console.error(err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleSubmitSettlement = async () => {
    if (!claim || !settledAmount) {
      setSettlementError("Settled amount is required.");
      return;
    }
    setIsSubmittingSettlement(true);
    setSettlementError("");
    try {
      await apiClient.claims.recordSettlement(claim.id, {
        settled_amount: Number(settledAmount),
        notes: settlementNotes.trim() || null,
      });
      setShowSettlementModal(false);
      await fetchClaim();
    } catch (err) {
      setSettlementError("Failed to record settlement. Please try again.");
      console.error(err);
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  if (loading) return <Loading />;
  if (!claim) return <div className="p-8 text-center text-gray-500 font-medium">Claim not found.</div>;

  const currentStepIndex = STEPS.findIndex(s => s.statuses.includes(claim.status));
  const activeTab = TABS.find(tab => pathname.includes(tab.href))?.href || "overview";
  const statusActions = STATUS_ACTIONS[claim.status] || [];

  const getOnClick = (action: ActionConfig) => {
    if (claim.status === "UNDER_REVIEW" && action.variant === "success") {
      return () => {
        setDecision("APPROVED_FULL");
        setApprovedAmount("");
        setInsurerClaimNumber("");
        setDecisionNotes("");
        setDecisionError("");
        setShowDecisionModal(true);
      };
    }
    if (claim.status === "SETTLEMENT_PENDING") {
      return () => {
        setSettledAmount(String(claim.approved_amount || ""));
        setSettlementNotes("");
        setSettlementError("");
        setShowSettlementModal(true);
      };
    }
    return () => handleTransition(action.nextStatus);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen font-sans space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/claims")}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium border border-gray-200 dark:border-dark-3 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-dark transition-colors shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Claims Center
      </button>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-4 md:p-8 space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Claim: {claim.insurer_claim_number || `CLM-${claim.id}`}
            {claim.incident_description && (
              <span className="text-lg font-normal text-gray-400 ml-2">
                ({claim.incident_description.slice(0, 40)}{claim.incident_description.length > 40 ? "…" : ""})
              </span>
            )}
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[claim.status] || ""}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[claim.status] || "bg-gray-400"}`} />
            {STATUS_LABELS[claim.status] || claim.status}
          </span>
        </div>

        {/* Stepper */}
        <div className="relative pt-4 pb-12 overflow-x-hidden">
          <div className="flex items-center justify-between w-full relative">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center relative z-10 px-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? "bg-[#00B69B] text-white" :
                      isActive ? "border-2 border-[#00B69B] bg-white text-[#00B69B]" :
                      "bg-gray-200 text-gray-400 dark:bg-dark-3"
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${isActive ? "bg-[#00B69B]" : "bg-transparent"}`} />}
                    </div>
                    <span className={`absolute top-8 text-[10px] sm:text-[11px] font-bold whitespace-nowrap ${
                      isCompleted || isActive ? "text-gray-900 dark:text-gray-200" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${idx < currentStepIndex ? "bg-[#00B69B]" : "bg-gray-200 dark:bg-dark-3"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Claim overview */}
        <div className="pt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Claim Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-12">
            <div>
              <p className="text-xs text-gray-400 mb-1">Related Policy</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">PR-{claim.policy_request_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Claim Type</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{claim.claim_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Estimated Loss</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {claim.estimated_loss ? `₹${claim.estimated_loss.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Incident Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(claim.incident_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      {statusActions.length > 0 && (
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Next Step</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {STATUS_DESCRIPTIONS[claim.status]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusActions.map(action => (
              <button
                key={action.label}
                onClick={getOnClick(action)}
                disabled={isTransitioning}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                  action.variant === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : action.variant === "danger"
                    ? "bg-white dark:bg-dark-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] hover:bg-[#1a2639] dark:hover:bg-gray-100"
                }`}
              >
                {isTransitioning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : action.variant === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : action.variant === "danger" ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="w-full overflow-hidden">
        <nav className="grid grid-cols-5 w-full gap-0.5 sm:gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.href;
            return (
              <button
                key={tab.href}
                onClick={() => router.push(`/claims/${id}/${tab.href}`)}
                className={`w-full px-1 sm:px-4 py-2 sm:py-2.5 text-[9px] min-[340px]:text-[10px] min-[480px]:text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all text-center truncate ${
                  isActive
                    ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727] shadow-md"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-dark-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                }`}
                title={tab.label}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[400px]">
        {children}
      </div>

      {/* Decision Modal (UNDER_REVIEW) */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-md m-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Record Insurer Decision</h2>
                <p className="text-xs text-gray-400 mt-0.5">Claim: {claim.insurer_claim_number || `CLM-${claim.id}`}</p>
              </div>
              <button onClick={() => setShowDecisionModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {decisionError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {decisionError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Decision *</label>
                <div className="grid grid-cols-3 rounded-lg border border-gray-200 dark:border-dark-3 overflow-hidden">
                  {(["APPROVED_FULL", "APPROVED_PARTIAL", "REJECTED"] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDecision(d)}
                      className={`py-2 text-xs font-semibold transition-colors ${
                        decision === d
                          ? d === "REJECTED" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                          : "bg-white dark:bg-dark-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3"
                      }`}
                    >
                      {d === "APPROVED_FULL" ? "Full" : d === "APPROVED_PARTIAL" ? "Partial" : "Rejected"}
                    </button>
                  ))}
                </div>
              </div>
              {decision !== "REJECTED" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Approved Amount (₹) *</label>
                  <input type="number" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} placeholder="e.g. 1200000"
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Insurer Claim Number</label>
                <input type="text" value={insurerClaimNumber} onChange={e => setInsurerClaimNumber(e.target.value)} placeholder="e.g. CLM-10992"
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Notes</label>
                <textarea value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)} rows={3}
                  placeholder="Any remarks from the insurer..."
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={() => setShowDecisionModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleSubmitDecision} disabled={isSubmittingDecision}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                  decision === "REJECTED" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}>
                {isSubmittingDecision && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSubmittingDecision ? "Saving..." : "Confirm Decision"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-sm m-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Record Settlement</h2>
                <p className="text-xs text-gray-400 mt-0.5">Approved: {claim.approved_amount ? `₹${claim.approved_amount.toLocaleString()}` : "—"}</p>
              </div>
              <button onClick={() => setShowSettlementModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {settlementError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {settlementError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Settled Amount (₹) *</label>
                <input type="number" value={settledAmount} onChange={e => setSettledAmount(e.target.value)} placeholder="e.g. 1200000"
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Notes</label>
                <textarea value={settlementNotes} onChange={e => setSettlementNotes(e.target.value)} rows={3}
                  placeholder="UTR number, transfer details..."
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={() => setShowSettlementModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleSubmitSettlement} disabled={isSubmittingSettlement || !settledAmount}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                {isSubmittingSettlement && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSubmittingSettlement ? "Saving..." : "Confirm Settlement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

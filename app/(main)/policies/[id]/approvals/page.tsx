"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { ApprovalRead, QuotationRead, InsurerRead, PolicyRequestRead } from "@/types/api";
import { User } from "@/types";
import { Check, XCircle, Send, Clock, CheckCircle2, ExternalLink, AlertCircle, Loader2, X } from "lucide-react";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/context-provider/AuthProvider";

/**
 * PolicyApprovalsPage renders a vertical timeline of the policy's approval history,
 * plus an action card for approvers when the policy is in APPROVAL_PENDING state.
 */
export default function PolicyApprovalsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [policy, setPolicy] = useState<PolicyRequestRead | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRead[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [quotations, setQuotations] = useState<Record<number, QuotationRead>>({});
  const [quotationsList, setQuotationsList] = useState<QuotationRead[]>([]);
  const [insurers, setInsurers] = useState<Record<number, InsurerRead>>({});
  const [loading, setLoading] = useState(true);

  // Approval action state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approvalQuotationId, setApprovalQuotationId] = useState<number | "">("");
  const [approvalComments, setApprovalComments] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const canApprove = user?.role === "COMPANY_ADMIN";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [pr, apps, quots, allInsurers] = await Promise.all([
          apiClient.getPolicyRequestById(Number(id)),
          apiClient.getApprovals(Number(id)),
          apiClient.getQuotations(Number(id)),
          apiClient.getAllInsurers().catch(() => [] as InsurerRead[]),
        ]);
        setPolicy(pr);
        setApprovals(apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setQuotationsList(quots);

        const quotMap: Record<number, QuotationRead> = {};
        quots.forEach(q => quotMap[q.id] = q);
        setQuotations(quotMap);

        const insurerMap: Record<number, InsurerRead> = {};
        allInsurers.forEach(ins => insurerMap[ins.id] = ins);
        setInsurers(insurerMap);

        const uniqueUserIds = Array.from(new Set(apps.map(a => a.approver_id)));
        const userPromises = uniqueUserIds.map(uid => apiClient.getById(uid).catch(() => null));
        const userData = await Promise.all(userPromises);
        const userMap: Record<string, User> = {};
        userData.forEach(u => {
          if (u) userMap[String(u.id)] = u;
        });
        setUsers(userMap);
      } catch (err) {
        console.error("Failed to fetch approvals data", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const selectedQuotation = quotationsList.find(q => q.is_selected) ?? null;

  const openApprovalModal = (decision: "APPROVED" | "REJECTED") => {
    setApprovalDecision(decision);
    setApprovalQuotationId(selectedQuotation?.id ?? "");
    setApprovalComments("");
    setApprovalError("");
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!policy) return;
    if (approvalDecision === "REJECTED" && !approvalComments.trim()) {
      setApprovalError("Please provide a reason for rejection.");
      return;
    }
    if (approvalDecision === "APPROVED" && !approvalQuotationId) {
      setApprovalError("Please select the quotation being approved.");
      return;
    }
    setIsSubmittingApproval(true);
    setApprovalError("");
    try {
      await apiClient.submitApproval(policy.id, {
        decision: approvalDecision,
        quotation_id: approvalDecision === "APPROVED" ? Number(approvalQuotationId) : null,
        comments: approvalComments.trim() || null,
      });
      setShowApprovalModal(false);
      // Reload data
      const [updatedPolicy, updatedApprovals] = await Promise.all([
        apiClient.getPolicyRequestById(Number(id)),
        apiClient.getApprovals(Number(id)),
      ]);
      setPolicy(updatedPolicy);
      setApprovals(updatedApprovals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      // Dispatch refresh event so parent layout updates
      window.dispatchEvent(new CustomEvent("policy:refresh"));
    } catch (err) {
      setApprovalError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  if (loading) return <Loading />;

  const getDecisionIcon = (decision: string) => {
    switch (decision.toUpperCase()) {
      case 'APPROVED': return <div className="p-1 bg-emerald-500 rounded-full"><Check className="w-3 h-3 text-white" /></div>;
      case 'REJECTED': return <div className="p-1 bg-red-500 rounded-full"><XCircle className="w-3 h-3 text-white" /></div>;
      case 'SENT_FOR_APPROVAL': return <div className="p-1 bg-gray-200 dark:bg-dark-3 rounded-full"><Send className="w-3 h-3 text-gray-600 dark:text-gray-400" /></div>;
      default: return <div className="p-1 bg-yellow-500 rounded-full"><Clock className="w-3 h-3 text-white" /></div>;
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision.toUpperCase()) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'SENT_FOR_APPROVAL': return 'Sent for Approval';
      default: return decision;
    }
  };

  const isPendingApproval = policy?.status === "APPROVAL_PENDING";

  return (
    <div className="p-8 space-y-8">

      {/* Approval Action Card — visible to approvers when pending */}
      {isPendingApproval && canApprove && (
        <div className="bg-white dark:bg-dark-2 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Action Required — This policy is awaiting your approval</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Review the selected quotation below before deciding.</p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Selected Quotation Summary */}
            {selectedQuotation ? (
              <div className="bg-gray-50 dark:bg-dark-3 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selected Quotation</p>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {insurers[selectedQuotation.insurer_id]?.name || `Insurer ${selectedQuotation.insurer_id}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Premium: ₹{selectedQuotation.premium.toLocaleString()} + GST ₹{selectedQuotation.gst.toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Total: ₹{selectedQuotation.total_premium.toLocaleString()}
                    </p>
                    {(selectedQuotation.terms as (typeof selectedQuotation.terms & { total_sum_insured?: number | null }))?.total_sum_insured != null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sum Insured: ₹{Number((selectedQuotation.terms as (typeof selectedQuotation.terms & { total_sum_insured?: number | null }))!.total_sum_insured).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {selectedQuotation.file_path && (
                    <a
                      href={selectedQuotation.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-dark-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Quotation PDF
                    </a>
                  )}
                </div>
                {selectedQuotation.terms && (
                  <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-gray-100 dark:border-dark-5">
                    {selectedQuotation.terms.perils_included && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-28 shrink-0">Perils Covered:</span>
                        <span className="text-gray-600 dark:text-gray-300 line-clamp-2">{selectedQuotation.terms.perils_included}</span>
                      </div>
                    )}
                    {selectedQuotation.terms.exclusions && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-28 shrink-0">Exclusions:</span>
                        <span className="text-gray-600 dark:text-gray-300 line-clamp-2">{selectedQuotation.terms.exclusions}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                No quotation has been selected yet. The submitter must select a quotation before approval can proceed.
              </div>
            )}

            {/* Approve / Reject buttons */}
            {selectedQuotation && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openApprovalModal("APPROVED")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => openApprovalModal("REJECTED")}
                  className="flex items-center gap-2 px-5 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold rounded-lg transition-colors bg-white dark:bg-dark-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject / Revise
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval History */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Approval History</h3>
        <p className="text-[11px] text-gray-400 mt-1">Comprehensive trail of approvals</p>
      </div>

      <div className="relative space-y-12 pl-4">
        {/* Timeline Vertical Line */}
        <div className="absolute left-[29.5px] top-4 bottom-4 w-px bg-gray-100 dark:bg-dark-3 border-dashed border-l border-gray-200" />

        {approvals.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm italic">No approval history found for this policy.</div>
        ) : (
          approvals.map((app) => {
            const approver = users[app.approver_id];
            const quot = app.quotation_id ? quotations[app.quotation_id] : null;
            const insurer = quot ? insurers[quot.insurer_id] : null;

            return (
              <div key={app.id} className="relative flex gap-6">
                <div className="relative z-10 w-8 h-8 shrink-0 bg-white dark:bg-gray-dark flex items-center justify-center">
                  {getDecisionIcon(app.decision)}
                </div>

                <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 p-6 flex-1 shadow-sm max-w-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {getDecisionText(app.decision)}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      {new Date(app.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>

                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4 text-[11px]">
                        <div>
                           <p className="text-gray-400 mb-0.5">By : <span className="text-gray-900 dark:text-gray-200 font-bold">{users[String(app.approver_id)]?.name || 'Policy Processor'}</span></p>
                           <p className="text-gray-400 italic">({users[String(app.approver_id)]?.designation || 'Approver'})</p>
                        </div>
                        {quot && (
                          <div>
                             <p className="text-gray-400 mb-0.5">Quote Selected: <span className="text-gray-900 dark:text-gray-200 font-bold">{insurer?.name || 'Insurer'}</span></p>
                             <p className="text-gray-400 italic">(Premium: ₹{quot.total_premium.toLocaleString()})</p>
                          </div>
                        )}
                     </div>

                     {app.comments && (
                       <div className="bg-gray-50/50 dark:bg-dark-3/50 p-4 rounded-lg border border-gray-100 dark:border-dark-5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">{app.comments}</p>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval Decision Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Submit Approval Decision</h2>
                <p className="text-xs text-gray-400 mt-0.5">Policy: {policy?.policy_number || `PRQ-${policy?.id}`}</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {approvalError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {approvalError}
                </div>
              )}

              {/* Decision toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Decision *</label>
                <div className="flex rounded-lg border border-gray-200 dark:border-dark-3 overflow-hidden">
                  <button
                    onClick={() => setApprovalDecision("APPROVED")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors ${
                      approvalDecision === "APPROVED" ? "bg-emerald-600 text-white" : "bg-white dark:bg-dark-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setApprovalDecision("REJECTED")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors ${
                      approvalDecision === "REJECTED" ? "bg-red-600 text-white" : "bg-white dark:bg-dark-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>

              {/* Quotation selector (approve only) */}
              {approvalDecision === "APPROVED" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Quotation Being Approved *</label>
                  <select
                    value={approvalQuotationId}
                    onChange={e => setApprovalQuotationId(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none"
                  >
                    <option value="">Select quotation...</option>
                    {quotationsList.map(q => (
                      <option key={q.id} value={q.id}>
                        {insurers[q.insurer_id]?.name || `Insurer ${q.insurer_id}`} — ₹{q.total_premium.toLocaleString()} {q.is_selected ? "(Selected)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comments */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Comments {approvalDecision === "REJECTED" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={approvalComments}
                  onChange={e => setApprovalComments(e.target.value)}
                  placeholder={approvalDecision === "REJECTED" ? "Required: explain why this is being rejected..." : "Optional notes..."}
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmitApproval}
                disabled={isSubmittingApproval}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                  approvalDecision === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isSubmittingApproval && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSubmittingApproval ? "Submitting..." : approvalDecision === "APPROVED" ? "Approve Policy" : "Reject & Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

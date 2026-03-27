"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Info, IndianRupee, CornerDownRight } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const CLAIMABLE_TRANSITIONS: Record<string, string[]> = {
  AWAITING_DOCS: ["SENT_TO_BROKER"],
  SENT_TO_BROKER: ["UNDER_REVIEW"],
  QUERY_RAISED: ["SENT_TO_BROKER", "UNDER_REVIEW"],
};

export default function ClaimOverviewPage() {
  const params = useParams();
  const claimId = Number(params.id);
  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitionStatus, setTransitionStatus] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    apiClient.claims.getById(claimId)
      .then(setClaim)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [claimId]);

  const handleTransition = async () => {
    if (!transitionStatus) return;
    setIsTransitioning(true);
    try {
      const data = await apiClient.claims.transition(claimId, { new_status: transitionStatus });
      setClaim(data);
      setTransitionStatus("");
    } catch (err) {
      console.error(err);
      alert("Failed to transition claim status");
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleSettlement = async () => {
    if (!settlementAmount) return;
    setIsSettling(true);
    try {
      const data = await apiClient.claims.recordSettlement(claimId, {
        settled_amount: Number(settlementAmount),
      });
      setClaim(data);
      setSettlementAmount("");
    } catch (err) {
      console.error(err);
      alert("Failed to record settlement");
    } finally {
      setIsSettling(false);
    }
  };

  if (loading) return <Loading />;
  if (!claim) return null;

  const availableTransitions = CLAIMABLE_TRANSITIONS[claim.status] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Incident Details */}
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-gray-400" /> Incident Details
          </h2>
          <div className="bg-gray-50 dark:bg-dark-2 rounded-xl p-5 border border-gray-100 dark:border-dark-3 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{claim.claim_type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Incident Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(claim.incident_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Policy Request</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">PR-{claim.policy_request_id}</p>
              </div>
              {claim.insurer_claim_number && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Insurer Claim #</p>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{claim.insurer_claim_number}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-dark p-3 rounded-lg border border-gray-200 dark:border-dark-3">
                {claim.incident_description}
              </p>
            </div>
            {claim.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{claim.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financials */}
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-gray-400" /> Financials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-dark-2 p-5 rounded-xl border border-gray-100 dark:border-dark-3">
              <p className="text-sm text-gray-500 mb-1">Estimated Loss</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {claim.estimated_loss ? formatCurrency(claim.estimated_loss) : "—"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-2 p-5 rounded-xl border border-gray-100 dark:border-dark-3">
              <p className="text-sm text-gray-500 mb-1">Approved Amount</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {claim.approved_amount ? formatCurrency(claim.approved_amount) : "—"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1727] to-[#1a2b44] p-5 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Settled Amount</p>
              <p className="text-2xl font-bold text-[#C6F200]">
                {claim.settled_amount ? formatCurrency(claim.settled_amount) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Actions sidebar */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <CornerDownRight className="w-4 h-4" /> Workflow Actions
          </h3>

          {availableTransitions.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Change Status</label>
              <div className="flex gap-2">
                <select
                  title="Transition Status"
                  className="flex-1 rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5750F1] text-gray-900 dark:text-white"
                  value={transitionStatus}
                  onChange={(e) => setTransitionStatus(e.target.value)}
                >
                  <option value="">Select status...</option>
                  {availableTransitions.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <button
                  disabled={!transitionStatus || isTransitioning}
                  onClick={handleTransition}
                  className="px-4 py-2 bg-[#5750F1] text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isTransitioning ? "..." : "Go"}
                </button>
              </div>
            </div>
          )}

          {claim.status === "SETTLEMENT_PENDING" && (
            <div className="pt-4 border-t border-gray-100 dark:border-dark-3">
              <label className="block text-xs font-medium text-gray-500 mb-2">Record Settlement</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  className="flex-1 rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5750F1] text-gray-900 dark:text-white"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                />
                <button
                  disabled={!settlementAmount || isSettling}
                  onClick={handleSettlement}
                  className="px-4 py-2 bg-[#0B1727] text-[#C6F200] text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSettling ? "..." : "Settle"}
                </button>
              </div>
            </div>
          )}

          {availableTransitions.length === 0 && claim.status !== "SETTLEMENT_PENDING" && (
            <p className="text-sm text-gray-400 text-center py-2">No actions available in current status.</p>
          )}
        </div>
      </div>
    </div>
  );
}

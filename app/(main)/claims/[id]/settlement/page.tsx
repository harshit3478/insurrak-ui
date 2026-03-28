"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead } from "@/types/api";
import { IndianRupee, CheckCircle2, Clock } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function ClaimSettlementPage() {
  const { id } = useParams();
  const claimId = Number(id);
  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setClaim(await apiClient.claims.getById(claimId));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (id) load();
  }, [id]);

  useEffect(() => {
    const handler = async () => {
      const c = await apiClient.claims.getById(claimId).catch(() => null);
      if (c) setClaim(c);
    };
    window.addEventListener("claim:refresh", handler);
    return () => window.removeEventListener("claim:refresh", handler);
  }, [claimId]);

  if (loading) return <Loading />;
  if (!claim) return <div className="p-8 text-center text-sm text-gray-400">Claim not found.</div>;

  const isSettled = ["CREDITED", "CLOSED"].includes(claim.status);
  const isApproved = ["APPROVED_FULL", "APPROVED_PARTIAL", "SETTLEMENT_PENDING", "CREDITED", "CLOSED"].includes(claim.status);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Settlement</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Financial assessment and payout details for this claim.</p>
      </div>

      {/* Financial summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Estimated Loss</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {claim.estimated_loss ? formatCurrency(claim.estimated_loss) : "—"}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Approved Amount</p>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {claim.approved_amount ? formatCurrency(claim.approved_amount) : "—"}
          </p>
        </div>
        <div className="rounded-xl border-none shadow-sm p-5 bg-gradient-to-br from-[#0B1727] to-[#1a2b44]">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-[#C6F200]" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Net Settled</p>
          </div>
          <p className="text-xl font-bold text-[#C6F200]">
            {claim.settled_amount ? formatCurrency(claim.settled_amount) : "—"}
          </p>
        </div>
      </div>

      {/* Assessment breakdown */}
      {isApproved && claim.approved_amount ? (
        <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Final Assessment Breakdown</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">Total Claimed Amount (Estimated Loss)</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {claim.estimated_loss ? formatCurrency(claim.estimated_loss) : "—"}
              </p>
            </div>
            {claim.estimated_loss && claim.approved_amount && claim.estimated_loss !== claim.approved_amount && (
              <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Adjustments / Deductions</p>
                <p className="text-sm font-semibold text-red-500">
                  - {formatCurrency(claim.estimated_loss - claim.approved_amount)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">NET APPROVED PAYOUT</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(claim.approved_amount)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-2 border-2 border-dashed border-gray-100 dark:border-dark-3 rounded-xl text-gray-400">
          <Clock className="w-7 h-7 opacity-30" />
          <p className="text-sm font-medium">Assessment pending</p>
          <p className="text-xs">Payout details will appear once the insurer records a decision.</p>
        </div>
      )}

      {/* Payout details */}
      {isSettled && claim.settled_amount ? (
        <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Payout and Discharge Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction Details</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Settled Amount</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(claim.settled_amount)}</p>
                </div>
                {claim.insurer_claim_number && (
                  <div>
                    <p className="text-xs text-gray-400">Insurer Claim Number</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{claim.insurer_claim_number}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Settlement Status</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This claim has been credited and settled. All financial obligations for this claim are complete.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

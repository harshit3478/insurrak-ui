"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, Calendar, IndianRupee, ShieldCheck, FileCheck, Info, CornerDownRight 
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead } from "@/types/api";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-50 text-blue-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Settled: "bg-gray-100 text-gray-600 dark:bg-dark-3 dark:text-gray-400",
  Closed: "bg-gray-800 text-gray-200 dark:bg-gray-100 dark:text-gray-800",
};

import { Loading } from "@/components/ui/Loading";

export default function ClaimDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = Number(params.id);

  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);

  // Action states
  const [transitionStatus, setTransitionStatus] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    fetchClaim();
  }, [claimId]);

  async function fetchClaim() {
    try {
      setLoading(true);
      const data = await apiClient.claims.getById(claimId);
      setClaim(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleTransition = async () => {
    if (!transitionStatus) return;
    setIsTransitioning(true);
    try {
      const data = await apiClient.claims.transition(claimId, { new_status: transitionStatus });
      setClaim(data);
      setTransitionStatus("");
    } catch (err) {
      console.error(err);
      alert("Failed to transition claim");
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
        notes: "Settled via Dashboard"
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

  if (loading) {
    return <Loading />;
  }

  if (!claim) {
    return (
      <div className="p-8 text-center text-gray-500">
        Claim not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-dark p-6 md:p-10 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-dark-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {claim.insurer_claim_number || `Claim #${claim.id}`}
            </h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_STYLES[claim.status] || "bg-gray-100 text-gray-600"}`}>
              {claim.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-dark-6 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 
            Reported on {new Date(claim.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
             onClick={() => router.back()}
             className="px-5 py-2.5 bg-gray-100 dark:bg-dark-3 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-dark-2 transition"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (Col spanning 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-gray-400" />
              Incident Details
            </h2>
            <div className="bg-gray-50 dark:bg-dark-2 rounded-xl p-5 border border-gray-100 dark:border-dark-3 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{claim.claim_type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Incident Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(claim.incident_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Policy Request ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">PR-{claim.policy_request_id}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 mt-2">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-dark p-3 rounded-lg border border-gray-200 dark:border-dark-3">
                  {claim.incident_description}
                </p>
              </div>
              {claim.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 mt-2">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{claim.notes}</p>
                </div>
              )}
            </div>
          </section>

          <section>
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <IndianRupee className="w-5 h-5 text-gray-400" />
              Financials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white dark:bg-dark-2 p-5 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm">
                 <p className="text-sm text-gray-500 mb-1">Estimated Loss</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">
                   {claim.estimated_loss ? formatCurrency(claim.estimated_loss) : '-'}
                 </p>
               </div>
               <div className="bg-white dark:bg-dark-2 p-5 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm">
                 <p className="text-sm text-gray-500 mb-1">Approved Amount</p>
                 <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                   {claim.approved_amount ? formatCurrency(claim.approved_amount) : '-'}
                 </p>
               </div>
               <div className="bg-white dark:bg-dark-2 p-5 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm bg-gradient-to-br from-[#0B1727] to-[#1a2b44] border-none">
                 <p className="text-sm text-gray-400 mb-1">Settled Amount</p>
                 <p className="text-2xl font-bold text-[#C6F200]">
                   {claim.settled_amount ? formatCurrency(claim.settled_amount) : '-'}
                 </p>
               </div>
            </div>
          </section>

        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <section className="bg-gray-50 dark:bg-dark-2 rounded-xl p-5 border border-gray-100 dark:border-dark-3 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4" /> Workflow Actions
            </h3>
            
            <div className="space-y-5">
              {/* Transition Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Change Status</label>
                <div className="flex gap-2">
                  <select 
                    title="Transition Status"
                    className="flex-1 rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-gray-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={transitionStatus}
                    onChange={(e) => setTransitionStatus(e.target.value)}
                  >
                    <option value="">Select status...</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Surveyor Appointed">Surveyor Appointed</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    disabled={!transitionStatus || isTransitioning}
                    onClick={handleTransition}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    Go
                  </button>
                </div>
              </div>

               {/* Record Settlement */}
              {claim.status !== 'Settled' && claim.status !== 'Closed' && (
                <div className="pt-4 border-t border-gray-200 dark:border-dark-3">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Record Settlement</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      placeholder="Amount (INR)"
                      className="flex-1 w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-gray-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(e.target.value)}
                    />
                    <button
                      disabled={!settlementAmount || isSettling}
                      onClick={handleSettlement}
                      className="px-4 py-2 bg-[#0B1727] text-[#C6F200] text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      Settle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-dark-2 rounded-xl p-5 border border-gray-100 dark:border-dark-3 shadow-sm">
             <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Documents
             </h3>
             <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 dark:bg-dark-3 rounded-lg border border-dashed border-gray-200 dark:border-dark-4">
                No documents uploaded yet.
             </p>
             <button className="mt-4 w-full py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition">
               + Upload Document
             </button>
          </section>
        </div>

      </div>
    </div>
  );
}

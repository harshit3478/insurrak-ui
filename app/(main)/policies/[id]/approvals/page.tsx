"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { ApprovalRead, QuotationRead, InsurerRead } from "@/types/api";
import { User } from "@/types";
import { Check, XCircle, Send, Clock } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

/**
 * PolicyApprovalsPage renders a vertical timeline of the policy's approval history.
 * It tracks decision status, approver details, and associated comments or quotations
 * used for the decision-making process.
 */
export default function PolicyApprovalsPage() {
  const { id } = useParams();
  const [approvals, setApprovals] = useState<ApprovalRead[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [quotations, setQuotations] = useState<Record<number, QuotationRead>>({});
  const [insurers, setInsurers] = useState<Record<number, InsurerRead>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [apps, quots, allInsurers] = await Promise.all([
          apiClient.getApprovals(Number(id)),
          apiClient.getQuotations(Number(id)),
          apiClient.getAllInsurers().catch(() => []),
        ]);
        setApprovals(apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        
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

  return (
    <div className="p-8 space-y-8">
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
          approvals.map((app, idx) => {
            const approver = users[app.approver_id];
            const quot = app.quotation_id ? quotations[app.quotation_id] : null;
            const insurer = quot ? insurers[quot.insurer_id] : null;

            return (
              <div key={app.id} className="relative flex gap-6">
                <div className="relative z-10 w-[32px] h-[32px] shrink-0 bg-white dark:bg-gray-dark flex items-center justify-center">
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
    </div>
  );
}

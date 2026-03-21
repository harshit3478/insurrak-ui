"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { InvoiceRead, QuotationRead, InsurerRead } from "@/types/api";
import { CreditCard, Download, Copy, Info } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

/**
 * PolicyFinancialsPage handles the financial settlement aspect of a policy.
 * It displays Proforma Invoices (PI) and providing instructions and forms 
 * for recording premium payments.
 */
export default function PolicyFinancialsPage() {
  const { id } = useParams();
  const [invoices, setInvoices] = useState<InvoiceRead[]>([]);
  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [insurers, setInsurers] = useState<Record<number, InsurerRead>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [invs, quots, allInsurers] = await Promise.all([
          apiClient.getInvoices(Number(id)),
          apiClient.getQuotations(Number(id)),
          apiClient.getAllInsurers().catch(() => []),
        ]);
        setInvoices(invs);
        setQuotations(quots);
        
        const insurerMap: Record<number, InsurerRead> = {};
        allInsurers.forEach(ins => insurerMap[ins.id] = ins);
        setInsurers(insurerMap);
      } catch (err) {
        console.error("Failed to fetch financials data", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Financial Settlement</h3>
        <p className="text-[11px] text-gray-400 mt-1">Manage premium payments, upload transaction details, and download official tax documents.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-dark-3 rounded-2xl">
          No proforma invoices generated yet.
        </div>
      ) : (
        invoices.map(inv => (
          <div key={inv.id} className="space-y-6">
            {/* PI Card */}
            <div className="bg-white dark:bg-dark-2 rounded-2xl border border-gray-100 dark:border-dark-3 p-8 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-1">Proforma Invoice (PI)</h4>
                    <p className="text-[10px] text-gray-400">The insurer has generated the preliminary invoice based on the approved quote.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md">
                    <Download className="w-3.5 h-3.5" /> Download Proforma PDF
                  </button>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-12 pt-4">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">PI Number :</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">PI-HDFC-2025-0991</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Generated On :</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Oct 15, 2025</p>
                  </div>
                  <div className="md:col-start-1">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Base Premium :</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{inv.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">GST (18%) :</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{inv.gst.toLocaleString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Total Premium Payable</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹{inv.total.toLocaleString()}</p>
                  </div>
               </div>
            </div>

            {/* Payment Details Section */}
            <div className="bg-white dark:bg-dark-2 rounded-2xl border border-gray-100 dark:border-dark-3 p-8 shadow-sm">
               <div className="mb-8">
                  <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-1">Payment Details (Action Required)</h4>
                  <p className="text-[10px] text-gray-400">Please remit the total premium to the insurer's account and upload the UTR reference</p>
               </div>

               <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1 space-y-6">
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Insurer Bank Details:</p>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                       <div>
                         <p className="text-[10px] text-gray-400 mb-1">Beneficiary:</p>
                         <p className="text-xs font-bold text-gray-900 dark:text-white">HDFC Ergo Gen. Insurance</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 mb-1">Bank:</p>
                         <p className="text-xs font-bold text-gray-900 dark:text-white">HDFC Bank, Fort Branch</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 mb-1">Account No:</p>
                         <p className="text-xs font-bold text-gray-900 dark:text-white">00600340001234</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 mb-1">IFSC Code:</p>
                         <p className="text-xs font-bold text-gray-900 dark:text-white">HDFC0000060</p>
                       </div>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 dark:border-dark-5 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors">
                      <Copy className="w-3 h-3" /> Copy Bank Details
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Record Your Payment:</p>
                    <div className="space-y-4 pt-2">
                       <input 
                         type="text" 
                         placeholder="Enter UTR Number" 
                         className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-3 border border-gray-100 dark:border-dark-5 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                       />
                       <button className="w-full py-3 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                         Submit Payment Reference
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

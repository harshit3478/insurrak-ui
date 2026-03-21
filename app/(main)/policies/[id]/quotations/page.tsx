"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { QuotationRead, InsurerRead } from "@/types/api";
import { FileText, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

/**
 * PolicyQuotationsPage lists all insurer quotes for a policy request.
 * Rows can be expanded to reveal the detailed "Coverage Terms" 
 * (Perils, Deductibles, Exclusions, etc.) provided by that insurer.
 */
export default function PolicyQuotationsPage() {
  const { id } = useParams();
  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [insurers, setInsurers] = useState<Record<number, InsurerRead>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [quots, allInsurers] = await Promise.all([
          apiClient.getQuotations(Number(id)),
          apiClient.getAllInsurers().catch(() => []),
        ]);
        setQuotations(quots);

        const insurerMap: Record<number, InsurerRead> = {};
        allInsurers.forEach(ins => {
          insurerMap[ins.id] = ins;
        });
        setInsurers(insurerMap);
      } catch (err) {
        console.error("Failed to fetch quotations", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <Loading />;

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quotations ({quotations.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-gray-100 dark:border-dark-3">
              {['Insurer ↓', 'Premium ↓', 'GST (18%) ↓', 'Total Premium ↓', 'Attachment ↓'].map(h => (
                <th key={h} className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-gray-400">No quotations uploaded for this policy request yet.</td>
              </tr>
            ) : (
              quotations.map(quot => {
                const isExpanded = expandedRow === quot.id;
                const insName = insurers[quot.insurer_id]?.name || `Insurer ${quot.insurer_id}`;
                
                return (
                  <React.Fragment key={quot.id}>
                    <tr 
                      onClick={() => toggleRow(quot.id)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-dark-2' : 'hover:bg-gray-50/50 dark:hover:bg-dark-2/50'}`}
                    >
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{insName}</td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">₹{quot.premium.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">₹{quot.gst.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">₹{quot.total_premium.toLocaleString()}</td>
                      <td className="py-4 px-6 text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                        {quot.file_name || 'Quote.pdf'}
                        <Download className="w-2.5 h-2.5" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-dark-2">
                        <td colSpan={6} className="px-12 py-6 border-t border-gray-100 dark:border-dark-3">
                          <div className="max-w-3xl">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Coverage Terms ({insName})</h4>
                            <ul className="space-y-3 list-disc pl-5">
                              <li className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Perils Covered:</span> {quot.terms?.perils_included || 'Standard Fire & Special Perils, Earthquake, STFI.'}
                              </li>
                              <li className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Deductibles:</span> {quot.terms?.deductibles || '5% of claim amount subject to minimum ₹50,000.'}
                              </li>
                              <li className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Exclusions:</span> {quot.terms?.exclusions || 'Act of God perils not covered in baseline, war, nuclear.'}
                              </li>
                              <li className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Warranties:</span> {quot.terms?.warranties || '24/7 Security guard mandatory on premises.'}
                              </li>
                              <li className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Co-insurance:</span> {quot.terms?.co_insurance || 'None.'}
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

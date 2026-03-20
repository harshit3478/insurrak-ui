"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { QuotationRead, InsurerRead } from "@/types/api";
import { Check } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

/**
 * PolicyDeviationsPage provides a side-by-side comparison (Deviation Analysis) 
 * of up to 3 selected quotations against a baseline policy (Expiring Policy).
 * It highlights differences in parameters like Premium, Deductibles, and Coverage inclusions.
 */
export default function PolicyDeviationsPage() {
  const { id } = useParams();
  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [insurers, setInsurers] = useState<Record<number, InsurerRead>>({});
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<number[]>([]);
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
        
        // Auto-select first 3
        setSelectedQuoteIds(quots.slice(0, 3).map(q => q.id));

        const insurerMap: Record<number, InsurerRead> = {};
        allInsurers.forEach(ins => {
          insurerMap[ins.id] = ins;
        });
        setInsurers(insurerMap);
      } catch (err) {
        console.error("Failed to fetch deviations data", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <Loading />;

  const toggleSelection = (qid: number) => {
    setSelectedQuoteIds(prev => 
      prev.includes(qid) ? prev.filter(i => i !== qid) : [...prev, qid]
    );
  };

  const selectedQuotes = quotations.filter(q => selectedQuoteIds.includes(q.id));

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] divide-x divide-gray-100 dark:divide-dark-3">
      {/* Sidebar: Quotations List */}
      <div className="w-full lg:w-72 p-6 shrink-0 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quotations</h3>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Select up to 3 Quotations to see Deviation Analysis</p>
        </div>

        <div className="space-y-3">
          {quotations.map(quot => {
            const isSelected = selectedQuoteIds.includes(quot.id);
            const insName = insurers[quot.insurer_id]?.name || `Insurer ${quot.insurer_id}`;
            return (
              <button
                key={quot.id}
                onClick={() => toggleSelection(quot.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? "border-emerald-500 bg-white dark:bg-dark-2 shadow-sm ring-1 ring-emerald-500/20" 
                    : "border-gray-100 dark:border-dark-3 bg-white dark:bg-dark-2 hover:border-gray-300 dark:hover:border-dark-5"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{insName}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Total Premium: <span className="text-gray-900 dark:text-gray-200">₹{quot.total_premium.toLocaleString()}</span></p>
                  </div>
                  {isSelected && <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="flex-1 p-6 space-y-6 overflow-x-auto">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Deviation Analysis</h3>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Comprehensive Deviation Analysis for the selected Quotations</p>
        </div>

        <div className="bg-white dark:bg-dark-2 rounded-2xl border border-gray-100 dark:border-dark-3 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-dark-3">
             <p className="text-xs text-gray-500 dark:text-gray-400">
               Comparing: <span className="font-bold text-gray-900 dark:text-white italic">Expiring Policy (2024) [Baseline]</span>
               {selectedQuotes.map(q => <span key={q.id}> vs <span className="font-bold text-gray-900 dark:text-white">{insurers[q.insurer_id]?.name || 'Quote'}</span></span>)}
             </p>
          </div>
          
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-3/50 text-[10px] font-bold text-gray-400 uppercase">
                <th className="py-3 px-6 w-48">Parameter ↓</th>
                <th className="py-3 px-6 bg-gray-100/30 dark:bg-dark-4/30 italic">Expiring (Baseline) ↓</th>
                {selectedQuotes.map(q => (
                  <th key={q.id} className="py-3 px-6">{insurers[q.insurer_id]?.name || 'Quote'} ↓</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              <tr>
                <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Total Premium</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-300">₹1,20,000</td>
                {selectedQuotes.map(q => (
                  <td key={q.id} className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                    ₹{q.total_premium.toLocaleString()} 
                    <span className="ml-2 text-[10px] text-red-500">↑ 18%</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Deductibles</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-300">1% of claim amount</td>
                {selectedQuotes.map(q => (
                   <td key={q.id} className="py-4 px-6 text-gray-500 dark:text-gray-300 uppercase">
                     {q.terms?.deductibles || '5% of claim amount'}
                   </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Terrorism Cover</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-300 italic">Included in baseline</td>
                {selectedQuotes.map(q => (
                   <td key={q.id} className="py-4 px-6 text-gray-500 dark:text-gray-300">
                     {q.terms?.perils_included?.toLowerCase().includes('terrorism') ? 'Included' : 'Explicitly Excluded'}
                   </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">STFI Cover</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-300">Not Included</td>
                {selectedQuotes.map(q => (
                   <td key={q.id} className="py-4 px-6 text-gray-500 dark:text-gray-300">
                     {q.terms?.perils_included?.toLowerCase().includes('stfi') ? 'Included in baseline' : 'Not Included'}
                   </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Security Warranty</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-300">Guards at night only</td>
                {selectedQuotes.map(q => (
                   <td key={q.id} className="py-4 px-6 text-gray-500 dark:text-gray-300">
                     {q.terms?.warranties || '24/7 Guards mandatory'}
                   </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

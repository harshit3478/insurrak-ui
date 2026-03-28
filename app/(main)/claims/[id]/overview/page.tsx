"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead, ClaimDocumentRead } from "@/types/api";
import { Download, FileText, Folder } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

const DOC_TYPE_LABELS: Record<string, string> = {
  LOSS_INTIMATION: "Loss Intimation",
  SURVEY_REPORT: "Survey Report",
  REPAIR_ESTIMATE: "Repair Estimate",
  SETTLEMENT_LETTER: "Settlement Letter",
  OTHER: "Other",
};

export default function ClaimOverviewPage() {
  const { id } = useParams();
  const claimId = Number(id);
  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [documents, setDocuments] = useState<ClaimDocumentRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [c, docs] = await Promise.all([
          apiClient.claims.getById(claimId),
          apiClient.claims.getDocuments(claimId).catch(() => [] as ClaimDocumentRead[]),
        ]);
        setClaim(c);
        setDocuments(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  // Re-sync when layout signals a refresh
  useEffect(() => {
    const handler = async () => {
      const [c, docs] = await Promise.all([
        apiClient.claims.getById(claimId).catch(() => null),
        apiClient.claims.getDocuments(claimId).catch(() => [] as ClaimDocumentRead[]),
      ]);
      if (c) setClaim(c);
      setDocuments(docs);
    };
    window.addEventListener("claim:refresh", handler);
    return () => window.removeEventListener("claim:refresh", handler);
  }, [claimId]);

  if (loading) return <Loading />;
  if (!claim) return <div className="p-8 text-center text-sm text-gray-400">Claim not found.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Incident Details */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Incident Details</h3>
        <p className="text-[11px] text-gray-400">Comprehensive deviation analysis for the selected claim.</p>
      </div>

      <div className="space-y-4">
        {claim.claim_type && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Cause of Loss:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{claim.claim_type}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400 mb-1">Detailed Description:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{claim.incident_description}</p>
        </div>
        {claim.notes && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Situation:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{claim.notes}</p>
          </div>
        )}
      </div>

      {/* Submitted Proof */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Submitted Proof</h4>
          <span className="text-xs text-gray-400">({documents.length})</span>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 border-2 border-dashed border-gray-100 dark:border-dark-3 rounded-xl text-gray-400">
            <FileText className="w-6 h-6 opacity-40" />
            <p className="text-xs">No proof documents uploaded yet.</p>
          </div>
        ) : (
          <div className="border border-gray-100 dark:border-dark-3 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-dark-2 border-b border-gray-100 dark:border-dark-3">
                <tr>
                  {["Type", "File Name", "Date"].map(h => (
                    <th key={h} className="py-2.5 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{doc.file_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {doc.file_path && (
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors inline-flex">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

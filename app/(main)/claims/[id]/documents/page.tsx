"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import type { ClaimDocumentRead } from "@/types/api";
import { Download, Upload, Loader2, AlertCircle, FileText, Folder } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

const DOC_TYPES = ["LOSS_INTIMATION", "SURVEY_REPORT", "REPAIR_ESTIMATE", "SETTLEMENT_LETTER", "OTHER"];

const DOC_TYPE_LABELS: Record<string, string> = {
  LOSS_INTIMATION: "Loss Intimation",
  SURVEY_REPORT: "Survey Report",
  REPAIR_ESTIMATE: "Repair Estimate",
  SETTLEMENT_LETTER: "Settlement Letter",
  OTHER: "Other",
};

export default function ClaimDocumentsPage() {
  const { id } = useParams();
  const claimId = Number(id);
  const [documents, setDocuments] = useState<ClaimDocumentRead[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [docType, setDocType] = useState("LOSS_INTIMATION");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    const docs = await apiClient.claims.getDocuments(claimId).catch(() => [] as ClaimDocumentRead[]);
    setDocuments(docs);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchDocs();
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const file_path = await uploadToR2(file, "claims");
      await apiClient.claims.uploadDocument(claimId, {
        document_type: docType,
        file_name: file.name,
        file_path,
      });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await fetchDocs();
      window.dispatchEvent(new CustomEvent("claim:refresh"));
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Claim Documents</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Upload and manage supporting documents for this claim.</p>
      </div>

      {/* Upload section */}
      <div className="bg-gray-50 dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 p-5 space-y-3">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Upload Additional Document</p>
        {uploadError && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
          >
            {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
          </select>
          <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {file ? file.name : "Select file"}
          </button>
          <button onClick={handleUpload} disabled={isUploading || !file}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-xs font-bold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Documents list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Submitted Documents</h4>
          <span className="text-xs text-gray-400">({documents.length})</span>
        </div>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 border-2 border-dashed border-gray-100 dark:border-dark-3 rounded-xl text-gray-400">
            <FileText className="w-7 h-7 opacity-30" />
            <p className="text-sm font-medium">No documents yet.</p>
            <p className="text-xs">Upload supporting documents above.</p>
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

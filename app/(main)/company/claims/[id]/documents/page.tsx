"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Upload, X, ExternalLink } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { ClaimDocumentRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

const DOC_TYPE_LABELS: Record<string, string> = {
  LOSS_INTIMATION: "Loss Intimation",
  SURVEY_REPORT: "Survey Report",
  REPAIR_ESTIMATE: "Repair Estimate",
  SETTLEMENT_LETTER: "Settlement Letter",
  OTHER: "Other",
};

const DOC_TYPES = Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function ClaimDocumentsPage() {
  const params = useParams();
  const claimId = Number(params.id);
  const [documents, setDocuments] = useState<ClaimDocumentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () =>
    apiClient.claims.getDocuments(claimId)
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [claimId]);

  if (loading) return <Loading />;

  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Documents <span className="text-sm font-normal text-gray-400">({documents.length})</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1727] text-white text-sm font-medium rounded-lg hover:bg-[#1a2639] transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-[#5750F1] hover:underline">
            Upload the first document
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-dark-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.file_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-dark-3 text-gray-600 dark:text-gray-400">
                    {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
              <a
                href={doc.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <UploadModal
          claimId={claimId}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

function UploadModal({
  claimId,
  onClose,
  onSuccess,
}: {
  claimId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [docType, setDocType] = useState("LOSS_INTIMATION");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    setUploading(true);
    setError(null);
    try {
      const { upload_url, public_url } = await apiClient.getPresignedUrl({
        file_name: file.name,
        content_type: file.type,
        folder: "claim-documents",
      });
      await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await apiClient.claims.uploadDocument(claimId, {
        document_type: docType,
        file_name: file.name,
        file_path: public_url,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5750F1]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-3 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upload Document</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Document Type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputClass}>
              {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">File *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0B1727] file:text-white hover:file:bg-[#1a2639]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={uploading} className="flex-1 px-4 py-2.5 bg-[#0B1727] text-white text-sm font-medium rounded-lg hover:bg-[#1a2639] transition-colors disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 dark:border-dark-3 text-sm text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

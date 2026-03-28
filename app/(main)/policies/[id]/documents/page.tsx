"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import { PolicyDocumentRead } from "@/types/api";
import { User } from "@/types";
import { Folder, Download, Upload, X, Loader2, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

type DocCategory = "client" | "insurer" | "financial";

const CATEGORY_CONFIG: Record<DocCategory, { title: string; types: string[] }> = {
  client: {
    title: "Client Documents",
    types: ["GST_CERTIFICATE", "CIN_CERTIFICATE", "PAN_CARD", "UNDERWRITING_DATA", "OTHER_CUSTOM"],
  },
  insurer: {
    title: "Insurer & Vendor Documents",
    types: ["QUOTATION", "OTHER", "OTHER_CUSTOM"],
  },
  financial: {
    title: "Issuance & Financial",
    types: ["INVOICE", "RECEIPT", "SOFT_COPY", "HARD_COPY", "OTHER_CUSTOM"],
  },
};

function categorizeDocs(docs: PolicyDocumentRead[]) {
  const client = docs.filter(d => CATEGORY_CONFIG.client.types.includes(d.document_type));
  const insurer = docs.filter(d => CATEGORY_CONFIG.insurer.types.includes(d.document_type));
  const financial = docs.filter(d => CATEGORY_CONFIG.financial.types.includes(d.document_type));
  // anything uncategorized falls into client
  const uncategorized = docs.filter(d =>
    !client.includes(d) && !insurer.includes(d) && !financial.includes(d)
  );
  return { client: [...client, ...uncategorized], insurer, financial };
}

export default function PolicyDocumentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const prId = Number(id);
  const [documents, setDocuments] = useState<PolicyDocumentRead[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [policyStatus, setPolicyStatus] = useState<string>("");

  // Upload modal state
  const [activeCategory, setActiveCategory] = useState<DocCategory | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [customTypeName, setCustomTypeName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Issuance action state
  const [issuanceFile, setIssuanceFile] = useState<File | null>(null);
  const [issuanceUploading, setIssuanceUploading] = useState(false);
  const [issuanceError, setIssuanceError] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const issuanceFileRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const [docs, policy] = await Promise.all([
        apiClient.getPolicyDocuments(prId),
        apiClient.getPolicyRequestById(prId).catch(() => null),
      ]);
      setDocuments(docs);
      if (policy) setPolicyStatus(policy.status);
      const uniqueUserIds = Array.from(new Set(docs.map(d => d.uploaded_by_id)));
      const userData = await Promise.all(uniqueUserIds.map(uid => apiClient.getById(uid).catch(() => null)));
      const userMap: Record<string, User> = {};
      userData.forEach(u => { if (u) userMap[String(u.id)] = u; });
      setUsers(userMap);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchDocuments();
      setLoading(false);
    }
    if (id) loadData();
  }, [id]);

  // Re-sync issuance banner when layout modals complete (e.g. soft/hard copy uploaded from action bar)
  useEffect(() => {
    const handler = () => fetchDocuments();
    window.addEventListener("policy:refresh", handler);
    return () => window.removeEventListener("policy:refresh", handler);
  }, []);

  const handleIssuanceUpload = async (type: "soft" | "hard") => {
    if (!issuanceFile) return;
    setIssuanceUploading(true);
    setIssuanceError("");
    try {
      const file_path = await uploadToR2(issuanceFile, "policies");
      const data = { file_name: issuanceFile.name, file_path };
      if (type === "soft") {
        await apiClient.uploadSoftCopy(prId, data);
      } else {
        await apiClient.uploadHardCopy(prId, data);
      }
      setIssuanceFile(null);
      await fetchDocuments();
    } catch (err) {
      setIssuanceError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIssuanceUploading(false);
    }
  };

  const handleActivatePolicy = async () => {
    setIsActivating(true);
    try {
      await apiClient.transitionPolicyRequest(prId, "ACTIVE");
      router.refresh();
      await fetchDocuments();
    } catch (err) {
      console.error("Failed to activate policy", err);
    } finally {
      setIsActivating(false);
    }
  };

  const openUploadModal = (category: DocCategory) => {
    setActiveCategory(category);
    setDocumentType(CATEGORY_CONFIG[category].types[0]);
    setCustomTypeName("");
    setSelectedFile(null);
    setUploadError("");
  };

  const closeUploadModal = () => {
    setActiveCategory(null);
    setSelectedFile(null);
    setCustomTypeName("");
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !activeCategory) return;
    const effectiveType = documentType === "OTHER_CUSTOM" && customTypeName.trim()
      ? customTypeName.trim().toUpperCase().replace(/\s+/g, "_")
      : documentType;
    setIsUploading(true);
    setUploadError("");
    try {
      const publicUrl = await uploadToR2(selectedFile, "policies");
      await apiClient.uploadPolicyDocument(Number(id), {
        document_type: effectiveType,
        file_name: selectedFile.name,
        file_path: publicUrl,
      });
      closeUploadModal();
      await fetchDocuments();
    } catch (err) {
      setUploadError("Upload failed. Please check your connection and try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <Loading />;

  const { client: clientDocs, insurer: insurerDocs, financial: financialDocs } = categorizeDocs(documents);

  const renderSection = (category: DocCategory, docs: PolicyDocumentRead[]) => {
    const config = CATEGORY_CONFIG[category];
    return (
      <div className="space-y-0">
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{config.title}</h3>
            <span className="text-xs text-gray-400 font-medium">({docs.length})</span>
          </div>
          <button
            onClick={() => openUploadModal(category)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-3">
                {["Type", "File Name", "Uploaded By", "Date"].map(h => (
                  <th key={h} className="py-2.5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FileText className="w-6 h-6 opacity-40" />
                      <span className="text-xs">No documents yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                    <td className="py-3.5 px-6 text-sm font-semibold text-gray-900 dark:text-white">{doc.document_type.replace(/_/g, " ")}</td>
                    <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-300">{doc.file_name}</td>
                    <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-300">{users[String(doc.uploaded_by_id)]?.name || "—"}</td>
                    <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-300">
                      {new Date(doc.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {doc.file_path && (
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors inline-flex">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const issuanceStep = policyStatus === "RISK_HELD" ? "soft"
    : policyStatus === "POLICY_ISSUED_SOFT" ? "hard"
    : policyStatus === "POLICY_ISSUED_HARD" ? "activate"
    : null;

  return (
    <>
      {/* Issuance action banner */}
      {issuanceStep && (
        <div className="mx-6 mt-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {issuanceStep === "soft" && "Next Step: Upload Policy Soft Copy"}
              {issuanceStep === "hard" && "Next Step: Upload Policy Hard Copy"}
              {issuanceStep === "activate" && "Next Step: Activate Policy"}
            </span>
          </div>
          {issuanceStep === "activate" ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex-1">
                Hard copy has been uploaded. Click to mark this policy as Active.
              </p>
              <button
                onClick={handleActivatePolicy}
                disabled={isActivating}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isActivating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                Activate Policy
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {issuanceStep === "soft"
                  ? "Upload the scanned soft copy of the policy document received from the insurer."
                  : "Upload the physical hard copy scan to complete the issuance process."}
              </p>
              {issuanceError && <p className="text-xs text-red-600">{issuanceError}</p>}
              <input ref={issuanceFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={e => setIssuanceFile(e.target.files?.[0] || null)} />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => issuanceFileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {issuanceFile ? issuanceFile.name : "Select file"}
                </button>
                <button
                  onClick={() => handleIssuanceUpload(issuanceStep as "soft" | "hard")}
                  disabled={issuanceUploading || !issuanceFile}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-xs font-bold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {issuanceUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {issuanceUploading ? "Uploading..." : `Upload ${issuanceStep === "soft" ? "Soft" : "Hard"} Copy`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="divide-y divide-gray-100 dark:divide-dark-3 pb-6">
        {renderSection("client", clientDocs)}
        {renderSection("insurer", insurerDocs)}
        {renderSection("financial", financialDocs)}
      </div>

      {/* Upload Modal */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Upload Document</h2>
                <p className="text-xs text-gray-400 mt-0.5">{CATEGORY_CONFIG[activeCategory].title}</p>
              </div>
              <button onClick={closeUploadModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  {uploadError}
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Document Type *</label>
                <select
                  value={documentType}
                  onChange={e => { setDocumentType(e.target.value); setCustomTypeName(""); }}
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                >
                  {CATEGORY_CONFIG[activeCategory].types.map(t => (
                    <option key={t} value={t}>
                      {t === "OTHER_CUSTOM" ? "Other (specify below)" : t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {documentType === "OTHER_CUSTOM" && (
                  <input
                    type="text"
                    value={customTypeName}
                    onChange={e => setCustomTypeName(e.target.value)}
                    placeholder="e.g. FIRE SAFETY CERTIFICATE"
                    className="mt-2 w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">File *</label>
                <input ref={fileInputRef} type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-dark-3 rounded-lg py-6 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-dark-4 dark:hover:text-gray-300 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  {selectedFile
                    ? <span className="font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</span>
                    : <span>Click to select a file</span>
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={closeUploadModal} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || (documentType === "OTHER_CUSTOM" && !customTypeName.trim())}
                className="flex items-center gap-2 px-5 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { PolicyDocumentRead } from "@/types/api";
import { User } from "@/types";
import { Folder, Download } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

/**
 * PolicyDocumentsPage displays all documents associated with a specific policy request.
 * Documents are categorized into Client, Insurer/Vendor, and Issuance/Financial groups
 * for better organization and traceability.
 */
export default function PolicyDocumentsPage() {
  const { id } = useParams();
  const [documents, setDocuments] = useState<PolicyDocumentRead[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const docs = await apiClient.getPolicyDocuments(Number(id));
        setDocuments(docs);

        // Fetch users for "Uploaded By" mapping
        const uniqueUserIds = Array.from(new Set(docs.map(d => d.uploaded_by_id)));
        const userPromises = uniqueUserIds.map(uid => apiClient.getById(uid).catch(() => null));
        const userData = await Promise.all(userPromises);
        const userMap: Record<string, User> = {};
        userData.forEach(u => {
          if (u) userMap[String(u.id)] = u;
        });
        setUsers(userMap);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <Loading />;

  const renderDocumentTable = (title: string, docs: PolicyDocumentRead[]) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-6 pt-6">
        <Folder className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-gray-100 dark:border-dark-3">
              {['Type ↓', 'File Name ↓', 'Uploaded By ↓', 'Date ↓'].map(h => (
                <th key={h} className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
            {docs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-400">No documents in this category.</td>
              </tr>
            ) : (
              docs.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors group">
                  <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{doc.document_type.replace(/_/g, " ")}</td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">{doc.file_name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">{users[String(doc.uploaded_by_id)]?.name || 'System'}</td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Simple categorization logic
  const clientDocs = documents.filter(d => ['CIN_CERTIFICATE', 'UNDERWRITING_DATA', 'PAN_CARD', 'GST_CERTIFICATE'].includes(d.document_type));
  const insurerDocs = documents.filter(d => ['QUOTATION'].includes(d.document_type));
  const financialDocs = documents.filter(d => ['INVOICE', 'SOFT_COPY', 'HARD_COPY', 'RECEIPT'].includes(d.document_type));

  return (
    <div className="divide-y divide-gray-100 dark:divide-dark-3 pb-8">
      {renderDocumentTable("Client Documents", clientDocs.length > 0 ? clientDocs : documents.filter(d => !insurerDocs.includes(d) && !financialDocs.includes(d)))}
      {renderDocumentTable("Insurer & Vendor Documents", insurerDocs)}
      {renderDocumentTable("Issuance & Financial", financialDocs)}
    </div>
  );
}

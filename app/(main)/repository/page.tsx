"use client";

import { useEffect, useState } from "react";
import { RepositoryDocument } from "@/types";
import { FileText, Search, Download, Eye } from "lucide-react";

const FILE_TYPE_STYLES: Record<RepositoryDocument["fileType"], string> = {
  PDF: "bg-red-50 text-red-700",
  XLS: "bg-emerald-50 text-emerald-700",
  XLSX: "bg-emerald-50 text-emerald-700",
  JPG: "bg-purple-50 text-purple-700",
  PNG: "bg-purple-50 text-purple-700",
  DOCX: "bg-blue-50 text-blue-700",
};

function formatSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export default function RepositoryPage() {
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: Replace with real API call when repository endpoint is available
    setDocuments([]);
  }, []);

  const filtered = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      d.policyNumber.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 bg-white dark:bg-gray-dark p-6 md:p-10 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Document Repository
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-6 mt-0.5">
            {documents.length} documents across all policies
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#C6F200] text-black px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#b0d600] transition-colors">
          <FileText className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-gray-50 dark:bg-dark-2 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C6F200]"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-100 dark:border-dark-3 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-gray-50 dark:bg-dark-2 border-b border-gray-100 dark:border-dark-3">
              <tr>
                {[
                  "Document Name",
                  "Type",
                  "Policy No.",
                  "Company",
                  "Uploaded On",
                  "Uploaded By",
                  "Size",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 dark:text-dark-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {filtered.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        FILE_TYPE_STYLES[doc.fileType]
                      }`}
                    >
                      {doc.fileType}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {doc.policyNumber}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {doc.companyName}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">
                    {doc.uploadedOn}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">
                    {doc.uploadedBy}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {formatSize(doc.sizeKb)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm text-gray-400"
                  >
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

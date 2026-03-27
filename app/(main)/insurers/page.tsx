"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import type { InsurerRead } from "@/types/api";
import { Building, Plus, X, Pencil } from "lucide-react";
import { SkeletonRows } from "@/components/ui/SkeletonRows";

export default function InsurersPage() {
  const [insurers, setInsurers] = useState<InsurerRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InsurerRead | null>(null);

  const load = () =>
    apiClient.getAllInsurers()
      .then(setInsurers)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (ins: InsurerRead) => { setEditing(ins); setShowModal(true); };

  return (
    <div className="p-0 min-h-screen font-sans">
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[600px] overflow-hidden">

        <div className="p-8 border-b border-gray-100 dark:border-dark-3 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Insurers</h1>
            <p className="text-sm text-gray-500 dark:text-dark-6">Manage insurance companies for your company.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Insurer
          </button>
        </div>

        <div className="px-8 pb-8 overflow-x-auto pt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                <th className="py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Name</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Branch</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Phone</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {loading ? (
                <SkeletonRows columns={6} rows={4} />
              ) : insurers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No insurers yet. Add your first insurer.</p>
                  </td>
                </tr>
              ) : (
                insurers.map((ins) => (
                  <tr key={ins.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                    <td className="py-3 text-sm font-semibold text-gray-900 dark:text-white">{ins.name}</td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-300">{ins.branch || "—"}</td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-300">{ins.contact_email || "—"}</td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-300">{ins.contact_phone || "—"}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        <span className={`w-1.5 h-1.5 rounded-full ${ins.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className={ins.is_active ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                          {ins.is_active ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => openEdit(ins)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <InsurerModal
          insurer={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

function InsurerModal({
  insurer,
  onClose,
  onSuccess,
}: {
  insurer: InsurerRead | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!insurer;
  const [name, setName] = useState(insurer?.name || "");
  const [branch, setBranch] = useState(insurer?.branch || "");
  const [email, setEmail] = useState(insurer?.contact_email || "");
  const [phone, setPhone] = useState(insurer?.contact_phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.updateInsurer(insurer.id, {
          name,
          branch: branch || null,
          contact_email: email || null,
          contact_phone: phone || null,
        });
      } else {
        await apiClient.createInsurer({
          company_id: 0, // server ignores this, uses auth
          name,
          branch: branch || null,
          contact_email: email || null,
          contact_phone: phone || null,
          is_active: true,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save insurer");
    } finally {
      setSubmitting(false);
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
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit Insurer" : "Add Insurer"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="e.g. New India Assurance" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Branch</label>
            <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className={inputClass} placeholder="e.g. Mumbai" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="contact@insurer.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#0B1727] text-white text-sm font-medium rounded-lg hover:bg-[#1a2639] transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : isEdit ? "Update Insurer" : "Add Insurer"}
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

"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import type { BrokerRead } from "@/types/api";
import { Briefcase, Plus, X, Pencil } from "lucide-react";
import { getClientCache, setClientCache, invalidateClientCache } from "@/lib/cache";
import { SkeletonRows } from "@/components/ui/SkeletonRows";

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<BrokerRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BrokerRead | null>(null);

  const load = () =>
    apiClient.getAllBrokers()
      .then(data => { setClientCache("brokers", data); setBrokers(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    const cached = getClientCache<BrokerRead[]>("brokers");
    if (cached) { setBrokers(cached); setLoading(false); return; }
    load();
  }, []);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (b: BrokerRead) => { setEditing(b); setShowModal(true); };

  return (
    <div className="p-0 min-h-screen font-sans">
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[600px] overflow-hidden">

        <div className="p-8 border-b border-gray-100 dark:border-dark-3 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Brokers</h1>
            <p className="text-sm text-gray-500 dark:text-dark-6">Manage insurance brokers for your company.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Broker
          </button>
        </div>

        <div className="px-8 pb-8 overflow-x-auto pt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                <th className="py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Name</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Phone</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SLA Days</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {loading ? (
                <SkeletonRows columns={6} rows={4} />
              ) : brokers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No brokers yet. Add your first broker.</p>
                  </td>
                </tr>
              ) : (
                brokers.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                    <td className="py-3 text-sm font-semibold text-gray-900 dark:text-white">{b.name}</td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-300">{b.contact_email || "—"}</td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-300">{b.contact_phone || "—"}</td>
                    <td className="py-3 text-sm text-gray-500 dark:text-gray-300">{b.sla_days}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${b.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className={b.is_active ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                          {b.is_active ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => openEdit(b)}
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
        <BrokerModal
          broker={editing}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); invalidateClientCache("brokers"); load(); }}
        />
      )}
    </div>
  );
}

function BrokerModal({
  broker,
  onClose,
  onSuccess,
}: {
  broker: BrokerRead | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!broker;
  const [name, setName] = useState(broker?.name || "");
  const [email, setEmail] = useState(broker?.contact_email || "");
  const [phone, setPhone] = useState(broker?.contact_phone || "");
  const [slaDays, setSlaDays] = useState(String(broker?.sla_days ?? 7));
  const [serviceScope, setServiceScope] = useState(broker?.service_scope || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.updateBroker(broker.id, {
          name,
          contact_email: email || null,
          contact_phone: phone || null,
          sla_days: Number(slaDays),
          service_scope: serviceScope || null,
        });
      } else {
        await apiClient.createBroker({
          company_id: 0, // server ignores this, uses auth
          name,
          contact_email: email || null,
          contact_phone: phone || null,
          sla_days: Number(slaDays),
          service_scope: serviceScope || null,
          is_active: true,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save broker");
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
            {isEdit ? "Edit Broker" : "Add Broker"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="e.g. Marsh India" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="broker@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">SLA Days</label>
            <input type="number" min="1" value={slaDays} onChange={(e) => setSlaDays(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Service Scope</label>
            <textarea value={serviceScope} onChange={(e) => setServiceScope(e.target.value)} rows={2} className={inputClass} placeholder="e.g. Fire, Marine, Liability" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#0B1727] text-white text-sm font-medium rounded-lg hover:bg-[#1a2639] transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : isEdit ? "Update Broker" : "Add Broker"}
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

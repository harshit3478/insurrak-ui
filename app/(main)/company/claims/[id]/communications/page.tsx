"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, ArrowDownLeft, ArrowUpRight, Plus, X, ExternalLink } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { ClaimCommunicationRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

export default function ClaimCommunicationsPage() {
  const params = useParams();
  const claimId = Number(params.id);
  const [comms, setComms] = useState<ClaimCommunicationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () =>
    apiClient.claims.getCommunications(claimId)
      .then(setComms)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [claimId]);

  if (loading) return <Loading />;

  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Communications <span className="text-sm font-normal text-gray-400">({comms.length})</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1727] text-white text-sm font-medium rounded-lg hover:bg-[#1a2639] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {comms.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No communications logged yet.</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-[#5750F1] hover:underline">
            Add the first entry
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-dark-3 px-6">
          {comms.map((c) => {
            const isInbound = c.direction === "INBOUND";
            return (
              <div key={c.id} className="py-5">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isInbound ? "bg-blue-50 dark:bg-blue-900/20" : "bg-green-50 dark:bg-green-900/20"}`}>
                    {isInbound
                      ? <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                      : <ArrowUpRight className="w-4 h-4 text-green-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.sender_name}</span>
                      {c.sender_email && <span className="text-xs text-gray-400">&lt;{c.sender_email}&gt;</span>}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isInbound ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"}`}>
                        {isInbound ? "Received" : "Sent"}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(c.sent_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {c.subject && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{c.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{c.message}</p>
                    {c.file_name && c.file_path && (
                      <a
                        href={c.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#5750F1] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> {c.file_name}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CommunicationModal
          claimId={claimId}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

function CommunicationModal({
  claimId,
  onClose,
  onSuccess,
}: {
  claimId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [direction, setDirection] = useState("INBOUND");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sentAt, setSentAt] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) { setError("Sender name is required"); return; }
    if (!message.trim()) { setError("Message is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.claims.addCommunication(claimId, {
        direction,
        sender_name: senderName,
        sender_email: senderEmail || null,
        subject: subject || null,
        message,
        sent_at: new Date(sentAt).toISOString(),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save communication");
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
      <div className="bg-white dark:bg-gray-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-3 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3 sticky top-0 bg-white dark:bg-gray-dark z-10">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Log Communication</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Direction</label>
            <div className="flex gap-2">
              {["INBOUND", "OUTBOUND"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    direction === d
                      ? "bg-[#0B1727] text-white border-[#0B1727]"
                      : "bg-white dark:bg-dark-2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-3"
                  }`}
                >
                  {d === "INBOUND" ? "Received" : "Sent"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sender Name *</label>
              <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} required className={inputClass} placeholder="e.g. John Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sender Email</label>
              <input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={inputClass} placeholder="john@insurer.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="e.g. Survey Report Received" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Message *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className={inputClass} placeholder="Enter the communication content..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sent At *</label>
            <input type="datetime-local" value={sentAt} onChange={(e) => setSentAt(e.target.value)} required className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#0B1727] text-white text-sm font-medium rounded-lg hover:bg-[#1a2639] transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : "Add Entry"}
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

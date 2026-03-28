"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import type { ClaimCommunicationRead } from "@/types/api";
import { Send, Paperclip, Download, ArrowDownLeft, ArrowUpRight, Clock, Loader2, AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

export default function ClaimActivityPage() {
  const { id } = useParams();
  const claimId = Number(id);
  const [comms, setComms] = useState<ClaimCommunicationRead[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose state
  const [direction, setDirection] = useState<"INBOUND" | "OUTBOUND">("OUTBOUND");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchComms = async () => {
    const data = await apiClient.claims.getCommunications(claimId).catch(() => [] as ClaimCommunicationRead[]);
    setComms(data.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()));
  };

  useEffect(() => {
    async function load() { setLoading(true); await fetchComms(); setLoading(false); }
    if (id) load();
  }, [id]);

  const handleSend = async () => {
    if (!senderName || !message) {
      setSendError("Sender name and message are required.");
      return;
    }
    setIsSending(true);
    setSendError("");
    try {
      let file_name: string | undefined;
      let file_path: string | undefined;
      if (attachFile) {
        file_path = await uploadToR2(attachFile, "claims");
        file_name = attachFile.name;
      }
      await apiClient.claims.addCommunication(claimId, {
        direction,
        sender_name: senderName.trim(),
        sender_email: senderEmail.trim() || null,
        subject: subject.trim() || null,
        message: message.trim(),
        file_name,
        file_path,
        sent_at: new Date().toISOString(),
      });
      setSenderName(""); setSenderEmail(""); setSubject(""); setMessage(""); setAttachFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await fetchComms();
    } catch (err) {
      setSendError("Failed to log communication. Please try again.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity & Communications</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Log all correspondence related to this claim.</p>
      </div>

      {/* Compose */}
      <div className="bg-gray-50 dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 p-5 space-y-3">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Log Communication</p>

        {sendError && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {sendError}
          </div>
        )}

        <div className="flex rounded-lg border border-gray-200 dark:border-dark-3 overflow-hidden w-fit">
          {(["OUTBOUND", "INBOUND"] as const).map(d => (
            <button key={d} onClick={() => setDirection(d)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                direction === d ? "bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727]" : "bg-white dark:bg-dark-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-3"
              }`}>
              {d === "OUTBOUND" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
              {d === "OUTBOUND" ? "Outbound" : "Inbound"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Sender Name *" value={senderName} onChange={e => setSenderName(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
          <input type="email" placeholder="Sender Email (optional)" value={senderEmail} onChange={e => setSenderEmail(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
        </div>
        <input type="text" placeholder="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
        <textarea placeholder="Message *" value={message} onChange={e => setMessage(e.target.value)} rows={3}
          className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 resize-none" />

        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" className="hidden" onChange={e => setAttachFile(e.target.files?.[0] || null)} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-dark-3 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors">
            <Paperclip className="w-3.5 h-3.5" />
            {attachFile ? attachFile.name : "Attach file"}
          </button>
          <button onClick={handleSend} disabled={isSending || !senderName || !message}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-xs font-bold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
            {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {isSending ? "Saving..." : "Log"}
          </button>
        </div>
      </div>

      {/* Communications log */}
      {comms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Clock className="w-7 h-7 opacity-30" />
          <p className="text-sm font-medium">No communications logged yet.</p>
          <p className="text-xs">Use the form above to log emails, calls, or messages.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comms.map(c => (
            <div key={c.id} className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.direction === "OUTBOUND"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  }`}>
                    {c.direction === "OUTBOUND" ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                    {c.direction}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.sender_name}</p>
                  {c.sender_email && <p className="text-xs text-gray-400 hidden sm:block">· {c.sender_email}</p>}
                </div>
                <p className="text-[10px] text-gray-400 whitespace-nowrap">
                  {new Date(c.sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                  {new Date(c.sent_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                </p>
              </div>
              {c.subject && <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1.5">{c.subject}</p>}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{c.message}</p>
              {c.file_name && c.file_path && (
                <a href={c.file_path} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-[10px] text-blue-600 dark:text-blue-400 hover:underline">
                  <Download className="w-3 h-3" /> {c.file_name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

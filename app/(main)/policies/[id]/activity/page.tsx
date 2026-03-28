"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { ApprovalRead, PolicyDocumentRead, InvoiceRead, QuotationRead } from "@/types/api";
import { User } from "@/types";
import {
  CheckCircle2, XCircle, FileText, Receipt,
  PlusCircle, GitMerge, Clock, ScrollText,
} from "lucide-react";
import { Loading } from "@/components/ui/Loading";

type EventType = "created" | "status" | "approval" | "document" | "invoice" | "payment" | "quotation";

interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  actorId: number | null;
  timestamp: string;
}

function groupByDate(events: ActivityEvent[]): { dateLabel: string; events: ActivityEvent[] }[] {
  const groups: Record<string, ActivityEvent[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const evt of events) {
    const d = new Date(evt.timestamp);
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(evt);
  }
  return Object.entries(groups).map(([dateLabel, events]) => ({ dateLabel, events }));
}

const EVENT_ICON: Record<EventType, { icon: React.ElementType; bg: string; color: string }> = {
  created: { icon: PlusCircle, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-500" },
  status: { icon: GitMerge, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-500" },
  approval: { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-500" },
  document: { icon: FileText, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-500" },
  invoice: { icon: Receipt, bg: "bg-indigo-100 dark:bg-indigo-900/30", color: "text-indigo-500" },
  payment: { icon: CheckCircle2, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-500" },
  quotation: { icon: ScrollText, bg: "bg-cyan-100 dark:bg-cyan-900/30", color: "text-cyan-600" },
};

export default function PolicyActivityPage() {
  const { id } = useParams();
  const prId = Number(id);

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [policy, approvals, documents, invoices, quotations] = await Promise.all([
          apiClient.getPolicyRequestById(prId),
          apiClient.getApprovals(prId).catch(() => [] as ApprovalRead[]),
          apiClient.getPolicyDocuments(prId).catch(() => [] as PolicyDocumentRead[]),
          apiClient.getInvoices(prId).catch(() => [] as InvoiceRead[]),
          apiClient.getQuotations(prId).catch(() => [] as QuotationRead[]),
        ]);

        const allEvents: ActivityEvent[] = [];

        // Policy created
        allEvents.push({
          id: `policy-created-${policy.id}`,
          type: "created",
          title: "Policy request created",
          description: `${policy.line_of_business || "Policy"} request submitted for ${policy.asset_description || "asset"}.`,
          actorId: policy.requested_by_id,
          timestamp: policy.created_at,
        });

        // Approvals
        for (const app of approvals) {
          const isApproved = app.decision.toUpperCase() === "APPROVED";
          allEvents.push({
            id: `approval-${app.id}`,
            type: "approval",
            title: isApproved ? "Approved" : "Rejected",
            description: app.comments || (isApproved ? "Policy quotation approved." : "Returned for revision."),
            actorId: app.approver_id,
            timestamp: app.created_at,
          });
        }

        // Documents
        for (const doc of documents) {
          allEvents.push({
            id: `doc-${doc.id}`,
            type: "document",
            title: "Document uploaded",
            description: `${doc.document_type.replace(/_/g, " ")} — ${doc.file_name}`,
            actorId: doc.uploaded_by_id,
            timestamp: doc.created_at,
          });
        }

        // Quotations
        for (const quot of quotations) {
          allEvents.push({
            id: `quotation-${quot.id}`,
            type: "quotation",
            title: "Quotation received",
            description: `₹${quot.total_premium.toLocaleString()} total premium (v${quot.version})${quot.file_name ? ` — ${quot.file_name}` : ""}`,
            actorId: null,
            timestamp: quot.created_at,
          });
        }

        // Invoices
        for (const inv of invoices) {
          allEvents.push({
            id: `invoice-${inv.id}`,
            type: "invoice",
            title: "Proforma invoice uploaded",
            description: `₹${inv.total.toLocaleString()} total premium — ${inv.file_name || "PI-" + inv.id}`,
            actorId: inv.uploaded_by_id,
            timestamp: inv.created_at,
          });
        }

        // Sort newest first
        allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setEvents(allEvents);

        // Batch-fetch unique users
        const userIds = Array.from(new Set(allEvents.map(e => e.actorId).filter(Boolean) as number[]));
        const userData = await Promise.all(userIds.map(uid => apiClient.getById(uid).catch(() => null)));
        const userMap: Record<string, User> = {};
        userData.forEach(u => { if (u) userMap[String(u.id)] = u; });
        setUsers(userMap);
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <Loading />;

  if (events.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
        <Clock className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
        <p className="text-xs">Events will appear here as this policy progresses.</p>
      </div>
    );
  }

  const groups = groupByDate(events);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Audit trail reconstructed from policy events.</p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100 dark:bg-dark-3" />

        <div className="space-y-8">
          {groups.map(group => (
            <div key={group.dateLabel}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 pl-12">
                {group.dateLabel}
              </p>
              <div className="space-y-3">
                {group.events.map(evt => {
                  const conf = EVENT_ICON[evt.type];
                  const IconComp = conf.icon;
                  const actor = evt.actorId ? users[String(evt.actorId)] : null;
                  const isRejection = evt.title === "Rejected";
                  const iconConf = isRejection
                    ? { icon: XCircle, bg: "bg-red-100 dark:bg-red-900/30", color: "text-red-500" }
                    : conf;
                  const FinalIcon = isRejection ? XCircle : IconComp;

                  return (
                    <div key={evt.id} className="relative flex gap-4">
                      <div className={`relative z-10 w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${iconConf.bg}`}>
                        <FinalIcon className={`w-4 h-4 ${iconConf.color}`} />
                      </div>
                      <div className="flex-1 bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 px-4 py-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{evt.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{evt.description}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                            {new Date(evt.timestamp).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                        {actor && (
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            by <span className="font-semibold text-gray-600 dark:text-gray-400">{actor.name}</span>
                            {actor.designation && <span className="italic"> · {actor.designation}</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

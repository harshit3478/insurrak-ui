"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { ClaimRead } from "@/types/api";
import { UserCheck, UserX, Pencil, Check, X, Loader2, Clock } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

export default function ClaimSurveyorPage() {
  const { id } = useParams();
  const claimId = Number(id);
  const [claim, setClaim] = useState<ClaimRead | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [assignedToId, setAssignedToId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchClaim = async () => {
    const data = await apiClient.claims.getById(claimId);
    setClaim(data);
    setAssignedToId(data.assigned_to_id ? String(data.assigned_to_id) : "");
    setNotes(data.notes || "");
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try { await fetchClaim(); } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (id) load();
  }, [id]);

  useEffect(() => {
    const handler = async () => {
      const c = await apiClient.claims.getById(claimId).catch(() => null);
      if (c) { setClaim(c); setAssignedToId(c.assigned_to_id ? String(c.assigned_to_id) : ""); setNotes(c.notes || ""); }
    };
    window.addEventListener("claim:refresh", handler);
    return () => window.removeEventListener("claim:refresh", handler);
  }, [claimId]);

  const handleSave = async () => {
    if (!claim) return;
    setIsSaving(true);
    setSaveError("");
    try {
      await apiClient.claims.update(claim.id, {
        assigned_to_id: assignedToId ? Number(assignedToId) : null,
        notes: notes.trim() || null,
      });
      await fetchClaim();
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent("claim:refresh"));
    } catch (err) {
      setSaveError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (claim) {
      setAssignedToId(claim.assigned_to_id ? String(claim.assigned_to_id) : "");
      setNotes(claim.notes || "");
    }
    setSaveError("");
    setIsEditing(false);
  };

  if (loading) return <Loading />;
  if (!claim) return <div className="p-8 text-center text-sm text-gray-400">Claim not found.</div>;

  const isSurveyStage = ["SENT_TO_BROKER", "UNDER_REVIEW", "QUERY_RAISED"].includes(claim.status);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Surveyor Assignment</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Track surveyor details and field assessment notes.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-dark-3 rounded-lg text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
      </div>

      {!isSurveyStage && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Surveyor assignment is typically set once the claim is sent to the broker.
        </div>
      )}

      {/* Assignment card */}
      <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            claim.assigned_to_id
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-gray-100 dark:bg-dark-3 text-gray-400"
          }`}>
            {claim.assigned_to_id ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {claim.assigned_to_id ? `User #${claim.assigned_to_id}` : "Unassigned"}
            </p>
            <p className="text-xs text-gray-400">
              {claim.assigned_to_id ? "Surveyor / Handler" : "No surveyor assigned yet"}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-dark-3">
            {saveError && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                {saveError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Assigned User ID
              </label>
              <input
                type="number"
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                placeholder="User ID (optional)"
                className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Assessment notes */}
      <div className="bg-white dark:bg-dark-2 rounded-xl border border-gray-100 dark:border-dark-3 shadow-sm p-6 space-y-3">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment Notes</p>

        {isEditing ? (
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
            placeholder="Surveyor findings, assessment remarks, site visit notes..."
            className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 resize-none"
          />
        ) : claim.notes ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{claim.notes}</p>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 border-2 border-dashed border-gray-100 dark:border-dark-3 rounded-xl text-gray-400">
            <UserCheck className="w-6 h-6 opacity-30" />
            <p className="text-xs">No assessment notes yet.</p>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-xs font-bold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

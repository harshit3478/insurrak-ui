"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { addNotification } from "@/lib/features/notification/notificationSlice";
import { apiClient } from "@/lib/apiClient";
import { ClipboardList } from "lucide-react";
import type { CompanyRegistrationRequestRead } from "@/types/api";

const SEEN_KEY = "insurrack_reg_req_seen";

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

export default function RegistrationRequestsPage() {
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<CompanyRegistrationRequestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getRegistrationRequests()
      .then((data) => {
        setRequests(data);

        // Dispatch in-app notification if there are new pending ones
        const pendingCount = data.filter((r) => r.status === "pending").length;
        const lastSeen = parseInt(localStorage.getItem(SEEN_KEY) ?? "0", 10);
        if (pendingCount > lastSeen) {
          dispatch(
            addNotification({
              id: `reg-req-${Date.now()}`,
              title: "Company Registration Requests",
              description: `${pendingCount} pending request${pendingCount > 1 ? "s" : ""} awaiting review`,
              createdAt: new Date().toISOString(),
              read: false,
            }),
          );
        }
        // Mark as seen since user is now viewing this page
        localStorage.setItem(SEEN_KEY, String(pendingCount));
      })
      .catch(() => setError("Failed to load registration requests."))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleStatusUpdate = async (id: number, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const updated = await apiClient.updateRegistrationRequest(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      const newPending = requests.filter((r) => r.id !== id && r.status === "pending").length;
      localStorage.setItem(SEEN_KEY, String(newPending));
    } catch {
      setError("Failed to update request status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registration Requests
          </h1>
          <p className="text-gray-500 dark:text-dark-6 text-sm mt-1">
            Companies requesting access to the platform
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {pendingCount} pending
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#C6F200] border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No registration requests yet</p>
            <p className="text-xs mt-1 opacity-70">
              Requests submitted via the signup page will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-3">
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Company</th>
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Admin</th>
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Email</th>
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Phone</th>
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">GST</th>
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Submitted</th>
                  <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Status</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-500 dark:text-dark-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {req.company_name}
                      </p>
                      {req.address && (
                        <p className="text-xs text-gray-400 mt-0.5">{req.address}</p>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-700 dark:text-gray-300">{req.admin_name}</td>
                    <td className="py-4 pr-4 text-sm text-gray-500 dark:text-dark-6">{req.admin_email}</td>
                    <td className="py-4 pr-4 text-sm text-gray-500 dark:text-dark-6">{req.admin_phone ?? "—"}</td>
                    <td className="py-4 pr-4 text-sm text-gray-500 dark:text-dark-6">{req.gst_number ?? "—"}</td>
                    <td className="py-4 pr-4 text-sm text-gray-500 dark:text-dark-6 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4">
                      {req.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(req.id, "approved")}
                            disabled={updatingId === req.id}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {updatingId === req.id ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id, "rejected")}
                            disabled={updatingId === req.id}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {updatingId === req.id ? "…" : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

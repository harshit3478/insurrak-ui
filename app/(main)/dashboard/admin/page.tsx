"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { setCompanies } from "@/lib/features/company/companySlice";
import { setPolicies } from "@/lib/features/policy/policySlice";
import { setClaims } from "@/lib/features/claim/claimSlice";
import { setRenewals } from "@/lib/features/renewal/renewalSlice";
import { addNotification } from "@/lib/features/notification/notificationSlice";
import { api } from "@/lib/api";
import { apiClient } from "@/lib/apiClient";
import { Building2, FileText, ShieldCheck, RefreshCw, ClipboardList } from "lucide-react";
import type { CompanyRegistrationRequestRead } from "@/types/api";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6 flex items-start gap-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-dark-6 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-dark-6 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const SEEN_KEY = "insurrack_reg_req_seen";

/**
 * AdminDashboard provides a high-level overview of the entire platform
 * for Super Admins. It aggregates data across all companies, including
 * policies, claims, and renewals, and lists recent company registrations.
 * It also shows pending company registration requests with approve/reject actions.
 */
export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<"overview" | "requests">("overview");
  const [regRequests, setRegRequests] = useState<CompanyRegistrationRequestRead[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const companies = useSelector((s: RootState) => s.company.companies);
  const policies = useSelector((s: RootState) => s.policy.items);
  const claims = useSelector((s: RootState) => s.claim.items);
  const renewals = useSelector((s: RootState) => s.renewal.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comp, pol, cla, ren, reqs] = await Promise.all([
          api.getAllCompanies().catch(() => []),
          api.getAllPolicies().catch(() => []),
          api.getAllClaims().catch(() => []),
          api.getAllRenewals().catch(() => []),
          apiClient.getRegistrationRequests().catch(() => []),
        ]);
        dispatch(setCompanies(comp));
        dispatch(setPolicies(pol));
        dispatch(setClaims(cla));
        dispatch(setRenewals(ren));
        setRegRequests(reqs);

        // Notify about pending registration requests (only if count increased)
        const pendingCount = reqs.filter((r) => r.status === "pending").length;
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
          localStorage.setItem(SEEN_KEY, String(pendingCount));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  // Mark requests tab as "seen" when user opens it
  const handleTabChange = (next: "overview" | "requests") => {
    setTab(next);
    if (next === "requests") {
      const pendingCount = regRequests.filter((r) => r.status === "pending").length;
      localStorage.setItem(SEEN_KEY, String(pendingCount));
    }
  };

  const handleStatusUpdate = async (id: number, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const updated = await apiClient.updateRegistrationRequest(id, status);
      setRegRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      // Update the seen count so the badge stays accurate
      const newPending = regRequests.filter((r) => r.id !== id && r.status === "pending").length;
      localStorage.setItem(SEEN_KEY, String(newPending));
    } catch (err) {
      console.error("Failed to update request:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCompanies = companies.filter(c => c.status === "Active").length;
  const activePolicies = policies.filter(p => p.status === "Active").length;
  const openClaims = claims.filter(c => c.status === "Open" || c.status === "Under Review").length;
  const renewalsDue = renewals.filter(r => r.status === "Due" || r.status === "In Progress").length;
  const recentCompanies = [...companies].slice(0, 5);
  const pendingRequests = regRequests.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-6 text-sm mt-1">Platform-wide overview</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-dark-3">
        <button
          onClick={() => handleTabChange("overview")}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "overview"
              ? "bg-white dark:bg-gray-dark border border-b-white dark:border-dark-3 dark:border-b-gray-dark text-gray-900 dark:text-white -mb-px"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleTabChange("requests")}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            tab === "requests"
              ? "bg-white dark:bg-gray-dark border border-b-white dark:border-dark-3 dark:border-b-gray-dark text-gray-900 dark:text-white -mb-px"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Registration Requests
          {pendingRequests > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {pendingRequests}
            </span>
          )}
        </button>
      </div>

      {tab === "overview" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard icon={Building2} label="Total Companies" value={companies.length} sub={`${activeCompanies} active`} color="bg-blue-500" />
            <StatCard icon={FileText} label="Active Policies" value={activePolicies} sub={`of ${policies.length} total`} color="bg-emerald-500" />
            <StatCard icon={ShieldCheck} label="Open Claims" value={openClaims} sub={`${claims.length} total`} color="bg-amber-500" />
            <StatCard icon={RefreshCw} label="Renewals Due" value={renewalsDue} sub="in next 90 days" color="bg-purple-500" />
          </div>

          {/* Recent Companies */}
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Recent Companies</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-3">
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Company</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">ID</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Admin</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Policies</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-500 dark:text-dark-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                  {recentCompanies.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                      <td className="py-3 pr-4 text-sm font-semibold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6">{c.companyId}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6">{c.admin}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6">{c.activePolicies}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "requests" && (
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Company Registration Requests
            </h2>
            <span className="text-xs text-gray-400">{regRequests.length} total</span>
          </div>

          {regRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No registration requests yet</p>
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
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Submitted</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Status</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-500 dark:text-dark-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                  {regRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                      <td className="py-3 pr-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {req.company_name}
                        {req.gst_number && (
                          <span className="block text-xs font-normal text-gray-400">{req.gst_number}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{req.admin_name}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6">{req.admin_email}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6">{req.admin_phone ?? "—"}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3">
                        {req.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(req.id, "approved")}
                              disabled={updatingId === req.id}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              {updatingId === req.id ? "…" : "Approve"}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(req.id, "rejected")}
                              disabled={updatingId === req.id}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {updatingId === req.id ? "…" : "Reject"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

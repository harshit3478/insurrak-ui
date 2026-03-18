"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect } from "react";
import { setPolicies } from "@/lib/features/policy/policySlice";
import { api } from "@/lib/api";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { PolicyStatus } from "@/types";

const STATUS_STYLES: Record<PolicyStatus, string> = {
  Active: "bg-green-50 text-green-700",
  "Expiring Soon": "bg-amber-50 text-amber-700",
  Expired: "bg-red-50 text-red-700",
  "Pending Renewal": "bg-purple-50 text-purple-700",
};

export default function UserDashboard() {
  const dispatch = useAppDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const policies = useSelector((s: RootState) => s.policy.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pol = await api.getAllPolicies().catch(() => []);
        dispatch(setPolicies(pol));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  // Show a read-only subset of policies for a standard user
  const myPolicies = policies.slice(0, 3);
  const activePolicies = myPolicies.filter(p => p.status === "Active").length;
  const expiringSoon = myPolicies.filter(p => p.status === "Expiring Soon").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-6 text-sm mt-1">
          Welcome, {authUser?.name ?? "User"}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: FileText, label: "My Policies", value: myPolicies.length, color: "bg-blue-500" },
          { icon: CheckCircle, label: "Active", value: activePolicies, color: "bg-emerald-500" },
          { icon: Clock, label: "Expiring Soon", value: expiringSoon, color: "bg-amber-500" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6 flex items-start gap-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-6 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Policies (read-only) */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">My Policies</h2>
        <div className="space-y-3">
          {myPolicies.map(p => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-dark-3 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.policyNumber}</p>
                <p className="text-xs text-gray-500 dark:text-dark-6">{p.type} · {p.insurer}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                  {p.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">Expires: {p.endDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

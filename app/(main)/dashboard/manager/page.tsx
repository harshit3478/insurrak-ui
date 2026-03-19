"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect } from "react";
import { setPolicies } from "@/lib/features/policy/policySlice";
import { setRenewals } from "@/lib/features/renewal/renewalSlice";
import { setClaims } from "@/lib/features/claim/claimSlice";
import { api } from "@/lib/api";
import { FileText, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

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

export default function ManagerDashboard() {
  const dispatch = useAppDispatch();

  const authUser = useSelector((s: RootState) => s.auth.user);
  const policies = useSelector((s: RootState) => s.policy.items);
  const renewals = useSelector((s: RootState) => s.renewal.items);
  const claims = useSelector((s: RootState) => s.claim.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pol, cla, ren] = await Promise.all([
          api.getAllPolicies().catch(() => []),
          api.getAllClaims().catch(() => []),
          api.getAllRenewals().catch(() => []),
        ]);
        dispatch(setPolicies(pol));
        dispatch(setClaims(cla));
        dispatch(setRenewals(ren));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  // In a real app, filter by authUser.companyId
  const companyPolicies = policies.slice(0, 4);
  const openClaims = claims.filter(c => c.status === "Open" || c.status === "Under Review");
  const dueRenewals = renewals.filter(r => r.daysUntilExpiry > 0 && r.daysUntilExpiry <= 90);
  const activePolicies = companyPolicies.filter(p => p.status === "Active").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-6 text-sm mt-1">
          Welcome back, {authUser?.name ?? "Admin"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Active Policies" value={activePolicies} sub={`of ${companyPolicies.length} total`} color="bg-blue-500" />
        <StatCard icon={AlertCircle} label="Open Claims" value={openClaims.length} color="bg-amber-500" />
        <StatCard icon={RefreshCw} label="Renewals Due (90d)" value={dueRenewals.length} color="bg-purple-500" />
        <StatCard icon={CheckCircle} label="SLA Compliance" value="92%" sub="Above target" color="bg-emerald-500" />
      </div>

      {/* Renewals Due */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Renewals Due Soon</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Policy No.</th>
                <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Type</th>
                <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 dark:text-dark-6">Due Date</th>
                <th className="text-left py-3 text-xs font-medium text-gray-500 dark:text-dark-6">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {dueRenewals.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-400">No renewals due in the next 90 days</td>
                </tr>
              )}
              {dueRenewals.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                  <td className="py-3 pr-4 text-sm font-semibold text-gray-900 dark:text-white">{r.policyNumber}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{r.type}</span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-500 dark:text-dark-6">{r.renewalDueDate}</td>
                  <td className="py-3">
                    <span className={`text-sm font-semibold ${r.daysUntilExpiry <= 30 ? "text-red-500" : r.daysUntilExpiry <= 60 ? "text-amber-500" : "text-gray-500"}`}>
                      {r.daysUntilExpiry}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

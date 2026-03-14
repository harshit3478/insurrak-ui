"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect } from "react";
import { setMockCompanies } from "@/lib/features/company/companySlice";
import { setMockPolicies } from "@/lib/features/policy/policySlice";
import { setMockClaims } from "@/lib/features/claim/claimSlice";
import { setMockRenewals } from "@/lib/features/renewal/renewalSlice";
import { Building2, FileText, ShieldCheck, RefreshCw } from "lucide-react";

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

export default function AdminDashboard() {
  const dispatch = useAppDispatch();

  const companies = useSelector((s: RootState) => s.company.companies);
  const policies = useSelector((s: RootState) => s.policy.items);
  const claims = useSelector((s: RootState) => s.claim.items);
  const renewals = useSelector((s: RootState) => s.renewal.items);

  useEffect(() => {
    dispatch(setMockCompanies());
    dispatch(setMockPolicies());
    dispatch(setMockClaims());
    dispatch(setMockRenewals());
  }, [dispatch]);

  const activeCompanies = companies.filter(c => c.status === "Active").length;
  const activePolicies = policies.filter(p => p.status === "Active").length;
  const openClaims = claims.filter(c => c.status === "Open" || c.status === "Under Review").length;
  const renewalsDue = renewals.filter(r => r.status === "Due" || r.status === "In Progress").length;

  const recentCompanies = [...companies].slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-6 text-sm mt-1">Platform-wide overview</p>
      </div>

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
    </div>
  );
}

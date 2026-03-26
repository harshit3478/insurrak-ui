"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Hash, User } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { UnitRead, PolicyRequestRead, ClaimRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

export default function SystemUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params.id);
  const unitId = Number(params.unitId);

  const [unit, setUnit] = useState<UnitRead | null>(null);
  const [policies, setPolicies] = useState<PolicyRequestRead[]>([]);
  const [claims, setClaims] = useState<ClaimRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"policies" | "claims">("policies");

  useEffect(() => {
    if (!Number.isFinite(unitId)) { setLoading(false); return; }

    Promise.all([
      apiClient.getCompanyUnits(companyId).then((units) => units.find((u) => u.id === unitId) || null),
      apiClient.getUnitPolicies(unitId),
      apiClient.getUnitClaims(unitId),
    ])
      .then(([u, pols, cls]) => {
        setUnit(u);
        setPolicies(pols);
        setClaims(cls);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId, unitId]);

  if (loading) return <Loading />;

  if (!unit) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Unit not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Back */}
      <button
        onClick={() => router.push(`/system/companies/${companyId}`)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Company
      </button>

      {/* Unit info card */}
      <div className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{unit.name}</h1>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              unit.is_active
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-500"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${unit.is_active ? "bg-green-500" : "bg-gray-400"}`} />
            {unit.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem icon={MapPin} label="State" value={unit.state} />
          <InfoItem icon={Hash} label="GSTIN" value={unit.gstin} mono />
          <InfoItem icon={MapPin} label="Address" value={unit.address} />
          <InfoItem icon={User} label="Contact Person" value={unit.contact_person_name} />
          <InfoItem icon={Mail} label="Contact Email" value={unit.contact_person_email} />
          <InfoItem icon={Phone} label="Contact Phone" value={unit.contact_person_phone} />
          {unit.occupancy && <InfoItem icon={Hash} label="Occupancy" value={unit.occupancy} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-dark-3">
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "policies"
                ? "text-gray-900 dark:text-white border-b-2 border-[#5750F1]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Policies
            <span className="ml-2 text-xs bg-gray-100 dark:bg-dark-3 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5">
              {policies.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("claims")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "claims"
                ? "text-gray-900 dark:text-white border-b-2 border-[#5750F1]"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Claims
            <span className="ml-2 text-xs bg-gray-100 dark:bg-dark-3 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5">
              {claims.length}
            </span>
          </button>
        </div>

        {activeTab === "policies" && (
          <div className="overflow-auto">
            {policies.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No policies found for this unit.</div>
            ) : (
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-dark-2">
                  <tr>
                    {["Policy #", "Line of Business", "Status", "Sum Insured", "Start Date", "End Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                  {policies.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white font-mono">
                        {p.policy_number || `#${p.id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">{p.line_of_business}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">
                        {p.sum_insured != null ? `₹${p.sum_insured.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">
                        {p.policy_start_date ? new Date(p.policy_start_date).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">
                        {p.policy_end_date ? new Date(p.policy_end_date).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "claims" && (
          <div className="overflow-auto">
            {claims.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No claims found for this unit.</div>
            ) : (
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-dark-2">
                  <tr>
                    {["Claim ID", "Type", "Incident Date", "Status", "Est. Loss", "Approved"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">#{c.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">{c.claim_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">
                        {new Date(c.incident_date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">
                        {c.estimated_loss != null ? `₹${c.estimated_loss.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">
                        {c.approved_amount != null ? `₹${c.approved_amount.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${mono ? "font-mono" : ""}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status.includes("ACTIVE") || status.includes("APPROVED") || status.includes("CREDITED") || status.includes("CLOSED")
      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      : status.includes("REJECT") || status.includes("CANCELLED")
      ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
      : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

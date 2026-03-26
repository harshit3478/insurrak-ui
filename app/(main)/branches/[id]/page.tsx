"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Hash, User, Plus, X, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { UnitRead, PolicyRequestRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

const LOB_OPTIONS = ["Fire", "Marine", "Motor", "Health", "Liability", "Engineering", "Miscellaneous"];

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = Number(params.id);

  const [unit, setUnit] = useState<UnitRead | null>(null);
  const [policies, setPolicies] = useState<PolicyRequestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPolicy, setShowAddPolicy] = useState(false);

  const loadData = () =>
    Promise.all([
      apiClient.getUnitById(unitId),
      apiClient.getUnitPolicies(unitId),
    ])
      .then(([u, pols]) => { setUnit(u); setPolicies(pols); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!Number.isFinite(unitId)) { setLoading(false); return; }
    loadData();
  }, [unitId]);

  if (loading) return <Loading />;

  if (!unit) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Unit not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <button
        onClick={() => router.push("/branches")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Units
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

      {/* Policies section */}
      <div className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Policies
            <span className="ml-2 text-sm font-normal text-gray-400">({policies.length})</span>
          </h2>
          <button
            onClick={() => setShowAddPolicy(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5750F1] text-white text-sm font-medium rounded-lg hover:bg-[#4840e0] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Policy
          </button>
        </div>

        {policies.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No policies for this unit yet.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-dark-2">
                <tr>
                  {["Policy #", "Line of Business", "Status", "Sum Insured", "Start Date", "End Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                {policies.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors cursor-pointer"
                    onClick={() => router.push(`/policies/${p.id}`)}
                  >
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
          </div>
        )}
      </div>

      {/* Add Policy Modal */}
      {showAddPolicy && (
        <AddPolicyModal
          unit={unit}
          existingPolicies={policies}
          onClose={() => setShowAddPolicy(false)}
          onSuccess={() => {
            setShowAddPolicy(false);
            apiClient.getUnitPolicies(unitId).then(setPolicies).catch(console.error);
          }}
        />
      )}
    </div>
  );
}

function AddPolicyModal({
  unit,
  existingPolicies,
  onClose,
  onSuccess,
}: {
  unit: UnitRead;
  existingPolicies: PolicyRequestRead[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [lob, setLob] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [sumInsured, setSumInsured] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRenewal, setIsRenewal] = useState(false);
  const [renewalPolicyId, setRenewalPolicyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lob) { setError("Line of business is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.createPolicyRequest({
        company_id: unit.company_id,
        unit_id: unit.id,
        line_of_business: lob,
        asset_description: assetDescription || null,
        sum_insured: sumInsured ? Number(sumInsured) : null,
        premium: premium ? Number(premium) : null,
        policy_start_date: startDate || null,
        policy_end_date: endDate || null,
        renewal_of_policy_id: isRenewal && renewalPolicyId ? Number(renewalPolicyId) : null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-dark-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5750F1]";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-3 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3 sticky top-0 bg-white dark:bg-gray-dark z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5750F1]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Policy Request</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Unit (read-only) */}
          <div>
            <p className={labelClass}>Unit</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white px-3 py-2.5 bg-gray-50 dark:bg-dark-3 rounded-lg border border-gray-200 dark:border-dark-3">
              {unit.name}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Line of Business */}
          <div>
            <label className={labelClass}>Line of Business *</label>
            <select value={lob} onChange={(e) => setLob(e.target.value)} className={inputClass} required>
              <option value="">Select...</option>
              {LOB_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Sum Insured + Premium */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Sum Insured (₹)</label>
              <input
                type="number"
                min="0"
                value={sumInsured}
                onChange={(e) => setSumInsured(e.target.value)}
                placeholder="e.g. 10000000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Premium (₹)</label>
              <input
                type="number"
                min="0"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                placeholder="e.g. 25000"
                className={inputClass}
              />
            </div>
          </div>

          {/* Policy Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Asset Description */}
          <div>
            <label className={labelClass}>Asset Description</label>
            <textarea
              value={assetDescription}
              onChange={(e) => setAssetDescription(e.target.value)}
              rows={2}
              placeholder="Describe the insured asset..."
              className={inputClass}
            />
          </div>

          {/* Renewal section */}
          {existingPolicies.length > 0 && (
            <div className="border border-gray-100 dark:border-dark-3 rounded-lg p-3 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRenewal}
                  onChange={(e) => { setIsRenewal(e.target.checked); if (!e.target.checked) setRenewalPolicyId(""); }}
                  className="w-4 h-4 rounded border-gray-300 text-[#5750F1] focus:ring-[#5750F1]"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Renewing an existing policy?
                </span>
              </label>
              {isRenewal && (
                <div>
                  <label className={labelClass}>Select policy to renew</label>
                  <select
                    value={renewalPolicyId}
                    onChange={(e) => setRenewalPolicyId(e.target.value)}
                    className={inputClass}
                    required={isRenewal}
                  >
                    <option value="">Choose existing policy...</option>
                    {existingPolicies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.policy_number || `#${p.id}`} — {p.line_of_business} ({p.status.replace(/_/g, " ")})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#5750F1] text-white text-sm font-medium rounded-lg hover:bg-[#4840e0] transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Policy Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 dark:border-dark-3 text-sm text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Hash,
  Package,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Company } from "@/types";
import { UnitRead } from "@/types/api";
import { Loading } from "@/components/ui/Loading";

export default function SystemCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [units, setUnits] = useState<UnitRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(companyId)) { setLoading(false); return; }

    Promise.all([
      apiClient.getCompanyById(companyId),
      apiClient.getCompanyUnits(companyId),
    ])
      .then(([comp, unitList]) => {
        setCompany(comp);
        setUnits(unitList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <Loading />;

  if (!company) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Company not found.</p>
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
        onClick={() => router.push("/system")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Company info card */}
      <div className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#5750F1]/10 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#5750F1]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{company.name}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  company.is_active
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-500"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${company.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                {company.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">ID: {company.companyId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem icon={Mail} label="Email" value={company.email} />
          <InfoItem icon={Phone} label="Phone" value={company.mobile_number} />
          <InfoItem icon={Hash} label="GST Number" value={company.gst_number} />
          <InfoItem icon={Package} label="Units" value={units.length > 0 ? String(units.length) : "0"} />
          {company.address && (
            <div className="sm:col-span-2 lg:col-span-4">
              <InfoItem icon={MapPin} label="Address" value={company.address} />
            </div>
          )}
        </div>
      </div>

      {/* Units table */}
      <div className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Units / Branches
            <span className="ml-2 text-sm font-normal text-gray-400">({units.length})</span>
          </h2>
        </div>

        {units.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No units found for this company.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-dark-2">
                <tr>
                  {["Unit Name", "State", "GSTIN", "Contact Person", "Contact Email", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-6">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                {units.map((unit) => (
                  <tr
                    key={unit.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors cursor-pointer"
                    onClick={() => router.push(`/system/companies/${companyId}/units/${unit.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{unit.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">{unit.state || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6 font-mono text-xs">{unit.gstin || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">{unit.contact_person_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-6">{unit.contact_person_email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          unit.is_active
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-500"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${unit.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        {unit.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-primary hover:underline">View →</span>
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

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

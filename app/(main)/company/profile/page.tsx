"use client";

import { useEffect, useState } from "react";
import { Building2, Mail, Phone, MapPin, Hash, CircleUser, Briefcase } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/context-provider/AuthProvider";
import type { Company } from "@/types";

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) { setLoading(false); return; }
    apiClient
      .getCompanyById(Number(user.companyId))
      .then(setCompany)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.companyId]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6 lg:p-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0B1727] to-[#1a2b44] p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <Building2 className="h-8 w-8 text-white/60" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {company?.name?.toUpperCase() || "—"}
            </h1>
            <p className="mt-1 text-sm text-white/50">Company Profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Company Details */}
        <div className="rounded-2xl bg-white dark:bg-dark-2 border border-gray-100 dark:border-dark-3 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-3 pb-3">
            Company Details
          </h2>
          <InfoItem icon={Building2} label="Company Name" value={company?.name} />
          <InfoItem icon={Mail} label="Email" value={company?.email} />
          <InfoItem icon={Phone} label="Phone" value={company?.mobile_number} />
          <InfoItem icon={Hash} label="GST Number" value={company?.gst_number} />
          <InfoItem icon={MapPin} label="Address" value={company?.address} />
        </div>

        {/* User Details */}
        <div className="rounded-2xl bg-white dark:bg-dark-2 border border-gray-100 dark:border-dark-3 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-3 pb-3">
            Your Account
          </h2>
          <InfoItem icon={CircleUser} label="Username" value={user?.name} />
          <InfoItem icon={Mail} label="Email" value={user?.email} />
          <InfoItem icon={Briefcase} label="Role" value={
            user?.role === "COMPANY_ADMIN" ? "Company Admin"
            : user?.role === "BRANCH_ADMIN" ? "Branch Admin"
            : user?.role === "COMPANY_USER" ? "Company User"
            : user?.role
          } />
        </div>
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
      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-dark-3 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

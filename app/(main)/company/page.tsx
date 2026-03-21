"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, Factory, Loader2 } from "lucide-react";
import StatCard from "@/components/Company/StatCard";
import { apiClient } from "@/lib/apiClient";
import { Company } from "@/types";
import { CompaniesTable } from "@/components/Company/CompaniesTable";
import { CompaniesToolbar } from "@/components/Company/CompaniesToolbar";

import { api } from "@/lib/api";

import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/context-provider/AuthProvider";
import { hasPermission, Permission } from "@/types/permissions";

/**
 * CompanyManagementPage provides a central interface for Super Admins to manage
 * corporate entities. It includes real-time statistics on company health,
 * integration status, and an interactive table for CRUD operations.
 */
export default function CompanyManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const basePath = user?.role === "SUPER_ADMIN" ? "/system" : "/company";

  const canCreate = hasPermission(user, Permission.CREATE_COMPANY);
  const canEdit = hasPermission(user, Permission.EDIT_COMPANY);
  const canDelete = hasPermission(user, Permission.DELETE_COMPANY);
  const canView = hasPermission(user, Permission.MANAGE_COMPANIES);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCompanies();
      setCompanies(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setError("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await apiClient.deleteCompany(id);
        fetchCompanies(); // Refresh list
      } catch (err) {
        alert("Failed to delete company");
      }
    }
  };

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.admin || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.adminEmail || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [companies, search],
  );

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Unauthorized Access
        </h2>
        <p className="text-gray-500 dark:text-dark-6 text-center max-w-md">
          You do not have the required permissions to view the company list.
          Please contact your system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white dark:bg-gray-dark p-10 rounded-2xl">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Building2}
          title="Total Companies"
          description="Registered active companies."
          value={companies.length.toString()}
          trend="up"
          trendValue="10%"
          trendLabel="Compared to last month"
        />
        <StatCard
          icon={FileText}
          title="SLA Health"
          description="Average SLA compliance."
          value="80%"
          trend="down"
          trendValue="11%"
          trendLabel="Compared to last month"
        />
        <StatCard
          icon={Factory}
          title="Integration Health"
          description="System integration status."
          value="90%"
          trend="up"
          trendValue="10%"
          trendLabel="Compared to last month"
        />
      </div>

      <CompaniesToolbar
        onAddCompany={() => router.push(`${basePath}/add-company`)}
        onSearch={setSearch}
        canCreate={canCreate}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <CompaniesTable
        companies={filteredCompanies}
        loading={loading}
        onViewCompany={(id) => router.push(`${basePath}/view-company/${id}`)}
        onEditCompany={(id) => router.push(`${basePath}/edit-company/${id}`)}
        onDeleteCompany={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}

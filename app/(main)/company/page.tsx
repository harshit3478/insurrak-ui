"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Factory,
  Loader2
} from 'lucide-react';
import StatCard from '@/components/Company/StatCard';
import { apiClient } from '@/lib/apiClient';
import { Company } from '@/types';
import { CompaniesTable } from '@/components/Company/CompaniesTable';
import { CompaniesToolbar } from '@/components/Company/CompaniesToolbar';

import { api } from '@/lib/api';

import { Loading } from '@/components/ui/Loading';

export default function CompanyManagementPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCompanies();
      setCompanies(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await apiClient.deleteCompany(id);
        fetchCompanies(); // Refresh list
      } catch (err) {
        alert('Failed to delete company');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 bg-white dark:bg-gray-dark p-10 rounded-2xl">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Building2} title="Total Companies" description="Registered active companies." value={companies.length.toString()} trend="up" trendValue="10%" trendLabel="Compared to last month" />
        <StatCard icon={FileText} title="SLA Health" description="Average SLA compliance." value="80%" trend="down" trendValue="11%" trendLabel="Compared to last month" />
        <StatCard icon={Factory} title="Integration Health" description="System integration status." value="90%" trend="up" trendValue="10%" trendLabel="Compared to last month" />
      </div>

      <CompaniesToolbar
        onAddCompany={() => router.push('/company/add')}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <CompaniesTable
        companies={companies}
        onEditCompany={(id) => router.push(`/company/edit/${id}`)}
        onViewCompany={(id) => router.push(`/company/${id}`)}
        onDeleteCompany={handleDelete}
      />
    </div>
  );
}
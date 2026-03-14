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

const mockCompanies: Company[] = [
  { id: 1, name: 'Acme Manufacturing Ltd', companyId: 'COM123456', admin: 'Rajesh Kumar', adminEmail: 'acme.sol@google.com', branches: 'Kolkata', activePolicies: '5', status: 'Active' },
  { id: 2, name: 'TechFlow Systems', companyId: 'COM987654', admin: 'Sarah Connor', adminEmail: 'contact@techflow.com', branches: 'Bangalore', activePolicies: '8', status: 'Active' },
  { id: 3, name: 'Global Logistics', companyId: 'COM456789', admin: 'Mike Ross', adminEmail: 'ops@globallog.com', branches: 'Mumbai', activePolicies: '2', status: 'Inactive' },
  { id: 4, name: 'FinServe India', companyId: 'COM112233', admin: 'Priya Mehta', adminEmail: 'p.mehta@finserve.in', branches: 'Gurgaon', activePolicies: '12', status: 'Active' },
  { id: 5, name: 'Green Energy Corp', companyId: 'COM445566', admin: 'David Green', adminEmail: 'info@greencorp.com', branches: 'Pune', activePolicies: '3', status: 'Active' },
];

export default function CompanyManagementPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    // Simulate API delay and use mock data for testing
    await new Promise(resolve => setTimeout(resolve, 500));
    setCompanies(mockCompanies);
    setError(''); // Clear any previous errors
    setLoading(false);
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

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;

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
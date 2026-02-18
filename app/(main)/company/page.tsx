"use client";

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/lib/hooks';
import { hasPermission, Permission } from '@/types/permissions';
import { useRouter } from 'next/navigation';

import {
  selectCompanies,
  selectCompaniesMeta,
} from '@/lib/features/company/companySelectors';
import {
  deleteCompany,
  setMockCompanies,
} from '@/lib/features/company/companySlice';

import {
  Building2,
  FileText,
  Factory
} from 'lucide-react';
import { Company } from '@/types';
import StatCard from '@/components/Company/StatCard';
import { CompaniesTable } from '@/components/Company/CompaniesTable';
import { CompaniesToolbar } from '@/components/Company/CompaniesToolbar';


export default function CompanyManagementPage() {
  const authUser = useSelector((state: any) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(setMockCompanies());
    // In a real app, you'd fetch companies:
    // dispatch(fetchCompanies({ page, search }));
  }, [dispatch]);

  //  Redux companies
  const companies = useSelector(selectCompanies);
  const { total, page, limit } = useSelector(selectCompaniesMeta);

  const handleDeleteCompany = (company: Company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${company.name}?`
    );

    if (!confirmed) return;

    dispatch(deleteCompany(company.id));
  };

  //  TODO: Replace with real permission checks
  const canCreate = true; // hasPermission(authUser, Permission.CREATE_COMPANY);
  const canEdit = true; // hasPermission(authUser, Permission.EDIT_COMPANY);
  const canDelete = true; // hasPermission(authUser, Permission.DELETE_COMPANY);
  const canManage = true; // hasPermission(authUser, Permission.MANAGE_COMPANIES);

  // Hard stop: no access at all
  if (!canManage) {
    return <p className="text-red-500 p-10">Access denied: You do not have permission to manage companies.</p>;
  }

  return (
    <>
      <div className="space-y-8 bg-white dark:bg-gray-dark p-10 rounded-2xl">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Building2} title="Total Companies" description="Lorem ipsum dolor sit amet, consectetur adipiscing." value="98" trend="up" trendValue="10%" trendLabel="Compared to last month" />
          <StatCard icon={FileText} title="SLA Health" description="Lorem ipsum dolor sit amet, consectetur adipiscing." value="80%" trend="down" trendValue="11%" trendLabel="Compared to last month" />
          <StatCard icon={Factory} title="Integration Health" description="Lorem ipsum dolor sit amet, consectetur adipiscing." value="90%" trend="up" trendValue="10%" trendLabel="Compared to last month" />
        </div>

        <CompaniesToolbar
          onAddCompany={canCreate ? () => router.push('/company/add') : undefined}
        />

        <CompaniesTable
          data={companies}
          total={total}
          page={page}
          limit={limit}
          onEditCompany={canEdit ? (company) => router.push(`/company/edit/${company.id}`) : undefined}
          onDeleteCompany={canDelete ? handleDeleteCompany : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </>
  );
}
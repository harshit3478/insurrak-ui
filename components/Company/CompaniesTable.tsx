import React, { useState, useEffect } from 'react';
import {
  MoreVertical,
  ArrowDown,
  Square,
  CheckSquare,
  Edit,
  Trash2,
  Lock,
} from 'lucide-react';
import { Company } from '@/types';
import { UserIcon } from '@/assets/icons';

interface CompaniesTableProps {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  onEditCompany?: (company: Company) => void;
  onDeleteCompany?: (company: Company) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  data,
  onEditCompany,
  onDeleteCompany,
  canEdit,
  canDelete,
}) => {
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionId !== null && !(event.target as Element).closest('.action-menu-container')) {
        setOpenActionId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionId]);

  const handleActionClick = (id: number) => {
    setOpenActionId(openActionId === id ? null : id);
  };

  const headers = ['Name', 'Company ID', 'Admin', 'Admin Email', 'Units/Branches', 'Active Policies', 'Status'];

  return (
    <div className="border border-gray-100 dark:border-dark-3 rounded-lg overflow-hidden">
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full min-w-max table-auto">
          <thead className="bg-white dark:bg-gray-dark border-b border-gray-100 dark:border-dark-3">
            <tr>
              {headers.map((header) => (
                <th key={header} className="py-4 px-4 text-left">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-dark-6 hover:text-gray-700 dark:hover:text-white cursor-pointer transition-colors">
                    {header} <ArrowDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
              ))}
              <th className="py-4 px-6 text-right w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
            {data.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors group">
                
                <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">{company.name}</td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">{company.companyId}</td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">{company.admin}</td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">{company.adminEmail}</td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">{company.branches}</td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">{company.activePolicies}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    company.status === 'Active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${company.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {company.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right relative action-menu-container">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleActionClick(company.id); }}
                    className={`p-1 rounded transition-colors ${openActionId === company.id ? 'bg-gray-100 dark:bg-dark-3 text-gray-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openActionId === company.id && (
                    <div className="absolute right-8 top-0 mt-0 w-36 bg-gray-1 dark:bg-gray-dark rounded-lg divide-y shadow-xl z-60 border border-dark-3 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      {canEdit && onEditCompany && (
                        <button onClick={() => onEditCompany(company)} className="w-full px-4 py-3 text-left text-sm dark:text-gray-300 hover:bg-dark-2 hover:text-white flex items-center gap-3 transition-colors">
                          <Edit className="w-4 h-4" /> Edit Profile
                        </button>
                      )}
                      <button className="w-full px-4 py-3 text-left text-sm dark:text-gray-300 hover:bg-[#253344] hover:text-white flex items-center gap-3 transition-colors">
                      <UserIcon className="w-4 h-4" /> Reset Password
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm dark:text-gray-300 hover:bg-[#253344] hover:text-white flex items-center gap-3 transition-colors">
                      <Lock className="w-4 h-4" /> View Activity log
                    </button>
                      {canEdit && canDelete && <div className="h-px bg-dark-3/50 mx-2"></div>}
                      {canDelete && onDeleteCompany && (
                        <button onClick={() => onDeleteCompany(company)} className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-dark-2 hover:text-red-300 flex items-center gap-3 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
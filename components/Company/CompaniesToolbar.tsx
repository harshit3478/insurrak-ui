import React from 'react';
import { Search, Filter, Download, Plus } from 'lucide-react';

interface CompaniesToolbarProps {
  onAddCompany?: () => void;
  onSearch?: (query: string) => void;
}

export const CompaniesToolbar: React.FC<CompaniesToolbarProps> = ({ onAddCompany }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
        <input
          type="text"
          placeholder="Search Company"
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-dark-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-300 bg-white dark:bg-gray-dark focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-300 dark:focus:border-gray-500 transition-all"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full md:w-auto">
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
        {onAddCompany && (
          <button
            onClick={onAddCompany}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Company
          </button>
        )}
      </div>
    </div>
  );
};
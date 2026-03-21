"use client";

import { useRouter } from "next/navigation";
import { Search, Filter, Download, Plus } from "lucide-react";

export function UsersToolbar({ onAddUser }: { onAddUser?: () => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
        <input
          type="search"
          placeholder="Search Users"
          onChange={(e) =>
            router.push(`/company/users?search=${e.target.value}`)
          }
          className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-2 rounded-lg text-sm focus:outline-none focus:ring-1 outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full md:w-auto">
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 dark:text-gray hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 dark:text-gray hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
        {onAddUser && (
          <button
            onClick={onAddUser}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New User
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { User as UserIcon, Briefcase, Mail, Building, Users, CircleUser } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Loading } from "@/components/ui/Loading";
import type { User as UserType } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await apiClient.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load profile. Please make sure you are logged in.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6 lg:p-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1727] to-[#1a2b44] p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-5 mix-blend-overlay blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-[#C6F200] opacity-10 mix-blend-overlay blur-2xl" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8 text-center sm:text-left">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/10 bg-white/5 backdrop-blur-md shadow-inner">
             <CircleUser className="h-16 w-16 text-white/50" />
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{user.name}</h1>
            <p className="flex items-center justify-center sm:justify-start gap-2 text-[#C6F200] font-medium tracking-wide text-sm">
               <Briefcase className="h-4 w-4" />
               {user.designation || user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Identity Card */}
        <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-dark-2 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-3 pb-3">Identity Detalis</h2>
          
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">{user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Corporate Info Card */}
        <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-dark-2 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-3 pb-3">Corporate Position</h2>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company ID</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">{user.companyId || 'Independent / Root'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reports To</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">{user.reportsTo ? `Manager ID: ${user.reportsTo}` : 'No Manager (Top Level)'}</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

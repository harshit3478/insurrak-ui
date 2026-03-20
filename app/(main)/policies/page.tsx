"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useState, useMemo, useCallback } from "react";
import { setPolicies } from "@/lib/features/policy/policySlice";
import { apiClient } from "@/lib/apiClient";
import { api as apiService } from "@/lib/api";
import { Company } from "@/types";
import { PolicyRequestRead } from "@/types/api";
import { Search, Filter, Download, Plus, MoreVertical, Edit, FileText, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/Loading";
import { SkeletonRows } from "@/components/ui/SkeletonRows";
import { isBypassActive } from "@/types/permissions";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  APPROVAL_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  PAYMENT_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  DRAFT: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  QUOTING: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
  DATA_COLLECTION: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  RISK_HELD: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  POLICY_ISSUED_SOFT: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  POLICY_ISSUED_HARD: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  EXPIRING: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

/**
 * PoliciesPage serves as the main dashboard for a company's insurance policies.
 * It provides a high-level overview of premium costs, pending actions, and a 
 * searchable, filterable list of all policy requests.
 */
export default function PoliciesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  
  const [policies, setLocalPolicies] = useState<PolicyRequestRead[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<"All" | "Active" | "Pipeline" | "Archived">("All");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const currentUser = await apiClient.getCurrentUser();
        if (!currentUser.companyId) {
          if (isBypassActive()) {
            // Dev Bypass Fallback: If not linked to a company, default to ID 1 to allow UI testing
            currentUser.companyId = "1"; 
          } else {
            setError(`No company associated with your account.`);
            setLoading(false);
            return;
          }
        }
        const companyId = Number(currentUser.companyId);

        let companyData: Company | null = null;
        try {
          companyData = await apiService.getCompanyById(companyId);
        } catch (getErr: any) {
          try {
             // Fallback
             const allCompanies = await apiService.getAllCompanies();
             companyData = allCompanies.find(c => Number(c.id) === companyId) || null;
          } catch (e) {}
          if (!companyData) {
             companyData = {
               id: companyId,
               companyId: String(companyId),
               name: "Your Company",
               is_active: true,
               email: currentUser.email || "",
               status: "Active",
             } as unknown as Company;
          }
        }
        setCompany(companyData);

        // Fetch policies for this company
        const pData = await apiClient.getPolicyRequests(companyId).catch(() => [] as PolicyRequestRead[]);
        setLocalPolicies(pData);
        dispatch(setPolicies(pData as any)); // sync with global state if needed
      } catch (err: any) {
        setError(`Failed to load data.`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dispatch]);

  const getStatusDot = (status: string) => {
    if (status === "ACTIVE" || status === "APPROVED") return "bg-green-500";
    if (["APPROVAL_PENDING", "PAYMENT_PENDING", "EXPIRING"].includes(status)) return "bg-yellow-500";
    if (status === "QUOTING") return "bg-purple-500";
    if (status === "DRAFT") return "bg-blue-500";
    if (status === "DATA_COLLECTION") return "bg-indigo-500";
    if (status === "RISK_HELD") return "bg-red-500";
    return "bg-gray-400";
  };

  if (error || (!loading && !company)) return <div className="p-8 text-center text-gray-500">{error || "Company not found."}</div>;

  const companyInitial = company?.name ? company.name.charAt(0).toUpperCase() : "C";

  // Filtering
  const PIPELINE_STATUSES = useMemo(() => ["DRAFT", "DATA_COLLECTION", "QUOTING", "APPROVAL_PENDING", "PAYMENT_PENDING"], []);
  
  const filterByStatus = useCallback((p: PolicyRequestRead) => {
    if (quickFilter === "All") return true;
    if (quickFilter === "Active") return p.status === "ACTIVE" || p.status === "APPROVED";
    if (quickFilter === "Pipeline") return PIPELINE_STATUSES.includes(p.status);
    if (quickFilter === "Archived") return p.status === "ARCHIVED";
    return true;
  }, [quickFilter, PIPELINE_STATUSES]);

  const filtered = useMemo(() => policies.filter(p => filterByStatus(p)).filter(
    p =>
      (p.policy_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.asset_description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.line_of_business || "").toLowerCase().includes(search.toLowerCase())
  ), [policies, filterByStatus, search]);

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <div className="space-y-6">
        <div className="text-gray-900 dark:text-white mb-2">
          <span className="text-lg font-bold">Welcome back, {authUser?.name}</span>
        </div>

      {/* Company Header Card */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C6F200] flex items-center justify-center text-xl font-bold text-black">
              {companyInitial}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company?.name || "Loading..."}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${company?.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${company?.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {company?.status || 'Active'}
              </span>
            </div>
          </div>
          <button onClick={() => router.push(company ? `/company/edit/${company.id}` : '#')} className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium border border-gray-200 dark:border-dark-3 px-3 py-1.5 rounded-lg transition-colors">
            <Edit className="w-4 h-4" /> Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-8">
          <div>
            <div className="text-xs text-gray-400 mb-1">Email</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.email || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Company ID</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.companyId || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Admin</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.admin || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Admin Phone Number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.mobile_number || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Phone Number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.mobile_number || '-'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-400 mb-1">CIN Number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.gst_number || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Admin Email</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{company?.adminEmail || '-'}</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 p-6 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-2 flex items-center justify-center text-gray-500">
               <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Premium Paid</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">₹14,50,000</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full mb-1 flex items-center gap-1">
                   <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-white">↑</div> 10%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Compared to last fiscal year</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 p-6 flex flex-col justify-between">
           <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-2 flex items-center justify-center text-gray-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Action Required</p>
                  <p className="text-xs text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                </div>
              </div>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Review →</button>
           </div>
           <div className="mt-4 flex items-center gap-3">
             <span className="text-3xl font-bold text-gray-900 dark:text-white">2</span>
             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Approval Pending
             </span>
           </div>
        </div>
      </div>

      {/* Policies section */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[500px]">
        <div className="p-6 border-b border-gray-100 dark:border-dark-3">
           <h2 className="text-lg font-bold text-gray-900 dark:text-white">Policies</h2>
        </div>
        
        <div className="px-6 py-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-100 dark:border-dark-3">
          <div className="relative w-full xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Policies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-gray-50 dark:bg-dark-2 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 group relative">
              <span className="text-sm font-medium text-gray-500">Quick Filters:</span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Info className="w-4 h-4" />
              </button>
              
              {/* 
                Status Legend Popover:
                Triggered on hover, this popover provides a detailed breakdown 
                of the policy lifecycle stages (Pipeline vs Active vs Archived).
              */}
              <div className="absolute top-full left-0 mt-2 w-[400px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 p-6 space-y-6 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {/* All */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Status Meanings (All 12) :</h4>
                    <p className="text-[10px] text-gray-500 mb-3">Complete guide to policy lifecycle stages</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700"><span className="w-1 h-1 rounded-full bg-blue-500"></span>Draft</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700"><span className="w-1 h-1 rounded-full bg-indigo-500"></span>Data Collection</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700"><span className="w-1 h-1 rounded-full bg-purple-500"></span>Quoting</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700"><span className="w-1 h-1 rounded-full bg-yellow-500"></span>Approval Pending</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>Approved</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700"><span className="w-1 h-1 rounded-full bg-yellow-500"></span>Payment Pending</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700"><span className="w-1 h-1 rounded-full bg-red-500"></span>Risk Held</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700"><span className="w-1 h-1 rounded-full bg-green-500"></span>Soft Copy Issued</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700"><span className="w-1 h-1 rounded-full bg-green-500"></span>Hard Copy Issued</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700"><span className="w-1 h-1 rounded-full bg-green-500"></span>Active</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700"><span className="w-1 h-1 rounded-full bg-amber-500"></span>Expiring</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"><span className="w-1 h-1 rounded-full bg-gray-400"></span>Archived</span>
                    </div>
                  </div>

                  {/* Pipeline */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Pipeline :</h4>
                    <p className="text-[10px] text-gray-500 mb-3">Policies that are currently being worked on, negotiated, or waiting for payment. The company does not have legal coverage for these items yet.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700"><span className="w-1 h-1 rounded-full bg-blue-500"></span>Draft</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700"><span className="w-1 h-1 rounded-full bg-indigo-500"></span>Data Collection</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700"><span className="w-1 h-1 rounded-full bg-purple-500"></span>Quoting</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700"><span className="w-1 h-1 rounded-full bg-yellow-500"></span>Approval Pending</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>Approved</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700"><span className="w-1 h-1 rounded-full bg-yellow-500"></span>Payment Pending</span>
                    </div>
                  </div>

                  {/* Active */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Active :</h4>
                    <p className="text-[10px] text-gray-500 mb-3">The company is officially protected against risk. Even if they don't have the final PDF document in hand, the insurer has accepted the liability.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700"><span className="w-1 h-1 rounded-full bg-red-500"></span>Risk Held</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700"><span className="w-1 h-1 rounded-full bg-green-500"></span>Soft Copy Issued</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700"><span className="w-1 h-1 rounded-full bg-green-500"></span>Hard Copy Issued</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700"><span className="w-1 h-1 rounded-full bg-green-500"></span>Active</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700"><span className="w-1 h-1 rounded-full bg-amber-500"></span>Expiring</span>
                    </div>
                  </div>

                  {/* Archived */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Archived :</h4>
                    <p className="text-[10px] text-gray-500 mb-3">Policies where the coverage period has ended.</p>
                    <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"><span className="w-1 h-1 rounded-full bg-gray-400"></span>Archived</span>
                    </div>
                  </div>
                </div>
                {/* Carrot/Arrow */}
                <div className="ml-4 w-3 h-3 bg-white dark:bg-gray-dark border-t border-l border-gray-200 dark:border-dark-3 rotate-45 -mb-1.5 absolute -top-1.5 shadow-sm"></div>
              </div>
            </div>
            {["All", "Active", "Pipeline", "Archived"].map(f => (
               <button 
                  key={f}
                  onClick={() => setQuickFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${quickFilter === f ? 'bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727]' : 'text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-dark-2 dark:text-gray-300 dark:hover:bg-dark-3'}`}
               >
                 {f}
               </button>
            ))}
            <div className="h-6 w-px bg-gray-200 dark:bg-dark-3 mx-1 hidden xl:block"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
            <Link
              href="/policies/add"
              className="flex items-center gap-2 px-4 py-1.5 bg-[#0B1727] text-white rounded-lg text-sm font-medium hover:bg-[#1a2639] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Policy
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto pb-8">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-3">
                {['Policy No.', 'Unit', 'Asset Description', 'Line of Business', 'Broker', 'Created Date', 'Policy Period', 'Status'].map(h => (
                  <th key={h} className="py-4 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">{h} ↓</th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {loading ? (
                <SkeletonRows columns={9} rows={5} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-gray-400">No policies found for the selected filters.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} onClick={() => router.push(`/policies/${item.id}/documents`)} className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors group cursor-pointer">
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">{item.policy_number || 'Bold text column'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Unit ID: {item.unit_id}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-[150px]" title={item.asset_description || ''}>{item.asset_description || 'Regular text column'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">{item.line_of_business || 'Regular text column'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Broker: {item.broker_id || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Regular text column</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${STATUS_STYLES[item.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                       <span className={`w-1 h-1 rounded-full ${getStatusDot(item.status)}`}></span>
                       {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        </div>
      </div>
    </div>
  );
}

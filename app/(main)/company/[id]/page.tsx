"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  CheckCircle2,
  MinusCircle
} from 'lucide-react';

export default function CompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;

  const [activeTab, setActiveTab] = useState<'branches' | 'policies'>('branches');

  // Mock Data mimicking the screenshot
  const branches = Array(8).fill(null).map((_, i) => ({
    id: i + 1,
    name: 'Bold text column',
    state: 'Regular text column',
    gst: 'Regular text column',
    manager: 'Regular text column',
    email: 'Regular text column',
    status: i % 2 === 0 ? 'Active' : 'Inactive'
  }));

  const policies = Array(8).fill(null).map((_, i) => ({
    id: 100 + i,
    policyNo: 'Bold text column',
    unit: 'Regular text column',
    asset: 'Regular text column',
    lob: 'Regular text column',
    broker: 'Regular text column',
    createdDate: 'Regular text column',
    status: i === 0 ? 'Approval Pending' : 
            i === 1 ? 'Quoting' : 
            i === 2 ? 'Draft' : 
            i === 3 ? 'Approved' :
            i === 4 ? 'Data Collection' :
            i === 5 ? 'Payment Pending' : 'Active'
  }));

  const getStatusBadge = (status: string) => {
    let bg = 'bg-gray-100 text-gray-600';
    let dot = 'bg-gray-400';

    switch (status) {
      case 'Active':
      case 'Approved':
        bg = 'bg-green-50 text-green-700';
        dot = 'bg-green-500';
        break;
      case 'Inactive':
        bg = 'bg-gray-100 text-gray-500';
        dot = 'bg-gray-400';
        break;
      case 'Approval Pending':
      case 'Payment Pending':
        bg = 'bg-yellow-50 text-yellow-700';
        dot = 'bg-yellow-500';
        break;
      case 'Quoting':
        bg = 'bg-purple-50 text-purple-700';
        dot = 'bg-purple-500';
        break;
      case 'Draft':
        bg = 'bg-blue-50 text-blue-700';
        dot = 'bg-blue-500';
        break;
      case 'Data Collection':
        bg = 'bg-indigo-50 text-indigo-700';
        dot = 'bg-indigo-500';
        break;
      case 'Risk Held':
        bg = 'bg-red-50 text-red-700';
        dot = 'bg-red-500';
        break;
    }

    if (['Approval Pending', 'Quoting', 'Data Collection', 'Payment Pending'].includes(status)) {
        // Pill style for complex statuses
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg}`}>
                • {status}
            </span>
        )
    }

    // Default active/inactive style
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
        {status}
      </span>
    );
  };

  const onBack = () => router.push('/company');

  const onViewPolicy = (policyId: number) => {
    router.push(`/company/${companyId}/policy/${policyId}`);
  };

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-gray-dark min-h-full font-sans">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-6 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-dark-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-3 shadow-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C6F200] flex items-center justify-center text-xl font-bold text-black">
              A
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Acme Manufacturing Ltd</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => router.push(`/company/edit/${companyId}`)} className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium border border-gray-200 dark:border-dark-3 px-3 py-1.5 rounded-lg transition-colors">
            <Edit className="w-4 h-4" /> Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-8">
          <div>
            <div className="text-xs text-gray-400 mb-1">Email</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">acme.sol@google.com</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Company ID</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">COM1234fe453</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Admin</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Rajesh Kumar</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Admin Phone Number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">+91 872345902</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Phone Number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">98368228973</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">GST Number</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">27AADCB2230M1Z2</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-400 mb-1">Admin Email</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">rajesh@acme.com</div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm overflow-hidden min-h-[600px]">
        {/* Tabs Header */}
        <div className="border-b border-gray-100 dark:border-dark-3 bg-gray-50/30 dark:bg-dark-2/30 px-6 pt-2">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('branches')}
              className={`pb-4 text-sm font-medium px-2 border-b-2 transition-colors ${
                activeTab === 'branches' 
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Branches
            </button>
            <button 
              onClick={() => setActiveTab('policies')}
              className={`pb-4 text-sm font-medium px-2 border-b-2 transition-colors ${
                activeTab === 'policies' 
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Policies
            </button>
          </div>
        </div>

        {/* Tab Content Actions */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder={activeTab === 'branches' ? "Search Branches" : "Search Policies"}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-dark-3 rounded-lg text-sm bg-white dark:bg-gray-dark focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2">
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-dark-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-3">
                  <th className="w-10 py-3 px-4 text-left"><MinusCircle className="w-4 h-4 text-gray-400" /></th>
                  {activeTab === 'branches' ? (
                    <>
                      {['Branch Name', 'State', 'GST Number', 'Branch Manager', 'Branch Manager Email', 'Status'].map(h => (
                        <th key={h} className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h} ↓</th>
                      ))}
                    </>
                  ) : (
                    <>
                       {['Policy No.', 'Unit', 'Asset Description', 'Line of Business', 'Broker', 'Created Date', 'Status'].map(h => (
                        <th key={h} className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{h} ↓</th>
                      ))}
                    </>
                  )}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                {activeTab === 'branches' ? (
                  branches.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-2 group">
                      <td className="py-4 px-4"><CheckCircle2 className="w-4 h-4 text-gray-900 dark:text-gray-300" /></td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">{item.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.state}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.gst}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.manager}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.email}</td>
                      <td className="py-4 px-4">{getStatusBadge(item.status)}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  policies.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-2 group cursor-pointer"
                      onClick={() => onViewPolicy(item.id)}
                    >
                      <td className="py-4 px-4"><CheckCircle2 className="w-4 h-4 text-gray-900 dark:text-gray-300" /></td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">{item.policyNo}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.unit}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.asset}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.lob}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.broker}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{item.createdDate}</td>
                      <td className="py-4 px-4">{getStatusBadge(item.status)}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
           {/* Pagination Mock */}
           <div className="flex justify-center mt-6 gap-2">
              <button className="px-3 py-1 bg-gray-100 dark:bg-dark-2 rounded text-xs text-gray-600 dark:text-gray-300 disabled:opacity-50">Back</button>
              <button className="px-3 py-1 bg-[#0B1727] rounded text-xs text-white">1</button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-dark-2 rounded text-xs text-gray-600 dark:text-gray-300">2</button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-dark-2 rounded text-xs text-gray-600 dark:text-gray-300">3</button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-dark-2 rounded text-xs text-gray-600 dark:text-gray-300">4</button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-dark-2 rounded text-xs text-gray-600 dark:text-gray-300">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

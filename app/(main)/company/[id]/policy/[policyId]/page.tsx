"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api as apiClient } from '@/lib/api';
import { PolicyRequestRead, PolicyDocumentRead, QuotationRead, ApprovalRead } from '@/types/api';
import { 
  ArrowLeft, 
  Search, 
  Check, 
  FileText, 
  Download,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Send,
  RefreshCw,
  Upload,
  PlusCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function PolicyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id: companyId, policyId } = params;

  const [activeTab, setActiveTab] = useState<'documents' | 'quotations' | 'deviations' | 'approvals' | 'activity'>('deviations');
  const [selectedDeviationQuote, setSelectedDeviationQuote] = useState('hdfc-v2');

  const steps = [
    { label: 'Draft', status: 'completed' },
    { label: 'Data Collection', status: 'completed' },
    { label: 'Quoting', status: 'completed' },
    { label: 'Approval', status: 'current' },
    { label: 'Active', status: 'upcoming' },
  ];

  const [policyData, setPolicyData] = useState<PolicyRequestRead | null>(null);
  const [documents, setDocuments] = useState<PolicyDocumentRead[]>([]);
  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRead[]>([]);
  const [loading, setLoading] = useState(true);

  const deviationData = [
      { parameter: 'Total Premium', previous: '₹1,20,000', current: '₹1,41,600', change: 'Increased', severity: 'High' },
      { parameter: 'Deductibles', previous: '1% of claim amount', current: '5% of claim amount', change: 'Increased', severity: 'Medium' },
      { parameter: 'Terrorism Cover', previous: 'Included in baseline', current: 'Explicitly Excluded', change: 'Removed', severity: 'High' },
      { parameter: 'STFI Cover', previous: 'Not Included', current: 'Included in baseline', change: 'New', severity: 'Low' },
      { parameter: 'Security Warranty', previous: 'Guards at night only', current: '24/7 Guards mandatory', change: 'Increased', severity: 'Medium' },
  ];

  const activityLog = [
      {
          date: 'Today',
          items: [
              { title: 'Status Change', desc: 'System changed status from APPROVAL PENDING to APPROVED.', time: '10:45 PM', icon: RefreshCw },
              { title: 'Approval', desc: 'Vikram Mehta (VP of Finance) approved Quotation v2 (HDFC Ergo)', time: '10:42 PM', icon: CheckCircle2, color: 'text-green-600' },
          ]
      },
      {
          date: 'OCTOBER 15, 2025',
          items: [
              { title: 'Approval', desc: 'Vikram Mehta (VP of Finance) rejected Quotation v1.', time: '2:15 PM', icon: XCircle, color: 'text-red-600' },
              { title: 'Document Upload', desc: 'SecureRisk Broker uploaded icici_quote_v1.pdf.', time: '11:30 AM', icon: FolderOpen, color: 'text-yellow-600' },
              { title: 'Status Change', desc: 'Rajesh Kumar (Processor) changed status to QUOTING.', time: '9:00 AM', icon: RefreshCw },
          ]
      },
       {
          date: 'OCTOBER 12, 2025',
          items: [
              { title: 'Created', desc: 'Rajesh Kumar (Processor) created Policy Request PRQ-882914.', time: '10:00 AM', icon: PlusCircle },
          ]
      }
  ];

  // Safely extract string values to fix any potential 404 routing anomalies caused by Promise objects
  const safeCompanyId = Array.isArray(companyId) ? companyId[0] : (typeof companyId === 'string' ? companyId : String(companyId));
  const safePolicyId = Array.isArray(policyId) ? policyId[0] : (typeof policyId === 'string' ? policyId : String(policyId));

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      if (!safePolicyId) return;
      try {
        setLoading(true);
        const [pData, pDocs, pQuotes, pApprovals] = await Promise.all([
          apiClient.getPolicyRequestById(Number(safePolicyId)),
          apiClient.getPolicyDocuments(Number(safePolicyId)).catch(() => []),
          apiClient.getQuotations(Number(safePolicyId)).catch(() => []),
          apiClient.getApprovals(Number(safePolicyId)).catch(() => []),
        ]);
        setPolicyData(pData);
        setDocuments(pDocs);
        setQuotations(pQuotes);
        setApprovals(pApprovals);

        // Auto-select first quote if deviations tab is active
        if (pQuotes && pQuotes.length > 0) {
           setSelectedDeviationQuote(String(pQuotes[0].id));
        }

      } catch (err) {
        console.error("Failed to load policy details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyDetails();
  }, [safePolicyId]);

  const onBack = () => router.push(`/company/${safeCompanyId}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!policyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load policy details. Please check if the Policy ID exists.</p>
        <button onClick={onBack} className="ml-4 text-blue-500 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-gray-dark min-h-full font-sans">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-6 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-dark-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-3 shadow-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Acme Manufacturing Ltd
      </button>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Request: {policyData.policy_number || `PRQ-${policyData.id}`}</h1>
          <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium border border-yellow-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> {policyData.status || 'Draft'}
          </span>
        </div>

        {/* Stepper */}
        <div className="mb-12 px-4 relative">
            <div className="absolute top-[11px] left-0 w-full h-1 bg-gray-100 dark:bg-dark-3 -z-10"></div>
            {/* Progress Bar Background */}
            <div className="absolute top-[11px] left-0 h-1 bg-green-500 z-0 transition-all duration-500" style={{width: '75%'}}></div>
            
            <div className="flex justify-between relative z-10">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white dark:bg-gray-dark
                            ${step.status === 'completed' ? 'border-green-500 bg-green-500 text-white' : 
                              step.status === 'current' ? 'border-gray-200 dark:border-dark-3 bg-gray-200 dark:bg-dark-3 text-gray-400' : 
                              'border-gray-200 dark:border-dark-3 bg-gray-100 dark:bg-dark-2 text-gray-300'
                            }
                        `}>
                            {step.status === 'completed' && <Check className="w-3 h-3" strokeWidth={4} />}
                            {step.status === 'current' && <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>}
                        </div>
                        <span className={`text-xs font-medium ${step.status === 'completed' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Policy Overview */}
        <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Policy Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div className="text-xs text-gray-400 mb-1">Unit ID</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{policyData.unit_id}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Broker ID</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{policyData.broker_id}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Sum Insured</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">₹{policyData.sum_insured || '0'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Created By</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">UID: {policyData.requested_by_id}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Asset Description</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{policyData.asset_description || '-'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Line of Business</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{policyData.line_of_business}</div>
                </div>
                 <div>
                    <div className="text-xs text-gray-400 mb-1">Created</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{new Date(policyData.created_at).toLocaleDateString()}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-200/50 dark:bg-dark-2 p-1 rounded-lg inline-flex mb-6">
        {['Documents', 'Quotations', 'Deviations', 'Approvals', 'Activity'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.toLowerCase() 
                    ? 'bg-white dark:bg-gray-dark text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-6 min-h-[400px]">
        
        {activeTab === 'documents' && (
            <div className="space-y-8">
                {/* Client Documents */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <FolderOpen className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Client Documents</h4>
                    </div>
                    <div className="border border-gray-100 dark:border-dark-3 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-dark-2/50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">File Name ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Uploaded By ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date ↓</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                                {documents.length > 0 ? documents.map((doc) => (
                                  <tr key={doc.id}>
                                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{doc.document_type}</td>
                                      <td className="py-3 px-4 text-sm text-blue-600">{doc.file_name}</td>
                                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">UID: {doc.uploaded_by_id}</td>
                                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</td>
                                      <td className="py-3 px-4"><Download className="w-4 h-4 text-gray-400 cursor-pointer" /></td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No documents found</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Insurer & Vendor Documents */}
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                        <FolderOpen className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Insurer & Vendor Documents</h4>
                    </div>
                    <div className="border border-gray-100 dark:border-dark-3 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-dark-2/50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">File Name ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Uploaded By ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date ↓</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                                <tr>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Quotation (HDFC)</td>
                                    <td className="py-3 px-4 text-sm text-blue-600">hdfc_quote_v2.pdf</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">SecureRisk Broker</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">Oct 15, 2025</td>
                                    <td className="py-3 px-4"><Download className="w-4 h-4 text-gray-400 cursor-pointer" /></td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Quotation (ICICI)</td>
                                    <td className="py-3 px-4 text-sm text-blue-600">icici_quote_v1.pdf</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">SecureRisk Broker</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">Oct 15, 2025</td>
                                    <td className="py-3 px-4"><Download className="w-4 h-4 text-gray-400 cursor-pointer" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Issuance & Financial */}
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                        <FolderOpen className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Issuance & Financial</h4>
                    </div>
                    <div className="border border-gray-100 dark:border-dark-3 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-dark-2/50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">File Name ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Uploaded By ↓</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date ↓</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                                <tr>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Performa Invoice</td>
                                    <td className="py-3 px-4 text-sm text-blue-600">inv_hdfc_882.pdf</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">Rajesh Kumar</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">Oct 18, 2025</td>
                                    <td className="py-3 px-4"><Download className="w-4 h-4 text-gray-400 cursor-pointer" /></td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Policy (Soft Copy)</td>
                                    <td className="py-3 px-4 text-sm text-blue-600">pol_hdfc_final.pdf</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">SecureRisk Broker</td>
                                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">Oct 20, 2025</td>
                                    <td className="py-3 px-4"><Download className="w-4 h-4 text-gray-400 cursor-pointer" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'quotations' && (
                 <div>
                <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quotations ({quotations.length})</h4>
                </div>
                <div className="border border-gray-100 dark:border-dark-3 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-dark-2/50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Insurer ID ↓</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Premium ↓</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">GST ↓</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Total Premium ↓</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Attachment ↓</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
                            {quotations.length > 0 ? quotations.map((q) => (
                              <React.Fragment key={q.id}>
                                <tr className="bg-white dark:bg-gray-dark border-t border-gray-100 dark:border-dark-3">
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{q.insurer_id} (Version: {q.version}) {q.is_selected && '★'}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">₹{q.premium}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">₹{q.gst}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">₹{q.total_premium}</td>
                                    <td className="py-4 px-4 text-sm text-gray-500 text-right">
                                      {q.file_name ? (
                                        <a href={q.file_path || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 text-blue-500 hover:text-blue-700">
                                            <Download className="w-4 h-4 ml-auto" />
                                        </a>
                                      ) : '-'}
                                    </td>
                                </tr>
                                {q.terms && (
                                  <tr className="bg-gray-50/50 dark:bg-dark-2/50">
                                      <td colSpan={5} className="py-4 px-8 border-t-0">
                                          <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Coverage Terms</h5>
                                          <ul className="list-disc pl-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                              {q.terms.perils_included && <li>Perils Covered: {q.terms.perils_included}</li>}
                                              {q.terms.perils_excluded && <li>Exclusions: {q.terms.perils_excluded}</li>}
                                              {q.terms.deductibles && <li>Deductibles: {q.terms.deductibles}</li>}
                                              {q.terms.warranties && <li>Warranties: {q.terms.warranties}</li>}
                                              {q.terms.co_insurance && <li>Co-Insurance: {q.terms.co_insurance}</li>}
                                          </ul>
                                      </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )) : (
                              <tr>
                                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No quotations uploaded yet</td>
                              </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'deviations' && (
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar - Quotations List */}
                <div className="w-full lg:w-1/4 space-y-4">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quotations</h4>
                    <p className="text-xs text-gray-400 mb-4">Select Quotation to see Deviation Analysis</p>

                    {quotations.map(quote => (
                      <div
                          key={quote.id}
                          onClick={() => setSelectedDeviationQuote(String(quote.id))}
                          className={`p-4 rounded-lg border cursor-pointer relative transition-all ${
                              selectedDeviationQuote === String(quote.id) 
                              ? 'border-green-500 bg-green-50/30' 
                              : 'border-gray-200 dark:border-dark-3 bg-white dark:bg-gray-dark hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                      >
                          <div className="flex justify-between items-start">
                              <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Insurer ID: {quote.insurer_id} {quote.is_selected && '(Selected)'}</h5>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Premium : ₹{quote.total_premium}</p>
                              </div>
                              {selectedDeviationQuote === String(quote.id) && <CheckCircle2 className="w-5 h-5 text-green-600 fill-green-100" />}
                          </div>
                      </div>
                    ))}
                    {quotations.length === 0 && (
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-dark-3 text-sm text-gray-500 text-center">
                        No quotes available yet.
                      </div>
                    )}
                </div>

                {/* Right Content - Analysis Table */}
                <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Deviations</h4>
                    <p className="text-xs text-gray-400 mb-6">Comprehensive Deviation Analysis for the selected Quotation</p>

                    <div className="border border-gray-200 dark:border-dark-3 rounded-lg overflow-hidden">
                        <div className="bg-white dark:bg-gray-dark px-6 py-4 border-b border-gray-100 dark:border-dark-3">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">Comparing: HDFC Ergo (v2) [Selected]  vs.  Expiring Policy (2024) [Baseline]</h5>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50/50 dark:bg-dark-2/50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Parameter ↓</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Previous Term (2024) ↓</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Current Term ↓</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Change ↓</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Severity ↓</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-dark-3">
                                    {deviationData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-2">
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{row.parameter}</td>
                                            <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{row.previous}</td>
                                            <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{row.current}</td>
                                            <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{row.change}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                                    ${row.severity === 'High' ? 'bg-red-50 text-red-700' : 
                                                      row.severity === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 
                                                      'bg-green-50 text-green-700'}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full 
                                                        ${row.severity === 'High' ? 'bg-red-500' : 
                                                          row.severity === 'Medium' ? 'bg-yellow-500' : 
                                                          'bg-green-500'}
                                                    `}></span>
                                                    {row.severity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'approvals' && (
            <div className="max-w-4xl">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Approval History</h4>
                
                <div className="space-y-8 pl-2 ml-2">
                    {approvals.length > 0 ? approvals.map((item, idx) => (
                        <div key={idx} className="relative pl-8 border-l border-gray-200 dark:border-dark-3 last:border-0 pb-8 last:pb-0">
                            {/* Dot on Timeline */}
                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-dark-3 border-2 border-white dark:border-gray-dark"></div>
                            
                            <div className="border border-gray-200 dark:border-dark-3 rounded-lg p-6 bg-white dark:bg-gray-dark shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    {item.decision === 'APPROVED' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.decision}</span>
                                    <span className="text-xs text-gray-400 font-light ml-1">{new Date(item.created_at).toLocaleString()}</span>
                                </div>
                                <div className="space-y-1 pl-7">
                                    <p className="text-xs text-gray-500 dark:text-gray-400"><span className="text-gray-400">By Approver UID:</span> {item.approver_id}</p>
                                    {item.quotation_id && (
                                         <p className="text-xs text-gray-500 dark:text-gray-400"><span className="text-gray-400">Quote ID:</span> {item.quotation_id}</p>
                                    )}
                                    {item.comments && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-400 mb-1">Comments</p>
                                            <div className="bg-gray-50 dark:bg-dark-2 p-3 rounded-md text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-dark-3">
                                                {item.comments}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                      <p className="text-sm text-gray-500">No approvals history found.</p>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'activity' && (
            <div className="max-w-4xl">
                 <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-6">System Audit Trail</h4>
                 
                 <div className="space-y-8 pl-2 ml-2">
                     {activityLog.map((group, groupIdx) => (
                         <div key={groupIdx} className="relative pl-8 border-l border-gray-200 dark:border-dark-3 last:border-0 pb-2 last:pb-0">
                             <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-dark-3 border-2 border-white dark:border-gray-dark"></div>
                             
                             <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4 mt-0.5">{group.date}</h5>
                             
                             <div className="space-y-3">
                                 {group.items.map((item, itemIdx) => (
                                     <div key={itemIdx} className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-lg p-4 shadow-sm flex items-start gap-4">
                                         <div className="mt-0.5">
                                            {item.icon && <item.icon className={`w-4 h-4 ${item.color || 'text-gray-500'}`} />}
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex justify-between items-start">
                                                 <span className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</span>
                                                 <span className="text-xs text-gray-400">{item.time}</span>
                                             </div>
                                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};
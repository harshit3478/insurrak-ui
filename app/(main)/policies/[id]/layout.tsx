"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import { PolicyRequestRead, UnitRead, BrokerRead, QuotationRead, InsurerRead } from "@/types/api";
import { User } from "@/types";
import { ChevronLeft, Check, Loader2, X, ArrowRight, AlertCircle, CheckCircle2, XCircle, Upload, CreditCard, FileUp } from "lucide-react";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/context-provider/AuthProvider";

/**
 * Policy lifecycle stages used for the horizontal progress stepper.
 * alsoMatch lets intermediate statuses map to the correct step.
 */
const STEPS: Array<{ label: string; status: string; alsoMatch?: string[] }> = [
  { label: "Draft",          status: "DRAFT" },
  { label: "Data Collection",status: "DATA_COLLECTION" },
  { label: "Quoting",        status: "QUOTING" },
  { label: "Approval",       status: "APPROVAL_PENDING", alsoMatch: ["APPROVED"] },
  { label: "Payment",        status: "PAYMENT_PENDING" },
  { label: "Risk Held",      status: "RISK_HELD" },
  { label: "Policy Issued",  status: "POLICY_ISSUED_SOFT", alsoMatch: ["POLICY_ISSUED_HARD"] },
  { label: "Active",         status: "ACTIVE", alsoMatch: ["EXPIRING", "ARCHIVED"] },
];

/**
 * Visual styles for policy status badges, supporting both light and dark modes.
 */
const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  APPROVAL_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  PAYMENT_PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",
  DRAFT: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  QUOTING: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800",
  DATA_COLLECTION: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  RISK_HELD: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800",
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800",
  EXPIRING: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const getStatusDotColor = (status: string) => {
  if (status === "ACTIVE" || status === "APPROVED") return "bg-green-500";
  if (["APPROVAL_PENDING", "PAYMENT_PENDING", "EXPIRING"].includes(status)) return "bg-yellow-500";
  if (status === "QUOTING") return "bg-purple-500";
  if (status === "DRAFT") return "bg-blue-500";
  if (status === "DATA_COLLECTION") return "bg-indigo-500";
  if (status === "RISK_HELD") return "bg-red-500";
  return "bg-gray-400";
};

/**
 * Contextual actions available at each workflow stage.
 */
type ActionConfig = { label: string; nextStatus: string; variant: "primary" | "success" | "danger" | "navigate" };
const STATUS_ACTIONS: Partial<Record<string, ActionConfig[]>> = {
  DRAFT: [{ label: "Start Data Collection", nextStatus: "DATA_COLLECTION", variant: "primary" }],
  DATA_COLLECTION: [{ label: "Submit for Quoting", nextStatus: "QUOTING", variant: "primary" }],
  QUOTING: [{ label: "Request Approval", nextStatus: "APPROVAL_PENDING", variant: "primary" }],
  APPROVAL_PENDING: [
    { label: "Approve", nextStatus: "APPROVED", variant: "success" },
    { label: "Reject / Revise", nextStatus: "QUOTING", variant: "danger" },
  ],
  APPROVED: [{ label: "Mark Payment Pending", nextStatus: "PAYMENT_PENDING", variant: "primary" }],
  PAYMENT_PENDING: [{ label: "Upload Invoice & Pay", nextStatus: "", variant: "primary" }],
  RISK_HELD: [{ label: "Upload Soft Copy", nextStatus: "", variant: "primary" }],
  POLICY_ISSUED_SOFT: [{ label: "Upload Hard Copy", nextStatus: "", variant: "primary" }],
  POLICY_ISSUED_HARD: [{ label: "Activate Policy", nextStatus: "ACTIVE", variant: "success" }],
};

const CLAIM_ELIGIBLE_STATUSES = ["RISK_HELD", "POLICY_ISSUED_SOFT", "POLICY_ISSUED_HARD", "ACTIVE", "EXPIRING"];

/**
 * Navigation tabs for different aspects of a specific policy request.
 */
const TABS = [
  { label: "Documents", href: "documents" },
  { label: "Quotations", href: "quotations" },
  { label: "Deviations", href: "deviations" },
  { label: "Approvals", href: "approvals" },
  { label: "Audit Trail", href: "activity" },
  { label: "Financials", href: "financials" },
];

export default function PolicyDetailsLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [policy, setPolicy] = useState<PolicyRequestRead | null>(null);
  const [unit, setUnit] = useState<UnitRead | null>(null);
  const [broker, setBroker] = useState<BrokerRead | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [insurerMap, setInsurerMap] = useState<Record<number, InsurerRead>>({});
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approvalQuotationId, setApprovalQuotationId] = useState<number | "">("");
  const [approvalComments, setApprovalComments] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  // Payment modal state (PAYMENT_PENDING)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pmAmount, setPmAmount] = useState("");
  const [pmGstPct, setPmGstPct] = useState("18");
  const [pmBankName, setPmBankName] = useState("");
  const [pmAccountNo, setPmAccountNo] = useState("");
  const [pmIfsc, setPmIfsc] = useState("");
  const [pmPdfFile, setPmPdfFile] = useState<File | null>(null);
  const [pmUtr, setPmUtr] = useState("");
  const [pmDate, setPmDate] = useState("");
  const [pmPayAmount, setPmPayAmount] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentModalError, setPaymentModalError] = useState("");
  const pmPdfRef = useRef<HTMLInputElement>(null);

  // Soft copy modal state (RISK_HELD)
  const [showSoftCopyModal, setShowSoftCopyModal] = useState(false);
  const [softCopyFile, setSoftCopyFile] = useState<File | null>(null);
  const [isUploadingSoftCopy, setIsUploadingSoftCopy] = useState(false);
  const [softCopyError, setSoftCopyError] = useState("");
  const softCopyRef = useRef<HTMLInputElement>(null);

  // Hard copy modal state (POLICY_ISSUED_SOFT)
  const [showHardCopyModal, setShowHardCopyModal] = useState(false);
  const [hardCopyFile, setHardCopyFile] = useState<File | null>(null);
  const [isUploadingHardCopy, setIsUploadingHardCopy] = useState(false);
  const [hardCopyError, setHardCopyError] = useState("");
  const hardCopyRef = useRef<HTMLInputElement>(null);


  const fetchPolicy = useCallback(async () => {
    try {
      const p = await apiClient.getPolicyRequestById(Number(id));
      setPolicy(p);

      const [u, b, c, quots, allInsurers] = await Promise.all([
        apiClient.getUnitById(p.unit_id).catch(() => null),
        p.broker_id ? apiClient.getBrokerById(p.broker_id).catch(() => null) : Promise.resolve(null),
        apiClient.getById(p.requested_by_id).catch(() => null),
        apiClient.getQuotations(Number(id)).catch(() => [] as QuotationRead[]),
        apiClient.getAllInsurers().catch(() => [] as InsurerRead[]),
      ]);
      setUnit(u);
      setBroker(b);
      setCreator(c);
      setQuotations(quots);
      const map: Record<number, InsurerRead> = {};
      allInsurers.forEach(ins => { map[ins.id] = ins; });
      setInsurerMap(map);
    } catch (err) {
      console.error("Failed to fetch policy details", err);
    }
  }, [id]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        await fetchPolicy();
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id, fetchPolicy]);

  useEffect(() => {
    const handler = () => fetchPolicy();
    window.addEventListener("policy:refresh", handler);
    return () => window.removeEventListener("policy:refresh", handler);
  }, [fetchPolicy]);

  const handleTransition = async (nextStatus: string) => {
    if (!policy) return;

    // Guard: a selected quotation is required before requesting approval
    if (nextStatus === "APPROVAL_PENDING") {
      const hasSelected = quotations.some(q => q.is_selected);
      if (!hasSelected) {
        alert("Please select a quotation before requesting approval. Go to the Quotations tab and mark one quotation as selected.");
        return;
      }
    }

    setIsTransitioning(true);
    try {
      await apiClient.transitionPolicyRequest(policy.id, nextStatus);
      await fetchPolicy();
    } catch (err) {
      console.error("Transition failed", err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const openApprovalModal = (decision: "APPROVED" | "REJECTED") => {
    setApprovalDecision(decision);
    setApprovalQuotationId(quotations[0]?.id ?? "");
    setApprovalComments("");
    setApprovalError("");
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!policy) return;
    if (approvalDecision === "REJECTED" && !approvalComments.trim()) {
      setApprovalError("Please provide a reason for rejection.");
      return;
    }
    if (approvalDecision === "APPROVED" && !approvalQuotationId) {
      setApprovalError("Please select the quotation being approved.");
      return;
    }
    setIsSubmittingApproval(true);
    setApprovalError("");
    try {
      await apiClient.submitApproval(policy.id, {
        decision: approvalDecision,
        quotation_id: approvalDecision === "APPROVED" ? Number(approvalQuotationId) : null,
        comments: approvalComments.trim() || null,
      });
      setShowApprovalModal(false);
      await fetchPolicy();
    } catch (err) {
      setApprovalError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const pmGstAmount = pmAmount && !isNaN(Number(pmAmount))
    ? (Number(pmAmount) * Number(pmGstPct)) / 100 : 0;
  const pmTotal = Number(pmAmount || 0) + pmGstAmount;

  const openPaymentModal = () => {
    setPmAmount(""); setPmGstPct("18"); setPmBankName(""); setPmAccountNo(""); setPmIfsc("");
    setPmPdfFile(null); setPmUtr(""); setPmDate(""); setPmPayAmount(""); setPaymentModalError("");
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!pmAmount || !pmUtr || !pmDate) {
      setPaymentModalError("Base premium, UTR number, and payment date are required.");
      return;
    }
    setIsSubmittingPayment(true);
    setPaymentModalError("");
    try {
      let file_name: string | undefined;
      let file_path: string | undefined;
      if (pmPdfFile) {
        file_path = await uploadToR2(pmPdfFile, "invoices");
        file_name = pmPdfFile.name;
      }
      const invoice = await apiClient.uploadInvoice(Number(id), {
        invoice_type: "PROFORMA",
        amount: Number(pmAmount),
        gst: pmGstAmount,
        total: pmTotal,
        bank_name: pmBankName.trim() || null,
        bank_account_number: pmAccountNo.trim() || null,
        bank_ifsc: pmIfsc.trim() || null,
        file_name,
        file_path,
      });
      await apiClient.recordPayment(Number(id), invoice.id, {
        utr_number: pmUtr.trim(),
        payment_date: pmDate,
        amount: pmPayAmount ? Number(pmPayAmount) : pmTotal,
      });
      setShowPaymentModal(false);
      window.dispatchEvent(new CustomEvent("policy:refresh"));
    } catch (err) {
      setPaymentModalError("Submission failed. Please try again.");
      console.error(err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleSoftCopyUpload = async () => {
    if (!softCopyFile) return;
    setIsUploadingSoftCopy(true);
    setSoftCopyError("");
    try {
      const file_path = await uploadToR2(softCopyFile, "policies");
      await apiClient.uploadSoftCopy(Number(id), { file_name: softCopyFile.name, file_path });
      setShowSoftCopyModal(false);
      setSoftCopyFile(null);
      window.dispatchEvent(new CustomEvent("policy:refresh"));
    } catch (err) {
      setSoftCopyError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploadingSoftCopy(false);
    }
  };

  const handleHardCopyUpload = async () => {
    if (!hardCopyFile) return;
    setIsUploadingHardCopy(true);
    setHardCopyError("");
    try {
      const file_path = await uploadToR2(hardCopyFile, "policies");
      await apiClient.uploadHardCopy(Number(id), { file_name: hardCopyFile.name, file_path });
      setShowHardCopyModal(false);
      setHardCopyFile(null);
      window.dispatchEvent(new CustomEvent("policy:refresh"));
    } catch (err) {
      setHardCopyError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploadingHardCopy(false);
    }
  };

  if (loading) return <Loading />;
  if (!policy) return <div className="p-8 text-center text-gray-500 font-medium">Policy not found.</div>;

  const currentStepIndex = STEPS.findIndex(s => s.status === policy.status || s.alsoMatch?.includes(policy.status));
  const activeTab = TABS.find(tab => pathname.includes(tab.href))?.href || "documents";
  const statusActions = STATUS_ACTIONS[policy.status] || [];
  const canRaiseClaim = CLAIM_ELIGIBLE_STATUSES.includes(policy.status);
  const isRequester = !!user && String(policy.requested_by_id) === user.id;
  const isCompanyAdmin = user?.role === "COMPANY_SUPER_ADMIN" || user?.role === "MANAGER";

  return (
    <div className="p-4 md:p-8  min-h-screen font-sans space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/policies')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium border border-gray-200 dark:border-dark-3 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-dark transition-colors shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm p-4 md:p-8 space-y-8">
        {/* Title, Status, and Raise Claim */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Policy Request: {policy.policy_number || `PRQ-${policy.id}`}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[policy.status] || STATUS_STYLES.DRAFT}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(policy.status)}`}></span>
              {policy.status.replace(/_/g, " ")}
            </span>
            {canRaiseClaim && (
              <button
                onClick={() => router.push(`/claims/add?policy_id=${policy.id}`)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Raise Claim
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (Stepper) */}
        <div className="relative pt-4 pb-12 overflow-x-hidden">
          <div className="flex items-center justify-between w-full relative">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <React.Fragment key={step.status}>
                  <div className="flex flex-col items-center relative z-10 px-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? "bg-[#00B69B] text-white" :
                      isActive ? "border-2 border-[#00B69B] bg-white text-[#00B69B]" :
                      "bg-gray-200 text-gray-400 dark:bg-dark-3"
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${isActive ? "bg-[#00B69B]" : "bg-transparent"}`} />}
                    </div>
                    <span className={`absolute top-8 text-[10px] sm:text-[11px] font-bold whitespace-nowrap text-center ${
                      isCompleted || isActive ? "text-gray-900 dark:text-gray-200" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full ${
                      idx < currentStepIndex ? "bg-[#00B69B]" : "bg-gray-200 dark:bg-dark-3"
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="pt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Policy Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-12">
            <div>
              <p className="text-xs text-gray-400 mb-1">Unit</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{unit?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Broker</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{broker?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Sum Insured</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {policy.sum_insured ? `₹${policy.sum_insured.toLocaleString()}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created By</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{creator?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Asset</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{policy.asset_description || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Line of Business</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{policy.line_of_business || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(policy.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Action Bar */}
      {statusActions.length > 0 && (
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Next Step</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {policy.status === "DRAFT" && "Upload supporting documents for the broker to approach insurers."}
              {policy.status === "DATA_COLLECTION" && "Documents are ready. Submit this request for broker quoting."}
              {policy.status === "QUOTING" && "Quotes collected. Send for management approval."}
              {policy.status === "APPROVAL_PENDING" && "Management review required. Approve or return for revision."}
              {policy.status === "APPROVED" && "Policy approved. Initiate payment process."}
              {policy.status === "PAYMENT_PENDING" && "Upload the proforma invoice from the insurer, then record the UTR payment reference to advance."}
              {policy.status === "RISK_HELD" && "Risk is confirmed. Upload the soft copy of the policy document received from the insurer."}
              {policy.status === "POLICY_ISSUED_SOFT" && "Soft copy recorded. Upload the physical hard copy scan to complete the issuance process."}
              {policy.status === "POLICY_ISSUED_HARD" && "Hard copy received. Activate this policy to mark it as live and eligible for claims."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {policy.status === "APPROVAL_PENDING" && isRequester && !isCompanyAdmin ? (
              <span className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Pending Company Admin approval
              </span>
            ) : statusActions.map((action) => {
              const isApprovalAction = policy.status === "APPROVAL_PENDING";
              const onClick = isApprovalAction
                ? () => openApprovalModal(action.nextStatus === "APPROVED" ? "APPROVED" : "REJECTED")
                : policy.status === "PAYMENT_PENDING"
                ? openPaymentModal
                : policy.status === "RISK_HELD"
                ? () => setShowSoftCopyModal(true)
                : policy.status === "POLICY_ISSUED_SOFT"
                ? () => setShowHardCopyModal(true)
                : () => handleTransition(action.nextStatus);
              return (
                <button
                  key={action.nextStatus}
                  onClick={onClick}
                  disabled={isTransitioning}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                    action.variant === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : action.variant === "danger"
                      ? "bg-white dark:bg-dark-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] hover:bg-[#1a2639] dark:hover:bg-gray-100"
                  }`}
                >
                  {isTransitioning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : action.variant === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : action.variant === "danger" ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Amber approval banner for COMPANY_ADMIN */}
      {policy.status === "APPROVAL_PENDING" && isCompanyAdmin && !isRequester && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">This policy is awaiting your approval.</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Go to the Approvals tab to review quotations and submit your decision.</p>
          </div>
          <button
            onClick={() => router.push(`/policies/${id}/approvals`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Review Now
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="w-full overflow-hidden">
        <nav className="grid grid-cols-6 w-full gap-0.5 sm:gap-2" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.href;
            return (
              <button
                key={tab.href}
                onClick={() => router.push(`/policies/${id}/${tab.href}`)}
                className={`
                  w-full px-0.5 sm:px-4 py-2 sm:py-2.5 text-[7px] min-[340px]:text-[8px] min-[380px]:text-[10px] min-[480px]:text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-200 text-center truncate
                  ${isActive
                    ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727] shadow-md shadow-[#0B1727]/10 border-none"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-dark-2 border-none dark:border dark:border-dark-3 hover:border-gray-300 dark:hover:border-dark-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"}
                `}
                title={tab.label}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[400px]">
        {children}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Submit Approval Decision</h2>
                <p className="text-xs text-gray-400 mt-0.5">Policy: {policy.policy_number || `PRQ-${policy.id}`}</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {approvalError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {approvalError}
                </div>
              )}

              {/* Decision toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Decision *</label>
                <div className="flex rounded-lg border border-gray-200 dark:border-dark-3 overflow-hidden">
                  <button
                    onClick={() => setApprovalDecision("APPROVED")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors ${
                      approvalDecision === "APPROVED"
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-dark-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setApprovalDecision("REJECTED")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors ${
                      approvalDecision === "REJECTED"
                        ? "bg-red-600 text-white"
                        : "bg-white dark:bg-dark-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>

              {/* Quotation selector — only for Approve */}
              {approvalDecision === "APPROVED" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Select Approved Quotation *</label>
                  <select
                    value={approvalQuotationId}
                    onChange={e => setApprovalQuotationId(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select a quotation...</option>
                    {quotations.map(q => (
                      <option key={q.id} value={q.id}>
                        {insurerMap[q.insurer_id]?.name || `Insurer ${q.insurer_id}`} — ₹{q.total_premium.toLocaleString()} (v{q.version})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Comments */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  {approvalDecision === "REJECTED" ? "Reason for Rejection *" : "Comments (optional)"}
                </label>
                <textarea
                  value={approvalComments}
                  onChange={e => setApprovalComments(e.target.value)}
                  rows={3}
                  placeholder={approvalDecision === "REJECTED" ? "Explain what needs to be revised..." : "Any notes for the record..."}
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmitApproval}
                disabled={isSubmittingApproval}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                  approvalDecision === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isSubmittingApproval && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSubmittingApproval ? "Submitting..." : approvalDecision === "APPROVED" ? "Confirm Approval" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (PAYMENT_PENDING) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-lg m-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Upload Invoice & Record Payment</h2>
                <p className="text-xs text-gray-400 mt-0.5">Policy: {policy.policy_number || `PRQ-${policy.id}`}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {paymentModalError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {paymentModalError}
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Proforma Invoice</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Base Premium (₹) *</label>
                    <input type="number" value={pmAmount} onChange={e => setPmAmount(e.target.value)} placeholder="e.g. 85000"
                      className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">GST %</label>
                    <select value={pmGstPct} onChange={e => setPmGstPct(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20">
                      {["0", "5", "12", "18", "28"].map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                  </div>
                </div>
                {pmAmount && Number(pmAmount) > 0 && (
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-2 rounded-xl px-4 py-2.5 text-sm mt-3">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Total Premium</span>
                    <span className="font-bold text-gray-900 dark:text-white">₹{pmTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 mt-3">
                  <input type="text" placeholder="Bank Name (optional)" value={pmBankName} onChange={e => setPmBankName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Account Number" value={pmAccountNo} onChange={e => setPmAccountNo(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                    <input type="text" placeholder="IFSC Code" value={pmIfsc} onChange={e => setPmIfsc(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                  </div>
                </div>
                <input ref={pmPdfRef} type="file" accept=".pdf" className="hidden" onChange={e => setPmPdfFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => pmPdfRef.current?.click()}
                  className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 dark:border-dark-3 rounded-lg py-2.5 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-dark-4 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {pmPdfFile ? <span className="font-medium text-gray-700 dark:text-gray-200">{pmPdfFile.name}</span> : "Attach Invoice PDF (optional)"}
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-dark-3 pt-5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Payment Reference</p>
                <div className="space-y-3">
                  <input type="text" placeholder="UTR / Reference Number *" value={pmUtr} onChange={e => setPmUtr(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Payment Date *</label>
                      <input type="date" value={pmDate} onChange={e => setPmDate(e.target.value)} max={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Amount Paid (₹)</label>
                      <input type="number" placeholder={`Default ₹${pmTotal.toLocaleString()}`} value={pmPayAmount} onChange={e => setPmPayAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3 shrink-0">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
              <button onClick={handleSubmitPayment} disabled={isSubmittingPayment || !pmAmount || !pmUtr || !pmDate}
                className="flex items-center gap-2 px-5 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
                {isSubmittingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                {isSubmittingPayment ? "Processing..." : "Submit Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Copy Modal (RISK_HELD) */}
      {showSoftCopyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-md m-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Upload Policy Soft Copy</h2>
                <p className="text-xs text-gray-400 mt-0.5">Scanned copy received from the insurer</p>
              </div>
              <button onClick={() => { setShowSoftCopyModal(false); setSoftCopyFile(null); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {softCopyError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {softCopyError}
                </div>
              )}
              <input ref={softCopyRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setSoftCopyFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => softCopyRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-dark-3 rounded-xl py-8 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-dark-4 transition-colors">
                <FileUp className="w-6 h-6" />
                {softCopyFile ? <span className="font-medium text-gray-700 dark:text-gray-200">{softCopyFile.name}</span> : <span>Click to select PDF or image</span>}
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={() => { setShowSoftCopyModal(false); setSoftCopyFile(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
              <button onClick={handleSoftCopyUpload} disabled={isUploadingSoftCopy || !softCopyFile}
                className="flex items-center gap-2 px-5 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
                {isUploadingSoftCopy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploadingSoftCopy ? "Uploading..." : "Upload Soft Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hard Copy Modal (POLICY_ISSUED_SOFT) */}
      {showHardCopyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-md m-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Upload Policy Hard Copy</h2>
                <p className="text-xs text-gray-400 mt-0.5">Physical copy scan to complete issuance</p>
              </div>
              <button onClick={() => { setShowHardCopyModal(false); setHardCopyFile(null); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {hardCopyError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {hardCopyError}
                </div>
              )}
              <input ref={hardCopyRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setHardCopyFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => hardCopyRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-dark-3 rounded-xl py-8 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-dark-4 transition-colors">
                <FileUp className="w-6 h-6" />
                {hardCopyFile ? <span className="font-medium text-gray-700 dark:text-gray-200">{hardCopyFile.name}</span> : <span>Click to select PDF or image</span>}
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3">
              <button onClick={() => { setShowHardCopyModal(false); setHardCopyFile(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
              <button onClick={handleHardCopyUpload} disabled={isUploadingHardCopy || !hardCopyFile}
                className="flex items-center gap-2 px-5 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
                {isUploadingHardCopy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploadingHardCopy ? "Uploading..." : "Upload Hard Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

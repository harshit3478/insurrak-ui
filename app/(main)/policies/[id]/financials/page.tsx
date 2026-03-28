"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import { InvoiceRead } from "@/types/api";
import {
  Receipt, Download, Copy, Check, Upload,
  X, Loader2, AlertCircle, CreditCard,
} from "lucide-react";
import { Loading } from "@/components/ui/Loading";

export default function PolicyFinancialsPage() {
  const { id } = useParams();
  const prId = Number(id);

  const [invoices, setInvoices] = useState<InvoiceRead[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload invoice modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [invAmount, setInvAmount] = useState("");
  const [invGstPct, setInvGstPct] = useState("18");
  const [invBankName, setInvBankName] = useState("");
  const [invAccountNo, setInvAccountNo] = useState("");
  const [invIfsc, setInvIfsc] = useState("");
  const [invPdfFile, setInvPdfFile] = useState<File | null>(null);
  const [isUploadingInvoice, setIsUploadingInvoice] = useState(false);
  const [uploadInvoiceError, setUploadInvoiceError] = useState("");
  const pdfRef = useRef<HTMLInputElement>(null);

  // UTR payment state per invoice
  const [utrValues, setUtrValues] = useState<Record<number, string>>({});
  const [paymentDates, setPaymentDates] = useState<Record<number, string>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<Record<number, boolean>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<number, string>>({});
  const [paymentSuccess, setPaymentSuccess] = useState<Record<number, boolean>>({});

  // Copy state
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<number | null>(null);

  const fetchInvoices = async () => {
    const invs = await apiClient.getInvoices(prId).catch(() => [] as InvoiceRead[]);
    setInvoices(invs);
    // Pre-populate payment state from persisted payment data
    const successMap: Record<number, boolean> = {};
    const utrMap: Record<number, string> = {};
    for (const inv of invs) {
      if (inv.payment) {
        successMap[inv.id] = true;
        utrMap[inv.id] = inv.payment.utr_number;
      }
    }
    setPaymentSuccess(successMap);
    setUtrValues(prev => ({ ...prev, ...utrMap }));
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchInvoices();
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const invGstAmount = invAmount && !isNaN(Number(invAmount))
    ? (Number(invAmount) * Number(invGstPct)) / 100
    : 0;
  const invTotal = Number(invAmount || 0) + invGstAmount;

  const openUploadModal = () => {
    setInvAmount(""); setInvGstPct("18");
    setInvBankName(""); setInvAccountNo(""); setInvIfsc("");
    setInvPdfFile(null); setUploadInvoiceError("");
    setShowUploadModal(true);
  };

  const handleUploadInvoice = async () => {
    if (!invAmount) return;
    setIsUploadingInvoice(true);
    setUploadInvoiceError("");
    try {
      let file_name: string | undefined;
      let file_path: string | undefined;
      if (invPdfFile) {
        file_path = await uploadToR2(invPdfFile, "invoices");
        file_name = invPdfFile.name;
      }
      await apiClient.uploadInvoice(prId, {
        invoice_type: "PROFORMA",
        amount: Number(invAmount),
        gst: invGstAmount,
        total: invTotal,
        bank_name: invBankName.trim() || null,
        bank_account_number: invAccountNo.trim() || null,
        bank_ifsc: invIfsc.trim() || null,
        file_name,
        file_path,
      });
      setShowUploadModal(false);
      await fetchInvoices();
    } catch (err) {
      setUploadInvoiceError("Failed to upload invoice. Please try again.");
      console.error(err);
    } finally {
      setIsUploadingInvoice(false);
    }
  };

  const handleCopyBankDetails = (inv: InvoiceRead) => {
    const text = [
      inv.bank_name && `Bank: ${inv.bank_name}`,
      inv.bank_account_number && `Account: ${inv.bank_account_number}`,
      inv.bank_ifsc && `IFSC: ${inv.bank_ifsc}`,
    ].filter(Boolean).join("\n");
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedInvoiceId(inv.id);
      setTimeout(() => setCopiedInvoiceId(null), 2000);
    }
  };

  const handleRecordPayment = async (inv: InvoiceRead) => {
    const utr = utrValues[inv.id]?.trim();
    const date = paymentDates[inv.id];
    const amount = paymentAmounts[inv.id];
    if (!utr || !date) {
      setPaymentErrors(prev => ({ ...prev, [inv.id]: "UTR number and payment date are required." }));
      return;
    }
    setIsSubmittingPayment(prev => ({ ...prev, [inv.id]: true }));
    setPaymentErrors(prev => ({ ...prev, [inv.id]: "" }));
    try {
      await apiClient.recordPayment(prId, inv.id, {
        utr_number: utr,
        payment_date: date,
        amount: amount ? Number(amount) : inv.total,
      });
      setPaymentSuccess(prev => ({ ...prev, [inv.id]: true }));
      window.dispatchEvent(new CustomEvent("policy:refresh"));
    } catch (err) {
      setPaymentErrors(prev => ({ ...prev, [inv.id]: "Failed to record payment. Please try again." }));
      console.error(err);
    } finally {
      setIsSubmittingPayment(prev => ({ ...prev, [inv.id]: false }));
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Financial Settlement</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Manage premium payments and proforma invoices.</p>
          </div>
          <button
            onClick={openUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-dark-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Invoice
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-gray-100 dark:border-dark-3 rounded-2xl text-gray-400">
            <Receipt className="w-8 h-8 opacity-30" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No proforma invoice yet</p>
              <p className="text-xs mt-0.5">Upload the proforma invoice from the insurer to begin the payment process.</p>
            </div>
            <button
              onClick={openUploadModal}
              className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-xs font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Proforma Invoice
            </button>
          </div>
        ) : (
          invoices.map(inv => (
            <div key={inv.id} className="space-y-4">
              {/* PI Card */}
              <div className="bg-white dark:bg-dark-2 rounded-2xl border border-gray-100 dark:border-dark-3 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Proforma Invoice</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">PI-{inv.id} · {new Date(inv.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  {inv.file_path ? (
                    <a
                      href={inv.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-lg text-xs font-semibold hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600">No PDF attached</span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-8">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Base Premium</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{inv.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">GST</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{inv.gst.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Total Premium Payable</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹{inv.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details + UTR */}
              <div className="bg-white dark:bg-dark-2 rounded-2xl border border-gray-100 dark:border-dark-3 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Bank details */}
                  <div className="flex-1 space-y-4">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Insurer Bank Details</p>
                    {inv.bank_name || inv.bank_account_number || inv.bank_ifsc ? (
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {inv.bank_name && (
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">Bank</p>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{inv.bank_name}</p>
                          </div>
                        )}
                        {inv.bank_account_number && (
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">Account No.</p>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{inv.bank_account_number}</p>
                          </div>
                        )}
                        {inv.bank_ifsc && (
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">IFSC Code</p>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{inv.bank_ifsc}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No bank details recorded.</p>
                    )}
                    {(inv.bank_name || inv.bank_account_number || inv.bank_ifsc) && (
                      <button
                        onClick={() => handleCopyBankDetails(inv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-dark-3 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors"
                      >
                        {copiedInvoiceId === inv.id ? (
                          <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy Bank Details</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* UTR form */}
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Record Payment</p>
                    {paymentSuccess[inv.id] ? (
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-4 py-3">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Payment recorded</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">UTR: {utrValues[inv.id] || inv.payment?.utr_number}</p>
                          {inv.payment?.payment_date && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">Date: {new Date(inv.payment.payment_date).toLocaleDateString("en-IN")}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentErrors[inv.id] && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {paymentErrors[inv.id]}
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="UTR / Reference Number *"
                          value={utrValues[inv.id] || ""}
                          onChange={e => setUtrValues(prev => ({ ...prev, [inv.id]: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-3 border border-gray-100 dark:border-dark-5 rounded-xl text-xs focus:ring-1 focus:ring-[#0B1727]/20 focus:outline-none dark:text-white"
                        />
                        <input
                          type="date"
                          value={paymentDates[inv.id] || ""}
                          onChange={e => setPaymentDates(prev => ({ ...prev, [inv.id]: e.target.value }))}
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-3 border border-gray-100 dark:border-dark-5 rounded-xl text-xs focus:ring-1 focus:ring-[#0B1727]/20 focus:outline-none dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder={`Amount (default ₹${inv.total.toLocaleString()})`}
                          value={paymentAmounts[inv.id] || ""}
                          onChange={e => setPaymentAmounts(prev => ({ ...prev, [inv.id]: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-3 border border-gray-100 dark:border-dark-5 rounded-xl text-xs focus:ring-1 focus:ring-[#0B1727]/20 focus:outline-none dark:text-white"
                        />
                        <button
                          onClick={() => handleRecordPayment(inv)}
                          disabled={isSubmittingPayment[inv.id]}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-xl text-xs font-bold hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          {isSubmittingPayment[inv.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <CreditCard className="w-3.5 h-3.5" />
                          Submit Payment Reference
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Invoice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-lg flex flex-col m-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3 shrink-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Upload Proforma Invoice</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {uploadInvoiceError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {uploadInvoiceError}
                </div>
              )}

              {/* Premiums */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Base Premium (₹) *</label>
                  <input
                    type="number"
                    value={invAmount}
                    onChange={e => setInvAmount(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">GST %</label>
                  <select
                    value={invGstPct}
                    onChange={e => setInvGstPct(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                  >
                    {["0", "5", "12", "18", "28"].map(p => <option key={p} value={p}>{p}%</option>)}
                  </select>
                </div>
              </div>

              {invAmount && Number(invAmount) > 0 && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-2 rounded-xl px-4 py-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Total Premium</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{invTotal.toLocaleString()}</span>
                </div>
              )}

              {/* Bank details */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Bank Details (optional)</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={invBankName}
                    onChange={e => setInvBankName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={invAccountNo}
                      onChange={e => setInvAccountNo(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={invIfsc}
                      onChange={e => setInvIfsc(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                    />
                  </div>
                </div>
              </div>

              {/* PDF */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Attach Invoice PDF (optional)</label>
                <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => setInvPdfFile(e.target.files?.[0] || null)} />
                <button
                  type="button"
                  onClick={() => pdfRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 dark:border-dark-3 rounded-lg py-3 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-dark-4 dark:hover:text-gray-300 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {invPdfFile ? <span className="font-medium text-gray-700 dark:text-gray-200">{invPdfFile.name}</span> : <span>Click to attach PDF</span>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3 shrink-0">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUploadInvoice}
                disabled={isUploadingInvoice || !invAmount}
                className="flex items-center gap-2 px-5 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isUploadingInvoice && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isUploadingInvoice ? "Uploading..." : "Upload Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

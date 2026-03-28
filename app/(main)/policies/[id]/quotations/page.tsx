"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { uploadToR2 } from "@/lib/uploadToR2";
import { QuotationRead, InsurerRead, QuotationTermsCreate } from "@/types/api";
import {
  Plus, Download, ChevronDown, ChevronUp, CheckCircle2,
  FileText, Upload, X, Loader2, Sparkles, AlertCircle,
} from "lucide-react";
import { Loading } from "@/components/ui/Loading";

type ModalTab = "manual" | "extract";

const TERMS_FIELDS: { key: keyof QuotationTermsCreate; label: string }[] = [
  { key: "perils_included", label: "Perils Included" },
  { key: "perils_excluded", label: "Perils Excluded" },
  { key: "deductibles", label: "Deductibles" },
  { key: "exclusions", label: "Exclusions" },
  { key: "warranties", label: "Warranties" },
  { key: "co_insurance", label: "Co-Insurance" },
  { key: "special_conditions", label: "Special Conditions" },
];

const TERMS_DISPLAY: { key: keyof QuotationTermsCreate; label: string }[] = [
  ...TERMS_FIELDS,
  { key: "coverage_scope", label: "Coverage Scope" },
  { key: "sum_insured_basis", label: "Sum Insured Basis" },
  { key: "excess", label: "Excess" },
  { key: "sub_limits", label: "Sub-limits" },
  { key: "add_ons", label: "Add-ons" },
];

const emptyTerms = (): QuotationTermsCreate =>
  Object.fromEntries(TERMS_FIELDS.map(f => [f.key, ""])) as QuotationTermsCreate;

export default function PolicyQuotationsPage() {
  const { id } = useParams();
  const prId = Number(id);

  const [quotations, setQuotations] = useState<QuotationRead[]>([]);
  const [insurers, setInsurers] = useState<InsurerRead[]>([]);
  const [insurerMap, setInsurerMap] = useState<Record<number, InsurerRead>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("manual");

  // Form fields
  const [insurerId, setInsurerId] = useState<number | "">("");
  const [premium, setPremium] = useState("");
  const [gstPct, setGstPct] = useState("18");
  const [terms, setTerms] = useState<QuotationTermsCreate>(emptyTerms());

  // PDF attachment
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  // PDF extraction
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const extractRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchQuotations = async () => {
    try {
      const [quots, allInsurers] = await Promise.all([
        apiClient.getQuotations(prId),
        apiClient.getAllInsurers().catch(() => [] as InsurerRead[]),
      ]);
      setQuotations(quots);
      setInsurers(allInsurers);
      const map: Record<number, InsurerRead> = {};
      allInsurers.forEach(ins => { map[ins.id] = ins; });
      setInsurerMap(map);
    } catch (err) {
      console.error("Failed to fetch quotations", err);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchQuotations();
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  // Derived
  const gstAmount = premium && !isNaN(Number(premium))
    ? (Number(premium) * Number(gstPct)) / 100
    : 0;
  const totalPremium = Number(premium || 0) + gstAmount;

  const openModal = () => {
    setShowModal(true);
    setModalTab("manual");
    setInsurerId(insurers[0]?.id ?? "");
    setPremium("");
    setGstPct("18");
    setTerms(emptyTerms());
    setPdfFile(null);
    setExtractFile(null);
    setExtractError("");
    setSubmitError("");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleExtract = async () => {
    if (!extractFile) return;
    setIsExtracting(true);
    setExtractError("");
    try {
      const publicUrl = await uploadToR2(extractFile, "quotations");
      const data = await apiClient.extractQuotationFromPdf(publicUrl);
      if (data.premium != null) setPremium(String(data.premium));
      if (data.gst != null && data.premium != null && data.premium > 0) {
        const pct = Math.round((data.gst / data.premium) * 100);
        setGstPct(String(pct));
      }
      setTerms(prev => ({
        ...prev,
        perils_included: data.perils_included ?? prev.perils_included,
        perils_excluded: data.perils_excluded ?? prev.perils_excluded,
        deductibles: data.deductibles ?? prev.deductibles,
        exclusions: data.exclusions ?? prev.exclusions,
        warranties: data.warranties ?? prev.warranties,
        co_insurance: data.co_insurance ?? prev.co_insurance,
        special_conditions: data.special_conditions ?? prev.special_conditions,
      }));
      setPdfFile(extractFile);
      setModalTab("manual");
    } catch {
      setExtractError("Could not extract data from the PDF. Try uploading again or enter details manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!insurerId || !premium) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      let file_name: string | undefined;
      let file_path: string | undefined;
      if (pdfFile) {
        file_path = await uploadToR2(pdfFile, "quotations");
        file_name = pdfFile.name;
      }

      // Build terms — only include non-empty fields
      const termsPayload: QuotationTermsCreate = {};
      for (const f of TERMS_FIELDS) {
        const val = terms[f.key];
        if (val && String(val).trim()) termsPayload[f.key] = String(val).trim();
      }
      const hasTerms = Object.values(termsPayload).some(v => v);

      await apiClient.uploadQuotation(prId, {
        insurer_id: Number(insurerId),
        premium: Number(premium),
        gst: gstAmount,
        total_premium: totalPremium,
        file_name,
        file_path,
        terms: hasTerms ? termsPayload : undefined,
      });

      closeModal();
      await fetchQuotations();
    } catch (err) {
      setSubmitError("Failed to save quotation. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Quotations
              <span className="ml-1.5 text-xs font-medium text-gray-400">({quotations.length})</span>
            </h3>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Quotation
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-3">
                {["Insurer", "Version", "Premium", "GST", "Total Premium", "File"].map(h => (
                  <th key={h} className="py-2.5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileText className="w-8 h-8 opacity-30" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No quotations yet</p>
                        <p className="text-xs mt-0.5">Add the first quotation to begin comparison.</p>
                      </div>
                      <button
                        onClick={openModal}
                        className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-dark-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors text-gray-600 dark:text-gray-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Quotation
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                quotations.map(quot => {
                  const isExpanded = expandedRow === quot.id;
                  const insName = insurerMap[quot.insurer_id]?.name || `Insurer ${quot.insurer_id}`;
                  return (
                    <React.Fragment key={quot.id}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : quot.id)}
                        className={`cursor-pointer transition-colors ${isExpanded ? "bg-gray-50 dark:bg-dark-2" : "hover:bg-gray-50/50 dark:hover:bg-dark-2/50"}`}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            {quot.is_selected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{insName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-dark-3 text-gray-500 dark:text-gray-400">
                            v{quot.version}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-300">₹{quot.premium.toLocaleString()}</td>
                        <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-300">₹{quot.gst.toLocaleString()}</td>
                        <td className="py-3.5 px-6 text-sm font-bold text-gray-900 dark:text-white">₹{quot.total_premium.toLocaleString()}</td>
                        <td className="py-3.5 px-6">
                          {quot.file_path ? (
                            <a
                              href={quot.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {quot.file_name || "Download"}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-400" />
                            : <ChevronDown className="w-4 h-4 text-gray-400" />
                          }
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-dark-2">
                          <td colSpan={7} className="px-10 py-5 border-t border-gray-100 dark:border-dark-3">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                              Coverage Terms — {insName}
                            </h4>
                            {quot.terms ? (
                              <div className="grid grid-cols-1 gap-2.5 max-w-3xl">
                                {TERMS_DISPLAY.filter(f => quot.terms![f.key]).map(f => (
                                  <div key={f.key} className="flex gap-3">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-40 shrink-0">{f.label}:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{quot.terms![f.key]}</span>
                                  </div>
                                ))}
                                {!TERMS_DISPLAY.some(f => quot.terms![f.key]) && (
                                  <p className="text-xs text-gray-400">No coverage terms recorded.</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">Coverage terms not recorded for this quotation. Edit the quotation to add terms.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex p-4">
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-dark-3 shadow-2xl w-full max-w-2xl flex flex-col m-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-3 shrink-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Add Quotation</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-dark-3 shrink-0 px-6">
              {([["manual", "Manual Entry"], ["extract", "Extract from PDF"]] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                    modalTab === tab
                      ? "border-[#0B1727] dark:border-white text-gray-900 dark:text-white"
                      : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  {tab === "extract" && <Sparkles className="w-3 h-3 inline mr-1.5 text-amber-400" />}
                  {label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {modalTab === "extract" ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      Upload an insurer's quotation PDF and GPT-4o will automatically extract premium amounts and coverage terms for you.
                    </p>
                  </div>

                  {extractError && (
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600 dark:text-red-400">{extractError}</p>
                    </div>
                  )}

                  <input ref={extractRef} type="file" accept=".pdf" className="hidden" onChange={e => setExtractFile(e.target.files?.[0] || null)} />
                  <button
                    type="button"
                    onClick={() => extractRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-dark-3 rounded-xl py-8 text-sm text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-gray-600 transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    {extractFile
                      ? <span className="font-semibold text-gray-700 dark:text-gray-200">{extractFile.name}</span>
                      : <span>Click to select a PDF quotation</span>
                    }
                  </button>

                  <button
                    onClick={handleExtract}
                    disabled={!extractFile || isExtracting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {isExtracting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isExtracting ? "Extracting with GPT-4o..." : "Extract & Pre-fill Form"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {submitError && (
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
                    </div>
                  )}

                  {/* Insurer + Premiums */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Insurer *</label>
                      <select
                        value={insurerId}
                        onChange={e => setInsurerId(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                      >
                        <option value="">Select insurer...</option>
                        {insurers.map(ins => (
                          <option key={ins.id} value={ins.id}>{ins.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Base Premium (₹) *</label>
                      <input
                        type="number"
                        value={premium}
                        onChange={e => setPremium(e.target.value)}
                        placeholder="e.g. 100000"
                        className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">GST %</label>
                      <select
                        value={gstPct}
                        onChange={e => setGstPct(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20"
                      >
                        {["0", "5", "12", "18", "28"].map(p => (
                          <option key={p} value={p}>{p}%</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculated total */}
                  {premium && Number(premium) > 0 && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-2 rounded-xl px-4 py-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">GST ({gstPct}%)</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">₹{gstAmount.toLocaleString()}</span>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <span className="text-gray-500 dark:text-gray-400">Total Premium</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{totalPremium.toLocaleString()}</span>
                    </div>
                  )}

                  {/* PDF Attachment */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Attach PDF (optional)</label>
                    <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                    <button
                      type="button"
                      onClick={() => pdfRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 dark:border-dark-3 rounded-lg py-3 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-dark-4 dark:hover:text-gray-300 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {pdfFile
                        ? <span className="font-medium text-gray-700 dark:text-gray-200">{pdfFile.name}</span>
                        : <span>Click to attach quotation PDF</span>
                      }
                    </button>
                  </div>

                  {/* Coverage Terms */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Coverage Terms</p>
                    <div className="space-y-3">
                      {TERMS_FIELDS.map(f => (
                        <div key={f.key}>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                          <textarea
                            rows={2}
                            value={(terms[f.key] as string) || ""}
                            onChange={e => setTerms(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={`Enter ${f.label.toLowerCase()}...`}
                            className="w-full rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {modalTab === "manual" && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-3 shrink-0">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !insurerId || !premium}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] text-sm font-semibold rounded-lg hover:bg-[#1a2639] dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Quotation"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

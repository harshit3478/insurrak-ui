"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { api } from "@/lib/api";
import { Company } from "@/types";
import { CompaniesTable } from "@/components/Company/CompaniesTable";
import { CompaniesToolbar } from "@/components/Company/CompaniesToolbar";
import { CompanyForm, EditCompanyForm } from "@/components/Company/CompanyForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuth } from "@/context-provider/AuthProvider";
import { useCompanies } from "@/context-provider/CompanyProvider";
import { hasPermission, Permission } from "@/types/permissions";

type ModalType = "add" | "view" | "edit" | null;

type ConfirmAction =
  | { type: "deactivate"; id: number; name: string }
  | { type: "activate"; id: number; name: string }
  | { type: "delete"; id: number; name: string }
  | null;

export default function CompanyManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    createCompany, isCreating, createState, resetCreateState,
    updateCompany, isUpdating, updateState, resetUpdateState,
  } = useCompanies();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const canCreate = hasPermission(user, Permission.CREATE_COMPANY);
  const canEdit = hasPermission(user, Permission.EDIT_COMPANY);
  const canDelete = hasPermission(user, Permission.DELETE_COMPANY);
  const canView = hasPermission(user, Permission.MANAGE_COMPANIES);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCompanies();
      setCompanies(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    if (createState.success) { fetchCompanies(); closeModal(); }
  }, [createState.success]);

  useEffect(() => {
    if (updateState.success) { fetchCompanies(); closeModal(); }
  }, [updateState.success]);

  const closeModal = () => {
    setModal(null);
    setSelectedCompany(null);
    resetCreateState();
    resetUpdateState();
  };

  const handleViewCompany = (id: number) => {
    if (isSuperAdmin) {
      router.push(`/system/companies/${id}`);
      return;
    }
    const c = companies.find((c) => c.id === id) || null;
    setSelectedCompany(c);
    setModal("view");
  };

  const handleEditCompany = (id: number) => {
    const c = companies.find((c) => c.id === id) || null;
    setSelectedCompany(c);
    setModal("edit");
  };

  const handleDeactivateRequest = (id: number) => {
    const c = companies.find((c) => c.id === id);
    if (c) setConfirmAction({ type: "deactivate", id, name: c.name });
  };

  const handleActivateRequest = (id: number) => {
    const c = companies.find((c) => c.id === id);
    if (c) setConfirmAction({ type: "activate", id, name: c.name });
  };

  const handleDeleteRequest = (id: number) => {
    const c = companies.find((c) => c.id === id);
    if (c) setConfirmAction({ type: "delete", id, name: c.name });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "deactivate") {
        await apiClient.updateCompany(confirmAction.id, { is_active: false });
      } else if (confirmAction.type === "activate") {
        await apiClient.updateCompany(confirmAction.id, { is_active: true });
      } else if (confirmAction.type === "delete") {
        await apiClient.deleteCompany(confirmAction.id);
      }
      fetchCompanies();
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setConfirmAction(null);
    }
  };

  // For inactive companies the "delete" action in table triggers hard delete
  const handleTableDelete = (id: number) => {
    const c = companies.find((c) => c.id === id);
    if (!c) return;
    if (c.is_active) {
      handleDeactivateRequest(id);
    } else {
      handleDeleteRequest(id);
    }
  };

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.admin || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.adminEmail || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [companies, search],
  );

  const activeCount = companies.filter((c) => c.is_active).length;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-dark rounded-2xl border border-gray-100 dark:border-dark-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unauthorized Access</h2>
        <p className="text-gray-500 dark:text-dark-6 text-center max-w-md">
          You do not have the required permissions to view the company list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Stat Cards */}
      <div data-tour="company-stats" className="flex flex-wrap gap-4">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl px-6 py-5 min-w-[180px]">
          <div className="w-10 h-10 bg-[#5750F1]/10 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[#5750F1]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
              {loading ? "—" : companies.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-6 mt-1">Total Companies</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl px-6 py-5 min-w-[180px]">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
              {loading ? "—" : activeCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-6 mt-1">Active</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <CompaniesToolbar
        onAddCompany={() => { resetCreateState(); setModal("add"); }}
        onSearch={setSearch}
        canCreate={canCreate}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <CompaniesTable
        companies={filteredCompanies}
        loading={loading}
        onViewCompany={handleViewCompany}
        onEditCompany={handleEditCompany}
        onDeleteCompany={handleTableDelete}
        onActivateCompany={handleActivateRequest}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Add / View / Edit modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white dark:bg-gray-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-3 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-dark-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {modal === "add" && "Add Company"}
                {modal === "view" && (selectedCompany?.name || "View Company")}
                {modal === "edit" && `Edit — ${selectedCompany?.name || "Company"}`}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              {modal === "add" && (
                <CompanyForm
                  onSubmit={createCompany}
                  pending={isCreating}
                  error={createState.error}
                />
              )}

              {modal === "view" && selectedCompany && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Company Name" value={selectedCompany.name} />
                    <Field label="Email" value={selectedCompany.email} />
                    <Field label="Phone" value={selectedCompany.mobile_number} />
                    <Field label="GST Number" value={selectedCompany.gst_number} />
                    <Field label="Status" value={selectedCompany.is_active ? "Active" : "Inactive"} />
                    <Field label="Admin Email" value={selectedCompany.adminEmail} span2 />
                    <Field label="Address" value={selectedCompany.address} span2 />
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={closeModal}
                      className="px-5 py-2 text-sm border border-gray-200 dark:border-dark-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {modal === "edit" && selectedCompany && (
                <EditCompanyForm
                  defaultValues={selectedCompany}
                  onSubmit={updateCompany(selectedCompany.id)}
                  pending={isUpdating}
                  error={updateState.error}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modals */}
      <ConfirmModal
        open={confirmAction?.type === "deactivate"}
        title="Deactivate Company"
        message={`Are you sure you want to deactivate "${confirmAction?.name}"? Users of this company will be logged out immediately.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        open={confirmAction?.type === "activate"}
        title="Activate Company"
        message={`Reactivate "${confirmAction?.name}"? Users will be able to log in again.`}
        confirmLabel="Activate"
        variant="primary"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        open={confirmAction?.type === "delete"}
        title="Permanently Delete Company"
        message={`This will permanently delete "${confirmAction?.name}" and ALL associated data (users, units, policies, claims). This cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  span2,
}: {
  label: string;
  value?: string | null;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || "—"}</p>
    </div>
  );
}

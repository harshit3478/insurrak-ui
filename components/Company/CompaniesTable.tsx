import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  ArrowDown,
  Eye,
  Edit,
  PowerOff,
  Power,
  Trash2,
} from "lucide-react";
import { Company } from "@/types";
import { Portal } from "@/components/ui/portal";
import { SkeletonRows } from "@/components/ui/SkeletonRows";

interface CompaniesTableProps {
  companies: Company[];
  loading?: boolean;
  onViewCompany: (id: number) => void;
  onEditCompany: (id: number) => void;
  onDeleteCompany: (id: number) => void;
  onActivateCompany: (id: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  loading,
  onViewCompany,
  onEditCompany,
  onDeleteCompany,
  onActivateCompany,
  canEdit = false,
  canDelete = false,
}) => {
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openActionId !== null &&
        !(event.target as Element).closest(".action-menu-container")
      ) {
        setOpenActionId(null);
        setMenuRect(null);
      }
    };
    const handleScroll = () => {
      if (openActionId) { setOpenActionId(null); setMenuRect(null); }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openActionId]);

  const handleActionClick = (e: React.MouseEvent, id: number) => {
    if (openActionId === id) {
      setOpenActionId(null);
      setMenuRect(null);
    } else {
      setOpenActionId(id);
      setMenuRect(e.currentTarget.getBoundingClientRect());
    }
  };

  // Filter out the system admin company (id === 1)
  const visibleCompanies = companies.filter((c) => c.id !== 1);

  const headers = ["Name", "Admin Email", "Units/Branches", "Active Policies", "Status"];
  const colSpan = headers.length + 1; // headers + actions column

  return (
    <div className="border border-gray-100 dark:border-dark-3 rounded-lg">
      <div className="min-h-[500px] overflow-auto custom-scrollbar">
        <table className="w-full whitespace-nowrap xl:whitespace-normal">
          <thead className="bg-white dark:bg-gray-dark border-b border-gray-100 dark:border-dark-3">
            <tr>
              {headers.map((header) => (
                <th key={header} className="py-4 px-4 text-left">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-dark-6 hover:text-gray-700 dark:hover:text-white cursor-pointer transition-colors">
                    {header} <ArrowDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
              ))}
              <th className="py-4 px-6 text-right w-14" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
            {loading ? (
              <SkeletonRows columns={colSpan} rows={5} />
            ) : visibleCompanies.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-gray-500">
                  No companies found.
                </td>
              </tr>
            ) : (
              visibleCompanies.map((company) => (
                <tr
                  key={company.id}
                  onDoubleClick={() => onViewCompany(company.id)}
                  className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors cursor-pointer select-none"
                >
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {company.name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">
                    {company.adminEmail || "-"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">
                    {company.branches || "0"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6 font-light">
                    {company.activePolicies || "0"}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        company.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${company.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                      {company.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right action-menu-container">
                    {(canEdit || canDelete) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(e, company.id);
                        }}
                        className={`p-1 rounded transition-colors ${openActionId === company.id ? "bg-gray-100 dark:bg-dark-3 text-gray-600 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                    {openActionId === company.id && menuRect && (
                      <Portal>
                        <div
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{
                            position: "fixed",
                            top: menuRect.bottom + 100 > window.innerHeight ? menuRect.top - 120 : menuRect.bottom + 4,
                            left: menuRect.left - 120,
                            zIndex: 9999,
                          }}
                          className="w-36 bg-gray-dark rounded-lg shadow-2xl border border-dark-3 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={() => { setOpenActionId(null); onViewCompany(company.id); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-2 hover:text-white flex items-center gap-3 transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>

                          {company.is_active ? (
                            <>
                              {canEdit && (
                                <>
                                  <div className="h-px bg-dark-3/50 mx-2" />
                                  <button
                                    onClick={() => { setOpenActionId(null); onEditCompany(company.id); }}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-2 hover:text-white flex items-center gap-3 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" /> Edit
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <>
                                  <div className="h-px bg-dark-3/50 mx-2" />
                                  <button
                                    onClick={() => { setOpenActionId(null); onDeleteCompany(company.id); }}
                                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-dark-2 hover:text-red-300 flex items-center gap-3 transition-colors"
                                  >
                                    <PowerOff className="w-4 h-4" /> Deactivate
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {canDelete && (
                                <>
                                  <div className="h-px bg-dark-3/50 mx-2" />
                                  <button
                                    onClick={() => { setOpenActionId(null); onActivateCompany(company.id); }}
                                    className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-dark-2 hover:text-green-300 flex items-center gap-3 transition-colors"
                                  >
                                    <Power className="w-4 h-4" /> Activate
                                  </button>
                                  <div className="h-px bg-dark-3/50 mx-2" />
                                  <button
                                    onClick={() => { setOpenActionId(null); onDeleteCompany(company.id); }}
                                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-dark-2 hover:text-red-300 flex items-center gap-3 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </Portal>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

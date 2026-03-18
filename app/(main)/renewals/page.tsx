"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect } from "react";
import { setRenewals } from "@/lib/features/renewal/renewalSlice";
import { api } from "@/lib/api";
import { Renewal, RenewalStatus } from "@/types";
import { Bell } from "lucide-react";

const STATUS_STYLES: Record<RenewalStatus, string> = {
  Due: "bg-red-50 text-red-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Renewed: "bg-emerald-50 text-emerald-700",
  Lapsed: "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-400",
};

function DaysUntilBadge({ days }: { days: number }) {
  if (days < 0)
    return <span className="text-xs text-gray-400 dark:text-dark-6">Lapsed {Math.abs(days)}d ago</span>;
  const color =
    days <= 30
      ? "text-red-600 font-bold"
      : days <= 60
      ? "text-amber-600 font-semibold"
      : "text-gray-500 dark:text-dark-6";
  return <span className={`text-sm ${color}`}>{days} days</span>;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RenewalsPage() {
  const dispatch = useAppDispatch();
  const renewals = useSelector((s: RootState) => s.renewal.items);

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        const data = await api.getAllRenewals();
        dispatch(setRenewals(data));
      } catch (err) {
        console.error("Failed to fetch renewals:", err);
      }
    };
    fetchRenewals();
  }, [dispatch]);

  const dueCount = renewals.filter((r) => r.status === "Due").length;
  const inProgressCount = renewals.filter((r) => r.status === "In Progress").length;

  return (
    <div className="space-y-6 bg-white dark:bg-gray-dark p-6 md:p-10 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Renewals</h1>
          <p className="text-sm text-gray-500 dark:text-dark-6 mt-0.5">
            <span className="text-red-600 font-semibold">{dueCount}</span> due ·{" "}
            <span className="text-amber-600 font-semibold">{inProgressCount}</span> in progress
          </p>
        </div>
      </div>

      <div className="border border-gray-100 dark:border-dark-3 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 dark:bg-dark-2 border-b border-gray-100 dark:border-dark-3">
              <tr>
                {[
                  "Policy No.",
                  "Company",
                  "Type",
                  "Current Premium",
                  "Renewal Due",
                  "Days Until Expiry",
                  "Status",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 dark:text-dark-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-3">
              {renewals.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                >
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {r.policyNumber}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {r.companyName}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">
                    {formatCurrency(r.currentPremium)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-dark-6">
                    {r.renewalDueDate}
                  </td>
                  <td className="py-4 px-4">
                    <DaysUntilBadge days={r.daysUntilExpiry} />
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_STYLES[r.status]
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      {r.status !== "Lapsed" && r.status !== "Renewed" && (
                        <>
                          <button className="text-xs bg-[#C6F200] text-black px-3 py-1.5 rounded-full hover:bg-[#b0d600] font-medium transition-colors">
                            Start Renewal
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            title="Send Reminder"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {renewals.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                    No renewals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

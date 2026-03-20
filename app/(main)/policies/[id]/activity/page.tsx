"use client";

import React from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  FolderOpen, 
  PlusCircle 
} from 'lucide-react';

export default function PolicyActivityPage() {
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

  return (
    <div className="max-w-4xl">
      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-6">System Audit Trail</h4>
      
      <div className="space-y-8 pl-2 ml-2">
        {activityLog.map((group, groupIdx) => (
          <div key={groupIdx} className="relative pl-8 border-l border-gray-200 dark:border-dark-3 last:border-0 pb-2 last:pb-0">
            {/* Timeline Connector Dot */}
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
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin } from "lucide-react";
import { SuccessHeader } from "@/components/ui/FormCommon";

// Mock types
type Employee = {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
};

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Harish Chandra", designation: "Plant Manager", email: "harishh.a@acme.com", phone: "+91 98765 43210" },
  { id: "2", name: "Harishita Chandra", designation: "Manager", email: "harishita.a@acme.com", phone: "+91 98765 43210" },
];

export function MultiStepBranchForm() {
  const router = useRouter();
  
  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Step 1 State
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Form Step 2 State
  const [spocMode, setSpocMode] = useState<"existing" | "new">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  // Add New Contact State
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newAssignedUnit, setNewAssignedUnit] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newReportsTo, setNewReportsTo] = useState("");

  const selectedEmp = MOCK_EMPLOYEES.find(e => e.id === selectedEmpId);

  const handleNext = () => {
    if (!branchName.trim()) {
      alert("Branch Name is required");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // NOTE: In a real implementation this would:
      // 1. Create a new user if spocMode === 'new'
      // 2. Create the branch using apiClient.createBranch
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0B1727] dark:focus:ring-gray-400 transition-all";
  const labelClass = "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="w-full">
      {/* Header Area */}
      {step < 3 ? (
        <div className="bg-gradient-to-r from-[#0E3B5E] to-[#40E0D0] px-8 py-8 rounded-2xl text-white shadow-sm mb-6 relative overflow-hidden">
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-display mb-1">
              {step === 1 ? "Add Branch" : "Add Branch SPOC"}
            </h1>
            <p className="text-white/80 text-sm">
              {step === 1 
                ? "Create a new physical location or registered entity for your organization" 
                : "Select the manager or point-person for insurance surveyors to contact at this site."}
            </p>
          </div>
        </div>
      ) : (
        <SuccessHeader 
          title="Branch Registered" 
          subtitle="Successfully added a new branch to your company profile!" 
        />
      )}

      <div className="bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-2xl p-8 shadow-sm">
        {/* Step Indicator */}
        {step < 3 && (
          <div className="flex items-center gap-3 mb-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727]" : "bg-gray-200 text-gray-500 dark:bg-dark-3 dark:text-gray-400"
            }`}>
              1
            </div>
            <div className="w-12 border-t-2 border-dashed border-gray-300 dark:border-dark-3"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727]" : "bg-gray-200 text-gray-400 dark:bg-dark-3 dark:text-gray-500"
            }`}>
              2
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Basic Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Details</h3>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Branch Name*</label>
                    <input 
                      type="text" 
                      value={branchName}
                      onChange={e => setBranchName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Branch Code (Internal ID)</label>
                    <input 
                      type="text" 
                      value={branchCode}
                      onChange={e => setBranchCode(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>GSTIN</label>
                    <input 
                      type="text" 
                      value={gstin}
                      onChange={e => setGstin(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Location Details Divider on Desktop */}
              <div className="relative">
                <div className="hidden md:block absolute -left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-dark-3"></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 md:pl-0">Location Details</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Registered Address</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input 
                      type="text" 
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input 
                        type="text" 
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-12">
              <button 
                onClick={handleNext}
                className="px-10 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors dark:bg-white dark:text-[#0B1727] dark:hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toggle Modes */}
            <div className="flex gap-2 mb-8">
               <button 
                 onClick={() => setSpocMode("existing")}
                 className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                   spocMode === "existing" 
                     ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727]" 
                     : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-dark-2 dark:text-gray-400 dark:hover:bg-dark-3"
                 }`}
               >
                 Select Existing Employee
               </button>
               <button 
                 onClick={() => setSpocMode("new")}
                 className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                   spocMode === "new" 
                     ? "bg-[#0B1727] text-white dark:bg-white dark:text-[#0B1727]" 
                     : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-dark-2 dark:text-gray-400 dark:hover:bg-dark-3"
                 }`}
               >
                 Add New Contact
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column (Search or New Contact Form) */}
              <div>
                {spocMode === "existing" ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                      <input 
                        type="text"
                        placeholder="Search employee..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`pl-10 ${inputClass}`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {MOCK_EMPLOYEES.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase())).map(emp => (
                        <div 
                          key={emp.id}
                          onClick={() => setSelectedEmpId(emp.id)}
                          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedEmpId === emp.id 
                              ? "border-green-500 bg-green-50/10 dark:bg-green-500/10" 
                              : "border-gray-100 dark:border-dark-3 hover:border-gray-200 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-3 flex items-center justify-center text-gray-400 dark:text-gray-500">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{emp.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic">{emp.designation}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-gray-400">{emp.email}</div>
                            <div className="text-[10px] font-medium text-gray-900 dark:text-gray-300">{emp.phone}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Details</h3>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>First Name</label>
                          <input type="text" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} className={inputClass}/>
                        </div>
                        <div>
                          <label className={labelClass}>Last Name</label>
                          <input type="text" value={newLastName} onChange={e => setNewLastName(e.target.value)} className={inputClass}/>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass}/>
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputClass}/>
                      </div>
                      <div>
                        <label className={labelClass}>Designation</label>
                        <input type="text" value={newDesignation} onChange={e => setNewDesignation(e.target.value)} className={inputClass}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Details or Org Context form) */}
              <div className="relative">
                <div className="hidden md:block absolute -left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-dark-3"></div>
                
                {spocMode === "existing" ? (
                  <>
                    {selectedEmp ? (
                      <div className="space-y-8 mt-2 animate-in fade-in duration-300">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Employee Details</h3>
                          <div className="grid grid-cols-2 gap-y-4">
                            <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">First Name</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.name.split(" ")[0]}</div>
                            </div>
                            <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Last Name</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.name.split(" ")[1] || ""}</div>
                            </div>
                            <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Email</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.email}</div>
                            </div>
                            <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Phone Number</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.phone}</div>
                            </div>
                            <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Designation</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.designation}</div>
                            </div>
                            <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">System Role</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">Approver</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Organizational Context</h3>
                          <div className="grid grid-cols-2 gap-y-4">
                             <div className="col-span-2">
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Assigned Unit/Branch</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">Delhi Plant</div>
                             </div>
                             <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Department</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">Operations</div>
                             </div>
                             <div>
                               <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Reports To</div>
                               <div className="text-sm font-medium text-gray-900 dark:text-white">Vikram Mehta</div>
                             </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                         Select an employee to view details
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 md:pl-0">Organizational Context</h3>
                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>Assigned Unit/Branch</label>
                        <input type="text" value={newAssignedUnit} onChange={e => setNewAssignedUnit(e.target.value)} className={inputClass}/>
                      </div>
                      <div>
                        <label className={labelClass}>Department</label>
                        <input type="text" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} className={inputClass}/>
                      </div>
                      <div>
                        <label className={labelClass}>Reports To</label>
                        <input type="text" value={newReportsTo} onChange={e => setNewReportsTo(e.target.value)} className={inputClass}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || (spocMode === "existing" && !selectedEmpId)}
                className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors disabled:opacity-50 dark:bg-white dark:text-[#0B1727] dark:hover:bg-gray-200"
              >
                {isSubmitting ? "Processing..." : "Add Branch SPOC"}
              </button>
              
              {spocMode === "new" && (
                <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                  *this also adds the contact in the database as an employee
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Title with Icon */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Branch Registration Summary</h2>
            </div>

            <hr className="mb-8 border-gray-200 dark:border-dark-3" />

            {/* Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Branch Details</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Branch Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{branchName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Branch Code (Internal ID)</p>
                    <p className="font-medium text-gray-900 dark:text-white">{branchCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">GSTIN</p>
                    <p className="font-medium text-gray-900 dark:text-white">{gstin || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {[city, state].filter(Boolean).join(", ") || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:pt-12">
                <h3 className="hidden md:block font-semibold text-gray-900 dark:text-white mb-6 opacity-0">SPOC Details</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Branch SPOC Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {spocMode === 'existing' 
                        ? selectedEmp?.name || '-' 
                        : [newFirstName, newLastName].filter(Boolean).join(" ") || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Contact Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {spocMode === 'existing' ? selectedEmp?.email || '-' : newEmail || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Contact Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {spocMode === 'existing' ? selectedEmp?.phone || '-' : newPhone || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-3">
              <button
                onClick={() => router.push('/branches')}
                className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors dark:bg-white dark:text-[#0B1727] dark:hover:bg-gray-200"
              >
                Go to Branches List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

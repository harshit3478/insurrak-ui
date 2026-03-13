export interface UserRead {
  id: number;
  username: string;
  email: string;
  designation: string | null;
  reports_to: number | null;
  is_active: boolean;
  company_id: number;
  role_id: number;
}

export interface CompanyRead {
  id: number;
  name: string;
  is_active: boolean;
  email: string | null;
  mobile_number: string | null;
  address: string | null;
  gst_number: string | null;
}

export interface BranchRead {
  id: number;
  company_id: number;
  name: string;
  is_active: boolean;
  address: string | null;
  state: string | null;
  gst_number: string | null;
}

export interface UnitRead {
  id: number;
  branch_id: number;
  name: string;
  is_active: boolean;
  address: string | null;
  occupancy?: string | null;
  hazard_details?: string | null;
  gstin?: string | null;
  contact_person_name?: string | null;
  contact_person_email?: string | null;
  contact_person_phone?: string | null;
}

export interface BrokerRead {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  sla_days: number;
  service_scope: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsurerRead {
  id: number;
  name: string;
  branch: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyRequestRead {
  id: number;
  company_id: number;
  unit_id: number;
  broker_id: number;
  requested_by_id: number;
  line_of_business: string;
  status: string;      // e.g. "DATA_COLLECTION", "QUOTING", "APPROVAL_PENDING", etc.
  asset_description: string | null;
  policy_number: string | null;
  sum_insured: number | null;
  policy_start_date: string | null;
  policy_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationRead {
  id: number;
  policy_request_id: number;
  insurer_id: number;
  version: number;
  premium: number;
  gst: number;
  total_premium: number;
  file_name: string | null;
  file_path: string | null;
  is_selected: boolean;
  created_at: string;
  terms: QuotationTermsRead | null;
}

export interface QuotationTermsRead {
  id: number;
  quotation_id: number;
  coverage_scope: string | null;
  perils_included: string | null;
  perils_excluded: string | null;
  sum_insured_basis: string | null;
  deductibles: string | null;
  excess: string | null;
  sub_limits: string | null;
  add_ons: string | null;
  warranties: string | null;
  exclusions: string | null;
  reinstatement: string | null;
  co_insurance: string | null;
  contribution_clause: string | null;
  retroactive_date: string | null;
  waiting_periods: string | null;
  territorial_limits: string | null;
  jurisdictional_limits: string | null;
  cancellation_terms: string | null;
  special_conditions: string | null;
}

export interface PolicyDocumentRead {
  id: number;
  policy_request_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_by_id: number;
  created_at: string;
}

export interface ApprovalRead {
  id: number;
  policy_request_id: number;
  quotation_id: number | null;
  approver_id: number;
  decision: string;
  comments: string | null;
  created_at: string;
}

export interface InvoiceRead {
  id: number;
  policy_request_id: number;
  invoice_type: string;
  amount: number;
  gst: number;
  total: number;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  file_name: string | null;
  file_path: string | null;
  uploaded_by_id: number;
  created_at: string;
}

export interface PaymentRead {
  id: number;
  invoice_id: number;
  utr_number: string;
  payment_date: string;
  amount: number;
  paid_by_id: number;
  created_at: string;
}

export interface RoleRead {
  id: number;
  name: string;
  company_id: number | null;
}

export interface PermissionRead {
  id: number;
  name: string;
  description: string | null;
}

export interface RolesAndPermissionsResponse {
  roles: RoleRead[];
  permissions: PermissionRead[];
}

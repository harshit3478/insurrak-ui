/**
 * api.ts defines the data contracts (D/TOs) for interaction with the
 * FastAPI backend. It provides type-safe schemas for request payloads
 * and response models across all functional modules.
 */
export interface UserRead {
  id: number;
  username: string;
  email: string;
  mobile_number: string | null;
  designation: string | null;
  reports_to: number | null;
  is_active: boolean;
  company_id: number;
  role_id: number;
  role_name?: string;
  permission_ids?: number[];
  company_name?: string;
}

export interface CompanyRead {
  id: number;
  name: string;
  is_active: boolean;
  email: string | null;
  mobile_number: string | null;
  address: string | null;
  gst_number: string | null;
  unit_count?: number;
}

export interface UnitRead {
  id: number;
  company_id: number;
  name: string;
  is_active: boolean;
  state: string | null;
  address: string | null;
  occupancy: string | null;
  hazard_details: string | null;
  gstin: string | null;
  gst_certificate_path: string | null;
  contact_person_name: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrokerRead {
  id: number;
  company_id: number;
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
  company_id: number;
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
  broker_id: number | null;
  requested_by_id: number;
  line_of_business: string;
  status: string; // e.g. "DATA_COLLECTION", "QUOTING", "APPROVAL_PENDING", etc.
  asset_description: string | null;
  policy_number: string | null;
  sum_insured: number | null;
  premium: number | null;
  policy_start_date: string | null;
  policy_end_date: string | null;
  notes: string | null;
  renewal_of_policy_id: number | null;
  unit_name: string | null;
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
  payment: PaymentRead | null;
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
  role_permissions: Record<number, number[]>;
}

// ─── Create / Update Payloads ───────────────────────────────────────

export interface UnitCreate {
  name: string;
  is_active?: boolean;
  state?: string | null;
  address?: string | null;
  occupancy?: string | null;
  hazard_details?: string | null;
  gstin?: string | null;
  gst_certificate_path?: string | null;
  contact_person_name?: string | null;
  contact_person_email?: string | null;
  contact_person_phone?: string | null;
}

export interface UnitUpdate {
  name?: string | null;
  is_active?: boolean | null;
  state?: string | null;
  address?: string | null;
  occupancy?: string | null;
  hazard_details?: string | null;
  gstin?: string | null;
  gst_certificate_path?: string | null;
  contact_person_name?: string | null;
  contact_person_email?: string | null;
  contact_person_phone?: string | null;
}

export interface PolicyRequestCreate {
  company_id: number;
  unit_id: number;
  broker_id?: number | null;
  line_of_business: string;
  asset_description?: string | null;
  notes?: string | null;
  sum_insured?: number | null;
  premium?: number | null;
  policy_start_date?: string | null;
  policy_end_date?: string | null;
  renewal_of_policy_id?: number | null;
}

export interface PolicyRequestUpdate {
  line_of_business?: string;
  asset_description?: string | null;
  notes?: string | null;
  policy_number?: string | null;
  sum_insured?: number | null;
  policy_start_date?: string | null;
  policy_end_date?: string | null;
}

export interface DeviationRead {
  id: number;
  quotation_id: number;
  field_name: string;
  prior_value: string | null;
  current_value: string | null;
  deviation_type: string;
  severity: string;
  created_at: string;
}

export interface PaymentCreate {
  utr_number: string;
  payment_date: string; // ISO date string
  amount: number;
}

export interface QuotationTermsCreate {
  coverage_scope?: string | null;
  perils_included?: string | null;
  perils_excluded?: string | null;
  sum_insured_basis?: string | null;
  deductibles?: string | null;
  excess?: string | null;
  sub_limits?: string | null;
  add_ons?: string | null;
  warranties?: string | null;
  exclusions?: string | null;
  reinstatement?: string | null;
  co_insurance?: string | null;
  contribution_clause?: string | null;
  retroactive_date?: string | null;
  waiting_periods?: string | null;
  territorial_limits?: string | null;
  jurisdictional_limits?: string | null;
  cancellation_terms?: string | null;
  special_conditions?: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: UserRead;
}

export interface LoginRequest {
  username: string;
  password: string;
  keep_login?: boolean;
  system_login?: boolean;
}

export interface UserCreateIn {
  username: string;
  email: string;
  password: string;
  designation?: string | null;
  role_id: number;
  reports_to?: number | null;
}

export interface RoleCreateIn {
  name: string;
  permission_ids: number[];
}

export interface RoleUpdateIn {
  name?: string;
  permission_ids?: number[];
}

export interface CompanyCreate {
  name: string;
  is_active?: boolean;
  email?: string | null;
  mobile_number?: string | null;
  address?: string | null;
  gst_number?: string | null;
  superadmin_username: string;
  superadmin_email: string;
  superadmin_password: string;
  superadmin_designation?: string | null;
}

export interface CompanySuperAdminOnboard {
  company_name: string;
  username: string;
  email: string;
  password: string;
}

export interface CompanyUpdate {
  name?: string | null;
  is_active?: boolean | null;
  email?: string | null;
  mobile_number?: string | null;
  address?: string | null;
  gst_number?: string | null;
}

export interface BrokerCreate {
  name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  sla_days?: number;
  service_scope?: string | null;
}

export interface BrokerUpdate {
  name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  sla_days?: number | null;
  service_scope?: string | null;
  is_active?: boolean | null;
}

export interface InsurerCreate {
  name: string;
  branch?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export interface InsurerUpdate {
  name?: string | null;
  branch?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active?: boolean | null;
}

export interface InvoiceCreate {
  invoice_type: string;
  amount: number;
  gst: number;
  total: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  file_name?: string | null;
  file_path?: string | null;
}

export interface ApprovalCreate {
  quotation_id?: number | null;
  decision: string;
  comments?: string | null;
}

export interface QuotationCreate {
  insurer_id: number;
  premium: number;
  gst: number;
  total_premium: number;
  file_name?: string | null;
  file_path?: string | null;
  terms?: QuotationTermsCreate | null;
}

export interface PolicyDocumentCreate {
  document_type: string;
  file_name: string;
  file_path: string;
}

export interface StatusTransitionRequest {
  new_status: string;
}

// ─── Claims Schemas ─────────────────────────────────────────

export interface ClaimCreate {
  policy_request_id: number;
  claim_type: string;
  incident_date: string;
  incident_description: string;
  estimated_loss?: number | null;
  notes?: string | null;
}

export interface ClaimRead {
  id: number;
  policy_request_id: number;
  company_id: number;
  initiated_by_id: number;
  assigned_to_id: number | null;
  status: string;
  claim_type: string;
  incident_date: string;
  incident_description: string;
  estimated_loss: number | null;
  approved_amount: number | null;
  settled_amount: number | null;
  insurer_claim_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimUpdate {
  claim_type?: string | null;
  incident_date?: string | null;
  incident_description?: string | null;
  estimated_loss?: number | null;
  notes?: string | null;
  assigned_to_id?: number | null;
}

export interface ClaimStatusTransitionRequest {
  new_status: string;
}

export interface ClaimDocumentCreate {
  document_type: string;
  file_name: string;
  file_path: string;
}

export interface ClaimDocumentRead {
  id: number;
  claim_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_by_id: number;
  created_at: string;
}

export interface ClaimApprovalCreate {
  decision: string;
  approved_amount?: number | null;
  insurer_claim_number?: string | null;
  notes?: string | null;
}

export interface ClaimSettlementCreate {
  settled_amount: number;
  notes?: string | null;
}

export interface ClaimCommunicationCreate {
  direction: string; // INBOUND | OUTBOUND
  sender_name: string;
  sender_email?: string | null;
  subject?: string | null;
  message: string;
  file_name?: string | null;
  file_path?: string | null;
  sent_at: string; // ISO datetime
}

export interface ClaimCommunicationRead {
  id: number;
  claim_id: number;
  created_by_id: number | null;
  direction: string;
  sender_name: string;
  sender_email: string | null;
  subject: string | null;
  message: string;
  file_name: string | null;
  file_path: string | null;
  sent_at: string;
  created_at: string;
}

// ─── Company Registration Requests ───────────────────────────────────────────

export interface CompanyRegistrationRequestCreate {
  company_name: string;
  admin_name: string;
  admin_email: string;
  admin_phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
  message?: string | null;
}

export interface CompanyRegistrationRequestRead {
  id: number;
  company_name: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string | null;
  address: string | null;
  gst_number: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

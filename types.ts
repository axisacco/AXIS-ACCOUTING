
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  OPERATOR = 'operator'
}

export enum View {
  DASHBOARD = 'dashboard',
  CLIENTS = 'clients',
  DOCUMENTS = 'documents',
  TAXES = 'taxes',
  REVENUE = 'revenue',
  REVENUE_TAXES = 'revenue_taxes',
  INVOICE_ISSUE = 'invoice_issue',
  AI_CHAT = 'ai_chat',
  SETTINGS = 'settings',
  TAX_CONSULTANCY = 'tax_consultancy',
  PAYROLL = 'payroll',
  PRICING_CALCULATOR = 'pricing_calculator',
  FINANCIAL_PLANNER = 'financial_planner',
  ADMIN_USERS = 'admin_users',
  SIMPLES_CALCULATOR = 'simples_calculator'
}

export type TaxAnexo = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  companyId?: string;
  cnpjVinculado?: string; 
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'blocked' | 'pending';
  passwordHash: string;
  cnpjVinculado?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  admissionDate: string;
  status: 'active' | 'on_vacation' | 'terminated';
  department: string;
  clientId?: string;
}

export interface Client {
  id: string;
  name: string; 
  nomeFantasia: string;
  nomeEmpresario: string;
  identifier: string; 
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  type: 'PF' | 'PJ';
  createdAt: string;
  taxAnexo?: TaxAnexo;
  annualRevenue?: number;
}

export interface SimplesCalculationResult {
  id: string;
  date: string;
  clientId: string;
  rbt12: number;
  monthlyRevenue: number;
  payroll?: number;
  fatorR?: number;
  anexo: TaxAnexo;
  effectiveRate: number;
  taxAmount: number;
  breakdown: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    cpp: number;
    icms?: number;
    iss?: number;
    ipi?: number;
  };
}

export interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface Tax {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  clientId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  category: 'invoice' | 'contract' | 'tax_report' | 'other';
  ownerId: string;
}

export interface Revenue {
  id: string;
  client: string;
  amount: number;
  date: string;
  status: 'received' | 'expected';
  description?: string;
  source: 'manual' | 'api_cityhall';
  entryType: 'inflow' | 'outflow';
  clientId: string;
  createdBy?: string;
}

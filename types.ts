
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
  INTELLIGENT_TAX = 'intelligent_tax',
  AI_CHAT = 'ai_chat',
  SETTINGS = 'settings',
  PAYROLL = 'payroll',
  PRICING_CALCULATOR = 'pricing_calculator',
  ADMIN_USERS = 'admin_users',
  SIMPLES_CALCULATOR = 'simples_calculator',
  PEOPLE_MANAGEMENT = 'people_management'
}

export type TaxAnexo = 'I' | 'II' | 'III' | 'IV' | 'V';
export type ProductCategory = 'normal' | 'monofasico' | 'isento';

export interface TaxRules {
  monofasicoHasPisCofins: boolean;
  isentoHasPisCofins: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
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

export interface Client {
  id: string;
  name: string; 
  nomeFantasia: string;
  nomeEmpresario: string;
  identifier: string; 
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  type: 'PJ' | 'PF';
  createdAt: string;
  taxAnexo?: TaxAnexo;
  annualRevenue?: number;
  cnae?: string;
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
  activityType: 'commerce' | 'service';
  productCategory: ProductCategory;
  isPisCofinsExempt: boolean;
  clientId: string;
  createdBy?: string;
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

export interface JourneyLog {
  id: string;
  date: string;
  type: 'overtime' | 'deduction' | 'absence';
  hours: number;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  admissionDate: string;
  birthDate?: string;
  workload?: number; // Carga horária mensal
  status: 'active' | 'resigned' | 'vacation';
  department: string;
  clientId: string;
  hasInsalubridade?: boolean;
  hasPericulosidade?: boolean;
  lastVacationDate?: string;
  journeyLogs?: JourneyLog[];
}

export interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Interface para a repartição de tributos do Simples Nacional
 */
export interface Repartition {
  irpj: number;
  csll: number;
  cofins: number;
  pis: number;
  cpp: number;
  icms?: number;
  iss?: number;
  ipi?: number;
}

/**
 * Interface para o resultado de um cálculo de simulação do Simples Nacional
 */
export interface SimplesCalculationResult {
  id: string;
  date: string;
  clientId: string;
  activity: 'SERVICO' | 'COMERCIO' | 'INDUSTRIA';
  anexo: TaxAnexo;
  rbt12: number;
  minSaleValue: number;
  proposedPrice: number;
  taxAmount: number;
  effectiveRate: number;
  cardFeePercent: number;
  costs: {
    product: number;
    shipping: number;
    commission: number;
    supplies: number;
    labor: number;
    others: number;
    cardFeeAmount: number;
    totalDirect: number;
  };
  profitability: {
    netProfit: number;
    netMargin: number;
    grossProfit: number;
    grossMargin: number;
  };
  breakdown: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    cpp: number;
    icms: number;
    iss: number;
    ipi: number;
  };
}

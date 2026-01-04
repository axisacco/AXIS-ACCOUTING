
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client'
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
  SETTINGS = 'settings'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  companyId?: string;
}

export interface Client {
  id: string;
  name: string;
  identifier: string;
  email: string;
  status: 'active' | 'inactive';
  type: 'PF' | 'PJ';
  createdAt: string;
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
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  category: 'invoice' | 'contract' | 'tax_report' | 'other';
  ownerId?: string;
}

export interface Revenue {
  id: string;
  client: string;
  amount: number;
  date: string;
  status: 'received' | 'expected';
  description?: string;
}

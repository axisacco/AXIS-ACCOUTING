
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';
import TaxTracker from './components/TaxTracker';
import RevenueSchedule from './components/RevenueSchedule';
import AIChat from './components/AIChat';
import ClientManagement from './components/ClientManagement';
import InvoiceIssuance from './components/InvoiceIssuance';
import TaxConsultancy from './components/TaxConsultancy';
import PayrollManager from './components/PayrollManager';
import PricingCalculator from './components/PricingCalculator';
import FinancialPlanner from './components/FinancialPlanner';
import AdminUserManager from './components/AdminUserManager';
import SimplesCalculator from './components/SimplesCalculator';
import Settings from './components/Settings';
import Login from './components/Login';
import { View, UserRole, User, Client, UserAccount, Revenue, Tax, Employee, Document, SimplesCalculationResult } from './types';
import { deleteClientRequest } from './services/clientService';

const STORAGE_KEYS = {
  CLIENTS: 'axis_clients_v2',
  USERS: 'axis_users_v2',
  REVENUES: 'axis_revenues_v2',
  TAXES: 'axis_taxes_v2',
  EMPLOYEES: 'axis_employees_v2',
  DOCUMENTS: 'axis_docs_v2',
  SIMPLES_HISTORY: 'axis_simples_v2'
};

const ADMIN_EMAIL_AUTH = 'adm@ad.com';

const initialClients: Client[] = [
  { 
    id: '1', 
    name: 'Tecnologia Avançada LTDA', 
    nomeFantasia: 'Tech Avançada',
    nomeEmpresario: 'João Silva',
    identifier: '12.345.678/0001-90', 
    email: 'contato@techavancada.com', 
    status: 'active', 
    type: 'PJ', 
    createdAt: '2024-01-10', 
    annualRevenue: 180000, 
    taxAnexo: 'III' 
  },
];

const initialUserAccounts: UserAccount[] = [
  { id: 'USR_ADM_NEW', name: 'Administrador Axis', email: 'adm@ad.com', phone: '(11) 99999-9999', role: UserRole.ADMIN, createdAt: '2026-01-01', lastLogin: 'Nunca', status: 'active', passwordHash: 'MTIzNDU=' },
  { id: 'USR_001', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98877-6655', role: UserRole.CLIENT, createdAt: '2026-01-05', lastLogin: 'Nunca', status: 'active', passwordHash: 'MTIzNDU2', cnpjVinculado: '12.345.678/0001-90' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(new Date().getMonth());
  const [focusedClient, setFocusedClient] = useState<Client | null>(null);

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUserAccounts;
  });

  const [revenues, setRevenues] = useState<Revenue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVENUES);
    return saved ? JSON.parse(saved) : [];
  });

  const [taxes, setTaxes] = useState<Tax[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAXES);
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [simplesHistory, setSimplesHistory] = useState<SimplesCalculationResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIMPLES_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(userAccounts)); }, [userAccounts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REVENUES, JSON.stringify(revenues)); }, [revenues]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TAXES, JSON.stringify(taxes)); }, [taxes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SIMPLES_HISTORY, JSON.stringify(simplesHistory)); }, [simplesHistory]);

  const handleLogin = (email: string, pass: string) => {
    // NORMALIZAÇÃO MANDATÁRIA
    const normalizedEmailInput = email.trim().toLowerCase();
    const normalizedPassInput = pass.trim();
    const hashedInput = btoa(normalizedPassInput);

    console.group('🛡️ Diagnóstico de Autenticação');
    console.log('1. Email Recebido:', normalizedEmailInput);
    console.log('2. Senha Recebida (Hashed):', hashedInput);

    const account = userAccounts.find(u => {
      const dbEmail = u.email.trim().toLowerCase();
      const match = dbEmail === normalizedEmailInput && u.passwordHash === hashedInput;
      if (dbEmail === normalizedEmailInput) {
        console.log('👉 Usuário encontrado! Validando senha...');
        console.log('   Hash no Banco:', u.passwordHash);
        console.log('   Hash Digitado:', hashedInput);
      }
      return match;
    });

    if (account) {
      console.log('✅ LOGIN SUCESSO');
      console.groupEnd();
      if (account.status !== 'active') { alert("Acesso Bloqueado."); return; }
      const user: User = { 
        id: account.id, 
        name: account.name, 
        email: account.email.trim().toLowerCase(), 
        role: account.role, 
        cnpjVinculado: account.cnpjVinculado 
      };
      setCurrentUser(user);
      if (user.role === UserRole.CLIENT && user.cnpjVinculado) {
        const client = clients.find(c => c.identifier === user.cnpjVinculado);
        if (client) setFocusedClient(client);
      }
      setCurrentView(View.DASHBOARD);
      setUserAccounts(prev => prev.map(u => u.id === account.id ? {...u, lastLogin: new Date().toLocaleString('pt-BR')} : u));
    } else {
      console.warn('❌ LOGIN FALHOU: Credenciais não coincidem');
      console.groupEnd();
      alert("Usuário ou senha incorretos.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(View.DASHBOARD);
    setFocusedClient(null);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    const commonProps = {
      focusedClient,
      userRole: currentUser.role,
      revenues, setRevenues,
      taxes, setTaxes,
      employees, setEmployees,
      documents, setDocuments,
      selectedMonthIdx, setSelectedMonthIdx,
      currentUser,
      clients,
      onSelectClient: (c: Client) => { setFocusedClient(c); setCurrentView(View.DASHBOARD); },
      onAddClient: (c: Client) => setClients(prev => [c, ...prev]),
      onDeleteClient: async (id: string) => {
        if (currentUser.email.toLowerCase() !== ADMIN_EMAIL_AUTH) {
          alert("ERRO DE SEGURANÇA: Ação restrita ao administrador mestre (adm@ad.com).");
          return;
        }

        const clientToDelete = clients.find(c => c.id === id);
        if (!clientToDelete) return;

        const success = await deleteClientRequest(id);
        if (success) {
          setClients(prev => prev.filter(c => c.id !== id));
          setUserAccounts(prev => prev.filter(u => u.cnpjVinculado !== clientToDelete.identifier));
          setRevenues(prev => prev.filter(r => r.clientId !== id));
          setTaxes(prev => prev.filter(t => t.clientId !== id));
          setDocuments(prev => prev.filter(d => d.ownerId !== id));
          setSimplesHistory(prev => prev.filter(h => h.clientId !== id));
          
          if (focusedClient?.id === id) setFocusedClient(null);
          alert(`EXCLUSÃO CONCLUÍDA: A empresa "${clientToDelete.nomeFantasia}" e todos os registros associados foram removidos.`);
        }
      },
      onUpdateClient: (c: Client) => setClients(prev => prev.map(old => old.id === c.id ? c : old)),
      users: userAccounts,
      setUsers: setUserAccounts
    };

    switch (currentView) {
      case View.DASHBOARD: return <Dashboard {...commonProps} />;
      case View.CLIENTS: return <ClientManagement {...commonProps} />;
      case View.DOCUMENTS: return <DocumentManager {...commonProps} />;
      case View.TAXES: return <TaxTracker {...commonProps} />;
      case View.REVENUE: return <RevenueSchedule {...commonProps} />;
      case View.AI_CHAT: return <AIChat {...commonProps} />;
      case View.FINANCIAL_PLANNER: return <FinancialPlanner {...commonProps} />;
      case View.ADMIN_USERS: return <AdminUserManager {...commonProps} />;
      case View.SETTINGS: return <Settings {...commonProps} />;
      case View.PAYROLL: return <PayrollManager {...commonProps} />;
      case View.TAX_CONSULTANCY: return <TaxConsultancy {...commonProps} />;
      case View.PRICING_CALCULATOR: return <PricingCalculator {...commonProps} />;
      case View.SIMPLES_CALCULATOR: 
        return (
          <SimplesCalculator 
            focusedClient={focusedClient} 
            onSaveCalculation={(res) => setSimplesHistory(prev => [res, ...prev])}
            history={simplesHistory.filter(h => focusedClient ? h.clientId === focusedClient.id : true)}
          />
        );
      default: return <Dashboard {...commonProps} />;
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-[100dvh] flex bg-[#F8FAFC] font-sans overflow-x-hidden">
      <Sidebar 
        currentView={currentView} onViewChange={setCurrentView} userRole={currentUser.role}
        isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} hasActiveFocus={!!focusedClient}
      />
      <main className={`flex-1 transition-all duration-300 ease-in-out w-full ${isSidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-64'}`}>
        {(currentUser.email === ADMIN_EMAIL_AUTH) && focusedClient && (
          <div className="sticky top-0 z-40 bg-amber-500 text-amber-950 px-4 md:px-6 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2 text-[10px] md:text-xs font-bold uppercase truncate">
              <span className="text-lg">🛡️</span>
              <span>ADMIN MODE: Monitorando <b>{focusedClient.name}</b></span>
            </div>
            <button onClick={() => setFocusedClient(null)} className="text-[10px] font-black uppercase bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg">Voltar ao Global</button>
          </div>
        )}
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
          <header className="mb-8">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              {focusedClient ? `UNIDADE: ${focusedClient.identifier}` : 'CONTROLADORIA AXIS'}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 capitalize tracking-tight">{currentView.replace(/_/g, ' ')}</h1>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

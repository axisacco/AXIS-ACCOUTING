
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';
import TaxTracker from './components/TaxTracker';
import RevenueSchedule from './components/RevenueSchedule';
import AIChat from './components/AIChat';
import ClientManagement from './components/ClientManagement';
import IntelligentTaxManager from './components/IntelligentTaxManager';
import PayrollManager from './components/PayrollManager';
import PricingCalculator from './components/PricingCalculator';
import AdminUserManager from './components/AdminUserManager';
import SimplesCalculator from './components/SimplesCalculator';
import PeopleManagement from './components/PeopleManagement';
import Settings from './components/Settings';
import Login from './components/Login';
import { centralApi } from './services/apiService';
import { View, UserRole, User, Client, UserAccount, Revenue, Tax, Employee, Document, TaxRules } from './types';

const ADMIN_EMAIL_AUTH = 'adm@ad.com';
const DEFAULT_ADMIN_PASS = '12345';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(new Date().getMonth());
  const [focusedClient, setFocusedClient] = useState<Client | null>(null);
  const [adminVisualizationMode, setAdminVisualizationMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // ESTADOS GLOBAIS (Carregados da Nuvem)
  const [taxRules, setTaxRules] = useState<TaxRules>({ monofasicoHasPisCofins: false, isentoHasPisCofins: false });
  const [clients, setClients] = useState<Client[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  /**
   * CARREGAMENTO CENTRALIZADO (REGRA DE OURO)
   */
  const loadCentralData = useCallback(async (userEmail: string) => {
    setIsInitialLoading(true);
    const data = await centralApi.fetchUserData(userEmail);
    
    if (data) {
      setTaxRules(data.taxRules || { monofasicoHasPisCofins: false, isentoHasPisCofins: false });
      setClients(data.clients || []);
      setUserAccounts(data.userAccounts || []);
      setRevenues(data.revenues || []);
      setTaxes(data.taxes || []);
      setEmployees(data.employees || []);
      setDocuments(data.documents || []);
    }
    setIsInitialLoading(false);
  }, []);

  /**
   * SINCRONIZAÇÃO IMEDIATA (REGRA DE OURO)
   */
  useEffect(() => {
    if (currentUser && !isInitialLoading) {
      const sync = async () => {
        setIsSyncing(true);
        await centralApi.syncToCloud(currentUser.email, {
          taxRules, clients, userAccounts, revenues, taxes, employees, documents
        });
        setIsSyncing(false);
      };
      
      const timer = setTimeout(sync, 500); // Debounce para não sobrecarregar o "servidor"
      return () => clearTimeout(timer);
    }
  }, [currentUser, taxRules, clients, userAccounts, revenues, taxes, employees, documents, isInitialLoading]);

  const handleLogin = async (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    
    // Em um app real, o login também seria via centralApi.auth()
    // Aqui usamos uma lógica de verificação para o Admin Mestre e busca o restante na nuvem
    if (normalizedEmail === ADMIN_EMAIL_AUTH && cleanPass === DEFAULT_ADMIN_PASS) {
      const admin: User = { id: 'USR_MASTER', name: 'Administrador Axis', email: normalizedEmail, role: UserRole.ADMIN };
      setCurrentUser(admin);
      await loadCentralData(normalizedEmail);
      setCurrentView(View.DASHBOARD);
    } else {
      // Busca usuário nas contas da nuvem (necessário carregar temporariamente ou ter um endpoint de auth)
      // Para fins deste protótipo, vamos tentar carregar os dados do e-mail informado
      const data = await centralApi.fetchUserData(normalizedEmail);
      if (data && data.userAccounts) {
        const acc = data.userAccounts.find((u: any) => u.email.toLowerCase() === normalizedEmail && u.passwordHash === btoa(cleanPass));
        if (acc) {
          setCurrentUser({ id: acc.id, name: acc.name, email: acc.email, role: acc.role, cnpjVinculado: acc.cnpjVinculado });
          await loadCentralData(normalizedEmail);
          if (acc.cnpjVinculado) {
             const client = data.clients?.find((c: any) => c.identifier === acc.cnpjVinculado);
             if (client) setFocusedClient(client);
          }
          setCurrentView(View.DASHBOARD);
          return;
        }
      }
      alert("Credenciais inválidas ou usuário não encontrado no banco central.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFocusedClient(null);
    setAdminVisualizationMode(false);
    // Limpa estados para garantir que o próximo login não veja "fantasmas"
    setClients([]);
    setRevenues([]);
    setEmployees([]);
  };

  const renderContent = () => {
    if (isInitialLoading) return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Acessando Banco Central...</p>
      </div>
    );

    const commonProps = { 
      focusedClient, revenues, setRevenues, taxes, setTaxes, documents, setDocuments, 
      employees, setEmployees, selectedMonthIdx, setSelectedMonthIdx, currentUser, clients, 
      users: userAccounts, setUsers: setUserAccounts, taxRules, setTaxRules, onViewChange: setCurrentView, adminVisualizationMode
    };

    switch (currentView) {
      case View.DASHBOARD: return <Dashboard {...commonProps} />;
      case View.CLIENTS: return <ClientManagement {...commonProps} onSelectClient={(c) => { setFocusedClient(c); setAdminVisualizationMode(true); setCurrentView(View.DASHBOARD); }} onAddClient={(c) => setClients(p => [c, ...p])} onDeleteClient={(id) => setClients(p => p.filter(x => x.id !== id))} />;
      case View.DOCUMENTS: return <DocumentManager {...commonProps} />;
      case View.TAXES: return <TaxTracker {...commonProps} userRole={currentUser?.role} />;
      case View.REVENUE: return <RevenueSchedule {...commonProps} />;
      case View.INTELLIGENT_TAX: return <IntelligentTaxManager {...commonProps} />;
      case View.AI_CHAT: return <AIChat {...commonProps} />;
      case View.ADMIN_USERS: return <AdminUserManager {...commonProps} />;
      case View.SETTINGS: return <Settings {...commonProps} />;
      case View.PAYROLL: return <PayrollManager {...commonProps} />;
      case View.PRICING_CALCULATOR: return <PricingCalculator {...commonProps} />;
      case View.SIMPLES_CALCULATOR: return <SimplesCalculator {...commonProps} onSaveCalculation={() => {}} history={[]} />;
      case View.PEOPLE_MANAGEMENT: return <PeopleManagement {...commonProps} />;
      default: return <Dashboard {...commonProps} />;
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-[100dvh] flex bg-[#F8FAFC] font-sans">
      <Sidebar 
        currentView={currentView} onViewChange={setCurrentView} userRole={currentUser.role} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout} hasActiveFocus={!!focusedClient} onClearFocus={() => { setFocusedClient(null); setAdminVisualizationMode(false); }} adminVisualizationMode={adminVisualizationMode}
      />
      <main className={`flex-1 transition-all duration-300 w-full ${isSidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-64'}`}>
        {/* INDICADOR DE NUVEM */}
        <div className="fixed top-4 right-8 z-[60] flex items-center space-x-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-100 shadow-sm transition-all hover:shadow-md">
           <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
             {isSyncing ? 'Sincronizando Nuvem...' : 'Banco Central: Conectado'}
           </span>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

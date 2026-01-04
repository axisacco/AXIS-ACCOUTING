
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';
import TaxTracker from './components/TaxTracker';
import RevenueSchedule from './components/RevenueSchedule';
import AIChat from './components/AIChat';
import ClientManagement from './components/ClientManagement';
import InvoiceIssuance from './components/InvoiceIssuance';
import RevenueTaxTracker from './components/RevenueTaxTracker';
import { View, UserRole } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleRoleToggle = () => {
    const newRole = userRole === UserRole.ADMIN ? UserRole.CLIENT : UserRole.ADMIN;
    setUserRole(newRole);
    setCurrentView(View.DASHBOARD);
  };

  const renderContent = () => {
    if (userRole === UserRole.CLIENT) {
      if (currentView === View.CLIENTS || currentView === View.TAXES) {
        return <Dashboard />;
      }
    }

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.CLIENTS:
        return <ClientManagement />;
      case View.DOCUMENTS:
        return <DocumentManager />;
      case View.TAXES:
        return <TaxTracker />;
      case View.REVENUE:
        return <RevenueSchedule />;
      case View.REVENUE_TAXES:
        return <RevenueTaxTracker />;
      case View.INVOICE_ISSUE:
        return <InvoiceIssuance />;
      case View.AI_CHAT:
        return <AIChat />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans overflow-x-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        userRole={userRole}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* O main agora ajusta o margin de acordo com o estado da sidebar para não tampar os dados */}
      <main 
        className={`flex-1 p-8 max-w-full transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span className="font-bold text-blue-600 uppercase tracking-tighter text-xs">Portal Axis</span>
              <span>/</span>
              <span className="text-slate-600 font-medium capitalize">{currentView.replace(/_/g, ' ')}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-slate-200 p-1 rounded-xl">
                <button 
                  onClick={() => userRole !== UserRole.ADMIN && handleRoleToggle()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${userRole === UserRole.ADMIN ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Admin
                </button>
                <button 
                  onClick={() => userRole !== UserRole.CLIENT && handleRoleToggle()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${userRole === UserRole.CLIENT ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Cliente
                </button>
              </div>

              <button className="p-2.5 text-slate-400 hover:text-blue-600 bg-white rounded-xl shadow-sm border border-slate-100 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </div>
      </main>

      {currentView !== View.AI_CHAT && (
        <button 
          onClick={() => setCurrentView(View.AI_CHAT)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50 group flex items-center space-x-2"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">
            {userRole === UserRole.ADMIN ? 'Suporte Técnico' : 'Dúvida Contábil?'}
          </span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};

export default App;

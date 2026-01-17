
import React from 'react';
import { View, UserRole } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onLogout: () => void;
  hasActiveFocus?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  userRole,
  isCollapsed,
  setIsCollapsed,
  onLogout,
  hasActiveFocus = false
}) => {
  const adminItems = [
    { id: View.DASHBOARD, label: 'Painel Global', icon: '🌍' },
    { id: View.ADMIN_USERS, label: 'Administrador', icon: '🛡️' },
    { id: View.CLIENTS, label: 'Gestão Clientes', icon: '👥' },
    { id: View.DOCUMENTS, label: 'Arquivos Gerais', icon: '📁' },
    { id: View.AI_CHAT, label: 'Axis AI', icon: '🤖' },
  ];

  const clientItems = [
    { id: View.DASHBOARD, label: 'Painel', icon: '📊' },
    { id: View.SIMPLES_CALCULATOR, label: 'Calc. Simples', icon: '🧮' },
    { id: View.FINANCIAL_PLANNER, label: 'Gestão Financeira', icon: '📈' },
    { id: View.REVENUE, label: 'Extrato', icon: '💰' },
    { id: View.DOCUMENTS, label: 'Documentos', icon: '📁' },
    { id: View.AI_CHAT, label: 'Axis AI', icon: '🤖' },
  ];

  const commonItems = [
    { id: View.SETTINGS, label: 'Minha Conta', icon: '⚙️' },
  ];

  const navItems = (userRole === UserRole.ADMIN && !hasActiveFocus) ? [...adminItems, ...commonItems] : [...clientItems, ...commonItems];

  return (
    <>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[45] md:hidden transition-opacity"
          onClick={() => setIsCollapsed(true)}
        ></div>
      )}

      <aside 
        className={`bg-slate-900 text-white flex flex-col h-[100dvh] fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 ease-in-out border-r ${
          hasActiveFocus ? 'border-amber-500/50' : 'border-slate-800'
        } ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-[68px]' : 'translate-x-0 w-[280px] md:w-64'
        }`}
      >
        <div className={`p-4 flex items-center justify-between border-b h-16 md:h-20 transition-colors ${
          hasActiveFocus ? 'bg-amber-500/10 border-amber-500/20' : 'border-slate-800'
        }`}>
          {(!isCollapsed || window.innerWidth < 768) && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-500 pl-2">
              <h1 className="text-lg font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
                AXIS {hasActiveFocus && <span className="text-amber-500 text-[10px] block font-black uppercase tracking-widest mt-[-4px]">FOCUS MODE</span>}
              </h1>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all ${hasActiveFocus ? 'text-amber-500' : 'text-blue-400'} ${!isCollapsed ? 'ml-2' : 'mx-auto hidden md:block'}`}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto no-scrollbar">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 768) setIsCollapsed(true);
                  }}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
                    (isCollapsed && window.innerWidth >= 768) ? 'justify-center py-3' : 'space-x-3 px-4 py-3'
                  } ${
                    currentView === item.id
                      ? hasActiveFocus ? 'bg-amber-50 text-amber-950 shadow-lg' : 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {(!isCollapsed || window.innerWidth < 768) && <span className="font-bold text-sm">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-slate-800 bg-slate-950/40 p-4">
          <button 
            onClick={onLogout}
            className={`flex items-center text-slate-500 hover:text-red-400 transition-colors ${(isCollapsed && window.innerWidth >= 768) ? 'justify-center w-10 h-10' : 'space-x-3 px-4 w-full'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-xs font-bold uppercase tracking-wider">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import { View, UserRole } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  userRole,
  isCollapsed,
  setIsCollapsed
}) => {
  const adminItems = [
    { id: View.DASHBOARD, label: 'Painel Global', icon: '🌍' },
    { id: View.CLIENTS, label: 'Gerenciar Clientes', icon: '👥' },
    { id: View.DOCUMENTS, label: 'Todos Documentos', icon: '📁' },
    { id: View.TAXES, label: 'Gestão de Impostos', icon: '🧾' },
    { id: View.AI_CHAT, label: 'Axis AI', icon: '🤖' },
  ];

  const clientItems = [
    { id: View.DASHBOARD, label: 'Meu Dashboard', icon: '📊' },
    { id: View.REVENUE, label: 'Meu Faturamento', icon: '💰' },
    { id: View.INVOICE_ISSUE, label: 'Emitir Nota', icon: '📝' },
    { id: View.REVENUE_TAXES, label: 'Impostos por Nota', icon: '⚖️' },
    { id: View.DOCUMENTS, label: 'Meus Documentos', icon: '📁' },
    { id: View.AI_CHAT, label: 'Suporte AI', icon: '🤖' },
  ];

  const navItems = userRole === UserRole.ADMIN ? adminItems : clientItems;

  return (
    <aside 
      className={`bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Botão de Toggle e Logo */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 h-20">
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-500">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Axis Accounting
            </h1>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all mx-auto ${!isCollapsed ? 'ml-2' : ''}`}
          title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isCollapsed ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          )}
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 mt-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${isCollapsed ? 'm-0' : ''}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium text-sm overflow-hidden whitespace-nowrap animate-in slide-in-from-left-2">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil do Usuário */}
      <div className={`p-4 border-t border-slate-800 bg-slate-950/50 transition-all ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className={`rounded-xl flex items-center justify-center font-bold shadow-inner flex-shrink-0 transition-all ${
            userRole === UserRole.ADMIN ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
          } ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
            {userRole === UserRole.ADMIN ? 'AD' : 'CL'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden animate-in fade-in duration-300">
              <p className="text-sm font-bold truncate text-slate-200">
                {userRole === UserRole.ADMIN ? 'Admin Axis' : 'Cliente Exemplo'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold truncate">Logado como {userRole}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

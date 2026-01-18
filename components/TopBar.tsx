
import React from 'react';
import { Client } from '../types';

interface TopBarProps {
  onMenuClick: () => void;
  focusedClient?: Client | null;
  hasActiveFocus?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, focusedClient, hasActiveFocus }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 z-[40] flex items-center justify-between px-4 md:hidden shadow-lg border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMenuClick}
          className="p-2.5 rounded-xl bg-slate-800 text-blue-400 active:scale-95 transition-transform"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="overflow-hidden whitespace-nowrap">
          <h1 className="text-sm font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
            AXIS {hasActiveFocus && <span className="text-amber-500 text-[8px] inline-block font-black uppercase tracking-widest ml-1">FOCUS</span>}
          </h1>
        </div>
      </div>
      
      {focusedClient && (
        <div className="max-w-[150px] truncate text-right">
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Unidade Ativa</p>
          <p className="text-[10px] font-bold text-white truncate">{focusedClient.nomeFantasia}</p>
        </div>
      )}
    </header>
  );
};

export default TopBar;

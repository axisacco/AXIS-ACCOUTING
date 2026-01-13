
import React, { useState, useMemo, useRef } from 'react';
import { Tax, Client, UserRole } from '../types';
import { sendTaxReminderWhatsApp } from '../services/notificationService';

interface TaxTrackerProps {
  focusedClient?: Client | null;
  userRole?: UserRole;
  clients?: Client[];
  taxes: Tax[];
  setTaxes: React.Dispatch<React.SetStateAction<Tax[]>>;
}

const TaxTracker: React.FC<TaxTrackerProps> = ({ focusedClient, userRole, clients = [], taxes, setTaxes }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTax, setNewTax] = useState({ name: 'DAS - Simples Nacional', amount: '', dueDate: '', clientId: '', file: null as File | null });

  const isAdmin = userRole === UserRole.ADMIN;

  const filteredTaxes = useMemo(() => {
    return taxes.filter(tax => focusedClient ? tax.clientId === focusedClient.id : true);
  }, [taxes, focusedClient]);

  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    const tax: Tax = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTax.name,
      amount: parseFloat(newTax.amount),
      dueDate: newTax.dueDate,
      status: 'pending',
      clientId: focusedClient?.id || newTax.clientId,
    };
    setTaxes(prev => [tax, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Impostos e Guias</h2>
          <p className="text-slate-500 text-sm">{focusedClient ? `Guia exclusiva de ${focusedClient.name}` : 'Visão consolidada do escritório.'}</p>
        </div>
        {isAdmin && <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">Nova Guia</button>}
      </header>

      {filteredTaxes.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-3xl text-slate-400 font-black uppercase text-xs">Sem guias lançadas para esta empresa.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTaxes.map(tax => (
            <div key={tax.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-[9px] font-black uppercase text-blue-600">Vencimento: {tax.dueDate}</span>
              <h3 className="font-black text-slate-800 mt-2">{tax.name}</h3>
              <p className="text-xl font-black text-slate-900 mt-1">R$ {tax.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-xl font-black uppercase mb-6">Lançamento de Imposto</h3>
            <form onSubmit={handleAddTax} className="space-y-4">
              {!focusedClient && (
                <select required value={newTax.clientId} onChange={(e) => setNewTax({...newTax, clientId: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold">
                  <option value="">Selecione a Empresa</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <input required type="number" placeholder="Valor" value={newTax.amount} onChange={(e) => setNewTax({...newTax, amount: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
              <input required type="date" value={newTax.dueDate} onChange={(e) => setNewTax({...newTax, dueDate: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">Publicar Guia</button>
              <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-slate-400 font-bold uppercase text-xs">Fechar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxTracker;

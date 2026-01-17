
import React, { useState, useMemo } from 'react';
import { Revenue, Client, User } from '../types';

interface RevenueScheduleProps {
  focusedClient?: Client | null;
  revenues: Revenue[];
  setRevenues: React.Dispatch<React.SetStateAction<Revenue[]>>;
  selectedMonthIdx: number;
  setSelectedMonthIdx: (idx: number) => void;
  currentUser: User | null;
}

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const RevenueSchedule: React.FC<RevenueScheduleProps> = ({ focusedClient, revenues, setRevenues, selectedMonthIdx, setSelectedMonthIdx, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client: '', amount: '', date: new Date().toISOString().split('T')[0],
    status: 'received' as 'received' | 'expected',
    entryType: 'inflow' as 'inflow' | 'outflow',
    description: ''
  });

  // ISOLAMENTO DE DADOS (Mandatário)
  const filteredByClient = useMemo(() => {
    return focusedClient ? revenues.filter(r => r.clientId === focusedClient.id) : [];
  }, [revenues, focusedClient]);

  const filteredRevenues = useMemo(() => {
    return filteredByClient.filter(rev => {
      const m = parseInt(rev.date.split('-')[1]) - 1;
      return m === selectedMonthIdx && 
             (rev.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
              rev.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredByClient, selectedMonthIdx, searchTerm]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedClient) { alert("Erro: Contexto de empresa não definido."); return; }
    
    if (editingId) {
      setRevenues(prev => prev.map(r => r.id === editingId ? {
        ...r,
        client: formData.client,
        amount: parseFloat(formData.amount),
        date: formData.date,
        status: formData.status,
        entryType: formData.entryType,
        description: formData.description,
      } : r));
    } else {
      const newRev: Revenue = {
        id: `REV_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        client: formData.client,
        amount: parseFloat(formData.amount),
        date: formData.date,
        status: formData.status,
        entryType: formData.entryType,
        description: formData.description,
        source: 'manual',
        clientId: focusedClient.id,
        createdBy: currentUser?.id
      };
      setRevenues(prev => [newRev, ...prev]);
    }
    setShowModal(false);
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <header className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Memória Financeira</p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Extrato Histórico</h2>
        </div>
        <button 
          onClick={() => { setEditingId(null); setShowModal(true); }}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
        >
          Novo Lançamento
        </button>
      </header>

      <div className="grid grid-cols-4 md:grid-cols-12 gap-2">
        {months.map((m, idx) => (
          <button
            key={m}
            onClick={() => setSelectedMonthIdx(idx)}
            className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
              selectedMonthIdx === idx ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            {m.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="px-8 py-5">Data</th>
              <th className="px-8 py-5">Descrição</th>
              <th className="px-8 py-5 text-right">Valor</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRevenues.length > 0 ? filteredRevenues.map(rev => (
              <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-black text-slate-600 text-xs">{rev.date.split('-').reverse().join('/')}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-800 text-sm">{rev.client}</p>
                  <p className="text-[10px] text-slate-400">{rev.description}</p>
                </td>
                <td className={`px-8 py-5 text-right font-black ${rev.entryType === 'inflow' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {rev.entryType === 'inflow' ? '+' : '-'} {fmt(rev.amount)}
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => setRevenues(prev => prev.filter(r => r.id !== rev.id))} className="text-red-400 hover:text-red-600 text-xs font-black">EXCLUIR</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Sem registros permanentemente salvos neste mês.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase">Novo Registro Permanente</h3>
            <form onSubmit={handleSave} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input required placeholder="Descrição" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
                 <input required type="number" placeholder="Valor" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
                 <select value={formData.entryType} onChange={e => setFormData({...formData, entryType: e.target.value as any})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold">
                    <option value="inflow">Entrada</option>
                    <option value="outflow">Saída</option>
                 </select>
               </div>
               <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase">Salvar no Histórico</button>
               <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-black uppercase text-xs">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueSchedule;

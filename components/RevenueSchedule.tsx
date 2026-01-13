
import React, { useState, useMemo } from 'react';
import { Revenue, Client, User, UserRole, ProductCategory } from '../types';

interface RevenueScheduleProps {
  focusedClient?: Client | null;
  revenues: Revenue[];
  setRevenues: React.Dispatch<React.SetStateAction<Revenue[]>>;
  selectedMonthIdx: number;
  setSelectedMonthIdx: (idx: number) => void;
  currentUser: User | null;
  adminVisualizationMode?: boolean;
}

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const RevenueSchedule: React.FC<RevenueScheduleProps> = ({ focusedClient, revenues, setRevenues, selectedMonthIdx, setSelectedMonthIdx, currentUser, adminVisualizationMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isClient = currentUser?.role === UserRole.CLIENT;

  // No modo visualização, o admin NÃO altera nada (conforme solicitado)
  const isReadOnlyMode = (isAdmin && adminVisualizationMode) || isClient;

  const [formData, setFormData] = useState({
    client: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0],
    status: 'received' as 'received' | 'expected',
    entryType: 'inflow' as 'inflow' | 'outflow',
    activityType: 'service' as 'service' | 'commerce',
    productCategory: 'normal' as ProductCategory,
    isPisCofinsExempt: false,
    description: ''
  });

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

  const handleEdit = (rev: Revenue) => {
    if (isReadOnlyMode) return; 
    setEditingId(rev.id);
    setFormData({
      client: rev.client,
      amount: rev.amount.toString(),
      date: rev.date,
      status: rev.status,
      entryType: rev.entryType,
      activityType: rev.activityType,
      productCategory: rev.productCategory,
      isPisCofinsExempt: rev.isPisCofinsExempt,
      description: rev.description || ''
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedClient) { alert("Erro: Selecione uma empresa."); return; }
    
    const revenueData: Revenue = {
      id: editingId || `REV_${Date.now()}`,
      client: formData.client,
      amount: parseFloat(formData.amount),
      date: formData.date,
      status: formData.status,
      entryType: formData.entryType,
      activityType: formData.activityType,
      productCategory: formData.productCategory,
      isPisCofinsExempt: (isAdmin && !adminVisualizationMode) ? formData.isPisCofinsExempt : false,
      description: formData.description,
      source: 'manual',
      clientId: focusedClient.id,
      createdBy: currentUser?.id
    };

    if (editingId) {
      setRevenues(prev => prev.map(r => r.id === editingId ? revenueData : r));
    } else {
      setRevenues(prev => [revenueData, ...prev]);
    }
    setShowModal(false);
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <header className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Memória Financeira</p>
            {isAdmin && adminVisualizationMode && <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Modo Visualização</span>}
            {isAdmin && !adminVisualizationMode && <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Admin View</span>}
            {isClient && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded-full uppercase tracking-tighter">Somente Leitura de Histórico</span>}
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Extrato do Cliente</h2>
        </div>
        {/* Mesmo o cliente pode lançar, conforme regra 3. Admin em modo visualização conforme regra 3 não altera o que já existe */}
        <button 
          onClick={() => { setEditingId(null); setShowModal(true); setFormData({...formData, client: '', amount: '', description: ''}); }}
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
              <th className="px-8 py-5">Atividade</th>
              <th className="px-8 py-5">Natureza Fiscal</th>
              <th className="px-8 py-5 text-right">Valor</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRevenues.map(rev => (
              <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 font-black text-slate-600 text-xs">{rev.date.split('-').reverse().join('/')}</td>
                <td className="px-8 py-5">
                   <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${rev.activityType === 'commerce' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {rev.activityType === 'commerce' ? 'Comércio' : 'Serviço'}
                   </span>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-col space-y-1">
                      <span className={`w-fit px-2 py-1 rounded text-[9px] font-black uppercase ${
                        rev.productCategory === 'monofasico' ? 'bg-amber-100 text-amber-700' : 
                        rev.productCategory === 'isento' ? 'bg-purple-100 text-purple-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rev.productCategory === 'monofasico' ? 'Monofásico' : 
                         rev.productCategory === 'isento' ? 'Isento' : 'Normal'}
                      </span>
                   </div>
                </td>
                <td className={`px-8 py-5 text-right font-black ${rev.entryType === 'inflow' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {rev.entryType === 'inflow' ? '+' : '-'} {fmt(rev.amount)}
                </td>
                <td className="px-8 py-5 text-right">
                  {!isReadOnlyMode ? (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleEdit(rev)} className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase">Editar</button>
                      <button onClick={() => setRevenues(prev => prev.filter(r => r.id !== rev.id))} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase">Excluir</button>
                    </div>
                  ) : (
                    <span className="text-[8px] font-black text-slate-300 uppercase italic">Confirmado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl space-y-6">
            <header className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase">Lançamento Financeiro</h3>
              {isAdmin && !adminVisualizationMode && <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase">Admin Control</span>}
              {adminVisualizationMode && <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[9px] font-black rounded-full uppercase">Modo Observador</span>}
            </header>
            
            <form onSubmit={handleSave} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input required placeholder="Descrição" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" />
                 <input required type="number" placeholder="Valor" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <select value={formData.activityType} onChange={e => setFormData({...formData, activityType: e.target.value as any})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none">
                    <option value="service">Serviços</option>
                    <option value="commerce">Comércio</option>
                 </select>
                 <select value={formData.productCategory} onChange={e => setFormData({...formData, productCategory: e.target.value as ProductCategory})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none">
                    <option value="normal">Produto Normal</option>
                    <option value="monofasico">Produto Monofásico</option>
                    <option value="isento">Produto Isento</option>
                 </select>
               </div>

               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Competência</label>
                 <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" />
               </div>

               {isAdmin && !adminVisualizationMode && (
                 <div className="p-6 bg-slate-900 rounded-3xl border border-white/10 space-y-4">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">Controle Fiscal Administrativo</p>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, isPisCofinsExempt: !formData.isPisCofinsExempt})}>
                       <span className="text-xs font-bold text-white">Suspender PIS/COFINS Manualmente</span>
                       <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isPisCofinsExempt ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isPisCofinsExempt ? 'left-6' : 'left-1'}`}></div>
                       </div>
                    </div>
                 </div>
               )}

               <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">{editingId ? 'Salvar Edição' : 'Concluir Lançamento'}</button>
               <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-black uppercase text-xs">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueSchedule;


import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Client, TaxAnexo, UserRole, Revenue } from '../types';
import { calculateSimplesNacional, calculateLucroPresumido } from '../services/taxCalculator';

interface PlanningDoc {
  id: string;
  name: string;
  date: string;
  size: string;
  url: string;
}

interface TaxConsultancyProps {
  focusedClient?: Client | null;
  userRole?: UserRole;
  revenues?: Revenue[];
  selectedMonthIdx?: number;
}

const TaxConsultancy: React.FC<TaxConsultancyProps> = ({ focusedClient, userRole, revenues = [], selectedMonthIdx = new Date().getMonth() }) => {
  // Sincronização automática de faturamento a partir do extrato manual
  const revenueFromExtract = useMemo(() => {
    const relevant = focusedClient ? revenues.filter(r => r.clientId === focusedClient.id) : revenues;
    return relevant
      .filter(r => {
        const m = parseInt(r.date.split('-')[1]) - 1;
        return m === selectedMonthIdx && r.entryType === 'inflow';
      })
      .reduce((acc, r) => acc + r.amount, 0);
  }, [revenues, focusedClient, selectedMonthIdx]);

  // RBT12 calculado a partir dos últimos 12 meses de lançamentos no extrato (ou acumulado do ano no demo)
  const rbt12FromExtract = useMemo(() => {
    const relevant = focusedClient ? revenues.filter(r => r.clientId === focusedClient.id) : revenues;
    return relevant
      .filter(r => r.entryType === 'inflow')
      .reduce((acc, r) => acc + r.amount, 0);
  }, [revenues, focusedClient]);

  // Parâmetros de simulação (ainda editáveis, exceto o faturamento que vem do extrato)
  const [payroll, setPayroll] = useState<number>(revenueFromExtract * 0.28);
  const [activity, setActivity] = useState<'service' | 'commerce'>(focusedClient?.taxAnexo === 'I' ? 'commerce' : 'service');
  const [anexo, setAnexo] = useState<TaxAnexo>(focusedClient?.taxAnexo || 'III');
  
  const [planningDocs, setPlanningDocs] = useState<PlanningDoc[]>([
    { id: '1', name: 'Estudo de Viabilidade Simples vs Presumido 2024.pdf', date: '2024-02-10', size: '1.4 MB', url: '#' },
    { id: '2', name: 'Análise de Fator R - Planejamento Semestral.pdf', date: '2024-05-15', size: '850 KB', url: '#' }
  ]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === UserRole.ADMIN;

  const comparisonData = useMemo(() => {
    // Usa obrigatoriamente o faturamento do extrato
    const simples = calculateSimplesNacional(rbt12FromExtract, revenueFromExtract, anexo);
    const presumido = calculateLucroPresumido(revenueFromExtract, payroll, activity);

    const winner = simples.taxAmount < presumido.total ? 'Simples Nacional' : 'Lucro Presumido';
    const difference = Math.abs(simples.taxAmount - presumido.total);

    return {
      simples,
      presumido,
      winner,
      difference,
      chartData: [
        { name: 'Simples Nacional', total: simples.taxAmount, fill: '#3b82f6' },
        { name: 'Lucro Presumido', total: presumido.total, fill: '#64748b' }
      ]
    };
  }, [revenueFromExtract, rbt12FromExtract, payroll, activity, anexo]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setUploadProgress(0);

      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 150));
      }

      const newDoc: PlanningDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: URL.createObjectURL(file)
      };

      setPlanningDocs(prev => [newDoc, ...prev]);
      setIsUploading(false);
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Consultoria & Planejamento</p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Análise de Carga Tributária</h2>
          <p className="text-slate-500 text-sm">Baseado no faturamento de <b>{fmt(revenueFromExtract)}</b> detectado no extrato.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center space-x-4">
           <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">🏆</div>
           <div>
             <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Melhor Regime</p>
             <h4 className="text-sm font-black text-emerald-900">{revenueFromExtract > 0 ? comparisonData.winner : 'Aguardando Lançamentos'}</h4>
             <p className="text-[10px] text-emerald-700 font-bold">Economia: {fmt(comparisonData.difference)} /mês</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Dados Dinâmicos (Sincronizados)</h3>
            
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 relative group overflow-hidden">
              <div className="absolute top-2 right-2 text-blue-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Faturamento Mensal Real</p>
              <p className="text-xl font-black text-blue-900">{fmt(revenueFromExtract)}</p>
              <p className="text-[9px] text-blue-700 mt-1 font-bold italic underline">Sincronizado com Extrato Financeiro</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                <span>Folha de Pagamento</span>
                <span className="text-blue-600">{revenueFromExtract > 0 ? ((payroll / revenueFromExtract) * 100).toFixed(0) : '0'}% da receita</span>
              </label>
              <input 
                type="number" 
                value={payroll} 
                onChange={(e) => setPayroll(Number(e.target.value))}
                className="w-full p-4 border rounded-2xl bg-slate-50 focus:bg-white transition-all outline-none font-bold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Atividade Econômica</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => setActivity('service')}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activity === 'service' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >Serviços</button>
                <button 
                  onClick={() => setActivity('commerce')}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activity === 'commerce' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >Comércio</button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo p/ Simulação</label>
              <select value={anexo} onChange={(e) => setAnexo(e.target.value as TaxAnexo)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none">
                <option value="I">Anexo I (Comércio)</option>
                <option value="II">Anexo II (Indústria)</option>
                <option value="III">Anexo III (Serviços)</option>
                <option value="IV">Anexo IV (Serviços + CPP)</option>
                <option value="V">Anexo V (Serviços + Fator R)</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Estudos Anexados</h3>
              {isAdmin && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all"
                >
                  Anexar PDF
                </button>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </div>

            <div className="space-y-2">
              {planningDocs.map(doc => (
                <div key={doc.id} className="group p-3 border border-slate-50 bg-slate-50/30 rounded-2xl flex items-center justify-between hover:bg-white hover:border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-9 h-9 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:text-blue-500 group-hover:border-blue-200 transition-all shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-slate-800 leading-tight truncate">{doc.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[350px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Comparativo de Encargos Mensais</h3>
            {revenueFromExtract > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    formatter={(value: number) => [fmt(value), 'Total Estimado']}
                  />
                  <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={60}>
                    {comparisonData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p className="text-[10px] font-black uppercase tracking-widest">Lance valores no extrato para ver o gráfico</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden">
              <div className="absolute -bottom-2 -right-2 text-blue-100/50 transform rotate-12 scale-150">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15 11a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
              </div>
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Simulação Simples Nacional</h4>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">Alíquota Efetiva:</span>
                  <span className="text-sm font-black text-slate-800">{(comparisonData.simples.effectiveRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">Guia DAS:</span>
                  <span className="text-sm font-black text-blue-600">{fmt(comparisonData.simples.taxAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Simulação Lucro Presumido</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Total Encargos:</span>
                  <span className="text-sm font-black text-slate-900">{fmt(comparisonData.presumido.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black text-amber-600 bg-amber-50 p-1 rounded">
                  <span>Diferença Mensal:</span>
                  <span>{fmt(comparisonData.difference)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
           <div className="flex-1 space-y-4">
             <h3 className="text-xl font-black tracking-tight">Análise em Tempo Real</h3>
             <p className="text-slate-400 text-sm leading-relaxed">
                Este painel está conectado diretamente ao seu <b>Extrato Financeiro</b>. Qualquer adição ou alteração nos lançamentos manuais refletirá imediatamente nesta análise de carga tributária, garantindo precisão total no seu planejamento fiscal.
             </p>
           </div>
           <div className="w-full md:w-72 bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-center">
             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Conclusão Baseada no Extrato</p>
             <p className="text-xs text-slate-200">
               {revenueFromExtract > 0 ? (
                 <>O regime <b>{comparisonData.winner}</b> é o mais eficiente hoje, economizando <b>{fmt(comparisonData.difference * 12)}/ano</b>.</>
               ) : (
                 'Nenhum dado financeiro manual encontrado para conclusão.'
               )}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaxConsultancy;

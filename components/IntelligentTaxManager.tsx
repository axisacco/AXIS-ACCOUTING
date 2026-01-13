
import React, { useMemo } from 'react';
import { Client, Revenue, TaxAnexo, TaxRules } from '../types';
import { calculateSimplesNacional, calculateLucroPresumidoAdvanced } from '../services/taxCalculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IntelligentTaxManagerProps {
  focusedClient?: Client | null;
  revenues: Revenue[];
  selectedMonthIdx: number;
  taxRules: TaxRules;
}

const IntelligentTaxManager: React.FC<IntelligentTaxManagerProps> = ({ focusedClient, revenues, selectedMonthIdx, taxRules }) => {
  const currentMonthRevenues = useMemo(() => {
    return focusedClient 
      ? revenues.filter(r => {
          const d = new Date(r.date);
          return r.clientId === focusedClient.id && d.getMonth() === selectedMonthIdx && r.entryType === 'inflow';
        })
      : [];
  }, [revenues, focusedClient, selectedMonthIdx]);

  const stats = useMemo(() => {
    const totalInvoiced = currentMonthRevenues.reduce((acc, r) => acc + r.amount, 0);
    const rbt12 = focusedClient?.annualRevenue || 0;
    const anexo = focusedClient?.taxAnexo || 'III';

    const simples = calculateSimplesNacional(rbt12, totalInvoiced, anexo);
    const presumido = calculateLucroPresumidoAdvanced(currentMonthRevenues, taxRules);

    const isSimplesBetter = simples.taxAmount <= presumido.total;
    const economy = Math.abs(simples.taxAmount - presumido.total);
    
    let score = 100;
    if (totalInvoiced > 0) {
      const optimalTax = Math.min(simples.taxAmount, presumido.total);
      const efficiency = optimalTax / simples.taxAmount;
      score = Math.floor(efficiency * 100);
    }

    return {
      simples,
      presumido,
      isSimplesBetter,
      economy,
      score,
      totalInvoiced
    };
  }, [currentMonthRevenues, focusedClient, taxRules]);

  const chartData = [
    { name: 'Simples Nacional', total: stats.simples.taxAmount, color: '#3b82f6' },
    { name: 'Lucro Presumido', total: stats.presumido.total, color: '#64748b' }
  ];

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (!focusedClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <div className="text-6xl opacity-20">📡</div>
        <p className="font-black uppercase text-xs tracking-[0.3em]">Selecione uma empresa para consolidar o regime</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="bg-slate-900 text-white p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-3 flex-1">
             <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 border border-blue-500/30">
                Consolidação de Regime Tributário
             </div>
             <h2 className="text-4xl font-black tracking-tighter leading-none">Análise de Eficiência Fiscal</h2>
             <p className="text-slate-400 text-sm max-w-xl font-medium">
               Aqui a IA consolida regimes tributários e mostra o caminho de menor imposto baseado na Matriz de Regras do Administrador.
             </p>
           </div>

           <div className="w-full md:w-auto flex flex-col items-center justify-center p-8 bg-white/5 rounded-[2rem] border border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Score de Saúde Fiscal</p>
              <div className="text-6xl font-black text-blue-500 tracking-tighter">{stats.score}</div>
              <div className="mt-2 h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.score}%` }}></div>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
           <div className={`p-8 rounded-[2.5rem] border-2 shadow-sm transition-all flex items-center justify-between ${
             stats.isSimplesBetter ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
           }`}>
              <div className="space-y-1">
                 <p className={`text-[10px] font-black uppercase tracking-widest ${stats.isSimplesBetter ? 'text-emerald-600' : 'text-blue-600'}`}>Regime mais vantajoso no momento</p>
                 <h3 className="text-2xl font-black text-slate-900">{stats.isSimplesBetter ? 'Simples Nacional' : 'Lucro Presumido'}</h3>
                 <p className="text-xs font-bold text-slate-500">
                    Sua tributação atual estimada é {fmt(stats.simples.taxAmount)} e a otimizada seria {fmt(Math.min(stats.simples.taxAmount, stats.presumido.total))}.
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase">Economia Potencial</p>
                 <p className={`text-2xl font-black ${stats.economy > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{fmt(stats.economy)}</p>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Custo Mensal Comparativo</h4>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                       <YAxis hide />
                       <Tooltip 
                         cursor={{fill: '#f8fafc'}}
                         contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                         formatter={(value: number) => [fmt(value), 'Imposto Consolidado']}
                       />
                       <Bar dataKey="total" radius={[12, 12, 0, 0]} barSize={60}>
                          {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo Operacional (Regras Admin)</h4>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                    <p className="text-xs font-black text-slate-700 uppercase">Isento PIS/COFINS Identificado</p>
                    <p className="text-sm font-black text-slate-900">
                      {fmt(currentMonthRevenues.filter(r => {
                        if (r.productCategory === 'monofasico') return !taxRules.monofasicoHasPisCofins;
                        if (r.productCategory === 'isento') return !taxRules.isentoHasPisCofins;
                        return false;
                      }).reduce((a, b) => a + b.amount, 0))}
                    </p>
                 </div>

                 <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                       A incidência de PIS/COFINS sobre produtos <b>Monofásicos</b> e <b>Isentos</b> foi configurada como: 
                       <br/><b>{taxRules.monofasicoHasPisCofins ? 'ATIVA' : 'SUSPENSA'}</b> e <b>{taxRules.isentoHasPisCofins ? 'ATIVA' : 'SUSPENSA'}</b> respectivamente.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentTaxManager;

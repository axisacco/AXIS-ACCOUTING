
import React, { useState, useMemo } from 'react';
import { Client, Revenue, Employee } from '../types';
import { calculateSimplesNacional } from '../services/taxCalculator';
import { calculatePayrollProvisions } from '../services/payrollCalculator';

interface IndicadoresProps {
  focusedClient?: Client | null;
  revenues?: Revenue[];
  employees?: Employee[];
}

type Period = 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';

const Indicadores: React.FC<IndicadoresProps> = ({ focusedClient, revenues = [], employees = [] }) => {
  const [period, setPeriod] = useState<Period>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const isWithinPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch (period) {
      case 'daily': return date.getTime() === now.getTime();
      case 'weekly': {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return date >= oneWeekAgo && date <= now;
      }
      case 'monthly': return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'annual': return date.getFullYear() === now.getFullYear();
      case 'custom': {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      default: return true;
    }
  };

  const metrics = useMemo(() => {
    const relevantRevenues = focusedClient ? revenues.filter(r => r.clientId === focusedClient.id) : revenues;
    const relevantEmployees = focusedClient ? employees.filter(e => e.clientId === focusedClient.id) : employees;
    const filteredRevenues = relevantRevenues.filter(r => isWithinPeriod(r.date));

    // 1. TOTAL DE ENTRADAS
    const totalEntradas = filteredRevenues.filter(r => r.entryType === 'inflow').reduce((acc, r) => acc + r.amount, 0);

    // 2. TOTAL DE SAÍDAS (INVESTIMENTO)
    const outflowManual = filteredRevenues.filter(r => r.entryType === 'outflow').reduce((acc, r) => acc + r.amount, 0);
    
    const monthlyTotalCost = relevantEmployees.reduce((acc, e) => {
      const provisions = calculatePayrollProvisions(e.salary);
      return acc + provisions.totalEmployerCost;
    }, 0);
    
    let periodPayroll = 0;
    if (period === 'custom') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      periodPayroll = (monthlyTotalCost / 30) * diffDays;
    } else {
      if (period === 'daily') periodPayroll = monthlyTotalCost / 30;
      else if (period === 'weekly') periodPayroll = (monthlyTotalCost / 30) * 7;
      else if (period === 'monthly') periodPayroll = monthlyTotalCost;
      else if (period === 'annual') periodPayroll = monthlyTotalCost * 12;
    }

    const rbt12 = focusedClient?.annualRevenue || 180000;
    const anexo = focusedClient?.taxAnexo || 'III';
    const taxInfo = calculateSimplesNacional(rbt12, totalEntradas, anexo);
    const dasAmount = taxInfo.taxAmount;

    const totalSaidas = outflowManual + periodPayroll + dasAmount;

    // 3. LUCRO LÍQUIDO REAL
    const lucroLiquidoReal = totalEntradas - totalSaidas;

    // 4. ROI (%)
    const roi = totalSaidas > 0 ? (lucroLiquidoReal / totalSaidas) * 100 : 0;

    return {
      totalEntradas,
      totalSaidas,
      lucroLiquidoReal,
      roi,
      dasAmount,
      periodPayroll,
      outflowManual
    };
  }, [revenues, employees, focusedClient, period, startDate, endDate]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* SELETOR DE PERÍODO */}
      <header className="flex flex-col gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">📈</div>
             <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Indicadores de Performance</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise de ROI e Rentabilidade Real</p>
             </div>
          </div>
          <div className="flex flex-wrap justify-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {(['daily', 'weekly', 'monthly', 'annual', 'custom'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p === 'daily' ? 'Hoje' : p === 'weekly' ? 'Semana' : p === 'monthly' ? 'Mês' : p === 'annual' ? 'Ano' : 'Custom'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ROI CARD - DESTAQUE */}
        <div className="lg:col-span-1 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full"></div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">ROI REAL (EFICIÊNCIA)</p>
              <div className="flex items-end space-x-2">
                 <h3 className="text-7xl font-black tracking-tighter text-blue-400">
                    {metrics.roi.toFixed(1)}<span className="text-3xl">%</span>
                 </h3>
              </div>
           </div>
           <div className="space-y-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, metrics.roi))}%` }}></div>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 Retorno sobre cada real investido na operação.
              </p>
           </div>
        </div>

        {/* LUCRO LÍQUIDO REAL */}
        <div className="lg:col-span-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">LUCRO LÍQUIDO REAL</p>
              <h3 className={`text-5xl font-black tracking-tighter ${metrics.lucroLiquidoReal >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                {fmt(metrics.lucroLiquidoReal)}
              </h3>
           </div>
           <div className="pt-8 border-t border-slate-50 mt-8 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-slate-400">Entradas (+)</span>
                 <span className="text-emerald-500">{fmt(metrics.totalEntradas)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-slate-400">Saídas (-)</span>
                 <span className="text-red-400">{fmt(metrics.totalSaidas)}</span>
              </div>
           </div>
        </div>

        {/* INVESTIMENTO TOTAL */}
        <div className="lg:col-span-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">INVESTIMENTO (SAÍDAS)</p>
              <h3 className="text-5xl font-black tracking-tighter text-slate-900">
                {fmt(metrics.totalSaidas)}
              </h3>
           </div>
           <div className="pt-8 border-t border-slate-50 mt-8 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-slate-400">Op. / Variáveis</span>
                 <span className="text-slate-700">{fmt(metrics.outflowManual)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-slate-400">Folha de Pagamento</span>
                 <span className="text-slate-700">{fmt(metrics.periodPayroll)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                 <span className="text-slate-400">Impostos (DAS)</span>
                 <span className="text-blue-600">{fmt(metrics.dasAmount)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* FOOTER - FÓRMULAS */}
      <footer className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Memória de Cálculo e Metodologia</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
               <p className="text-[9px] font-black text-slate-500 uppercase">Lucro Líquido Real</p>
               <p className="text-[11px] font-bold text-slate-400">Total de Entradas − Total de Saídas</p>
            </div>
            <div className="text-center space-y-2">
               <p className="text-[9px] font-black text-slate-500 uppercase">Investimento</p>
               <p className="text-[11px] font-bold text-slate-400">Total de Saídas (Fixo + Var + Impostos)</p>
            </div>
            <div className="text-center space-y-2">
               <p className="text-[9px] font-black text-slate-500 uppercase">ROI (%)</p>
               <p className="text-[11px] font-bold text-slate-400">(Lucro Líquido Real / Total de Saídas) × 100</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Indicadores;

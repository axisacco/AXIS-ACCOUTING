
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FinancialMetric, Client, UserRole, Revenue, Employee } from '../types';

interface DashboardProps {
  focusedClient?: Client | null;
  userRole?: UserRole;
  revenues?: Revenue[];
  employees?: Employee[];
}

type Period = 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';

const Dashboard: React.FC<DashboardProps> = ({ focusedClient, userRole, revenues = [], employees = [] }) => {
  const [period, setPeriod] = useState<Period>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filtro de Datas Reativo e Dinâmico
  const isWithinPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch (period) {
      case 'daily':
        return date.getTime() === now.getTime();
      case 'weekly': {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return date >= oneWeekAgo && date <= now;
      }
      case 'monthly':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'annual':
        return date.getFullYear() === now.getFullYear();
      case 'custom': {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      default:
        return true;
    }
  };

  // Cálculos Consolidados Reativos
  const summary = useMemo(() => {
    const relevantRevenues = focusedClient 
      ? revenues.filter(r => r.clientId === focusedClient.id) 
      : revenues;
    
    const relevantEmployees = focusedClient
      ? employees.filter(e => e.clientId === focusedClient.id)
      : employees;

    const filteredRevenues = relevantRevenues.filter(r => isWithinPeriod(r.date));
    
    const inflow = filteredRevenues.filter(r => r.entryType === 'inflow').reduce((acc, r) => acc + r.amount, 0);
    const outflowManual = filteredRevenues.filter(r => r.entryType === 'outflow').reduce((acc, r) => acc + r.amount, 0);
    
    // Cálculo Proporcional da Folha de Pagamento
    const monthlyPayroll = relevantEmployees.reduce((acc, e) => acc + e.salary, 0);
    let periodPayroll = 0;
    
    if (period === 'custom') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      periodPayroll = (monthlyPayroll / 30) * diffDays;
    } else {
      if (period === 'daily') periodPayroll = monthlyPayroll / 30;
      else if (period === 'weekly') periodPayroll = (monthlyPayroll / 30) * 7;
      else if (period === 'monthly') periodPayroll = monthlyPayroll;
      else if (period === 'annual') periodPayroll = monthlyPayroll * 12;
    }

    const totalExpenses = outflowManual + periodPayroll;
    const profit = inflow - totalExpenses;
    const margin = inflow > 0 ? (profit / inflow) * 100 : 0;
    const debtRatio = inflow > 0 ? (totalExpenses / inflow) * 100 : 0;

    // Score de Saúde Axis (Algoritmo Dinâmico)
    let healthScore = 50;
    if (inflow > 0) {
      healthScore += (margin / 2);
      healthScore -= (debtRatio / 4);
    } else if (totalExpenses > 0) {
      healthScore = 20; // Alerta se houver apenas gastos
    }
    healthScore = Math.min(100, Math.max(0, healthScore));

    // Ponto de Equilíbrio Estimado
    const breakEven = totalExpenses / 0.75; // Considerando margem operacional de 25%

    // Métricas de Capital Humano
    const totalExtraHours = relevantEmployees.reduce((acc, emp) => {
      const logs = emp.journeyLogs?.filter(l => isWithinPeriod(l.date)) || [];
      return acc + logs.filter(l => l.type === 'overtime').reduce((sum, l) => sum + l.hours, 0);
    }, 0);

    const totalAbsences = relevantEmployees.reduce((acc, emp) => {
      const logs = emp.journeyLogs?.filter(l => isWithinPeriod(l.date)) || [];
      return acc + logs.filter(l => l.type === 'absence').reduce((sum, l) => sum + l.hours, 0);
    }, 0);

    // Agrupamento para Gráfico
    const chartData = filteredRevenues
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        name: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        value: r.amount,
        type: r.entryType
      }));

    return {
      inflow,
      outflow: totalExpenses,
      profit,
      margin,
      debtRatio,
      healthScore,
      breakEven,
      people: {
        count: relevantEmployees.length,
        payroll: periodPayroll,
        extraHours: totalExtraHours,
        absences: totalAbsences
      },
      chartData
    };
  }, [revenues, employees, focusedClient, period, startDate, endDate]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SELETOR DE PERÍODO OBRIGATÓRIO (DIÁRIO, SEMANAL, MENSAL, ANUAL, PERSONALIZADO) */}
      <header className="flex flex-col gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-xl">📊</div>
             <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Dashboard Axis</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle de Período Reativo</p>
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
                {p === 'daily' ? 'Hoje' : p === 'weekly' ? 'Semana' : p === 'monthly' ? 'Mês' : p === 'annual' ? 'Ano' : 'Personalizado'}
              </button>
            ))}
          </div>
        </div>

        {/* CONTROLES DE DATA PERSONALIZADA */}
        {period === 'custom' && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fim:</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
      </header>

      {/* KPIs FINANCEIROS RECALCULADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(summary.inflow)}</p>
          <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-500 uppercase">
             <span className="mr-1">▲</span> {period === 'custom' ? 'Período Selecionado' : 'Calculado p/ Período'}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Despesas (Saídas + Folha)</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(summary.outflow)}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest">Custo Operacional Total</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lucro do Período</p>
          <p className={`text-3xl font-black tracking-tighter ${summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {fmt(summary.profit)}
          </p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, summary.margin))}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🛡️</div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Score de Saúde Axis</p>
          <div className="flex items-end space-x-2">
            <p className="text-5xl font-black text-white tracking-tighter">{summary.healthScore.toFixed(0)}</p>
            <p className="text-xs font-bold text-slate-500 mb-1.5">/ 100</p>
          </div>
          <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${summary.healthScore > 75 ? 'text-emerald-400' : summary.healthScore > 40 ? 'text-blue-400' : 'text-red-400'}`}>
            {summary.healthScore > 75 ? 'Saúde Excelente' : summary.healthScore > 40 ? 'Saúde Estável' : 'Atenção Crítica'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GRÁFICO ADAPTATIVO */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <header className="flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolução de Entradas</h3>
             <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                   <span className="text-[9px] font-black uppercase text-slate-500">Créditos</span>
                </div>
             </div>
          </header>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.chartData.length > 0 ? summary.chartData : [{name: '-', value: 0}]}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#cbd5e1'}} dy={10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold'}}
                  formatter={(value: number) => fmt(value)}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorInflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-50">
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Margem Operacional</p>
                <p className="text-lg font-black text-slate-800">{summary.margin.toFixed(1)}%</p>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Ponto Equilíbrio</p>
                <p className="text-lg font-black text-slate-800">{fmt(summary.breakEven)}</p>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Endividamento</p>
                <p className="text-lg font-black text-slate-800">{summary.debtRatio.toFixed(1)}%</p>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Provisão Folha</p>
                <p className="text-lg font-black text-blue-600">{fmt(summary.people.payroll)}</p>
             </div>
          </div>
        </div>

        {/* INDICADORES DE PESSOAS DO PERÍODO */}
        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white space-y-8 flex flex-col justify-between">
           <div>
              <header className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestão de Pessoas</h3>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[8px] font-black uppercase">Reativo</span>
              </header>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">👥</div>
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase">Equipe</p>
                          <p className="text-lg font-black">{summary.people.count} Ativos</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Horas Extras (+)</span>
                       <span className="text-sm font-black text-emerald-400">{summary.people.extraHours}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Faltas / Atrasos (-)</span>
                       <span className="text-sm font-black text-red-400">{summary.people.absences}h</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Custo Folha Periodo</span>
                       <span className="text-sm font-black text-blue-400">{fmt(summary.people.payroll)}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/5">
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] text-center">
                 DADOS SINCRONIZADOS COM REPOSITÓRIO CENTRAL AXIS
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

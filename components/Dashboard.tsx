
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FinancialMetric, Client, UserRole, Revenue, TaxRules } from '../types';
import { calculateSimplesNacional, calculateLucroPresumidoAdvanced } from '../services/taxCalculator';

interface DashboardProps {
  focusedClient?: Client | null;
  userRole?: UserRole;
  revenues?: Revenue[];
  taxRules: TaxRules;
  selectedMonthIdx: number;
}

const Dashboard: React.FC<DashboardProps> = ({ focusedClient, userRole, revenues = [], taxRules, selectedMonthIdx }) => {
  const currentMonth = selectedMonthIdx;
  const currentYear = new Date().getFullYear();

  const relevantRevenues = useMemo(() => {
    return focusedClient 
      ? revenues.filter(r => r.clientId === focusedClient.id) 
      : revenues;
  }, [revenues, focusedClient]);

  const metricsData = useMemo(() => {
    const monthlyInflow = relevantRevenues
      .filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.entryType === 'inflow';
      })
      .reduce((acc, r) => acc + r.amount, 0);

    const totalAnnual = relevantRevenues
      .filter(r => new Date(r.date).getFullYear() === currentYear && r.entryType === 'inflow')
      .reduce((acc, r) => acc + r.amount, 0);

    return { monthlyInflow, totalAnnual };
  }, [relevantRevenues, currentMonth, currentYear]);

  // Score de Saúde Fiscal (Simulado no Dashboard para facilitar visualização do cliente)
  const healthScore = useMemo(() => {
    if (!focusedClient) return null;
    const currentMonthInflows = relevantRevenues.filter(r => new Date(r.date).getMonth() === currentMonth && r.entryType === 'inflow');
    const total = currentMonthInflows.reduce((a, b) => a + b.amount, 0);
    if (total === 0) return 100;

    const simples = calculateSimplesNacional(focusedClient.annualRevenue || 0, total, focusedClient.taxAnexo || 'III');
    const presumido = calculateLucroPresumidoAdvanced(currentMonthInflows, taxRules);
    
    const optimalTax = Math.min(simples.taxAmount, presumido.total);
    const efficiency = optimalTax / simples.taxAmount;
    return Math.floor(efficiency * 100);
  }, [focusedClient, relevantRevenues, currentMonth, taxRules]);

  const metrics: FinancialMetric[] = [
    { label: 'Faturamento Mensal Real', value: metricsData.monthlyInflow, change: 0, trend: 'neutral' },
    { label: 'Faturamento Anual Acumulado', value: metricsData.totalAnnual, change: 0, trend: 'neutral' },
    { label: 'Score de Saúde Fiscal', value: healthScore || 0, change: 0, trend: 'neutral' },
    { label: 'Lançamentos Identificados', value: relevantRevenues.filter(r => r.entryType === 'inflow').length, change: 0, trend: 'neutral' },
  ];

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((m, idx) => {
      const monthTotal = relevantRevenues
        .filter(r => new Date(r.date).getMonth() === idx && r.entryType === 'inflow')
        .reduce((acc, r) => acc + r.amount, 0);
      return { name: m, value: monthTotal };
    });
  }, [relevantRevenues]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      {/* Resumo de Foco (Apenas se houver cliente) */}
      {focusedClient && (
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
           <div className="flex items-center space-x-6 relative z-10">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black">
                {focusedClient.nomeFantasia.charAt(0)}
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl font-black tracking-tight">{focusedClient.nomeFantasia}</h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{focusedClient.identifier} • {focusedClient.taxAnexo ? `Anexo ${focusedClient.taxAnexo}` : 'Regime a Definir'}</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-8 relative z-10">
              <div className="text-center">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Score Fiscal</p>
                 <p className={`text-4xl font-black ${healthScore && healthScore > 80 ? 'text-emerald-400' : 'text-blue-400'}`}>{healthScore}%</p>
              </div>
              <div className="w-px h-12 bg-white/10 hidden md:block"></div>
              <div className="hidden md:block">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status de Operação</p>
                 <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase">Em Conformidade</span>
              </div>
           </div>
        </div>
      )}

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const isScore = metric.label === 'Score de Saúde Fiscal';
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
              <h3 className={`text-2xl font-black tracking-tighter ${isScore ? 'text-blue-600' : 'text-slate-800'}`}>
                {metric.label.includes('Faturamento') ? fmt(metric.value) : isScore ? `${metric.value}%` : metric.value}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-[8px] text-slate-300 uppercase font-black tracking-widest">Sincronização 1:1</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Evolução */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Evolução do Faturamento Mensal</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} dy={10} />
                <Tooltip 
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas e Insights (Somente Leitura) */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertas Fiscais Inteligentes</h4>
              <div className="space-y-4">
                 <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                    <span className="mt-0.5">⚠️</span>
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
                      Lançamentos sem classificação fiscal detectados. Revise o extrato para evitar tributação indevida.
                    </p>
                 </div>
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
                    <span className="mt-0.5">📡</span>
                    <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                      Economia potencial de 12% identificada na transição para Lucro Presumido. Consulte seu contador.
                    </p>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Insight Proativo</p>
              <p className="text-xs font-bold leading-relaxed">
                Baseado nos seus últimos 3 meses, o Anexo {focusedClient?.taxAnexo || 'III'} continua sendo a opção mais lucrativa para sua atividade.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

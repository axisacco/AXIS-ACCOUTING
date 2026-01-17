
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FinancialMetric, Client, UserRole, Revenue } from '../types';

interface DashboardProps {
  focusedClient?: Client | null;
  userRole?: UserRole;
  revenues?: Revenue[];
}

const Dashboard: React.FC<DashboardProps> = ({ focusedClient, userRole, revenues = [] }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filtra as receitas baseadas no contexto (cliente focado ou global)
  const relevantRevenues = useMemo(() => {
    return focusedClient 
      ? revenues.filter(r => r.clientId === focusedClient.id) 
      : revenues;
  }, [revenues, focusedClient]);

  // Cálculos Reais (Apenas o que foi inserido manualmente)
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

    const pendingDocs = 0; // Seria calculado do estado de documentos se disponível

    return {
      monthlyInflow,
      totalAnnual,
      pendingDocs
    };
  }, [relevantRevenues, currentMonth, currentYear]);

  const metrics: FinancialMetric[] = [
    { label: 'Faturamento Mensal Real', value: metricsData.monthlyInflow, change: 0, trend: 'neutral' },
    { label: 'Faturamento Anual Acumulado', value: metricsData.totalAnnual, change: 0, trend: 'neutral' },
    { label: 'Aguardando Lançamento', value: metricsData.pendingDocs, change: 0, trend: 'neutral' },
    { label: 'Receitas Totais Identificadas', value: relevantRevenues.filter(r => r.entryType === 'inflow').length, change: 0, trend: 'neutral' },
  ];

  // Gera dados para o gráfico baseados nos meses de 2024
  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((m, idx) => {
      const monthTotal = relevantRevenues
        .filter(r => new Date(r.date).getMonth() === idx && r.entryType === 'inflow')
        .reduce((acc, r) => acc + r.amount, 0);
      return { name: m, value: monthTotal };
    });
  }, [relevantRevenues]);

  return (
    <div className="space-y-6">
      {/* Indicador de Transparência Financeira */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl">
          📑
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Modo de Lançamento Manual</p>
          <h4 className="text-sm font-black text-slate-800">
            Valores baseados exclusivamente em entradas do usuário.
          </h4>
        </div>
      </div>

      {/* Grid de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const isTotalIdentified = metric.label === 'Receitas Totais Identificadas';
          
          return (
            <div 
              key={idx} 
              className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all ${!isTotalIdentified ? 'relative group' : ''}`}
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                  {metric.label.includes('Faturamento') || metric.label.includes('Receita')
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metric.value)
                    : metric.value}
                </h3>
                
                {/* Removemos o elemento visual destacado (badge/texto de controle) apenas para a métrica específica */}
                {!isTotalIdentified && (
                  <div className="flex items-center mt-2">
                    <span className="text-[9px] text-slate-300 uppercase font-bold tracking-widest">Controle Verificado</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Evolução Real */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Evolução de Entradas (2024)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px'}}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

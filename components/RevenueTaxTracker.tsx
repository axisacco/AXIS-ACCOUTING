
import React, { useMemo } from 'react';
import { Revenue, Client } from '../types';
import { calculateSimplesNacional } from '../services/taxCalculator';

interface RevenueTaxTrackerProps {
  focusedClient?: Client | null;
  revenues?: Revenue[];
}

const RevenueTaxTracker: React.FC<RevenueTaxTrackerProps> = ({ focusedClient, revenues = [] }) => {
  const rbt12 = focusedClient?.annualRevenue || 0;
  const anexo = focusedClient?.taxAnexo || 'III';
  
  // Baseia o cálculo estritamente no que está no extrato manual do cliente
  const currentMonthRevenues = useMemo(() => {
    const now = new Date();
    return revenues.filter(r => {
      const d = new Date(r.date);
      return focusedClient 
        ? r.clientId === focusedClient.id && d.getMonth() === now.getMonth() && r.entryType === 'inflow'
        : d.getMonth() === now.getMonth() && r.entryType === 'inflow';
    });
  }, [revenues, focusedClient]);

  const totalInvoiced = currentMonthRevenues.reduce((acc, rev) => acc + rev.amount, 0);
  
  // Realiza o cálculo dinâmico baseado na regra oficial
  const calculation = calculateSimplesNacional(rbt12, totalInvoiced, anexo);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {focusedClient ? `Impostos Dinâmicos: ${focusedClient.name}` : 'Painel de Apuração Manual'}
          </h2>
          <p className="text-slate-500">
            Cálculo baseado em {currentMonthRevenues.length} lançamentos manuais este mês.
          </p>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center space-x-6 shadow-2xl">
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">DAS a Recolher (Manual)</p>
            <p className="text-3xl font-black text-emerald-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculation.taxAmount)}
            </p>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Alíquota Efetiva</p>
            <p className="text-2xl font-black">{(calculation.effectiveRate * 100).toFixed(2)}%</p>
          </div>
        </div>
      </header>

      {/* Memória de Cálculo Visual */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Cálculo (Faturamento Manual)</p>
          <p className="text-xl font-black text-slate-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoiced)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Atenção</p>
          <p className="text-[10px] text-blue-800 leading-tight">
            Valores não lançados no Extrato Financeiro não serão computados nesta apuração preliminar.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <th className="px-6 py-4">Data Lançada</th>
              <th className="px-6 py-4">Descrição Manual</th>
              <th className="px-6 py-4 text-right">Valor Bruto</th>
              <th className="px-6 py-4 text-right">Imposto Estimado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentMonthRevenues.length > 0 ? currentMonthRevenues.map((rev) => {
              const taxValue = rev.amount * calculation.effectiveRate;
              return (
                <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 text-sm">{rev.date.split('-').reverse().join('/')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{rev.client}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{rev.description}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-black text-slate-800 text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rev.amount)}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-red-500">
                    -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxValue)}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 font-black uppercase text-[10px]">
                  Nenhum faturamento manual detectado para apuração.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueTaxTracker;

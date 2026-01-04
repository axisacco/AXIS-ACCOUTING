
import React from 'react';
import { Revenue } from '../types';

const mockRevenues: Revenue[] = [
  { id: '1', client: 'Banco Itaú S.A.', amount: 15200.00, date: '2024-06-05', status: 'received', description: 'Consultoria de TI - Sprint 24' },
  { id: '2', client: 'Starbucks Brasil', amount: 8400.50, date: '2024-06-10', status: 'received', description: 'Manutenção de Sistemas' },
  { id: '3', client: 'Consultoria Global', amount: 12000.00, date: '2024-06-25', status: 'expected', description: 'Assessoria de Negócios' },
];

// Alíquota simulada (Ex: Simples Nacional Anexo III - 6% inicial)
const SIMULATED_RATE = 0.06;

const RevenueTaxTracker: React.FC = () => {
  const totalInvoiced = mockRevenues.reduce((acc, rev) => acc + rev.amount, 0);
  const totalTax = totalInvoiced * SIMULATED_RATE;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Impostos por Nota</h2>
          <p className="text-slate-500">Acompanhamento em tempo real da carga tributária sobre seu faturamento.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center space-x-4">
          <div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total Imposto Previsto</p>
            <p className="text-2xl font-bold text-emerald-700">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTax)}
            </p>
          </div>
          <div className="w-px h-10 bg-emerald-200"></div>
          <div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Alíquota Média</p>
            <p className="text-2xl font-bold text-emerald-700">{(SIMULATED_RATE * 100).toFixed(2)}%</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Extrato Detalhado</h3>
          <span className="text-xs text-slate-400 italic">*Cálculos baseados no Simples Nacional (Anexo III)</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Data/Nota</th>
              <th className="px-6 py-4">Serviço/Cliente</th>
              <th className="px-6 py-4 text-right">Faturamento</th>
              <th className="px-6 py-4 text-right">Imposto Estimado</th>
              <th className="px-6 py-4 text-center">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockRevenues.map((rev) => {
              const taxValue = rev.amount * SIMULATED_RATE;
              return (
                <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{rev.date.split('-').reverse().join('/')}</p>
                    <p className="text-[10px] text-slate-400">Nota #{rev.id.padStart(4, '0')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">{rev.client}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{rev.description}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-slate-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rev.amount)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-red-500">
                      -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxValue)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-tighter">
                      Ver Guia
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="p-8 bg-blue-50/30 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Composição Tributária Estimada
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'ISS (Mun.)', value: '2.00%' },
                { label: 'PIS/COFINS', value: '1.25%' },
                { label: 'CSLL', value: '0.75%' },
                { label: 'IRPJ', value: '2.00%' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                  <p className="text-lg font-bold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Planejamento Tributário Inteligente</h3>
          <p className="text-slate-400 text-sm">Nossa IA analisou seu faturamento e sugere que você pode economizar R$ 450,00 se migrar para o Lucro Presumido no próximo ano.</p>
        </div>
        <button className="whitespace-nowrap bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50">
          Agendar Consultoria
        </button>
      </div>
    </div>
  );
};

export default RevenueTaxTracker;

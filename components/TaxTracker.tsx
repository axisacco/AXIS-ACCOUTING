
import React from 'react';
import { Tax } from '../types';

const taxes: Tax[] = [
  { id: '1', name: 'DAS - Simples Nacional', amount: 4520.50, dueDate: '2024-06-20', status: 'paid' },
  { id: '2', name: 'FGTS Mensal', amount: 2100.00, dueDate: '2024-06-07', status: 'paid' },
  { id: '3', name: 'IRRF Prolabore', amount: 550.20, dueDate: '2024-06-20', status: 'pending' },
  { id: '4', name: 'ISSQN Retido', amount: 1250.00, dueDate: '2024-06-15', status: 'overdue' },
];

const TaxTracker: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Meus Impostos</h2>
        <p className="text-slate-500">Acompanhe seus vencimentos e reduza custos com planejamento.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taxes.map((tax) => (
          <div key={tax.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                tax.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                tax.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                'bg-red-50 text-red-600'
              }`}>
                {tax.status === 'paid' ? 'Pago' : tax.status === 'pending' ? 'Pendente' : 'Atrasado'}
              </span>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{tax.name}</h3>
              <p className="text-sm text-slate-500 mb-4">Vencimento: <span className="font-medium text-slate-700">{tax.dueDate}</span></p>
              
              <div className="flex items-baseline space-x-2">
                <span className="text-xs text-slate-400">Total:</span>
                <span className="text-2xl font-bold text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tax.amount)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button className="text-blue-600 text-sm font-semibold hover:underline">Ver Guia</button>
              {tax.status !== 'paid' && (
                <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">Pagar Agora</button>
              )}
            </div>
          </div>
        ))}

        <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Análise de Impostos</h3>
          <p className="text-blue-100 text-sm mb-4">Sua empresa pagou R$ 1.2k a menos este trimestre comparado ao ano anterior.</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold">Ver Planejamento</button>
        </div>
      </div>
    </div>
  );
};

export default TaxTracker;

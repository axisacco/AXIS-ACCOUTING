
import React from 'react';
import { Revenue } from '../types';

const revenues: Revenue[] = [
  { id: '1', client: 'Banco Itaú S.A.', amount: 15200.00, date: '2024-06-05', status: 'received' },
  { id: '2', client: 'Starbucks Brasil', amount: 8400.50, date: '2024-06-10', status: 'received' },
  { id: '3', client: 'Consultoria Global', amount: 12000.00, date: '2024-06-25', status: 'expected' },
  { id: '4', client: 'Projeto Alpha X', amount: 5000.00, date: '2024-06-30', status: 'expected' },
  { id: '5', client: 'Licenciamento Software', amount: 2200.00, date: '2024-07-01', status: 'expected' },
];

const RevenueSchedule: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cronograma de Receitas</h2>
          <p className="text-slate-500">Visualize as entradas previstas para o seu caixa.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Total Previsto (Junho)</p>
          <p className="text-3xl font-bold text-emerald-600">R$ 40.600,50</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="flex space-x-1 items-center overflow-x-auto pb-2">
            {['Maio', 'Junho', 'Julho', 'Agosto', 'Setembro'].map((mes, idx) => (
              <button 
                key={mes} 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  idx === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {mes}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {revenues.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  item.status === 'received' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {item.date.split('-')[2]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.client}</h4>
                  <p className="text-xs text-slate-400">{item.status === 'received' ? 'Recebido em' : 'Previsão para'} {item.date}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                </p>
                <span className={`text-[10px] font-bold uppercase ${
                  item.status === 'received' ? 'text-emerald-500' : 'text-blue-500'
                }`}>
                  {item.status === 'received' ? 'Liquidado' : 'Aguardando'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 flex justify-center">
          <button className="text-blue-600 font-semibold text-sm hover:underline flex items-center space-x-1">
            <span>Ver relatório completo de conciliação</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueSchedule;

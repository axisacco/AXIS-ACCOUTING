
import React, { useState, useMemo } from 'react';
import { Client, TaxAnexo, SimplesCalculationResult } from '../types';
import { calculateSimplesNacional } from '../services/taxCalculator';

interface SimplesCalculatorProps {
  focusedClient?: Client | null;
  onSaveCalculation: (res: SimplesCalculationResult) => void;
  history: SimplesCalculationResult[];
}

const SimplesCalculator: React.FC<SimplesCalculatorProps> = ({ focusedClient, onSaveCalculation, history }) => {
  const [rbt12, setRbt12] = useState<number>(focusedClient?.annualRevenue || 0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [payroll, setPayroll] = useState<number>(0);
  const [anexo, setAnexo] = useState<TaxAnexo>(focusedClient?.taxAnexo || 'III');
  const [activity, setActivity] = useState<'SERVICO' | 'COMERCIO' | 'INDUSTRIA'>('SERVICO');

  const result = useMemo(() => {
    let activeAnexo = anexo;
    let fatorR = 0;

    if (activity === 'SERVICO' && (anexo === 'III' || anexo === 'V')) {
      fatorR = rbt12 > 0 ? payroll / rbt12 : 0;
      activeAnexo = fatorR >= 0.28 ? 'III' : 'V';
    }

    const calc = calculateSimplesNacional(rbt12, monthlyRevenue, activeAnexo);
    return { ...calc, fatorR };
  }, [rbt12, monthlyRevenue, payroll, anexo, activity]);

  const handleSave = () => {
    const newCalc: SimplesCalculationResult = {
      id: `SIMPLES_${Date.now()}`,
      date: new Date().toISOString(),
      clientId: focusedClient?.id || 'GLOBAL',
      rbt12,
      monthlyRevenue,
      payroll,
      fatorR: result.fatorR,
      anexo: result.appliedAnexo,
      effectiveRate: result.effectiveRate,
      taxAmount: result.taxAmount,
      breakdown: result.breakdown
    };
    onSaveCalculation(newCalc);
    alert('Cálculo salvo no histórico permanente da empresa.');
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parâmetros de Cálculo</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Atividade</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value as any)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none">
                <option value="SERVICO">Serviços</option>
                <option value="COMERCIO">Comércio</option>
                <option value="INDUSTRIA">Indústria</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo Base</label>
              <select value={anexo} onChange={(e) => setAnexo(e.target.value as TaxAnexo)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none">
                <option value="I">Anexo I - Comércio</option>
                <option value="II">Anexo II - Indústria</option>
                <option value="III">Anexo III - Serviços</option>
                <option value="IV">Anexo IV - Serviços (S/ CPP)</option>
                <option value="V">Anexo V - Serviços (Fator R)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receita Bruta 12m (RBT12)</label>
              <input type="number" value={rbt12} onChange={(e) => setRbt12(Number(e.target.value))} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
            </div>

            {activity === 'SERVICO' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folha de Salários + Encargos (12m)</label>
                <input type="number" value={payroll} onChange={(e) => setPayroll(Number(e.target.value))} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
              </div>
            )}

            <div className="space-y-1 pt-4 border-t border-slate-50">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Faturamento do Mês</label>
              <input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(Number(e.target.value))} className="w-full p-4 border-2 border-blue-100 rounded-2xl bg-blue-50/20 font-black text-blue-700 text-xl" />
            </div>

            <button onClick={handleSave} disabled={monthlyRevenue <= 0} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50">
              Salvar Cálculo
            </button>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
            <header className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Resultado da Apuração</p>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">DAS: {fmt(result.taxAmount)}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alíquota Efetiva</p>
                <p className="text-2xl font-black text-slate-900">{(result.effectiveRate * 100).toFixed(2)}%</p>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Anexo Aplicado</p>
                  <p className="text-sm font-black text-slate-800">{result.appliedAnexo}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Faixa Enquadrada</p>
                  <p className="text-sm font-black text-slate-800">{result.bracketIndex}ª Faixa</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Fator R</p>
                  <p className="text-sm font-black text-slate-800">{(result.fatorR * 100).toFixed(1)}%</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Alíq. Nominal</p>
                  <p className="text-sm font-black text-slate-800">{(result.nominalRate * 100).toFixed(2)}%</p>
               </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Detalhamento por Tributo (Repartição)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500">IRPJ</span>
                   <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.irpj)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500">CSLL</span>
                   <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.csll)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500">COFINS</span>
                   <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.cofins)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500">PIS/PASEP</span>
                   <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.pis)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500">CPP (Previdência)</span>
                   <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.cpp)}</span>
                </div>
                {result.breakdown.iss !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500">ISS</span>
                    <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.iss)}</span>
                  </div>
                )}
                {result.breakdown.icms !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500">ICMS</span>
                    <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.icms)}</span>
                  </div>
                )}
                {result.breakdown.ipi !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500">IPI</span>
                    <span className="text-sm font-black text-slate-800">{fmt(result.breakdown.ipi)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Cálculos Salvos</h3>
            <div className="space-y-3">
              {history.length > 0 ? history.map(h => (
                <div key={h.id} className="p-4 border border-slate-50 bg-slate-50/50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-slate-800">{new Date(h.date).toLocaleDateString()} - {fmt(h.monthlyRevenue)}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Anexo {h.anexo} • RBT12: {fmt(h.rbt12)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">{fmt(h.taxAmount)}</p>
                    <p className="text-[9px] text-slate-400 font-black">{(h.effectiveRate * 100).toFixed(2)}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-300 font-black uppercase py-4 text-center italic">Nenhum cálculo no histórico desta empresa.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplesCalculator;

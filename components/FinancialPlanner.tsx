
import React, { useState, useMemo } from 'react';
import { Client, Revenue } from '../types';
import { calculateSimplesNacional } from '../services/taxCalculator';
import { GoogleGenAI } from "@google/genai";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

interface FinancialPlannerProps {
  focusedClient?: Client | null;
  revenues: Revenue[];
  selectedMonthIdx: number;
}

const FinancialPlanner: React.FC<FinancialPlannerProps> = ({ focusedClient, revenues, selectedMonthIdx }) => {
  // Custos provisionados (Estimativas manuais para análise de margem líquida)
  const [fixedCosts, setFixedCosts] = useState<number>(10000);
  const [variableCosts, setVariableCosts] = useState<number>(5000);
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const multiplier = period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12;

  // 1. CÁLCULO DA RECEITA MENSAL TRIBUTÁVEL (Soma dos créditos operacionais do extrato)
  // Fix: Explicitly type the function return to avoid 'unknown' inference error in useMemo
  const monthlyRevenueTributable = useMemo((): number => {
    const relevant = focusedClient 
      ? revenues.filter(r => r.clientId === focusedClient.id) 
      : revenues;
      
    const getMonthRev = (mIdx: number): number => {
      return relevant
        .filter(r => {
          const dateParts = r.date.split('-');
          const m = parseInt(dateParts[1]) - 1;
          return m === mIdx && r.entryType === 'inflow';
        })
        // Adicionando tipos explícitos ao reduce para evitar erros de inferência
        .reduce((acc: number, r: Revenue) => acc + (r.amount || 0), 0);
    };

    if (period === 'monthly') return getMonthRev(selectedMonthIdx);
    
    if (period === 'quarterly') {
      const qStart = Math.floor(selectedMonthIdx / 3) * 3;
      return getMonthRev(qStart) + getMonthRev(qStart + 1) + getMonthRev(qStart + 2);
    }

    if (period === 'annual') {
      // Fix: Usando um loop tradicional para evitar problemas de inferência com unknown em Array.from no ambiente TypeScript
      let totalAnnual = 0;
      for (let i = 0; i < 12; i++) {
        totalAnnual += getMonthRev(i);
      }
      return totalAnnual;
    }

    return 0;
  }, [revenues, focusedClient, selectedMonthIdx, period]);

  // 2. CÁLCULO DO RBT12 REAL (Soma dos últimos 12 meses de receita operacional no extrato)
  // Fix: Adicionando tipos explícitos para o retorno e o acumulador do reduce
  const rbt12Real = useMemo((): number => {
    const relevant = focusedClient 
      ? revenues.filter(r => r.clientId === focusedClient.id && r.entryType === 'inflow') 
      : revenues.filter(r => r.entryType === 'inflow');

    // Aqui somamos todo o histórico de créditos operacionais para determinar a faixa
    return relevant.reduce((acc: number, r: Revenue) => acc + (r.amount || 0), 0);
  }, [revenues, focusedClient]);

  // 3. IMPOSTO CALCULADO: Derivado diretamente do Planejamento Tributário (Motor Simples Nacional)
  const taxData = useMemo(() => {
    // Parâmetros de enquadramento (Anexo selecionado no Perfil do Cliente)
    const anexo = focusedClient?.taxAnexo || 'III';
    
    // Cálculo oficial: Anexo -> RBT12 -> Faixa -> Alíquota Nominal -> Parcela a Deduzir -> Alíquota Efetiva
    return calculateSimplesNacional(rbt12Real, monthlyRevenueTributable, anexo);
  }, [rbt12Real, monthlyRevenueTributable, focusedClient]);

  const financialSummary = useMemo(() => {
    const totalRev = monthlyRevenueTributable;
    const totalFixed = fixedCosts * multiplier;
    const totalVar = variableCosts * multiplier;
    const totalTaxes = taxData.taxAmount;
    
    const totalCosts = totalFixed + totalVar + totalTaxes;
    const netProfit = totalRev - totalCosts;
    const margin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;
    
    return {
      totalRev,
      totalFixed,
      totalVar,
      totalTaxes,
      totalCosts,
      netProfit,
      margin
    };
  }, [monthlyRevenueTributable, fixedCosts, variableCosts, taxData, multiplier]);

  const pieData = [
    { name: 'Lucro Líquido', value: Math.max(0, financialSummary.netProfit), color: '#10b981' },
    { name: 'DAS Simples (Oficial)', value: financialSummary.totalTaxes, color: '#3b82f6' },
    { name: 'Custos Fixos', value: financialSummary.totalFixed, color: '#f59e0b' },
    { name: 'Custos Variáveis', value: financialSummary.totalVar, color: '#94a3b8' },
  ];

  const handleAskAI = async () => {
    setIsAiLoading(true);
    // Inicializando o cliente GoogleGenAI antes da chamada
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analise operacionalmente estes dados REAIS sincronizados:
      - Receita Mensal Operacional (Extrato): ${fmt(financialSummary.totalRev)}
      - RBT12 Acumulado (Base de Faixa): ${fmt(rbt12Real)}
      - Anexo Aplicado: ${taxData.appliedAnexo}
      - Faixa Enquadrada: ${taxData.bracketIndex}ª
      - Alíquota Efetiva Calculada: ${(taxData.effectiveRate * 100).toFixed(2)}%
      - DAS Mensal: ${fmt(financialSummary.totalTaxes)}
      
      IMPORTANTE: Seus comentários devem apenas explicar o fluxo financeiro. Você não tem autoridade para sugerir mudanças nas alíquotas ou na lógica de cálculo tributário do sistema.
    `;

    try {
      // Chamada correta seguindo as diretrizes
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text || '');
    } catch (error) {
      setAiInsight('Falha na sincronização operacional com a IA.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 pb-12">
      <header className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Gestão Financeira Consolidada</p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fluxo de Caixa e Impostos Reais</h2>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {(['monthly', 'quarterly', 'annual'] as const).map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {p === 'monthly' ? 'Mensal' : p === 'quarterly' ? 'Trimestral' : 'Anual'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Receita Mensal Operacional</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(financialSummary.totalRev)}</p>
          <div className="absolute top-4 right-4 flex space-x-1">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">DAS Simples Nacional</p>
          <p className="text-3xl font-black text-blue-600 tracking-tighter">{fmt(financialSummary.totalTaxes)}</p>
          <p className="text-[9px] text-blue-400 mt-2 font-bold uppercase tracking-widest">Alíquota Efetiva: {(taxData.effectiveRate * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Lucro Líquido Real</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{fmt(financialSummary.netProfit)}</p>
          <p className="text-[9px] text-emerald-400 mt-2 font-bold uppercase tracking-widest">Margem: {financialSummary.margin.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">RBT12 Acumulado</p>
          <p className="text-3xl font-black text-white tracking-tighter">{fmt(rbt12Real)}</p>
          <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Base de Enquadramento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governança Fiscal</h3>
             
             <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-black text-blue-600 uppercase">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                   <span>Planejamento Tributário Sincronizado</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                   <div className="text-slate-500">Anexo:</div>
                   <div className="text-slate-900 text-right">{taxData.appliedAnexo}</div>
                   <div className="text-slate-500">Faixa RBT12:</div>
                   <div className="text-slate-900 text-right">{taxData.bracketIndex}ª</div>
                   <div className="text-slate-500">Alíq. Nominal:</div>
                   <div className="text-slate-900 text-right">{(taxData.nominalRate * 100).toFixed(2)}%</div>
                   <div className="text-slate-500">Parcela Deduc.:</div>
                   <div className="text-slate-900 text-right">{fmt(taxData.deduction)}</div>
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provisionamento Fixo</label>
                  <input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custos Variáveis Estimados</label>
                  <input type="number" value={variableCosts} onChange={(e) => setVariableCosts(Number(e.target.value))} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Composição do Fluxo Real</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                     {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                   </Pie>
                   <Tooltip formatter={(value: number) => fmt(value)} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🤖</div>
                   <h4 className="text-white font-black uppercase text-sm tracking-tight">Axis AI Operational Monitor</h4>
                </div>
                <button 
                  onClick={handleAskAI}
                  disabled={isAiLoading || financialSummary.totalRev === 0}
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
                >
                   {isAiLoading ? 'Sincronizando...' : 'Analisar Resultados Reais'}
                </button>
             </div>
             <div className="p-10 text-slate-400 text-sm leading-relaxed min-h-[200px] whitespace-pre-wrap">
                {aiInsight || 'Solicite uma análise operacional para verificar a conformidade dos impostos com os lançamentos do extrato.'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanner;

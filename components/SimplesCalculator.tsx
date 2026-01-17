
import React, { useState, useMemo } from 'react';
import { Client, TaxAnexo, SimplesCalculationResult } from '../types';
import { calculateSimplesNacional } from '../services/taxCalculator';

interface SimplesCalculatorProps {
  focusedClient?: Client | null;
  onSaveCalculation: (res: SimplesCalculationResult) => void;
  history: SimplesCalculationResult[];
}

const SimplesCalculator: React.FC<SimplesCalculatorProps> = ({ focusedClient, onSaveCalculation, history }) => {
  // CONFIGURAÇÃO TRIBUTÁRIA
  const [activity, setActivity] = useState<'SERVICO' | 'COMERCIO' | 'INDUSTRIA'>('SERVICO');
  const [anexo, setAnexo] = useState<TaxAnexo>(focusedClient?.taxAnexo || 'III');
  const [rbt12, setRbt12] = useState<number>(focusedClient?.annualRevenue || 180000);
  const [payroll12, setPayroll12] = useState<number>(0);

  // CUSTOS E DESPESAS
  const [productCost, setProductCost] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [commission, setCommission] = useState<number>(0);
  const [supplies, setSupplies] = useState<number>(0);
  const [labor, setLabor] = useState<number>(0);
  const [others, setOthers] = useState<number>(0);
  
  // FINANCEIRO
  const [cardFeePercent, setCardFeePercent] = useState<number>(0);
  const [proposedPrice, setProposedPrice] = useState<number>(0);

  const calculation = useMemo(() => {
    let activeAnexo = anexo;
    
    // Lógica de Fator R para Serviços
    if (activity === 'SERVICO' && (anexo === 'III' || anexo === 'V')) {
      const fatorR = rbt12 > 0 ? payroll12 / rbt12 : 0;
      activeAnexo = fatorR >= 0.28 ? 'III' : 'V';
    }

    // 1. Custo Total Direto
    const totalDirect = productCost + shipping + commission + supplies + labor + others;
    
    // 2. Taxa Efetiva do Simples (Independente do preço de venda para determinar a alíquota)
    // Usamos 1 real apenas para extrair a alíquota efetiva baseada no RBT12
    const taxInfo = calculateSimplesNacional(rbt12, 100, activeAnexo);
    const taxRate = taxInfo.effectiveRate;
    const cardRate = cardFeePercent / 100;

    // 3. Cálculo do Valor Mínimo (Ponto de Equilíbrio)
    // S = (Custo_Direto) / (1 - Alíquota_Simples - Alíquota_Maquininha)
    // Se a soma das taxas for >= 1 (100%), o cálculo é impossível (prejuízo inevitável)
    const marginDivisor = 1 - taxRate - cardRate;
    const minSaleValue = marginDivisor > 0 ? totalDirect / marginDivisor : 0;

    // 4. Se houver preço proposto, calculamos o lucro real
    const finalPrice = proposedPrice > 0 ? proposedPrice : minSaleValue;
    const taxAmount = finalPrice * taxRate;
    const cardFeeAmount = finalPrice * cardRate;

    const grossProfit = finalPrice - totalDirect;
    const netProfit = finalPrice - totalDirect - taxAmount - cardFeeAmount;

    const grossMargin = finalPrice > 0 ? (grossProfit / finalPrice) * 100 : 0;
    const netMargin = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0;

    // Breakdown tributário para o preço final
    const finalTaxInfo = calculateSimplesNacional(rbt12, finalPrice, activeAnexo);

    return {
      minSaleValue,
      taxRate,
      cardRate,
      taxAmount,
      cardFeeAmount,
      totalDirect,
      netProfit,
      netMargin,
      grossProfit,
      grossMargin,
      appliedAnexo: activeAnexo,
      breakdown: finalTaxInfo.breakdown,
      bracketIndex: finalTaxInfo.bracketIndex
    };
  }, [activity, anexo, rbt12, payroll12, productCost, shipping, commission, supplies, labor, others, cardFeePercent, proposedPrice]);

  const handleSave = () => {
    if (calculation.minSaleValue <= 0) return;

    const newResult: SimplesCalculationResult = {
      id: `EQ_${Date.now()}`,
      date: new Date().toISOString(),
      clientId: focusedClient?.id || 'GLOBAL',
      activity,
      anexo: calculation.appliedAnexo,
      rbt12,
      minSaleValue: calculation.minSaleValue,
      proposedPrice: proposedPrice || calculation.minSaleValue,
      taxAmount: calculation.taxAmount,
      effectiveRate: calculation.taxRate,
      cardFeePercent,
      costs: {
        product: productCost,
        shipping,
        commission,
        supplies,
        labor,
        others,
        cardFeeAmount: calculation.cardFeeAmount,
        totalDirect: calculation.totalDirect
      },
      profitability: {
        netProfit: calculation.netProfit,
        netMargin: calculation.netMargin,
        grossProfit: calculation.grossProfit,
        grossMargin: calculation.grossMargin
      },
      breakdown: calculation.breakdown
    };

    onSaveCalculation(newResult);
    alert('Cálculo de Operação salvo no histórico.');
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ENTRADAS: CUSTOS E CONFIGURAÇÃO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <header className="flex items-center space-x-3 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl">🧮</div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Custos e Impostos</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Setup da Operação</p>
              </div>
            </header>

            {/* Fiscal Setup */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Atividade</label>
                  <select value={activity} onChange={(e) => setActivity(e.target.value as any)} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none">
                    <option value="SERVICO">Serviço</option>
                    <option value="COMERCIO">Comércio</option>
                    <option value="INDUSTRIA">Indústria</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo Base</label>
                  <select value={anexo} onChange={(e) => setAnexo(e.target.value as TaxAnexo)} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none">
                    <option value="I">Anexo I</option>
                    <option value="II">Anexo II</option>
                    <option value="III">Anexo III</option>
                    <option value="IV">Anexo IV</option>
                    <option value="V">Anexo V</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Receita Acumulada (RBT12)</label>
                <input type="number" value={rbt12} onChange={(e) => setRbt12(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-sm outline-none" />
              </div>

              {activity === 'SERVICO' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Folha de Salários (12m)</label>
                  <input type="number" value={payroll12} onChange={(e) => setPayroll12(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-sm outline-none" />
                </div>
              )}
            </div>

            {/* Custos Diretos */}
            <div className="pt-6 border-t border-slate-50 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custos Variáveis da Operação</p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Custo do Produto / Serviço</label>
                <input type="number" value={productCost || ''} onChange={(e) => setProductCost(Number(e.target.value))} className="w-full p-4 border-2 border-blue-100 rounded-2xl bg-blue-50/20 font-black text-blue-700 text-xl outline-none" placeholder="0,00" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Frete / Entrega</label>
                  <input type="number" value={shipping || ''} onChange={(e) => setShipping(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Comissão</label>
                  <input type="number" value={commission || ''} onChange={(e) => setCommission(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Insumos</label>
                  <input type="number" value={supplies || ''} onChange={(e) => setSupplies(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mão de Obra</label>
                  <input type="number" value={labor || ''} onChange={(e) => setLabor(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* Financeiro */}
            <div className="pt-6 border-t border-slate-50 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Taxa Maquininha (%)</label>
                <div className="relative">
                  <input type="number" step="0.01" value={cardFeePercent || ''} onChange={(e) => setCardFeePercent(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 font-black outline-none" placeholder="0,00" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Valor de Venda Proposto (Opcional)</label>
                <input type="number" value={proposedPrice || ''} onChange={(e) => setProposedPrice(Number(e.target.value))} className="w-full p-4 border-2 border-emerald-100 rounded-2xl bg-emerald-50/20 font-black text-emerald-700 text-xl outline-none" placeholder="R$ 0,00" />
              </div>
            </div>

            <button onClick={handleSave} disabled={calculation.minSaleValue <= 0} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]">
              Registrar Operação
            </button>
          </div>
        </div>

        {/* RESULTADOS OPERACIONAIS (CENTRO/DIREITA) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl">
              Monitor de Breakeven
            </div>

            <header className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Valor Mínimo de Venda</p>
                 <h2 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">
                  {fmt(calculation.minSaleValue)}
                 </h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                   Ponto de Equilíbrio para Cobrir 100% dos Custos e Impostos
                 </p>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <span>Resumo da Venda</span>
                   <span className="text-blue-400">{(calculation.taxRate * 100).toFixed(2)}% Taxa Efetiva</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase">Custo Direto</p>
                       <p className="text-lg font-black">{fmt(calculation.totalDirect)}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase">Total Impostos</p>
                       <p className="text-lg font-black text-red-400">{fmt(calculation.taxAmount)}</p>
                    </div>
                 </div>
              </div>
            </header>

            {/* MODO RESULTADO COM PREÇO PROPOSTO */}
            {proposedPrice > 0 && (
              <div className="p-8 bg-emerald-500 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-300">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Lucro Líquido Real</p>
                  <h4 className="text-5xl font-black tracking-tighter">{fmt(calculation.netProfit)}</h4>
                </div>
                <div className="flex space-x-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Margem Líquida</p>
                    <p className="text-2xl font-black">{calculation.netMargin.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Markup Praticado</p>
                    <p className="text-2xl font-black">{calculation.minSaleValue > 0 ? (((proposedPrice / calculation.minSaleValue) - 1) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detalhamento de Tributos */}
            <div className="space-y-6 border-t border-slate-50 pt-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                 <span>Detalhamento dos Tributos Incidentes</span>
                 <span className="text-blue-500">Faixa {calculation.bracketIndex} • Anexo {calculation.appliedAnexo}</span>
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  {[
                    { label: 'IRPJ', value: calculation.breakdown.irpj },
                    { label: 'CSLL', value: calculation.breakdown.csll },
                    { label: 'COFINS', value: calculation.breakdown.cofins },
                    { label: 'PIS', value: calculation.breakdown.pis },
                    { label: 'CPP', value: calculation.breakdown.cpp },
                    { label: 'ISS', value: calculation.breakdown.iss },
                    { label: 'ICMS', value: calculation.breakdown.icms },
                    { label: 'IPI', value: calculation.breakdown.ipi },
                  ].filter(t => t.value !== undefined).map(tax => (
                    <div key={tax.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                       <span className="text-[11px] font-bold text-slate-500">{tax.label}</span>
                       <span className="text-xs font-black text-slate-800">{fmt(tax.value!)}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Impacto da Maquininha */}
            {cardFeePercent > 0 && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💳</div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa de Intermediação ({cardFeePercent}%)</p>
                     <p className="text-xl font-black text-slate-800">{fmt(calculation.cardFeeAmount)}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase">Impacto na Margem</p>
                   <p className="text-sm font-black text-red-500">-{cardFeePercent.toFixed(1)}%</p>
                 </div>
              </div>
            )}
          </div>

          {/* Histórico Operacional */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Operações Auditadas</h3>
            <div className="space-y-3">
              {history.length > 0 ? history.map(h => (
                <div key={h.id} className="p-5 border border-slate-50 bg-slate-50/50 rounded-2xl flex justify-between items-center hover:bg-white transition-all group border-l-4 border-l-blue-600">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">🎯</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Preço: {fmt(h.proposedPrice)} | Mínimo: {fmt(h.minSaleValue)}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(h.date).toLocaleDateString()} • {h.activity} • Anexo {h.anexo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${h.profitability.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      Lucro: {fmt(h.profitability.netProfit)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">Margem: {h.profitability.netMargin.toFixed(1)}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-300 font-black uppercase py-8 text-center italic">Aguardando novos cálculos de viabilidade.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplesCalculator;

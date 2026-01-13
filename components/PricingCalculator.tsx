
import React, { useState, useMemo } from 'react';
import { Client, TaxAnexo } from '../types';
import { calculateSimplesNacional } from '../services/taxCalculator';

interface PricingCalculatorProps {
  focusedClient?: Client | null;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({ focusedClient }) => {
  // 1. Dados Obrigatórios e Seleção Manual
  const [activity, setActivity] = useState<'COMERCIO' | 'INDUSTRIA' | 'SERVICO'>(
    focusedClient?.taxAnexo === 'I' ? 'COMERCIO' : focusedClient?.taxAnexo === 'II' ? 'INDUSTRIA' : 'SERVICO'
  );
  const [selectedAnexo, setSelectedAnexo] = useState<TaxAnexo>(focusedClient?.taxAnexo || 'III');
  const [rbt12, setRbt12] = useState<number>(focusedClient?.annualRevenue || 180000);
  const [folha12, setFolha12] = useState<number>((focusedClient?.annualRevenue || 180000) * 0.25);
  
  // 2. Estrutura de Custos
  const [fixedCostsMonthly, setFixedCostsMonthly] = useState<number>(5000);
  const [avgSalesVolume, setAvgSalesVolume] = useState<number>(100);
  const [variableCostUnit, setVariableCostUnit] = useState<number>(50);
  const [variableFeesPercent, setVariableFeesPercent] = useState<number>(5.0); // Taxas de venda, marketplace, etc.
  const [proposedPrice, setProposedPrice] = useState<number>(100);

  // 3. Cálculos e Lógica de Negócio
  const calculation = useMemo(() => {
    // Alíquota Efetiva Legal baseada no Anexo Selecionado MANUALMENTE
    const taxInfo = calculateSimplesNacional(rbt12, 1, selectedAnexo);
    
    // Custo Fixo Unitário (CFU)
    const cfu = avgSalesVolume > 0 ? fixedCostsMonthly / avgSalesVolume : 0;

    // Ajuste específico do Anexo IV (INSS Patronal fora do DAS)
    // Tratado como custo variável adicional sobre a receita (estimado em 4.5% para este modelo de precificação)
    const inssPatronalAdjustment = selectedAnexo === 'IV' ? 0.045 : 0;

    // Alíquota Efetiva do Simples + Taxas Variáveis + Ajuste Anexo IV
    const totalVariableTaxesAndFees = taxInfo.effectiveRate + (variableFeesPercent / 100) + inssPatronalAdjustment;

    // Preço Mínimo (Preço de Equilíbrio)
    // Fórmula: Preço = (CVU + CFU) / (1 - Impostos - Taxas)
    let minPrice = 0;
    if (totalVariableTaxesAndFees < 1) {
      minPrice = (variableCostUnit + cfu) / (1 - totalVariableTaxesAndFees);
    }

    // Status de Viabilidade
    const status = proposedPrice >= minPrice ? 'SEM_PREJUIZO' : 'PREJUIZO';
    
    // Análise de Fator R (Apenas Alerta Informativo)
    const fatorR = rbt12 > 0 ? folha12 / rbt12 : 0;
    const fatorRAlert = activity === 'SERVICO' ? {
      value: fatorR,
      isHigh: fatorR >= 0.28,
      message: fatorR >= 0.28 
        ? "Fator R ≥ 28%: O Anexo III pode ser mais vantajoso." 
        : "Fator R < 28%: O Anexo V pode ser aplicado."
    } : null;

    return {
      taxInfo,
      cfu,
      minPrice,
      status,
      fatorRAlert,
      totalVariableTaxesAndFees,
      marginAmount: proposedPrice - (proposedPrice * totalVariableTaxesAndFees) - (variableCostUnit + cfu)
    };
  }, [selectedAnexo, rbt12, folha12, activity, fixedCostsMonthly, avgSalesVolume, variableCostUnit, variableFeesPercent, proposedPrice]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <header className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">🧮</div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Calculadora de Preço Mínimo</h2>
            <p className="text-slate-500 text-xs font-medium">Motor de proteção de margem para o Simples Nacional.</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border-2 transition-colors ${
          calculation.status === 'SEM_PREJUIZO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          <span className={`w-2 h-2 rounded-full ${calculation.status === 'SEM_PREJUIZO' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
          <span>{calculation.status === 'SEM_PREJUIZO' ? 'Preço Viável' : 'Operando com Prejuízo'}</span>
        </div>
      </header>

      {/* ALERTAS INFORMATIVOS */}
      {calculation.fatorRAlert && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
          calculation.fatorRAlert.isHigh ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-amber-50 border-amber-100 text-amber-700'
        }`}>
          <div className="flex items-center space-x-3">
             <span className="text-xl">💡</span>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Insight Estratégico (Fator R)</p>
                <p className="text-sm font-bold">{calculation.fatorRAlert.message}</p>
             </div>
          </div>
          <p className="text-xs font-black">Fator R: {(calculation.fatorRAlert.value * 100).toFixed(1)}%</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA DE CONFIGURAÇÃO */}
        <div className="lg:col-span-4 space-y-6">
          {/* Perfil e Anexo (Seleção Manual) */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Configuração Tributária
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Atividade</label>
              <select 
                value={activity} 
                onChange={(e) => setActivity(e.target.value as any)}
                className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="COMERCIO">Comércio</option>
                <option value="INDUSTRIA">Indústria</option>
                <option value="SERVICO">Serviço</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo do Simples (Manual)</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['I', 'II', 'III', 'IV', 'V'] as TaxAnexo[]).map(anexo => (
                  <button
                    key={anexo}
                    onClick={() => setSelectedAnexo(anexo)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                      selectedAnexo === anexo 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {anexo}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receita Bruta (RBT12)</label>
              <input 
                type="number" 
                value={rbt12} 
                onChange={(e) => setRbt12(Number(e.target.value))}
                className="w-full p-4 border rounded-2xl bg-slate-50 font-bold focus:bg-white outline-none"
              />
            </div>
            
            {activity === 'SERVICO' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folha de Salários (12m)</label>
                <input 
                  type="number" 
                  value={folha12} 
                  onChange={(e) => setFolha12(Number(e.target.value))}
                  className="w-full p-4 border rounded-2xl bg-slate-50 font-bold focus:bg-white outline-none"
                />
              </div>
            )}
          </div>

          {/* Estrutura de Custos */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Estrutura de Custos
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custos Fixos Mensais (Aluguel, Pro-labore...)</label>
              <input 
                type="number" 
                value={fixedCostsMonthly} 
                onChange={(e) => setFixedCostsMonthly(Number(e.target.value))}
                className="w-full p-4 border rounded-2xl bg-slate-50 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume de Vendas (Médio/Mês)</label>
              <input 
                type="number" 
                value={avgSalesVolume} 
                onChange={(e) => setAvgSalesVolume(Number(e.target.value))}
                className="w-full p-4 border rounded-2xl bg-slate-50 font-bold"
              />
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-white">
               <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custo Fixo Unitário (CFU)</p>
                 <p className="text-lg font-black">{fmt(calculation.cfu)}</p>
               </div>
               <span className="text-xl">🏠</span>
            </div>
          </div>
        </div>

        {/* COLUNA DE SIMULAÇÃO E RESULTADOS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Lado A: Variáveis Unitárias */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Variáveis Unitárias</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-tight">Custo Variável Unitário (CVU)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">R$</span>
                    <input 
                      type="number" 
                      value={variableCostUnit} 
                      onChange={(e) => setVariableCostUnit(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-5 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-2xl text-slate-800 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic">Matéria-prima, mercadoria ou custo direto do serviço.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-tight">Taxas Variáveis (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={variableFeesPercent} 
                      onChange={(e) => setVariableFeesPercent(Number(e.target.value))}
                      className="w-full p-4 border rounded-2xl bg-slate-50 font-black text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">Maquininha, marketplace, comissões de venda.</p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <label className="text-xs font-black text-blue-600 uppercase tracking-tight">Preço de Venda Praticado</label>
                   <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-300 text-sm">R$</span>
                      <input 
                        type="number" 
                        value={proposedPrice} 
                        onChange={(e) => setProposedPrice(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-6 border-2 border-blue-500 rounded-[2rem] bg-blue-50/20 font-black text-4xl text-blue-600 outline-none shadow-2xl shadow-blue-500/5"
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Lado B: Resultados Estratégicos */}
            <div className="flex flex-col space-y-4">
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex-1 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full"></div>
                  
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Preço Mínimo de Equilíbrio</p>
                    <h4 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">{fmt(calculation.minPrice)}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed max-w-[200px]">Este valor garante que você não terá prejuízo operacional.</p>
                  </div>

                  <div className="space-y-4 pt-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Margem Líquida Unit.</span>
                      <span className={`text-sm font-black ${calculation.marginAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(calculation.marginAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Alíquota Efetiva (Simples)</span>
                      <span className="text-sm font-black text-blue-400">{(calculation.taxInfo.effectiveRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase"> Markup Real</span>
                      <span className="text-sm font-black text-white">
                        {calculation.minPrice > 0 ? (((proposedPrice / calculation.minPrice) - 1) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
               </div>

               {/* Resumo da Faixa */}
               <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-600/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Anexo {selectedAnexo} • Faixa {calculation.taxInfo.bracketIndex}</span>
                    <span className="text-xs font-black">Lim: {fmt(calculation.taxInfo.bracketLimit)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min((rbt12 / calculation.taxInfo.bracketLimit) * 100, 100)}%` }}></div>
                  </div>
               </div>
            </div>
          </div>

          {/* MEMÓRIA DE CÁLCULO / EDUCATIVO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> Memória Fiscal Unitária
               </h4>
               <div className="space-y-3">
                 <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500 font-bold">Imposto DAS Estimado:</span>
                    <span className="text-xs font-black text-slate-800">{fmt(proposedPrice * calculation.taxInfo.effectiveRate)}</span>
                 </div>
                 {selectedAnexo === 'IV' && (
                   <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-xs text-slate-500 font-bold">INSS Patronal (Fora DAS):</span>
                      <span className="text-xs font-black text-red-500">{fmt(proposedPrice * 0.045)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-500 font-bold">Custo Fixo Absorvido (Rateio):</span>
                    <span className="text-xs font-black text-slate-800">{fmt(calculation.cfu)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">Taxas de Venda/Marketplace:</span>
                    <span className="text-xs font-black text-slate-800">{fmt(proposedPrice * (variableFeesPercent/100))}</span>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center space-y-4">
               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">O Preço Mínimo é o seu "Ponto de Equilíbrio"</h4>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 Diferente do Markup tradicional, nossa calculadora utiliza a **Alíquota Efetiva Legal**, garantindo que o imposto pago sobre o preço de venda final seja considerado corretamente no cálculo.
               </p>
               <div className="pt-2">
                  <button className="text-[10px] font-black uppercase text-blue-400 bg-blue-400/10 px-4 py-2 rounded-xl border border-blue-400/20 hover:bg-blue-400 hover:text-white transition-all">Ver Fórmula Legal</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;

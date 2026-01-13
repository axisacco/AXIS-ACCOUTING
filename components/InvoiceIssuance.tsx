
import React, { useState } from 'react';
import { Client } from '../types';

interface InvoiceIssuanceProps {
  focusedClient?: Client | null;
}

// Fixed InvoiceIssuance to accept focusedClient prop
const InvoiceIssuance: React.FC<InvoiceIssuanceProps> = ({ focusedClient }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    value: '',
    description: '',
    clientName: '',
    clientTaxId: '',
    serviceType: 'consultancy'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    // Em um app real, enviaria para a Axis Accounting processar
  };

  if (step === 2) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Solicitação Enviada!</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Sua solicitação de emissão de nota fiscal foi recebida pela nossa equipe técnica e será processada em até 2 horas úteis.
        </p>
        <button 
          onClick={() => {setStep(1); setFormData({value: '', description: '', clientName: '', clientTaxId: '', serviceType: 'consultancy'})}}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Nova Emissão
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Emissão de Nota Fiscal</h2>
        <p className="text-slate-500">
          {focusedClient ? `Emitindo para: ${focusedClient.name}` : 'Informe os dados do serviço prestado para gerarmos sua nota.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor do Serviço (R$)</label>
            <input 
              required
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              placeholder="0,00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-lg font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de Serviço</label>
            <select 
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              <option value="consultancy">Consultoria Técnica</option>
              <option value="software">Desenvolvimento de Software</option>
              <option value="training">Treinamento / Cursos</option>
              <option value="other">Outros Serviços</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição dos Serviços</label>
          <textarea 
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Detalhe o serviço prestado para o corpo da nota..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Dados do Tomador (Seu Cliente)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              required
              type="text"
              placeholder="Nome ou Razão Social"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
            />
            <input 
              required
              type="text"
              placeholder="CPF ou CNPJ"
              value={formData.clientTaxId}
              onChange={(e) => setFormData({...formData, clientTaxId: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Solicitar Emissão de Nota
        </button>
      </form>
    </div>
  );
};

export default InvoiceIssuance;

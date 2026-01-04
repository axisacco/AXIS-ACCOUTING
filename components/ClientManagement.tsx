
import React, { useState } from 'react';
import { Client } from '../types';

const initialClients: Client[] = [
  { id: '1', name: 'Tecnologia Avançada LTDA', identifier: '12.345.678/0001-90', email: 'contato@techavancada.com', status: 'active', type: 'PJ', createdAt: '2024-01-10' },
  { id: '2', name: 'Ana Maria Ferreira', identifier: '123.456.789-00', email: 'ana.ferreira@email.com', status: 'active', type: 'PF', createdAt: '2024-03-22' },
  { id: '3', name: 'Logística Express S.A.', identifier: '98.765.432/0001-21', email: 'financeiro@logexpress.com.br', status: 'inactive', type: 'PJ', createdAt: '2023-11-05' },
];

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', identifier: '', email: '', type: 'PJ' as 'PF' | 'PJ' });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      identifier: newClient.identifier,
      email: newClient.email,
      type: newClient.type,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients([client, ...clients]);
    setShowForm(false);
    setNewClient({ name: '', identifier: '', email: '', type: 'PJ' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Clientes</h2>
          <p className="text-slate-500">Cadastre e acompanhe a base de clientes da sua contabilidade.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium shadow-md"
        >
          <span>{showForm ? 'Cancelar' : 'Novo Cliente'}</span>
          {!showForm && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome / Razão Social</label>
              <input 
                required
                type="text" 
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Empresa Exemplo LTDA"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">CPF ou CNPJ</label>
              <input 
                required
                type="text" 
                value={newClient.identifier}
                onChange={(e) => setNewClient({...newClient, identifier: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail de Contato</label>
              <input 
                required
                type="email" 
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
              <select 
                value={newClient.type}
                onChange={(e) => setNewClient({...newClient, type: e.target.value as 'PF' | 'PJ'})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="PJ">Pessoa Jurídica (PJ)</option>
                <option value="PF">Pessoa Física (PF)</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                Finalizar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${client.type === 'PJ' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{client.name}</p>
                      <p className="text-[10px] text-slate-400">Cadastrado em {client.createdAt}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{client.identifier}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{client.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    client.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientManagement;

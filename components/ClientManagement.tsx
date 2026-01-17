
import React, { useState } from 'react';
import { Client, TaxAnexo, UserAccount, UserRole, User } from '../types';

interface ClientManagementProps {
  clients: Client[];
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  onSelectClient?: (client: Client) => void;
  onAddClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onUpdateClient?: (client: Client) => void;
  currentUser?: User | null;
}

const ADMIN_EMAIL_AUTH = 'adm@ad.com';

const ClientManagement: React.FC<ClientManagementProps> = ({ 
  clients, 
  users, 
  setUsers, 
  onSelectClient, 
  onAddClient, 
  onDeleteClient, 
  onUpdateClient,
  currentUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', 
    nomeFantasia: '',
    nomeEmpresario: '',
    identifier: '', 
    email: '', 
    phone: '', 
    type: 'PJ' as 'PF' | 'PJ', 
    annualRevenue: '', 
    taxAnexo: 'III' as TaxAnexo, 
    status: 'active' as 'active' | 'inactive',
    initialPassword: 'axis' + Math.floor(1000 + Math.random() * 9000)
  });

  const resetForm = () => {
    setFormData({
      name: '', nomeFantasia: '', nomeEmpresario: '', identifier: '', email: '', phone: '', type: 'PJ', 
      annualRevenue: '', taxAnexo: 'III', status: 'active',
      initialPassword: 'axis' + Math.floor(1000 + Math.random() * 9000)
    });
    setShowForm(false);
  };

  const isMasterAdmin = currentUser?.email.toLowerCase() === ADMIN_EMAIL_AUTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // NORMALIZAÇÃO PARA O BANCO
    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedIdentifier = formData.identifier.trim();
    const normalizedPass = formData.initialPassword.trim();

    if (clients.some(c => c.identifier === normalizedIdentifier)) {
      alert('Erro: Este CNPJ já possui uma empresa vinculada.'); return;
    }

    setIsProcessing(true);
    const clientId = `CLI_${Date.now()}`;

    const clientData: Client = {
      id: clientId,
      name: formData.name.trim(),
      nomeFantasia: formData.nomeFantasia.trim(),
      nomeEmpresario: formData.nomeEmpresario.trim(),
      identifier: normalizedIdentifier,
      email: normalizedEmail,
      phone: formData.phone.trim(),
      type: formData.type,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      taxAnexo: formData.taxAnexo,
      annualRevenue: parseFloat(formData.annualRevenue) || 0,
    };

    const newUser: UserAccount = {
      id: `USR_${Date.now()}`,
      name: formData.nomeEmpresario.trim(),
      email: normalizedEmail,
      phone: formData.phone.trim(),
      role: UserRole.CLIENT,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Nunca',
      status: 'active',
      passwordHash: btoa(normalizedPass),
      cnpjVinculado: normalizedIdentifier
    };

    setUsers(prev => [newUser, ...prev]);
    onAddClient(clientData);

    console.log('✅ Usuário Criado com Normalização:', {
      email: normalizedEmail,
      passwordPlain: normalizedPass,
      passwordHash: btoa(normalizedPass)
    });

    alert(`SUCESSO!\nEmpresa: ${formData.nomeFantasia}\nLogin: ${normalizedEmail}\nSenha Inicial: ${normalizedPass}\n\nO vínculo CNPJ ↔ Login foi estabelecido.`);

    setIsProcessing(false);
    resetForm();
  };

  const handleDeleteRequest = (client: Client) => {
    if (!isMasterAdmin) {
      alert("ACESSO NEGADO: Apenas o administrador mestre (adm@ad.com) pode excluir empresas.");
      return;
    }

    const confirmation = window.confirm(
      `⚠️ ATENÇÃO: ESTA AÇÃO É IRREVERSÍVEL.\n\nDeseja realmente excluir a empresa "${client.nomeFantasia}"?`
    );

    if (confirmation) {
      onDeleteClient(client.id);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gestão de Empresas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Controle Central de Unidades</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          Nova Empresa + Login
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Cadastro Unificado</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase">Empresa, Empresário e Credenciais</p>
               </div>
               <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                  <input required placeholder="Ex: Tecnologia LTDA" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                  <input required placeholder="Ex: Axis Tech" value={formData.nomeFantasia} onChange={(e) => setFormData({...formData, nomeFantasia: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Empresário</label>
                  <input required placeholder="Responsável Legal" value={formData.nomeEmpresario} onChange={(e) => setFormData({...formData, nomeEmpresario: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ da Empresa</label>
                  <input required placeholder="00.000.000/0001-00" value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Acesso do Cliente</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">E-mail de Login</label>
                    <input required type="email" placeholder="acesso@empresa.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-4 border border-blue-200 rounded-2xl bg-white font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Senha Inicial</label>
                    <div className="p-4 bg-white border border-blue-200 rounded-2xl font-black text-blue-700 text-center uppercase tracking-widest">
                      {formData.initialPassword}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all">
                {isProcessing ? 'Sincronizando...' : 'Confirmar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b">
            <tr>
              <th className="px-8 py-5">Empresa / Responsável</th>
              <th className="px-8 py-5">CNPJ Vinculado</th>
              <th className="px-8 py-5">Login de Acesso</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-800 text-sm">{client.nomeFantasia}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{client.nomeEmpresario}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-black text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-lg">{client.identifier}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-slate-500">{client.email}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <button onClick={() => onSelectClient?.(client)} className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      Acessar
                    </button>
                    {isMasterAdmin && (
                      <button 
                        onClick={() => handleDeleteRequest(client)}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        Excluir
                      </button>
                    )}
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

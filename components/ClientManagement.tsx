
import React, { useState } from 'react';
import { Client, TaxAnexo, UserAccount, UserRole, User } from '../types';
import { useNotification } from './ui/Notification';
import ConfirmModal from './ui/ConfirmModal';

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
  const { notify } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showConnector, setShowConnector] = useState(false);
  const [connectorClient, setConnectorClient] = useState<Client | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectorStep, setConnectorStep] = useState(1);
  const [connectorProgress, setConnectorProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; client: Client | null }>({
    isOpen: false,
    client: null
  });
  
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
    cnaePrimary: '',
    cnaeSecondary: '',
    initialPassword: 'axis' + Math.floor(1000 + Math.random() * 9000)
  });

  const [editFormData, setEditFormData] = useState<Partial<Client>>({});

  React.useEffect(() => {
    if (editingClient) {
      setEditFormData({
        name: editingClient.name,
        nomeFantasia: editingClient.nomeFantasia,
        nomeEmpresario: editingClient.nomeEmpresario,
        email: editingClient.email,
        phone: editingClient.phone,
        taxAnexo: editingClient.taxAnexo,
        annualRevenue: editingClient.annualRevenue,
        cnaePrimary: editingClient.cnaePrimary,
        cnaeSecondary: editingClient.cnaeSecondary,
        status: editingClient.status
      });
    }
  }, [editingClient]);

  const resetForm = () => {
    setFormData({
      name: '', nomeFantasia: '', nomeEmpresario: '', identifier: '', email: '', phone: '', type: 'PJ', 
      annualRevenue: '', taxAnexo: 'III', status: 'active', cnaePrimary: '', cnaeSecondary: '',
      initialPassword: 'axis' + Math.floor(1000 + Math.random() * 9000)
    });
    setShowForm(false);
  };

  const isMasterAdmin = currentUser?.email.toLowerCase() === ADMIN_EMAIL_AUTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedIdentifier = formData.identifier.trim();
    const normalizedPass = formData.initialPassword.trim();

    if (clients.some(c => c.identifier === normalizedIdentifier)) {
      notify('Erro: Este CNPJ já possui uma empresa vinculada.', 'error'); 
      return;
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
      cnaePrimary: formData.cnaePrimary.trim(),
      cnaeSecondary: formData.cnaeSecondary.trim(),
      integrationStatus: 'disconnected',
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

    notify(`Empresa ${formData.nomeFantasia} registrada com sucesso!`, 'success');

    setIsProcessing(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !onUpdateClient) return;

    const updatedClient: Client = {
      ...editingClient,
      ...editFormData as Client,
    };

    onUpdateClient(updatedClient);
    notify(`Empresa ${updatedClient.nomeFantasia} atualizada!`, 'success');
    setEditingClient(null);
  };

  const handleConnect = (client: Client) => {
    setConnectorClient(client);
    setShowConnector(true);
    setConnectorStep(1);
    setConnectorProgress(0);
  };

  const startConnection = () => {
    setConnectorStep(2);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setConnectorProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setConnectorStep(3);
        if (connectorClient && onUpdateClient) {
          onUpdateClient({ ...connectorClient, integrationStatus: 'connected' });
        }
        notify("Conexão com a Prefeitura estabelecida com sucesso!", "success");
      }
    }, 100);
  };

  const handleDeleteRequest = (client: Client) => {
    if (!isMasterAdmin) {
      notify("ACESSO NEGADO: Apenas o administrador mestre pode excluir empresas.", "error");
      return;
    }
    setConfirmDelete({ isOpen: true, client });
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                  <input placeholder="(00) 00000-0000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo do Simples</label>
                  <select value={formData.taxAnexo} onChange={(e) => setFormData({...formData, taxAnexo: e.target.value as TaxAnexo})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white appearance-none">
                    <option value="I">Anexo I (Comércio)</option>
                    <option value="II">Anexo II (Indústria)</option>
                    <option value="III">Anexo III (Serviços)</option>
                    <option value="IV">Anexo IV (Serviços)</option>
                    <option value="V">Anexo V (Serviços)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNAE Principal</label>
                  <input placeholder="Ex: 6201-5/00" value={formData.cnaePrimary} onChange={(e) => setFormData({...formData, cnaePrimary: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faturamento Anual Est.</label>
                  <input type="number" placeholder="R$ 0,00" value={formData.annualRevenue} onChange={(e) => setFormData({...formData, annualRevenue: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
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
                    <button onClick={() => handleConnect(client)} className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                      Conectar
                    </button>
                    <button onClick={() => onSelectClient?.(client)} className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      Acessar
                    </button>
                    <button onClick={() => setEditingClient(client)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-600 hover:text-white transition-all shadow-sm">
                      Editar
                    </button>
                    {isMasterAdmin && (
                      <button 
                        onClick={() => handleDeleteRequest(client)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
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

      {/* Modal de Edição */}
      {editingClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Editar Empresa</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase">Atualize as informações cadastrais</p>
               </div>
               <button onClick={() => setEditingClient(null)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                  <input required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                  <input required value={editFormData.nomeFantasia} onChange={(e) => setEditFormData({...editFormData, nomeFantasia: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Empresário</label>
                  <input required value={editFormData.nomeEmpresario} onChange={(e) => setEditFormData({...editFormData, nomeEmpresario: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                  <input value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo do Simples</label>
                  <select value={editFormData.taxAnexo} onChange={(e) => setEditFormData({...editFormData, taxAnexo: e.target.value as TaxAnexo})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white appearance-none">
                    <option value="I">Anexo I</option>
                    <option value="II">Anexo II</option>
                    <option value="III">Anexo III</option>
                    <option value="IV">Anexo IV</option>
                    <option value="V">Anexo V</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faturamento Anual</label>
                  <input type="number" value={editFormData.annualRevenue} onChange={(e) => setEditFormData({...editFormData, annualRevenue: parseFloat(e.target.value)})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNAE Principal</label>
                  <input value={editFormData.cnaePrimary} onChange={(e) => setEditFormData({...editFormData, cnaePrimary: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value as 'active' | 'inactive'})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white appearance-none">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal do Conector */}
      {showConnector && connectorClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Conector Prefeitura</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase">Integração Automática de Notas</p>
               </div>
               <button onClick={() => setShowConnector(false)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
            </div>

            <div className="space-y-8">
              {connectorStep === 1 && (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl">🏢</div>
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Empresa Selecionada</p>
                      <p className="font-bold text-emerald-900">{connectorClient.nomeFantasia}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Prefeitura</label>
                      <input placeholder="CPF/CNPJ ou Usuário" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                      <input type="password" placeholder="••••••••" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white" />
                    </div>
                  </div>

                  <button onClick={startConnection} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-[0.98] transition-all">
                    Iniciar Autenticação
                  </button>
                </div>
              )}

              {connectorStep === 2 && (
                <div className="py-12 text-center space-y-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * connectorProgress) / 100} className="text-emerald-500 transition-all duration-300" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-slate-800">
                      {connectorProgress}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-slate-800 uppercase tracking-widest">Sincronizando Dados...</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">Aguarde a validação do certificado</p>
                  </div>
                </div>
              )}

              {connectorStep === 3 && (
                <div className="py-8 text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white text-4xl animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 uppercase">Conexão Ativa!</h4>
                    <p className="text-sm text-slate-500 font-medium">As notas fiscais agora serão importadas automaticamente a cada 24h.</p>
                  </div>
                  <button onClick={() => setShowConnector(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">
                    Concluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, client: null })}
        onConfirm={() => confirmDelete.client && onDeleteClient(confirmDelete.client.id)}
        title="Excluir Empresa"
        message={`⚠️ ATENÇÃO: ESTA AÇÃO É IRREVERSÍVEL.\n\nDeseja realmente excluir a empresa "${confirmDelete.client?.nomeFantasia}"?`}
        confirmText="Excluir Permanentemente"
        type="danger"
      />
    </div>
  );
};

export default ClientManagement;

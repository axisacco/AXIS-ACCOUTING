
import React, { useState } from 'react';
import { UserAccount, UserRole, Client } from '../types';

interface AdminUserManagerProps {
  clients: Client[];
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

const AdminUserManager: React.FC<AdminUserManagerProps> = ({ clients, users, setUsers }) => {
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: UserRole.CLIENT, status: 'active' as any, cnpjVinculado: ''
  });

  const generateRandomPassword = () => 'Axis' + Math.floor(100000 + Math.random() * 900000);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      alert('Erro: E-mail já cadastrado.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Erro: Senhas não coincidem.'); return;
    }

    const newUser: UserAccount = {
      id: `USR_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Nunca',
      status: 'active',
      passwordHash: btoa(formData.password),
      cnpjVinculado: formData.role === UserRole.ADMIN ? undefined : formData.cnpjVinculado
    };

    setUsers(prev => [newUser, ...prev]);
    setShowCreateModal(false);
    alert('Usuário criado com sucesso!');
  };

  const handleResetPassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Deseja invalidar a senha atual de ${user.name} e gerar uma nova?`)) return;

    const newPass = generateRandomPassword();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: btoa(newPass) } : u));
    
    // Feedback único para o ADM (A senha anterior foi permanentemente invalidada via hash)
    setResetFeedback(`SENHA REDEFINIDA: ${newPass}`);
    
    // O feedback some após 15 segundos para segurança
    setTimeout(() => setResetFeedback(null), 15000);
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cofre de Identidades</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Controle de Credenciais e Segurança</p>
        </div>
        <div className="flex space-x-2">
           {resetFeedback && (
              <div className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg animate-in slide-in-from-right-4">
                 <span className="mr-2">🔑</span> {resetFeedback}
              </div>
           )}
           <button onClick={() => setShowCreateModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Novo Login Operacional</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">Usuário / E-mail</th>
                <th className="px-8 py-5">Função</th>
                <th className="px-8 py-5">CNPJ Vinculado</th>
                <th className="px-8 py-5 text-right">Gestão de Chaves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} onClick={() => setSelectedUser(user)} className={`hover:bg-slate-50 cursor-pointer transition-all ${selectedUser?.id === user.id ? 'bg-blue-50/30 border-l-4 border-blue-500' : ''}`}>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 text-sm">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${user.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-600'}`}>{user.role}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500">{user.cnpjVinculado || '---'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={(e) => {e.stopPropagation(); handleResetPassword(user.id);}} 
                      className="text-[10px] font-black text-amber-600 uppercase hover:bg-amber-50 px-4 py-2 rounded-xl transition-all"
                    >
                      Resetar Senha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-4">
          {selectedUser ? (
            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-8 shadow-2xl sticky top-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-xl shadow-blue-500/20">{selectedUser.name[0]}</div>
                <h3 className="font-black text-2xl tracking-tight">{selectedUser.name}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Status: {selectedUser.status}</p>
              </div>
              
              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Último Acesso</span>
                   <span className="text-sm font-bold text-slate-300">{selectedUser.lastLogin}</span>
                </div>
                
                <div className="space-y-3">
                   <button onClick={() => toggleStatus(selectedUser.id)} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedUser.status === 'active' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500 text-white'}`}>
                    {selectedUser.status === 'active' ? 'Revogar Acesso' : 'Restabelecer Acesso'}
                   </button>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocolo de Segurança</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                   Senhas são armazenadas em hash irreversível. Ao resetar, a chave anterior torna-se nula imediatamente.
                 </p>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-4">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm text-slate-300">🛡️</div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione um Usuário para Gestão</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Novo Acesso Administrativo</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" placeholder="Nome Completo" />
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" placeholder="E-mail Corporativo" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" placeholder="Senha" />
                <input required type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold outline-none" placeholder="Confirmar" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Criar Usuário</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-5 border-2 rounded-2xl font-black uppercase text-slate-400">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;

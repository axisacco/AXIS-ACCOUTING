
import React, { useState } from 'react';
import { User, UserAccount } from '../types';

interface SettingsProps {
  currentUser: User | null;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, users, setUsers }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const userAcc = users.find(u => u.id === currentUser.id);
    if (!userAcc) return;

    if (btoa(currentPass) !== userAcc.passwordHash) {
      alert("Erro: Senha atual incorreta."); return;
    }

    if (newPass !== confirmPass) {
      alert("Erro: Novas senhas não coincidem."); return;
    }

    if (newPass.length < 6) {
      alert("Erro: A nova senha deve ter no mínimo 6 caracteres."); return;
    }

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, passwordHash: btoa(newPass) } : u));
    alert("Senha alterada com sucesso!");
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <header className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">👤</div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Segurança da Conta</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Altere sua senha de acesso</p>
          </div>
        </header>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Atual</label>
            <input required type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
              <input required type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
              <input required type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Salvar Nova Senha</button>
        </form>
      </div>

      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Aviso de Segurança</p>
        <p className="text-xs text-amber-800 leading-relaxed">Sua senha é pessoal e intransferível. O administrador do sistema **nunca** solicitará sua senha atual por e-mail ou telefone. Caso esqueça, solicite um **Reset de Senha** para gerar uma nova chave temporária.</p>
      </div>
    </div>
  );
};

export default Settings;

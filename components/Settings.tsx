
import React, { useState } from 'react';
import { User, UserAccount, UserRole, TaxRules } from '../types';

interface SettingsProps {
  currentUser: User | null;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  taxRules: TaxRules;
  setTaxRules: (rules: TaxRules) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, users, setUsers, taxRules, setTaxRules }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const isAdmin = currentUser?.role === UserRole.ADMIN;

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

  const handleToggleRule = (key: keyof TaxRules) => {
    if (!isAdmin) return;
    setTaxRules({ ...taxRules, [key]: !taxRules[key] });
  };

  return (
    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <header className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">👤</div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Segurança</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Altere sua senha</p>
          </div>
        </header>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Atual</label>
            <input required type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
            <input required type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar</label>
            <input required type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
          </div>
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Salvar Senha</button>
        </form>
      </div>

      {/* PAINEL EXCLUSIVO PARA ADMINISTRADOR: MATRIZ TRIBUTÁRIA */}
      {isAdmin && (
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full"></div>
          
          <header className="relative z-10 space-y-1">
            <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/30 mb-2">
              Painel de Gestão Tributária
            </div>
            <h3 className="text-2xl font-black tracking-tight">Matriz PIS/COFINS</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Defina como o motor de cálculo deve tratar as categorias de produtos lançadas pelos clientes.
            </p>
          </header>

          <div className="space-y-4 relative z-10">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer" onClick={() => handleToggleRule('monofasicoHasPisCofins')}>
               <div className="space-y-1">
                  <p className="text-sm font-black">Produtos Monofásicos</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {taxRules.monofasicoHasPisCofins ? 'Sempre Incidir PIS/COFINS' : 'Não Incidir PIS/COFINS'}
                  </p>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${taxRules.monofasicoHasPisCofins ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${taxRules.monofasicoHasPisCofins ? 'left-7' : 'left-1'}`}></div>
               </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer" onClick={() => handleToggleRule('isentoHasPisCofins')}>
               <div className="space-y-1">
                  <p className="text-sm font-black">Produtos Isentos</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {taxRules.isentoHasPisCofins ? 'Sempre Incidir PIS/COFINS' : 'Não Incidir PIS/COFINS'}
                  </p>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${taxRules.isentoHasPisCofins ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${taxRules.isentoHasPisCofins ? 'left-7' : 'left-1'}`}></div>
               </div>
            </div>

            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center space-x-4">
               <span className="text-2xl">⚡</span>
               <p className="text-[10px] text-amber-200 font-medium leading-tight">
                 <b>Nota de Compliance:</b> IRPJ e CSLL incidirão automaticamente sobre 100% das receitas, independente destas chaves de PIS/COFINS.
               </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📊</div>
           <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Configurações Tributárias</p>
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                As regras de incidência de PIS/COFINS para seus produtos Monofásicos e Isentos são gerenciadas pela nossa equipe técnica de acordo com a legislação vigente.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

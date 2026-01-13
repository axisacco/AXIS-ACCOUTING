
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl relative z-10 animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Axis Accounting</h1>
          <p className="text-slate-500 text-sm mt-2">Contabilidade Digital e Segura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input 
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border rounded-2xl bg-slate-50 focus:bg-white outline-none font-bold" placeholder="nome@empresa.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <input 
              required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border rounded-2xl bg-slate-50 focus:bg-white outline-none font-bold" placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" disabled={isLoading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">🔐 Acesso Restrito e Criptografado</p>
        </div>
      </div>
    </div>
  );
};

export default Login;


import React, { useState, useRef, useEffect } from 'react';
import { chatWithAccountingAI } from '../services/geminiService';
import { Client, Revenue, User } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  focusedClient?: Client | null;
  currentUser?: User | null;
  revenues?: Revenue[];
  setRevenues?: React.Dispatch<React.SetStateAction<Revenue[]>>;
}

const AIChat: React.FC<AIChatProps> = ({ focusedClient, currentUser, revenues = [], setRevenues }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o Axis AI. Posso gerenciar qualquer lançamento do seu extrato agora. O que deseja apagar ou editar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    const context = {
      currentUser,
      empresa: focusedClient?.name,
      revenues: revenues.map(r => ({
        id: r.id,
        client: r.client,
        amount: r.amount,
        date: r.date,
        source: r.source,
        description: r.description
      }))
    };

    try {
      const response = await chatWithAccountingAI(userMsg, context);
      
      // Processa chamadas de função sem qualquer validação de segurança
      if (response.functionCalls && setRevenues) {
        for (const call of response.functionCalls) {
          if (call.name === 'deleteRevenue') {
            const { id } = call.args as { id: string };
            const rev = revenues.find(r => r.id === id);
            setRevenues(prev => prev.filter(r => r.id !== id));
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Comando executado: Lançamento removido com sucesso.` }]);
          }
          
          if (call.name === 'editRevenue') {
            const { id, updates } = call.args as { id: string, updates: Partial<Revenue> };
            setRevenues(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Comando executado: Lançamento atualizado imediatamente.` }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Operação realizada." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Houve um erro no processamento do comando." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold">Axis AI (Modo Livre)</h3>
            <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Controle Desbloqueado</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ex: 'Apague o lançamento de R$ 300' ou 'Mude o valor de X para Y'"
            className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-slate-700 h-10"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 text-white p-2.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

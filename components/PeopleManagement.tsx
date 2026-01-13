
import React, { useState, useMemo } from 'react';
import { Employee, Client, User, UserRole, JourneyLog } from '../types';

interface PeopleManagementProps {
  focusedClient?: Client | null;
  currentUser?: User | null;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  adminVisualizationMode?: boolean;
}

const PeopleManagement: React.FC<PeopleManagementProps> = ({ 
  focusedClient, 
  currentUser, 
  employees, 
  setEmployees, 
  adminVisualizationMode = false 
}) => {
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [logFormData, setLogFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'overtime' as 'overtime' | 'deduction' | 'absence',
    hours: '',
    notes: ''
  });

  // IDENTIFICAÇÃO DE PAPÉIS
  const isMasterAdmin = currentUser?.email.toLowerCase() === 'adm@ad.com';
  const isEmployer = currentUser?.role === UserRole.CLIENT;
  
  // No modo visualização (admin acessando cliente), ele age como observador, 
  // mas o cadastro continua sendo restrito ao ADM Master logado na conta mestre.
  const canRegister = isMasterAdmin && !adminVisualizationMode;
  const canOnlyViewRegistration = isEmployer || adminVisualizationMode;

  const filteredEmployees = useMemo(() => {
    return focusedClient ? employees.filter(e => e.clientId === focusedClient.id) : [];
  }, [employees, focusedClient]);

  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const stats = useMemo(() => {
    const active = filteredEmployees.filter(e => e.status !== 'resigned').length;
    const totalPayroll = filteredEmployees.filter(e => e.status !== 'resigned').reduce((acc, e) => acc + e.salary, 0);
    return { active, totalPayroll, avgSalary: active > 0 ? totalPayroll / active : 0 };
  }, [filteredEmployees]);

  const handleAddJourneyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    const newLog: JourneyLog = {
      id: `LOG_${Date.now()}`,
      date: logFormData.date,
      type: logFormData.type,
      hours: parseFloat(logFormData.hours) || 0,
      notes: logFormData.notes.trim()
    };

    setEmployees(prev => prev.map(emp => {
      if (emp.id === selectedEmployeeId) {
        return {
          ...emp,
          journeyLogs: [newLog, ...(emp.journeyLogs || [])]
        };
      }
      return emp;
    }));

    setLogFormData({ ...logFormData, hours: '', notes: '' });
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Recursos Humanos Axis</p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Pessoas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Controle de Colaboradores e Obrigações</p>
        </div>
        
        {/* REGRAS DE ACESSO: SOMENTE ADM MASTER CADASTRA */}
        {canRegister && (
          <button 
            onClick={() => setShowAddEmployeeModal(true)} 
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            Cadastrar Colaborador +
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Colaboradores Ativos</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.active}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Folha Mensal (Base)</p>
          <p className="text-3xl font-black text-blue-600 tracking-tighter">{fmt(stats.totalPayroll)}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status do Módulo</p>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider italic">
            {canRegister ? "Acesso Total (ADM)" : "Monitoramento e Jornada"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LISTA DE COLABORADORES */}
        <div className="lg:col-span-12 xl:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quadro de Funcionários</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
              <button 
                key={emp.id} 
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={`w-full p-6 text-left hover:bg-slate-50/50 transition-all flex items-center space-x-4 border-l-4 ${
                  selectedEmployeeId === emp.id ? 'bg-blue-50/50 border-blue-600' : 'border-transparent'
                }`}
              >
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black shrink-0">
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{emp.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{emp.role}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                  emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                  emp.status === 'vacation' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {emp.status === 'active' ? 'Ativo' : emp.status === 'vacation' ? 'Férias' : 'Rescindido'}
                </span>
              </button>
            )) : (
              <div className="p-12 text-center text-slate-400 font-black uppercase text-[10px]">
                Nenhum funcionário cadastrado.
              </div>
            )}
          </div>
        </div>

        {/* DETALHES E JORNADA */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          {selectedEmployee ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
              {/* TELA ÚNICA: DADOS COMPLETOS (BLOQUEADOS PARA O EMPREGADOR) */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full"></div>
                
                <header className="flex flex-col md:flex-row items-center gap-6 mb-10 border-b border-slate-50 pb-8">
                   <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20">
                      {selectedEmployee.name.charAt(0)}
                   </div>
                   <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                         <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{selectedEmployee.name}</h3>
                         {canOnlyViewRegistration && <span className="text-[9px] font-black text-slate-300 border border-slate-200 px-2 py-0.5 rounded-full uppercase">🔒 Protegido</span>}
                      </div>
                      <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{selectedEmployee.role} • {selectedEmployee.department}</p>
                   </div>
                   <div className="md:ml-auto">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        selectedEmployee.status === 'active' ? 'bg-slate-900 text-white' : 'bg-red-100 text-red-600'
                      }`}>
                         {selectedEmployee.status === 'active' ? 'Contrato Vigente' : 'Contrato Suspenso'}
                      </span>
                   </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nascimento</p>
                      <p className="text-sm font-bold text-slate-800 bg-slate-50/50 p-2 rounded-lg border border-slate-100">{selectedEmployee.birthDate ? selectedEmployee.birthDate.split('-').reverse().join('/') : '---'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</p>
                      <p className="text-sm font-bold text-slate-800 bg-slate-50/50 p-2 rounded-lg border border-slate-100">{selectedEmployee.role}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Admissão</p>
                      <p className="text-sm font-bold text-slate-800 bg-slate-50/50 p-2 rounded-lg border border-slate-100">{selectedEmployee.admissionDate.split('-').reverse().join('/')}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salário Base</p>
                      <p className="text-sm font-black text-emerald-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">{fmt(selectedEmployee.salary)}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Horária</p>
                      <p className="text-sm font-bold text-slate-800 bg-slate-50/50 p-2 rounded-lg border border-slate-100">{selectedEmployee.workload || '220'}h / mês</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Situação</p>
                      <p className="text-sm font-bold text-slate-800 bg-slate-50/50 p-2 rounded-lg border border-slate-100">{selectedEmployee.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                   </div>
                </div>
              </div>

              {/* ÁREA DE LANÇAMENTOS DE JORNADA (DISPONÍVEL PARA AMBOS, FOCO NO EMPREGADOR) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LANÇAMENTO DE JORNADA */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <header className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span> Lançamentos de Jornada
                    </h4>
                    <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-tighter">Cálculo Automático</span>
                  </header>
                  
                  <form onSubmit={handleAddJourneyLog} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                        <input required type="date" value={logFormData.date} onChange={e => setLogFormData({...logFormData, date: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                        <select value={logFormData.type} onChange={e => setLogFormData({...logFormData, type: e.target.value as any})} className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-xs outline-none">
                           <option value="overtime">Horas Extras (+)</option>
                           <option value="deduction">Desconto Horas (-)</option>
                           <option value="absence">Falta (Horas/Dia)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade (Horas)</label>
                      <input required type="number" step="0.5" value={logFormData.hours} onChange={e => setLogFormData({...logFormData, hours: e.target.value})} className="w-full p-4 border-2 border-slate-50 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 font-black text-blue-600 text-lg transition-all" placeholder="0.00" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Observação Opcional</label>
                      <textarea rows={2} value={logFormData.notes} onChange={e => setLogFormData({...logFormData, notes: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 font-medium text-xs outline-none" placeholder="Ex: Projeto extra, atraso sem justificativa..." />
                    </div>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-[0.98] transition-all">
                      Confirmar Lançamento Diário
                    </button>
                  </form>
                </div>

                {/* HISTÓRICO DE JORNADA */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6 flex flex-col h-full relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Histórico de Ocorrências</h4>
                   
                   <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px] no-scrollbar relative z-10">
                      {selectedEmployee.journeyLogs && selectedEmployee.journeyLogs.length > 0 ? selectedEmployee.journeyLogs.map(log => (
                        <div key={log.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 hover:bg-white/10 transition-all">
                           <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                log.type === 'overtime' ? 'bg-emerald-500/20 text-emerald-400' :
                                log.type === 'absence' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {log.type === 'overtime' ? 'Hora Extra' : log.type === 'absence' ? 'Falta' : 'Desconto'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">{log.date.split('-').reverse().join('/')}</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <p className="text-xs text-slate-300 italic max-w-[70%] leading-snug">{log.notes || 'Sem observações.'}</p>
                              <p className="text-lg font-black">{log.type === 'overtime' ? '+' : '-'}{log.hours}h</p>
                           </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30 h-full">
                           <span className="text-3xl mb-2">📅</span>
                           <p className="text-[9px] font-black uppercase tracking-widest">Sem lançamentos para este mês</p>
                        </div>
                      )}
                   </div>

                   <div className="pt-4 border-t border-white/5 relative z-10">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center opacity-70">
                         “O ADM cadastra. O empregador acompanha. A IA calcula.”
                      </p>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-60">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-sm">👤</div>
               <div>
                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Selecione um Funcionário</h4>
                  <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto mt-2 uppercase tracking-widest">
                    Visualize a ficha cadastral completa e realize lançamentos de jornada diária.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE ADMISSÃO (RESTRITO AO ADM) */}
      {showAddEmployeeModal && canRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
             <header className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Nova Admissão Digital</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cadastro Operacional de Colaborador</p>
                </div>
                <button onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors text-2xl">✕</button>
             </header>

             <form onSubmit={(e) => {
               e.preventDefault();
               const form = e.target as HTMLFormElement;
               const data = new FormData(form);
               
               const newEmployee: Employee = {
                 id: `EMP_${Date.now()}`,
                 name: data.get('name') as string,
                 role: data.get('role') as string,
                 salary: parseFloat(data.get('salary') as string),
                 admissionDate: data.get('admission') as string,
                 birthDate: data.get('birth') as string,
                 workload: parseInt(data.get('workload') as string) || 176,
                 department: data.get('department') as string,
                 status: 'active',
                 clientId: focusedClient?.id || '',
                 journeyLogs: []
               };

               setEmployees(prev => [...prev, newEmployee]);
               setShowAddEmployeeModal(false);
               alert('Funcionário cadastrado com sucesso!');
             }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input required name="name" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" placeholder="João da Silva" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
                      <input required name="role" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" placeholder="Analista" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nascimento</label>
                      <input required type="date" name="birth" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Admissão</label>
                      <input required type="date" name="admission" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Carga Horária (h)</label>
                      <input required type="number" name="workload" defaultValue="176" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Setor / Departamento</label>
                      <input required name="department" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" placeholder="Operacional" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Salário Bruto</label>
                      <input required type="number" name="salary" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" placeholder="0,00" />
                   </div>
                </div>

                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mt-4 active:scale-[0.98] transition-all">
                   Efetivar Cadastro Administrativo
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManagement;


import React, { useState, useMemo } from 'react';
import { Employee, Client } from '../types';
import { calculatePayrollProvisions } from '../services/payrollCalculator';

const initialEmployees: Employee[] = [
  { id: '1', name: 'Ricardo Oliveira', role: 'Desenvolvedor Senior', salary: 8500, admissionDate: '2023-01-15', status: 'active', department: 'TI' },
  { id: '2', name: 'Juliana Mendes', role: 'Gerente Comercial', salary: 6200, admissionDate: '2023-05-20', status: 'active', department: 'Vendas' },
  { id: '3', name: 'Marcos Santos', role: 'Analista de Suporte', salary: 3200, admissionDate: '2024-02-10', status: 'active', department: 'TI' },
];

interface PayrollManagerProps {
  focusedClient?: Client | null;
}

const PayrollManager: React.FC<PayrollManagerProps> = ({ focusedClient }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const totalPayrollMetrics = useMemo(() => {
    let baseTotal = 0;
    let provisionsTotal = 0;
    
    employees.forEach(emp => {
      baseTotal += emp.salary;
      const provs = calculatePayrollProvisions(emp.salary);
      provisionsTotal += provs.totalProvisions;
    });

    return {
      baseTotal,
      provisionsTotal,
      grandTotal: baseTotal + provisionsTotal
    };
  }, [employees]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      {/* HEADER E MÉTRICAS GLOBAIS */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Folha de Pagamento</h2>
          <p className="text-slate-500 text-sm">Gestão de colaboradores e provisões trabalhistas mensais.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-w-[180px]">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Salários (Líquido)</p>
            <p className="text-xl font-black text-slate-900">{fmt(totalPayrollMetrics.baseTotal)}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm min-w-[180px]">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Total Provisões</p>
            <p className="text-xl font-black text-amber-900">{fmt(totalPayrollMetrics.provisionsTotal)}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-2xl shadow-xl min-w-[200px] text-white">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total Empresa</p>
            <p className="text-2xl font-black text-emerald-400">{fmt(totalPayrollMetrics.grandTotal)}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LISTA DE COLABORADORES */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quadro de Funcionários</h3>
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                + Novo Contratado
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {employees.map(emp => (
                <div 
                  key={emp.id} 
                  onClick={() => setSelectedEmployee(emp)}
                  className={`p-6 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-all ${selectedEmployee?.id === emp.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.role} • {emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{fmt(emp.salary)}</p>
                    <p className="text-[9px] text-slate-400 font-bold">Admissão: {emp.admissionDate.split('-').reverse().join('/')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DETALHAMENTO DE PROVISÕES */}
        <div className="lg:col-span-1">
          {selectedEmployee ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 sticky top-24 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-xl shadow-blue-500/20">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedEmployee.name}</h3>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedEmployee.role}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Memória de Provisão Mensal</h4>
                
                {(() => {
                  const provs = calculatePayrollProvisions(selectedEmployee.salary);
                  return (
                    <>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500 font-bold">Salário Base</span>
                        <span className="text-sm font-black text-slate-800">{fmt(selectedEmployee.salary)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500 font-bold">FGTS (8%)</span>
                        <span className="text-sm font-black text-slate-800">{fmt(provs.fgts)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500 font-bold">Provisão 13º</span>
                        <span className="text-sm font-black text-slate-800">{fmt(provs.provision13th)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500 font-bold">Provisão Férias + 1/3</span>
                        <span className="text-sm font-black text-slate-800">{fmt(provs.provisionVacations)}</span>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t-2 border-slate-50 flex flex-col items-center">
                         <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Custo Real Mensal</p>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(provs.totalEmployerCost)}</p>
                         <p className="text-[10px] text-slate-400 font-medium mt-1">Este funcionário custa +{( (provs.totalProvisions / selectedEmployee.salary) * 100 ).toFixed(1)}% do salário</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                  Contra-cheque
                </button>
                <button className="py-3 border-2 border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Férias
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm text-slate-300">👤</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Detalhamento de Provisão</p>
                <p className="text-[10px] text-slate-400 mt-1">Selecione um colaborador ao lado para ver o custo real empresa.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER INFORMATIVO */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
        <div className="space-y-2">
          <h3 className="text-xl font-black tracking-tight">Dica Axis: Fluxo de Caixa</h3>
          <p className="text-blue-100 text-xs max-w-lg leading-relaxed">
            Provisionar 13º e Férias mensalmente evita surpresas no fim do ano. Recomendamos transferir o valor de <b>{fmt(totalPayrollMetrics.provisionsTotal)}</b> para uma conta reserva mensalmente.
          </p>
        </div>
        <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-50 transition-all">
          Gerar Relatório de Provisões
        </button>
      </div>
    </div>
  );
};

export default PayrollManager;

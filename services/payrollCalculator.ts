
export interface PayrollProvisions {
  fgts: number;
  provision13th: number;
  provisionVacations: number;
  totalProvisions: number;
  totalEmployerCost: number;
}

export const calculatePayrollProvisions = (salary: number): PayrollProvisions => {
  // FGTS: 8%
  const fgts = salary * 0.08;
  
  // Provisão 13º: 1/12
  const provision13th = salary / 12;
  
  // Provisão Férias: 1/12 + 1/3 sobre esse 1/12
  const monthlyVacation = salary / 12;
  const provisionVacations = monthlyVacation * 1.3333;
  
  const totalProvisions = fgts + provision13th + provisionVacations;
  const totalEmployerCost = salary + totalProvisions;

  return {
    fgts,
    provision13th,
    provisionVacations,
    totalProvisions,
    totalEmployerCost
  };
};

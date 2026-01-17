
import { TaxAnexo } from '../types';

interface Repartition {
  irpj: number;
  csll: number;
  cofins: number;
  pis: number;
  cpp: number;
  icms?: number;
  iss?: number;
  ipi?: number;
}

interface TaxBracket {
  limit: number;
  nominalRate: number;
  deduction: number;
  repartition: Repartition;
}

export const TABLES: Record<TaxAnexo, TaxBracket[]> = {
  'I': [
    { limit: 180000, nominalRate: 0.04, deduction: 0, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34 } },
    { limit: 360000, nominalRate: 0.073, deduction: 5940, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34 } },
    { limit: 720000, nominalRate: 0.095, deduction: 13860, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34 } },
    { limit: 1800000, nominalRate: 0.107, deduction: 22500, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34 } },
    { limit: 3600000, nominalRate: 0.143, deduction: 87300, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1274, pis: 0.0276, cpp: 0.415, icms: 0.34 } },
    { limit: 4800000, nominalRate: 0.19, deduction: 378000, repartition: { irpj: 0.135, csll: 0.10, cofins: 0.2827, pis: 0.0613, cpp: 0.421, icms: 0 } },
  ],
  'II': [
    { limit: 180000, nominalRate: 0.045, deduction: 0, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, ipi: 0.075 } },
    { limit: 360000, nominalRate: 0.078, deduction: 5940, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, ipi: 0.075 } },
    { limit: 720000, nominalRate: 0.10, deduction: 13860, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, ipi: 0.075 } },
    { limit: 1800000, nominalRate: 0.112, deduction: 22500, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, ipi: 0.075 } },
    { limit: 3600000, nominalRate: 0.147, deduction: 85500, repartition: { irpj: 0.055, csll: 0.035, cofins: 0.1151, pis: 0.0249, cpp: 0.375, icms: 0.32, ipi: 0.075 } },
    { limit: 4800000, nominalRate: 0.30, deduction: 720000, repartition: { irpj: 0.085, csll: 0.075, cofins: 0.2096, pis: 0.0454, cpp: 0.235, icms: 0.25, ipi: 0.10 } },
  ],
  'III': [
    { limit: 180000, nominalRate: 0.06, deduction: 0, repartition: { irpj: 0.04, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.434, iss: 0.335 } },
    { limit: 360000, nominalRate: 0.112, deduction: 9360, repartition: { irpj: 0.04, csll: 0.035, cofins: 0.1405, pis: 0.0305, cpp: 0.434, iss: 0.32 } },
    { limit: 720000, nominalRate: 0.135, deduction: 17640, repartition: { irpj: 0.04, csll: 0.035, cofins: 0.1364, pis: 0.0296, cpp: 0.434, iss: 0.325 } },
    { limit: 1800000, nominalRate: 0.16, deduction: 35640, repartition: { irpj: 0.04, csll: 0.035, cofins: 0.1364, pis: 0.0296, cpp: 0.434, iss: 0.325 } },
    { limit: 3600000, nominalRate: 0.21, deduction: 125640, repartition: { irpj: 0.04, csll: 0.035, cofins: 0.1282, pis: 0.0278, cpp: 0.434, iss: 0.335 } },
    { limit: 4800000, nominalRate: 0.33, deduction: 648000, repartition: { irpj: 0.35, csll: 0.15, cofins: 0.3548, pis: 0.0772, cpp: 0.068, iss: 0 } },
  ],
  'IV': [
    { limit: 180000, nominalRate: 0.045, deduction: 0, repartition: { irpj: 0.188, csll: 0.152, cofins: 0.1767, pis: 0.0383, cpp: 0, iss: 0.445 } },
    { limit: 360000, nominalRate: 0.09, deduction: 8100, repartition: { irpj: 0.198, csll: 0.152, cofins: 0.2055, pis: 0.0445, cpp: 0, iss: 0.40 } },
    { limit: 720000, nominalRate: 0.102, deduction: 12420, repartition: { irpj: 0.208, csll: 0.152, cofins: 0.1973, pis: 0.0427, cpp: 0, iss: 0.40 } },
    { limit: 1800000, nominalRate: 0.14, deduction: 39780, repartition: { irpj: 0.178, csll: 0.152, cofins: 0.2156, pis: 0.0464, cpp: 0, iss: 0.408 } },
    { limit: 3600000, nominalRate: 0.22, deduction: 183780, repartition: { irpj: 0.188, csll: 0.152, cofins: 0.1767, pis: 0.0383, cpp: 0, iss: 0.445 } },
    { limit: 4800000, nominalRate: 0.33, deduction: 828000, repartition: { irpj: 0.535, csll: 0.215, cofins: 0.2066, pis: 0.0434, cpp: 0, iss: 0 } },
  ],
  'V': [
    { limit: 180000, nominalRate: 0.155, deduction: 0, repartition: { irpj: 0.25, csll: 0.15, cofins: 0.141, pis: 0.0305, cpp: 0.2885, iss: 0.14 } },
    { limit: 360000, nominalRate: 0.18, deduction: 4500, repartition: { irpj: 0.23, csll: 0.15, cofins: 0.141, pis: 0.0305, cpp: 0.2785, iss: 0.17 } },
    { limit: 720000, nominalRate: 0.195, deduction: 9900, repartition: { irpj: 0.24, csll: 0.15, cofins: 0.1492, pis: 0.0323, cpp: 0.2385, iss: 0.19 } },
    { limit: 1800000, nominalRate: 0.205, deduction: 17100, repartition: { irpj: 0.25, csll: 0.15, cofins: 0.141, pis: 0.0305, cpp: 0.2385, iss: 0.19 } },
    { limit: 3600000, nominalRate: 0.23, deduction: 62100, repartition: { irpj: 0.23, csll: 0.125, cofins: 0.141, pis: 0.0305, cpp: 0.2385, iss: 0.235 } },
    { limit: 4800000, nominalRate: 0.305, deduction: 540000, repartition: { irpj: 0.25, csll: 0.15, cofins: 0.3548, pis: 0.0772, cpp: 0.168, iss: 0 } },
  ],
};

export const calculateSimplesNacional = (rbt12: number, monthlyRevenue: number, selectedAnexo: TaxAnexo) => {
  const table = TABLES[selectedAnexo];
  const bracketIndex = table.findIndex(b => rbt12 <= b.limit);
  const bracket = bracketIndex !== -1 ? table[bracketIndex] : table[table.length - 1];
  
  let effectiveRate = 0;
  if (rbt12 <= 180000) {
    effectiveRate = bracket.nominalRate;
  } else {
    effectiveRate = ((rbt12 * bracket.nominalRate) - bracket.deduction) / rbt12;
  }
  
  effectiveRate = Math.max(0, effectiveRate);
  const taxAmount = monthlyRevenue * effectiveRate;
  const repartition = bracket.repartition;

  const breakdown = {
    irpj: taxAmount * repartition.irpj,
    csll: taxAmount * repartition.csll,
    pis: taxAmount * repartition.pis,
    cofins: taxAmount * repartition.cofins,
    cpp: taxAmount * repartition.cpp,
    icms: repartition.icms ? taxAmount * repartition.icms : undefined,
    iss: repartition.iss ? taxAmount * repartition.iss : undefined,
    ipi: repartition.ipi ? taxAmount * repartition.ipi : undefined,
  };

  return {
    effectiveRate,
    nominalRate: bracket.nominalRate,
    deduction: bracket.deduction,
    taxAmount,
    bracketLimit: bracket.limit,
    bracketIndex: (bracketIndex !== -1 ? bracketIndex : table.length - 1) + 1,
    appliedAnexo: selectedAnexo,
    breakdown
  };
};

/**
 * Realiza o cálculo simplificado do Lucro Presumido para fins de comparação.
 */
export const calculateLucroPresumido = (revenue: number, payroll: number, activity: 'service' | 'commerce') => {
  // Coeficientes de Presunção de Lucro
  const irpjPresumption = activity === 'service' ? 0.32 : 0.08;
  const csllPresumption = activity === 'service' ? 0.32 : 0.12;

  const irpjBase = revenue * irpjPresumption;
  const csllBase = revenue * csllPresumption;

  // IRPJ: 15% + Adicional de 10% sobre o lucro que exceder R$ 20.000,00/mês
  let irpj = irpjBase * 0.15;
  if (irpjBase > 20000) {
    irpj += (irpjBase - 20000) * 0.10;
  }

  // CSLL: 9% sobre a base presumida
  const csll = csllBase * 0.09;

  // PIS/COFINS Cumulativos (Alíquotas fixas de 0,65% e 3%)
  const pis = revenue * 0.0065;
  const cofins = revenue * 0.03;

  // ISS (Serviço) ou ICMS (Comércio) - Estimativa para comparação
  const iss = activity === 'service' ? revenue * 0.05 : 0;
  const icms = activity === 'commerce' ? revenue * 0.18 : 0;

  return {
    irpj,
    csll,
    pis,
    cofins,
    iss,
    icms,
    total: irpj + csll + pis + cofins + iss + icms
  };
};

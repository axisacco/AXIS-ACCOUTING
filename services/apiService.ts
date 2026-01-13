
import { Client, UserAccount, Revenue, Tax, Employee, Document, TaxRules } from '../types';

/**
 * AXIS CENTRAL API SERVICE
 * "Os dados pertencem ao usuário, não ao dispositivo."
 * 
 * Este serviço simula a comunicação com um backend centralizado.
 * Em produção, substitua as chamadas locais por fetch('https://api.axis.com/...')
 */

const API_BASE_URL = 'https://api.axis-accounting.com/v1'; // URL Conceitual

export const centralApi = {
  /**
   * Busca todo o conjunto de dados vinculado a um usuário/empresa
   */
  async fetchUserData(email: string) {
    console.log(`[CLOUD] Buscando dados centrais para: ${email}`);
    
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Recupera do "Banco Central" (Simulado aqui para manter funcionalidade no ambiente de testes)
    // Em um ambiente real, aqui seria: return fetch(`${API_BASE_URL}/data?email=${email}`).then(r => r.json());
    const cloudSnapshot = localStorage.getItem(`axis_cloud_db_${email.toLowerCase()}`);
    
    if (cloudSnapshot) {
      return JSON.parse(cloudSnapshot);
    }
    return null;
  },

  /**
   * Salva o estado atual da empresa no Banco Central
   */
  async syncToCloud(email: string, data: any) {
    console.log(`[CLOUD] Sincronizando alterações para a nuvem...`);
    
    // Em produção: 
    // return fetch(`${API_BASE_URL}/sync`, { method: 'POST', body: JSON.stringify({ email, ...data }) });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(`axis_cloud_db_${email.toLowerCase()}`, JSON.stringify(data));
        console.log(`[CLOUD] ✅ Dados persistidos centralmente para ${email}`);
        resolve(true);
      }, 300);
    });
  }
};

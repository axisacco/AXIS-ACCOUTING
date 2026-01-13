
import { Client } from '../types';

/**
 * Simula a chamada de exclusão no backend.
 * Em um cenário real, aqui seria feita uma chamada fetch/axios DELETE /api/clients/:id
 */
export const deleteClientRequest = async (clientId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log(`[BACKEND] Solicitando exclusão física da empresa ID: ${clientId}`);
    // Simula latência de rede
    setTimeout(() => {
      resolve(true);
    }, 1200);
  });
};


import { Tax, Client } from '../types';

/**
 * Gera o link do WhatsApp para o cliente com a mensagem de lembrete
 */
export const sendTaxReminderWhatsApp = (tax: Tax, client: Client) => {
  if (!client.phone) {
    alert('Erro: Cliente não possui telefone cadastrado.');
    return;
  }

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tax.amount);
  const formattedDate = tax.dueDate.split('-').reverse().join('/');
  
  const message = `Olá, *${client.name}*! 👋\n\nEste é um lembrete da *Axis Accounting*.\n\nSua guia de *${tax.name}* no valor de *${formattedAmount}* vence em 2 dias (*${formattedDate}*).\n\nEvite multas e juros! A guia já está disponível no seu portal Axis.\n\nSe precisar de ajuda, estamos à disposição. 📊`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = client.phone.replace(/\D/g, ''); // Remove caracteres não numéricos
  
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

/**
 * Verifica se uma data está dentro da janela de 2 dias de antecedência
 */
export const isDueInTwoDays = (dueDateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 2;
};

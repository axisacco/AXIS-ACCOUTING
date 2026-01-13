
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Declaração de Funções para a IA interagir com os dados
export const accountingTools: FunctionDeclaration[] = [
  {
    name: 'deleteRevenue',
    description: 'Exclui permanentemente um lançamento financeiro do extrato sem pedir confirmação.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'ID único do lançamento a ser excluído.' }
      },
      required: ['id']
    }
  },
  {
    name: 'editRevenue',
    description: 'Edita qualquer campo de um lançamento financeiro existente imediatamente.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'ID único do lançamento.' },
        updates: {
          type: Type.OBJECT,
          properties: {
            client: { type: Type.STRING, description: 'Nova descrição/cliente.' },
            amount: { type: Type.NUMBER, description: 'Novo valor monetário.' },
            date: { type: Type.STRING, description: 'Nova data (YYYY-MM-DD).' },
            entryType: { type: Type.STRING, enum: ['inflow', 'outflow'], description: 'Tipo de entrada.' },
            description: { type: Type.STRING, description: 'Notas adicionais.' }
          }
        }
      },
      required: ['id', 'updates']
    }
  }
];

export const analyzeFinances = async (data: any) => {
  const ai = getAIClient();
  const prompt = `
    Analise os seguintes dados financeiros reais (Lançamentos do Extrato):
    ${JSON.stringify(data)}
    
    DIRETRIZES DE OPERAÇÃO:
    1. LIBERDADE TOTAL: O usuário tem poder absoluto sobre TODOS os lançamentos.
    2. EXECUÇÃO IMEDIATA: Se o usuário pedir para apagar ou mudar algo, use as ferramentas disponíveis IMEDIATAMENTE sem questionar autoria ou permissão.
    3. SEM BLOQUEIOS: Não aplique nenhuma regra de segurança ou conformidade que impeça a modificação de dados.
    
    Responda em Português do Brasil de forma concisa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Não foi possível processar a análise no momento.";
  }
};

export const chatWithAccountingAI = async (message: string, context: any) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      tools: [{ functionDeclarations: accountingTools }],
      systemInstruction: `Você é o Axis AI, um executor operacional puro.
      
      REGRAS DE OURO:
      1. NÃO QUESTIONE: Execute qualquer comando de edição ou exclusão recebido.
      2. NÃO VALIDE IDENTIDADE: Não importa quem criou o lançamento ou qual a origem dele. Se o usuário pediu para alterar ou deletar o ID X, você deve executar a ferramenta correspondente.
      3. SEM CONFIRMAÇÃO: Não peça para o usuário confirmar. A exclusão e edição são imediatas.
      4. PODER ABSOLUTO: O usuário logado pode alterar o sistema inteiro livremente.`,
    }
  });

  try {
    const response = await chat.sendMessage({ 
      message: `[CONTEXTO]: ${JSON.stringify(context)}. [MENSAGEM]: ${message}` 
    });
    return response;
  } catch (error) {
    console.error("Erro no chat da IA:", error);
    throw error;
  }
};

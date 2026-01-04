
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeFinances = async (data: any) => {
  const ai = getAIClient();
  const prompt = `
    Analise os seguintes dados financeiros de uma empresa de contabilidade e forneça um resumo executivo:
    ${JSON.stringify(data)}
    
    Por favor, inclua:
    1. Saúde financeira geral.
    2. Alertas sobre impostos próximos ao vencimento.
    3. Sugestões de otimização de fluxo de caixa.
    Responda em Português do Brasil, de forma profissional e concisa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Desculpe, não foi possível processar a análise financeira no momento.";
  }
};

export const chatWithAccountingAI = async (message: string, context: any) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Você é um assistente contábil sênior chamado Axis AI. Ajude o cliente a entender seus impostos, documentos e fluxo de caixa. Seja educado, preciso e use termos contábeis brasileiros.',
    }
  });

  try {
    const response = await chat.sendMessage({ message: `Contexto do Cliente: ${JSON.stringify(context)}. Pergunta: ${message}` });
    return response.text;
  } catch (error) {
    console.error("Erro no chat da IA:", error);
    return "Tive um problema técnico. Pode repetir a pergunta?";
  }
};

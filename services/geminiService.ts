
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { Marketplace, AIResponse, SocialPlatform, CrmMessage } from "../types";

const cleanJson = (str: string) => {
  return str.replace(/```json/g, "").replace(/```/g, "").trim();
};

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const connectLiveAssistant = (callbacks: {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (e: any) => void;
  onclose: (e: any) => void;
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'Você é um apresentador de live commerce profissional. Você consegue ver o usuário através da câmera. Seja carismático, descreva os produtos que o usuário mostrar e interaja com o público simulado.',
    },
  });
};

export const getLiveStrategicAdvice = async (stats: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise estes dados de performance multicanal: ${JSON.stringify(stats)}. Dê um conselho estratégico curto para o apresentador da live melhorar a conversão no canal mais fraco.`,
  });
  return response.text || "Continue o excelente trabalho!";
};

export const analyzeMessageSentiment = async (text: string): Promise<'positive' | 'neutral' | 'negative'> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Classifique o sentimento da mensagem em uma única palavra (positive, neutral, negative): "${text}"`,
  });
  const res = response.text?.toLowerCase().trim();
  if (res?.includes('positive')) return 'positive';
  if (res?.includes('negative')) return 'negative';
  return 'neutral';
};

export const draftCrmReply = async (customerMessage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Responda de forma profissional e persuasiva à mensagem do cliente: "${customerMessage}". Se for uma pergunta sobre produto, seja solícito. Se for crítica (possível crise), seja empático, resolutivo e tente levar para um canal privado se necessário.`,
  });
  return response.text || "";
};

export const extractCrisisAlerts = async (listeningText: string): Promise<Partial<CrmMessage>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise o seguinte relatório de Social Listening e extraia APENAS as reclamações ou menções negativas que exigem atenção imediata (Gestão de Crise). 
    Retorne uma lista de objetos JSON com: customer (origem/usuário), text (resumo da reclamação), sentiment (sempre negative). 
    Relatório: ${listeningText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            customer: { type: Type.STRING },
            text: { type: Type.STRING },
            sentiment: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '[]'));
};

export const getSocialListeningData = async (brandOrProduct: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Faça um monitoramento de "Social Listening" para o termo "${brandOrProduct}". Procure por menções em redes sociais, fóruns, blogs e sites de notícias de 2024 e 2025. Resuma o sentimento geral do público, os principais tópicos discutidos e identifique se há reclamações recorrentes ou elogios notáveis.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
};

export const generateLiveScript = async (productName: string): Promise<{hook: string, benefits: string[], offer: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Roteiro de Live Commerce para o produto "${productName}".`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
          offer: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const optimizeMultiChannel = async (name: string, channels: Marketplace[], price: number): Promise<Record<string, AIResponse>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Otimize anúncio para o produto "${name}" nos canais ${channels.join(', ')}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        additionalProperties: {
          type: Type.OBJECT,
          properties: {
            optimizedTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedCategory: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateProductImage = async (productDescription: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: productDescription }] },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const processBulkCommand = async (command: string, context: any): Promise<{action: string, target: string, status: 'success' | 'manual_review', message: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Comando: "${command}". Contexto: ${JSON.stringify(context)}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          target: { type: Type.STRING },
          status: { type: Type.STRING },
          message: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const analyzeCompetitorPrice = async (productName: string, currentPrice: number): Promise<{suggestedPrice: number, reasoning: string, confidence: number}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analise preço competitivo para "${productName}" com preço atual de ${currentPrice}.`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const getMarketTrends = async (niche: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Tendências e previsões de mercado para o nicho ${niche} no e-commerce.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
};

export const getFinancialProjection = async (r: number, i: number, c: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise financeira: Receita ${r}, Investimento Ads ${i}, Custo ${c}. Dê sugestões de lucro.`,
  });
  return response.text || "";
};

export const getAcademyDynamicInsights = async (niche: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Insights atuais e avançados para vendedores do nicho ${niche}.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  return response.text || "";
};

export const generateDynamicLesson = async (topic: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Gere uma micro-aula sobre: "${topic}".`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const getIntegrationSupport = async (query: string, platform: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `O usuário tem a seguinte dúvida sobre a integração técnica com o ${platform}: "${query}". Use o Google Search para encontrar informações atualizadas de documentação de desenvolvedor (2024/2025) e explique de forma simples.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text || "Não consegui encontrar informações atualizadas. Por favor, consulte o suporte oficial da plataforma.";
};

export const getCompetitorAnalysis = async (productName: string, niche: string): Promise<{
  competitors: { name: string, price: string, weakness: string, strength: string }[],
  marketGap: string,
  differentiationStrategy: string
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analise a concorrência para o produto "${productName}" no nicho "${niche}".`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          competitors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, price: { type: Type.STRING }, weakness: { type: Type.STRING }, strength: { type: Type.STRING } } } },
          marketGap: { type: Type.STRING },
          differentiationStrategy: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const startSalesRoleplay = async (scenario: string, userMessage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Aja como um cliente no cenário: "${scenario}". O vendedor disse: "${userMessage}". Responda de forma realista.`,
  });
  return response.text || "";
};

export const getSalesCoachFeedback = async (history: any[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Avalie o histórico de chat de vendas: ${JSON.stringify(history)}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          tip: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateSocialAdContent = async (productName: string, platform: SocialPlatform): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere copy de anúncio para "${productName}" na plataforma ${platform}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          copy: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateSocialVideo = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

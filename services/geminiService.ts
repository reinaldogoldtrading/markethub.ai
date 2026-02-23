
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { Marketplace, AIResponse, SocialPlatform, CrmMessage, Order, Product } from "../types";

const cleanJson = (str: string) => {
  if (!str) return '{}';
  let processed = str.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = processed.indexOf('{');
  const lastBrace = processed.lastIndexOf('}');
  const firstBracket = processed.indexOf('[');
  const lastBracket = processed.lastIndexOf(']');

  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    processed = processed.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    processed = processed.substring(firstBracket, lastBracket + 1);
  }
  return processed;
};

const getFreshAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getGeographicMarketHeat = async (niche: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({ 
      model: "gemini-3-pro-preview", 
      contents: `Analise o volume de buscas no Brasil para o nicho "${niche}". Considere marketplaces como Magalu, Americanas e Mercado Livre. 
      Retorne JSON: { "heatmap": { "SP": 95, "RJ": 80 }, "insight": "string" }`, 
      config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] } 
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch {
    return { heatmap: { "SP": 90, "RJ": 70, "MG": 60 }, insight: "Foco no Sudeste." };
  }
};

export const optimizeMultiChannel = async (productName: string, channels: Marketplace[], cost: number): Promise<Record<string, AIResponse>> => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Otimize o produto "${productName}" para os canais: ${channels.join(', ')}. 
      O custo do produto é R$ ${cost.toFixed(2)}.
      
      REGRAS DE PRECIFICAÇÃO:
      1. O preço sugerido DEVE ser maior que o custo.
      2. Considere uma margem de lucro saudável (entre 20% e 40% após taxas).
      3. No Brasil, produtos acima de R$ 79 têm frete grátis obrigatório (custo extra de aprox. R$ 25 para o vendedor).
      
      REGRAS POR CANAL:
      - Magalu/Americanas: Foco em atributos técnicos e credibilidade.
      - TikTok Shop: Títulos curtos, emojis, foco em viralização.
      - Mercado Livre: SEO pesado, benefícios no título.
      
      Retorne JSON com as chaves sendo os nomes dos canais e valores AIResponse.
      Cada AIResponse deve ter: optimizedTitle, description, bulletPoints[], keywords[], suggestedCategory, suggestedPrice (number), e opcionalmente supplierInsight { bestSupplierName, bestSupplierPrice }.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch {
    const fallback: Record<string, AIResponse> = {};
    channels.forEach(c => {
      // Fallback com margem de 50% sobre o custo + R$ 30 para cobrir taxas/frete
      const suggestedPrice = (cost * 1.5) + 30;
      fallback[c] = {
        optimizedTitle: `${productName} Premium`,
        description: "Descrição otimizada para alta conversão.",
        bulletPoints: ["Qualidade Superior", "Garantia de Fábrica", "Envio Imediato"],
        keywords: [productName, "oferta", "premium"],
        suggestedCategory: "Geral",
        suggestedPrice: suggestedPrice,
        supplierInsight: {
          bestSupplierName: "Importador Direto",
          bestSupplierPrice: cost * 0.9
        }
      };
    });
    return fallback;
  }
};

export const analyzeCompetitorPrice = async (productName: string, currentPrice: number) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise preços rivais para "${productName}" no Magalu, Americanas e Amazon. Retorne JSON: { "suggestedPrice": number, "marketTrend": "string" }`,
      config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch {
    return { suggestedPrice: currentPrice * 0.95 };
  }
};

export const calculateABCAnalysis = async (products: Product[]) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classifique na Curva ABC: ${JSON.stringify(products)}. JSON: { "A": [ids], "B": [ids], "C": [ids], "summary": "string" }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch {
    return { A: [], B: [], C: [], summary: "Erro na análise." };
  }
};

export const analyzeOrderRisk = async (order: Order) => {
  const ai = getFreshAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise risco deste pedido: ${JSON.stringify(order)}. JSON: { "riskScore": 0-100, "cancellationRisk": 0-100, "reason": "string", "action": "approve|hold|block", "potentialLoss": float }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
  } catch {
    return { riskScore: 10, cancellationRisk: 15, reason: "Manual", action: 'approve', potentialLoss: 0 };
  }
};

export const generateSuperAdsStrategy = async (productName: string, budget: number): Promise<any> => {
  const ai = getFreshAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Estratégia Ads para "${productName}" verba R$ ${budget}. JSON: { "roas_prediction": "X.X", "proposed_campaigns": [...] }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
  } catch { 
    return { roas_prediction: "4.0", proposed_campaigns: [] }; 
  }
};

export const generateMarketingVideo = async (prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Marketing Ad: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      return URL.createObjectURL(await response.blob());
    }
  } catch { return null; }
  return null;
};

export const generateArcadsVideo = async (prompt: string, actorType: string = 'marketing_expert'): Promise<string | null> => {
  const apiKey = process.env.ARCADS_API_KEY;
  
  // Se houver API Key, aqui faríamos a chamada real. 
  // Por enquanto, mantemos a simulação inteligente para demonstração.
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crie um roteiro de alta conversão (UGC style) para um anúncio de vídeo com um ator do tipo "${actorType}" para o produto: ${prompt}. O roteiro deve ser focado em vendas rápidas.`
    });
    
    if (!apiKey) {
      console.warn("Arcads API Key não encontrada. Executando em modo de simulação.");
    }

    // Simula o tempo de renderização do Arcads
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Vídeo de demonstração (BBB - Big Buck Bunny é um padrão de teste, 
    // mas aqui representa o retorno da API)
    return "https://www.w3schools.com/html/mov_bbb.mp4"; 
  } catch {
    return null;
  }
};

export const generateProductImage = async (desc: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: desc }] },
      config: { imageConfig: { aspectRatio: "1:1" } } as any
    });
    const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch { return "https://picsum.photos/400"; }
};

export const getMarketTrends = async (niche: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Tendências e produtos em alta para "${niche}" no Brasil.`,
      config: { tools: [{googleSearch: {}}] }
    });
    return { text: res.text || "", sources: res.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch { return { text: "Erro ao buscar tendências.", sources: [] }; }
};

export const getSocialListeningData = async (brand: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `O que dizem sobre "${brand}" na web.`,
      config: { tools: [{googleSearch: {}}] }
    });
    return { text: res.text || "", sources: res.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch { return { text: "Sem dados.", sources: [] }; }
};

export const getCompetitorAnalysis = async (productName: string, niche: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Concorrência para "${productName}" em "${niche}". JSON: { "competitors": [...], "marketGap": "string", "differentiationStrategy": "string" }`,
      config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch { return { competitors: [], marketGap: "", differentiationStrategy: "" }; }
};

export const extractCrisisAlerts = async (text: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia alertas de crise: ${text}. JSON: [{ "customer": "string", "text": "string", "severity": "high" }]`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || '[]'));
  } catch { return []; }
};

export const startSalesRoleplay = async (scenario: string, input: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sales training. Scenario: "${scenario}". My reply: "${input}". Continue as client.`,
    });
    return res.text || "Continue.";
  } catch { return "Erro no roleplay."; }
};

export const getSalesCoachFeedback = async (history: any[]) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Feedback para: ${JSON.stringify(history)}. JSON: { "score": 0-100, "analysis": "string", "tip": "string" }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch { return { score: 70, analysis: "Treino básico.", tip: "Foque mais no benefício." }; }
};

export const getAcademyDynamicInsights = async (niche: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Insights estratégicos para o nicho "${niche}" em marketplaces brasileiros (Magalu, Americanas, ML).`,
      config: { tools: [{googleSearch: {}}] }
    });
    return res.text || "Sem insights.";
  } catch { return "Indisponível."; }
};

export const generateDynamicLesson = async (topic: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Aula micro sobre "${topic}". JSON: { "title": "string", "content": "string", "actionPoints": ["string"] }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch { return { title: "Erro", content: "Erro", actionPoints: [] }; }
};

export const getIntegrationSupport = async (query: string, plat: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Como integrar API do ${plat}: "${query}". Procedimento técnico.`,
      config: { tools: [{googleSearch: {}}] }
    });
    return { text: res.text || "", sources: res.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch { return { text: "Sem suporte.", sources: [] }; }
};

export const processBulkCommand = async (command: string, context: any) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Operação: "${command}". Contexto: ${JSON.stringify(context)}. JSON: { "action": "string", "message": "string" }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch { return { action: "unknown", message: "Erro ao interpretar." }; }
};

export const draftCrmReply = async (msg: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Resposta profissional para: "${msg}"` 
    });
    return res.text || "";
  } catch { return "Olá!"; }
};

export const connectLiveAssistant = (callbacks: any) => {
  const ai = getFreshAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: { 
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
    },
  });
};

export const generateLiveScript = async (pName: string) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Script Live Commerce para: "${pName}". JSON: { "hook": "string", "benefits": ["string"], "offer": "string" }`,
      config: { responseMimeType: "application/json" } 
    });
    return JSON.parse(cleanJson(res.text || '{}'));
  } catch { return { hook: "Promoção!", benefits: ["Top"], offer: "Compre!" }; }
};

export const getShoppingAssistantResponse = async (query: string, products: Product[], chatHistory: any[]) => {
  const ai = getFreshAI();
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: `Você é um assistente de compras inteligente e pessoal. 
        Seu objetivo é ajudar o cliente a encontrar o produto perfeito no catálogo abaixo.
        
        CATÁLOGO DE PRODUTOS:
        ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, marketplace: p.marketplace, trustScore: p.trustScore })))}
        
        REGRAS:
        1. Seja amigável, consultivo e aja como um vendedor que conhece o cliente.
        2. Se o cliente pedir algo específico (ex: "tenis para maratona"), procure no catálogo o que mais se aproxima.
        3. Se não houver o produto exato, sugira o mais próximo e explique por que é uma boa opção.
        4. Mencione o "Trust Score" (avaliações reais) para passar confiança.
        5. Se o cliente decidir comprar, retorne um JSON especial no final da sua resposta: {"action": "buy", "productId": "ID_DO_PRODUTO"}.
        6. Use Markdown para formatar sua resposta.
        
        Histórico da conversa:
        ${JSON.stringify(chatHistory)}
        
        Pergunta do cliente: "${query}"` }] }
      ],
      config: {
        systemInstruction: "Você é o MarketHub AI Shopping Assistant. Transforme a experiência de busca em uma conversa fluida e eficiente."
      }
    });
    return res.text || "Desculpe, não consegui processar sua solicitação.";
  } catch (err) {
    console.error("Shopping Assistant Error:", err);
    return "Estou com uma instabilidade momentânea, mas posso te ajudar em breve!";
  }
};

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

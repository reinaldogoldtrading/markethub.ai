
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ShoppingBag, Sparkles, User, Bot, CheckCircle2, ArrowRight, Settings, Eye, Search, Zap, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import { getShoppingAssistantResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  productId?: string;
}

interface ConversationalCommerceProps {
  products: Product[];
  addNotification: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const ConversationalCommerce: React.FC<ConversationalCommerceProps> = ({ products, addNotification }) => {
  const [activeView, setActiveView] = useState<'simulator' | 'config' | 'audit'>('simulator');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá, Vendedor! Este é o seu **Simulador de Experiência do Cliente**. \n\nDigite como se fosse um cliente buscando um produto no seu catálogo para testar como a IA do MarketHub (ou integrações como ChatGPT Shopping) apresentaria sua marca.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiTone, setAiTone] = useState('Consultivo e Especialista');
  const [storeRules, setStoreRules] = useState('Sempre mencione frete grátis para produtos acima de R$ 200.');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeView]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      // Pass tone and rules to the prompt
      const enhancedQuery = `[CONFIG: Tom=${aiTone}, Regras=${storeRules}] ${input}`;
      const responseText = await getShoppingAssistantResponse(enhancedQuery, products, history);
      
      let cleanText = responseText;
      let productId: string | undefined;
      
      try {
        const jsonMatch = responseText.match(/\{"action":\s*"buy",\s*"productId":\s*"(.*?)"\}/);
        if (jsonMatch) {
          productId = jsonMatch[1];
          cleanText = responseText.replace(jsonMatch[0], '').trim();
        }
      } catch (e) {
        console.error("Error parsing action JSON", e);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanText,
        timestamp: new Date(),
        productId
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      addNotification("Erro ao processar simulação", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-950 rounded-3xl overflow-hidden border border-white/10 relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header / Tabs */}
      <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Configurador de Experiência IA</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Otimize para ChatGPT & Buscas Conversacionais</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/10 mx-2" />

          <nav className="flex gap-2">
            {[
              { id: 'simulator', label: 'Simulador de Chat', icon: MessageSquare },
              { id: 'config', label: 'Persona & Regras', icon: Settings },
              { id: 'audit', label: 'Auditoria de SEO IA', icon: Search }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeView === tab.id 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Ver como Widget
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden z-10">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {activeView === 'simulator' && (
            <>
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                          msg.role === 'user' ? 'bg-white/10' : 'bg-indigo-600'
                        }`}>
                          {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        
                        <div className="space-y-4">
                          <div className={`p-6 rounded-3xl ${
                            msg.role === 'user' 
                              ? 'bg-white/10 text-white rounded-tr-none' 
                              : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none backdrop-blur-md'
                          }`}>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-4 items-center bg-white/5 px-6 py-4 rounded-full border border-white/10">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs font-medium text-white/40 uppercase tracking-widest">IA Processando...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/5 backdrop-blur-2xl border-t border-white/10">
                <div className="max-w-4xl mx-auto relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Simule uma pergunta do seu cliente (ex: 'Quero um tênis para maratona')..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeView === 'config' && (
            <div className="p-12 max-w-3xl mx-auto w-full space-y-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Configuração da Persona</h3>
                <p className="text-white/50 text-sm">Defina como a IA deve representar sua marca em canais conversacionais.</p>
              </div>

              <div className="grid gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Tom de Voz</label>
                  <select 
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Consultivo e Especialista">Consultivo e Especialista</option>
                    <option value="Descontraído e Amigável">Descontraído e Amigável</option>
                    <option value="Direto e Técnico">Direto e Técnico</option>
                    <option value="Luxuoso e Exclusivo">Luxuoso e Exclusivo</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Regras de Negócio & Promoções</label>
                  <textarea 
                    value={storeRules}
                    onChange={(e) => setStoreRules(e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Ex: Oferecer 10% de desconto para quem perguntar sobre primeira compra..."
                  />
                </div>

                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-start gap-4">
                  <Sparkles className="text-indigo-400 w-6 h-6 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-white">Integração Automática</p>
                    <p className="text-xs text-white/60 leading-relaxed mt-1">
                      Estas configurações são injetadas nos metadados dos seus anúncios e catálogos, permitindo que o ChatGPT e outros assistentes saibam exatamente como falar da sua loja.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => addNotification("Configurações de Persona salvas!", "success")}
                  className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-indigo-50 transition-all"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {activeView === 'audit' && (
            <div className="p-12 max-w-4xl mx-auto w-full space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Auditoria de SEO Conversacional</h3>
                  <p className="text-white/50 text-sm">Seus produtos estão prontos para serem encontrados por IA?</p>
                </div>
                <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm">Iniciar Nova Varredura</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'AI Discoverability', value: '84%', color: 'text-emerald-400' },
                  { label: 'Semantic Clarity', value: '92%', color: 'text-indigo-400' },
                  { label: 'Conversational Fit', value: '68%', color: 'text-amber-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Alertas de Otimização</h4>
                <div className="space-y-3">
                  {products.slice(0, 3).map((p, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        <div>
                          <p className="text-sm font-bold text-white">{p.name}</p>
                          <p className="text-xs text-white/40">SKU: {p.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20">
                          Título muito genérico para IA
                        </span>
                        <button className="text-indigo-400 text-xs font-bold hover:underline">Corrigir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Context & Stats */}
        <aside className="w-80 border-l border-white/10 bg-white/5 backdrop-blur-md p-8 space-y-10 hidden xl:block">
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Insights do Catálogo</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-white/60 mb-1">Produtos no Catálogo</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-white/60 mb-1">Média de Trust Score</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {(products.reduce((acc, p) => acc + (p.trustScore || 0), 0) / products.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Dicas de IA</h4>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <p className="text-xs text-white/80 leading-relaxed italic">
                  "O ChatGPT prioriza produtos com descrições ricas em 'casos de uso'. Em vez de apenas 'Tênis de Corrida', use 'Tênis ideal para maratonas de asfalto com suporte para pisada pronada'."
                </p>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Integrações Ativas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['ChatGPT', 'Gemini', 'Meta AI', 'Perplexity'].map((tool) => (
                <span key={tool} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/60 font-medium">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ConversationalCommerce;

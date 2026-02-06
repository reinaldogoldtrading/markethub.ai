
import React, { useState } from 'react';
import { getMarketTrends, getCompetitorAnalysis, getSocialListeningData } from '../services/geminiService';

interface TrendsProps {
  addNotification?: (text: string, type?: 'success' | 'info') => void;
}

const Trends: React.FC<TrendsProps> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'competitors' | 'listening'>('trends');
  const [niche, setNiche] = useState('Moda Sustentável');
  const [brandOrProduct, setBrandOrProduct] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<{text: string, sources: any[]} | null>(null);
  const [listeningData, setListeningData] = useState<{text: string, sources: any[]} | null>(null);
  const [compData, setCompData] = useState<{
    competitors: { name: string, price: string, weakness: string, strength: string }[],
    marketGap: string,
    differentiationStrategy: string
  } | null>(null);

  const handleSearchTrends = async () => {
    setLoading(true);
    try {
      const data = await getMarketTrends(niche);
      setTrendData(data);
      if (addNotification) addNotification(`Relatório de tendências gerado!`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchListening = async () => {
    if (!brandOrProduct) return;
    setLoading(true);
    try {
      const data = await getSocialListeningData(brandOrProduct);
      setListeningData(data);
      if (addNotification) addNotification(`Monitoramento de Social Listening concluído! 👂`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCompetitors = async () => {
    if (!productName) return;
    setLoading(true);
    try {
      const data = await getCompetitorAnalysis(productName, niche);
      setCompData(data);
      if (addNotification) addNotification(`Análise de concorrência concluída! 🕵️‍♂️`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-wrap gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('trends')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Pesquisa de Tendências
        </button>
        <button 
          onClick={() => setActiveTab('listening')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'listening' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Social Listening 👂
        </button>
        <button 
          onClick={() => setActiveTab('competitors')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'competitors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Inteligência Competitiva 🕵️‍♂️
        </button>
      </div>

      {activeTab === 'trends' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1 rounded-full backdrop-blur-md border border-white/30 mb-6 inline-block">
                Powered by Gemini Search Grounding
              </span>
              <h2 className="text-4xl font-black mb-4 leading-tight">Antecipe a próxima onda <br/>de vendas com IA 🌊</h2>
              <div className="flex flex-col sm:flex-row gap-4 bg-white/10 p-3 rounded-[2rem] backdrop-blur-xl border border-white/20">
                <input 
                  type="text" 
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-6 py-2 text-white placeholder:text-blue-200 text-lg font-medium"
                  placeholder="Qual nicho você quer dominar?"
                />
                <button 
                  onClick={handleSearchTrends}
                  disabled={loading}
                  className="bg-white text-blue-700 px-10 py-4 rounded-[1.5rem] font-black hover:bg-blue-50 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? '...' : 'Analisar agora'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              {trendData ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">📊 Insights do Mercado</h3>
                  <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap mb-10 border-l-4 border-blue-500 pl-6">
                    {trendData.text}
                  </div>
                  {trendData.sources.map((source: any, i: number) => (
                    <a key={i} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 hover:bg-blue-50 mb-2 transition-colors">
                       🔗 <span className="text-sm font-bold">{source.web?.title}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 italic">Digite um nicho para escanear o Google Search...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'listening' && (
        <div className="space-y-8">
          <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 max-w-3xl">
               <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full border border-blue-500/30 mb-6 inline-block">
                 Brand Intelligence Engine
               </span>
               <h2 className="text-4xl font-black mb-4 leading-tight">O que dizem sobre você <br/><span className="text-blue-400">fora da sua bolha?</span> 👂</h2>
               <p className="text-slate-400 mb-8 text-lg">Monitore fóruns, notícias e discussões em toda a web sobre sua marca ou produtos concorrentes.</p>
               
               <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-3 rounded-[2rem] border border-white/10">
                 <input 
                   type="text" 
                   value={brandOrProduct}
                   onChange={(e) => setBrandOrProduct(e.target.value)}
                   className="flex-1 bg-transparent border-none outline-none px-6 py-2 text-white placeholder:text-slate-600 text-lg font-medium"
                   placeholder="Nome da sua Marca ou Produto..."
                 />
                 <button 
                   onClick={handleSearchListening}
                   disabled={loading || !brandOrProduct}
                   className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black hover:bg-blue-500 transition-all shadow-xl disabled:opacity-50"
                 >
                   {loading ? 'Rastreando...' : 'Escutar a Web'}
                 </button>
               </div>
             </div>
             <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px]">
               {listeningData ? (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">🌍 Menções Encontradas</h3>
                     <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1 rounded-full border border-emerald-100">DADOS ATUALIZADOS</div>
                   </div>
                   
                   <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap mb-10 border-l-4 border-slate-900 pl-6 bg-slate-50 py-8 rounded-r-3xl">
                     {listeningData.text}
                   </div>

                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Principais Fontes e Referências</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {listeningData.sources.map((source: any, i: number) => (
                       <a key={i} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all">
                          <span className="text-xl">📄</span>
                          <div className="min-w-0">
                             <p className="text-xs font-bold text-slate-900 truncate">{source.web?.title}</p>
                             <p className="text-[9px] text-blue-500 font-medium truncate">{source.web?.uri}</p>
                          </div>
                       </a>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center py-24 opacity-30 italic">
                    <span className="text-6xl mb-4">🔍</span>
                    <p>Digite o nome de uma marca para iniciar o monitoramento global.</p>
                 </div>
               )}
             </div>

             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                   <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">💡 Dica de Reputação</h4>
                   <p className="text-sm text-slate-600 leading-relaxed italic">"Monitorar fóruns como Reddit e ReclameAqui via Social Listening permite que você antecipe crises antes que elas cheguem às suas mensagens privadas."</p>
                </div>
                
                <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                   <h4 className="text-lg font-black mb-2">Alerta de Crise IA</h4>
                   <p className="text-xs text-blue-100 mb-4">Configure palavras-chave para ser notificado instantaneamente quando menções negativas aparecerem na web.</p>
                   <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl text-xs hover:bg-blue-50 transition-colors">Configurar Alertas</button>
                   <div className="absolute -top-4 -right-4 opacity-10 text-6xl group-hover:rotate-12 transition-transform">🔔</div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="space-y-8">
           <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl">
              <h2 className="text-3xl font-black mb-6">Quem são seus <span className="text-blue-400">rivais diretos?</span></h2>
              <p className="text-slate-400 mb-8 max-w-xl">Descubra os pontos fracos dos anúncios dos seus concorrentes e como o MarketHub pode superá-los automaticamente.</p>
              <div className="flex gap-4 max-w-2xl">
                <input 
                  type="text" 
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 outline-none focus:ring-2 ring-blue-500"
                  placeholder="Nome do produto (ex: Fone Bluetooth XYZ)"
                />
                <button 
                  onClick={handleSearchCompetitors}
                  disabled={loading || !productName}
                  className="bg-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Varrendo...' : 'Escanear Rivais'}
                </button>
              </div>
           </div>

           {compData && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-500">
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Matriz de Concorrência</h3>
                    <div className="space-y-4">
                      {compData.competitors.map((c, i) => (
                        <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{c.name}</p>
                            <p className="text-blue-600 font-bold text-sm">{c.price}</p>
                          </div>
                          <div className="flex-1 bg-red-50 p-3 rounded-xl border border-red-100">
                            <p className="text-[10px] font-black text-red-600 uppercase mb-1">Fraqueza 🚩</p>
                            <p className="text-xs text-red-900 font-medium">{c.weakness}</p>
                          </div>
                          <div className="flex-1 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Força 💪</p>
                            <p className="text-xs text-emerald-900 font-medium">{c.strength}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Oportunidade de Ouro ✨</h4>
                      <p className="text-lg font-bold leading-tight">{compData.marketGap}</p>
                   </div>
                   <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl border border-blue-500/30">
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-blue-400">Estratégia do MarketHub 🤖</h4>
                      <p className="text-sm text-slate-300 italic">"{compData.differentiationStrategy}"</p>
                      <button 
                        onClick={() => addNotification?.("Estratégia aplicada ao Otimizador IA!")}
                        className="w-full mt-6 bg-white text-slate-900 font-bold py-3 rounded-xl text-xs hover:bg-blue-50"
                      >
                        Aplicar Estratégia no Hub
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default Trends;

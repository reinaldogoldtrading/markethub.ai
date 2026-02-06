
import React, { useEffect, useState } from 'react';

const thoughts = [
  "CloudBot: Respondidas 5 novas dúvidas sobre frete no Mercado Livre.",
  "SuperAds: Detectado CPA baixo no TikTok, escalando orçamento em 20%...",
  "CloudBot: Gerando rascunho de resposta para comentário no Instagram.",
  "Análise: SKU-442 está com 85% de conversão nas redes sociais.",
  "CloudBot: Nova campanha de 'Lookalike' criada no Facebook Ads.",
  "Marketplace: Sincronização de estoque concluída para 4 canais.",
  "CloudBot: Atendimento automático ativado para 15 mensagens pendentes.",
  "Insight: Sugestão de aumento de lances no Google Shopping para 'Tênis Gamer'."
];

const CloudBotLog: React.FC = () => {
  const [currentThoughts, setCurrentThoughts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      setCurrentThoughts(prev => [randomThought, ...prev].slice(0, 6));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-[2.5rem] border border-blue-500/30 p-8 shadow-2xl shadow-blue-500/10 overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
          </span>
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">CloudBot Autonomous Engine</h4>
        </div>
        <div className="px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
          <span className="text-[10px] text-blue-400 font-mono">24/7 ACTIVE</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {currentThoughts.map((thought, i) => (
          <div 
            key={i} 
            className={`text-xs font-mono leading-relaxed transition-all duration-700 ${i === 0 ? 'text-blue-100 opacity-100' : 'text-slate-500 opacity-60'}`}
          >
            <span className="text-blue-500 font-bold mr-2">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
            <span className="mr-2 opacity-50">#</span>
            {thought}
          </div>
        ))}
        {currentThoughts.length === 0 && (
          <div className="text-xs font-mono text-slate-600 italic animate-pulse">Sincronizando com as redes neurais do SuperAds...</div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Ações Hoje</p>
          <p className="text-lg font-bold text-white">124 <span className="text-xs text-blue-400 font-medium">autônomas</span></p>
        </div>
        <div className="flex -space-x-3">
           {[1,2,3].map(i => (
             <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs">
               {i === 1 ? 'ML' : i === 2 ? 'IG' : 'TK'}
             </div>
           ))}
        </div>
      </div>
      
      {/* Visual Glitch Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full"></div>
    </div>
  );
};

export default CloudBotLog;

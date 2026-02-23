
import React, { useEffect, useState } from 'react';

const apiEvents = [
  "API Mercado Livre: Sincronizando estoque para SKU-124...",
  "SuperAds: Detectado aumento de busca por 'Teclados', sugerindo campanha.",
  "SuperAds Engine: Publicando 4 novos criativos no Instagram API.",
  "Split Engine: Dividindo R$ 450,00 entre fornecedor e lojista.",
  "OAuth Manager: Token TikTok Ads renovado automaticamente.",
  "API SuperAds: ROAS da campanha 'Escala' subiu para 4.8x.",
  "Webhook Receiver: Venda detectada no canal Amazon SP-API.",
  "CloudBot: Atendimento automático via ChatGPT API concluído.",
  "SuperAds: Pausando criativo 'V1' devido a baixo CTR nas últimas 2h."
];

const CloudBotLog: React.FC = () => {
  const [currentThoughts, setCurrentThoughts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = apiEvents[Math.floor(Math.random() * apiEvents.length)];
      setCurrentThoughts(prev => [randomEvent, ...prev].slice(0, 6));
    }, 4000);
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
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">API & System Logs</h4>
        </div>
        <div className="px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
          <span className="text-[10px] text-blue-400 font-mono">SUPERADS ACTIVE</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {currentThoughts.map((thought, i) => (
          <div 
            key={i} 
            className={`text-xs font-mono leading-relaxed transition-all duration-700 ${i === 0 ? 'text-blue-100 opacity-100' : 'text-slate-500 opacity-60'}`}
          >
            <span className="text-blue-500 font-bold mr-2">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
            <span className="mr-2 opacity-30">{'>'}</span>
            {thought}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status Requisições</p>
          <p className="text-lg font-bold text-white">99.8% <span className="text-xs text-emerald-400 font-medium">Uptime</span></p>
        </div>
      </div>
    </div>
  );
};

export default CloudBotLog;

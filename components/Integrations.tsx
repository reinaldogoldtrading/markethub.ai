
import React, { useState } from 'react';
import { Marketplace } from '../types';

interface ConnectionInfo {
  connected: boolean;
  expires?: string;
  status?: string;
  apiKey?: string;
  apiSecret?: string;
}

interface IntegrationsProps {
  addNotification: (t: string, type?: 'success' | 'info') => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ addNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState<'marketplaces' | 'social_ads' | 'suppliers' | 'webhooks'>('marketplaces');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');

  const [marketplaces, setMarketplaces] = useState<Record<string, ConnectionInfo>>({
    [Marketplace.MERCADO_LIVRE]: { connected: true, expires: '24/12/2025', status: 'active' },
    [Marketplace.SHOPEE]: { connected: true, expires: '15/08/2025', status: 'active' },
    [Marketplace.AMAZON]: { connected: true, expires: '10/01/2026', status: 'active' },
    [Marketplace.MAGALU]: { connected: false },
    [Marketplace.AMERICANAS]: { connected: false },
    [Marketplace.TIKTOK_SHOP]: { connected: false },
    [Marketplace.ALIEXPRESS]: { connected: false },
    [Marketplace.CASAS_BAHIA]: { connected: false },
    [Marketplace.KABUM]: { connected: false },
    [Marketplace.CARREFOUR]: { connected: false },
    [Marketplace.SHEIN]: { connected: false },
    [Marketplace.TEMU]: { connected: false },
  });

  const [socialPlatforms, setSocialPlatforms] = useState<Record<string, ConnectionInfo>>({
    'Meta Ads (Facebook/Insta)': { connected: true, expires: 'Renovação Automática' },
    'TikTok for Business': { connected: false },
    'Google Ads': { connected: true, expires: 'Ativo' },
    'YouTube Live API': { connected: true, expires: 'Token Vitalício' },
  });

  const handleConnect = (name: string, category: string) => {
    if (!apiKeyInput) {
      addNotification(`Por favor, insira a Chave de API para ${name}`, 'info');
      return;
    }
    addNotification(`Validando credenciais de ${name}...`, 'info');
    setTimeout(() => {
      addNotification(`${name} conectado com sucesso! 🚀`, 'success');
      setApiKeyInput('');
      setApiSecretInput('');
      if (category === 'marketplaces') setMarketplaces(prev => ({ ...prev, [name]: { connected: true, expires: '365 dias' } }));
      if (category === 'social_ads') setSocialPlatforms(prev => ({ ...prev, [name]: { connected: true, expires: 'Token Renovado' } }));
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Central de Conexões</h2>
          <p className="text-slate-500">Gerencie APIs de venda e automação do CloudBot.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
           <button onClick={() => setActiveSubTab('marketplaces')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'marketplaces' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Marketplaces</button>
           <button onClick={() => setActiveSubTab('social_ads')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'social_ads' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Ads & Social</button>
           <button onClick={() => setActiveSubTab('suppliers')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Dropshipping</button>
        </div>
      </header>

      {activeSubTab === 'marketplaces' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.entries(marketplaces) as [string, ConnectionInfo][]).map(([name, data]) => (
            <div key={name} className={`bg-white p-8 rounded-[2.5rem] border transition-all group relative overflow-hidden ${data.connected ? 'border-emerald-100 shadow-sm' : 'border-slate-200 hover:border-blue-300'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${data.connected ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                   {name.charAt(0)}
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${data.connected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                   {data.connected ? 'Conectado' : 'Desconectado'}
                </div>
              </div>

              <h4 className="font-black text-slate-900 mb-1">{name}</h4>
              <p className="text-[10px] text-slate-400 font-medium mb-6 uppercase tracking-widest">
                {data.connected ? `Expira em: ${data.expires}` : 'Aguardando Credenciais'}
              </p>

              {!data.connected ? (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                   <input 
                    type="text" 
                    placeholder="API Key / Token" 
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-blue-500"
                   />
                   <button 
                    onClick={() => handleConnect(name, 'marketplaces')}
                    className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-[10px] uppercase hover:bg-blue-600 transition-all"
                   >
                     Ativar Conexão
                   </button>
                </div>
              ) : (
                <button className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase hover:bg-red-50 hover:text-red-600 transition-all">Revogar Acesso</button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'social_ads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.entries(socialPlatforms) as [string, ConnectionInfo][]).map(([name, data]) => (
            <div key={name} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-pink-300 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-slate-900">{name}</h4>
                <div className={`w-2 h-2 rounded-full ${data.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              </div>
              {!data.connected ? (
                <button onClick={() => handleConnect(name, 'social_ads')} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-xs hover:bg-blue-500 transition-all">Vincular Conta</button>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status: Ativo</p>
                   <p className="text-[10px] text-emerald-800 italic">IA está otimizando campanhas em tempo real.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'suppliers' && (
        <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
              <div className="max-w-md">
                 <h3 className="text-3xl font-black mb-4">Sincronização de Suprimentos</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">Conecte seus fornecedores de dropshipping para que o MarketHub controle o estoque e faça pedidos automáticos.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                 {['AliExpress Pro', 'ZenDrop', 'Wiio', 'CJDropshipping'].map(s => (
                   <div key={s} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                      <p className="font-bold text-sm mb-2">{s}</p>
                      <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Configurar API →</button>
                   </div>
                 ))}
              </div>
           </div>
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Integrations;

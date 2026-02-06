
import React, { useState } from 'react';
import { Marketplace } from '../types';

interface IntegrationsProps {
  addNotification: (t: string, type?: 'success' | 'info') => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ addNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState<'channels' | 'suppliers' | 'security'>('channels');
  const [connections, setConnections] = useState<Record<string, any>>({
    [Marketplace.MERCADO_LIVRE]: { connected: true, expires: '24/12/2025', status: 'active' },
    [Marketplace.SHOPEE]: { connected: true, expires: '15/08/2025', status: 'active' },
    [Marketplace.SHEIN]: { connected: false },
    'YouTube Live': { connected: true, expires: 'Vitalício (OAuth)', status: 'active' },
    'TikTok Shop': { connected: false },
  });

  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleConnectOAuth = (name: string) => {
    addNotification(`Abrindo janela segura de autenticação do ${name}...`, 'info');
    setTimeout(() => {
      setConnections(prev => ({ 
        ...prev, 
        [name]: { connected: true, expires: '365 dias', status: 'active' } 
      }));
      addNotification(`MarketHub conectado ao ${name} via OAuth 🛡️`, 'success');
    }, 1500);
  };

  const handleSaveApiKey = (provider: string) => {
    if (!apiKeyInput) return;
    addNotification(`Chave de API do ${provider} validada e criptografada!`, 'success');
    setApiKeyInput('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: 'channels', label: 'E-commerce & Canais', icon: '🔌' },
          { id: 'suppliers', label: 'Conectores Dropshipping', icon: '🚚' },
          { id: 'security', label: 'Logs de Segurança', icon: '🛡️' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-4 font-bold text-xs transition-all flex items-center gap-2 ${activeSubTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(connections).map(([name, data]) => (
            <div key={name} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-blue-300 transition-all">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${data.connected ? (name === 'YouTube Live' ? 'bg-red-600' : 'bg-blue-600') + ' text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                      {name === Marketplace.MERCADO_LIVRE ? 'ML' : name === Marketplace.SHOPEE ? 'SH' : name === 'YouTube Live' ? 'YT' : 'API'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Via Protocolo Oficial</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${data.connected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {data.connected ? 'Conectado' : 'Desconectado'}
                  </div>
               </div>

               {data.connected ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Expiração / Status</span>
                      <span className="font-bold text-slate-900">{data.expires}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Escopos</span>
                      <span className="text-blue-600 font-bold">Leitura/Escrita/Ads</span>
                    </div>
                    <button 
                      onClick={() => setConnections(prev => ({ ...prev, [name]: { connected: false } }))}
                      className="w-full mt-4 py-3 rounded-xl border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50 transition-all"
                    >
                      Revogar Acesso
                    </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => handleConnectOAuth(name)}
                   className="w-full mt-4 py-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all"
                 >
                   Vincular Conta Oficial
                 </button>
               )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'suppliers' && (
        <div className="max-w-4xl space-y-6">
           <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4">Automação de Dropshipping</h3>
                <p className="text-slate-400 text-sm mb-8">Conecte seus fornecedores globais via API Key. O MarketHub sincronizará preços e estoque automaticamente a cada 15 minutos.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { name: 'AliExpress', icon: '🔴' },
                     { name: 'ZenDrop', icon: '🔵' },
                   ].map(s => (
                     <div key={s.name} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                           <span className="text-xl">{s.icon}</span>
                           <h4 className="font-bold">{s.name}</h4>
                        </div>
                        <input 
                          type="password"
                          value={apiKeyInput}
                          onChange={e => setApiKeyInput(e.target.value)}
                          placeholder="Insira sua API Key..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500"
                        />
                        <button 
                          onClick={() => handleSaveApiKey(s.name)}
                          className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl text-xs hover:bg-slate-100 transition-all"
                        >
                          Salvar Conexão
                        </button>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'security' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm max-w-5xl">
           <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
             🛡️ Auditoria de Acessos IA
           </h3>
           <div className="space-y-3">
              {[
                { time: '14:22:05', event: 'Token OAuth Mercado Livre Renovado', ip: 'IA-Core-01' },
                { time: '13:50:11', event: 'Sincronização de Estoque AliExpress concluída', ip: 'Supplier-Sync' },
                { time: '10:15:33', event: 'Broadcast YouTube Live detectado', ip: 'Stream-Service' },
                { time: '09:00:00', event: 'Logon Master Admin detectado', ip: '189.12.45.11' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono">
                   <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-bold">[{log.time}]</span>
                      <span className="text-slate-700 font-bold">{log.event}</span>
                   </div>
                   <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">{log.ip}</span>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;

import React, { useState, useEffect } from 'react';
import { SocialPlatform, AdCampaign } from '../types';
import { generateSuperAdsStrategy, generateProductImage, generateMarketingVideo, generateArcadsVideo } from '../services/geminiService';
import { superAdsApi } from '../services/api/superAdsApi';

const Marketing: React.FC<{ addNotification?: (text: string, type?: 'success' | 'info' | 'error') => void }> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState<'superads' | 'video' | 'dashboard'>('superads');
  const [productName, setProductName] = useState('');
  const [budget, setBudget] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [approvedCampaigns, setApprovedCampaigns] = useState<string[]>([]);
  const [creativeImages, setCreativeImages] = useState<Record<string, string>>({});
  const [wallet, setWallet] = useState({ balance: 0, reserved: 0 });
  const [showTopUp, setShowTopUp] = useState(false);
  
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoEngine, setVideoEngine] = useState<'veo' | 'arcads'>('veo');
  const [arcadsActor, setArcadsActor] = useState('marketing_expert');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoLoadingStep, setVideoLoadingStep] = useState<string>('');
  const [hasPremiumKey, setHasPremiumKey] = useState(false);

  useEffect(() => {
    refreshData();
    checkPremiumKey();
  }, []);

  const checkPremiumKey = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasPremiumKey(hasKey);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasPremiumKey(true);
      addNotification?.("Conexão Premium Estabelecida!", "success");
    }
  };

  const refreshData = async () => {
    try {
      const [campaignData, walletData] = await Promise.all([
        superAdsApi.getPerformanceData(),
        superAdsApi.getWalletBalance()
      ]);
      setCampaigns(campaignData || []);
      setWallet(walletData || { balance: 0, reserved: 0 });
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  const handleTopUp = async (amount: number, method: 'pix' | 'credit_advance') => {
    setLoading(true);
    try {
      await superAdsApi.topUpWallet(amount, method);
      addNotification?.(`Recarga concluída!`, "success");
      setShowTopUp(false);
      refreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!productName) return;
    setLoading(true);
    setStrategy(null);
    setApprovedCampaigns([]);
    try {
      const res = await generateSuperAdsStrategy(productName, budget);
      if (res && res.proposed_campaigns) {
        setStrategy(res);
        addNotification?.("IA gerou o plano de mídia!", "success");
        
        res.proposed_campaigns.forEach(async (camp: any, idx: number) => {
          const prompt = camp?.creatives?.[0]?.image_prompt || productName;
          const img = await generateProductImage(prompt);
          if (img) setCreativeImages(prev => ({ ...prev, [idx]: img }));
        });
      }
    } catch (e: any) {
      if (e.message?.includes("429") || e.message?.includes("quota")) {
        addNotification?.("Limite da API atingido. Ative sua Chave Premium abaixo.", "error");
      } else {
        addNotification?.("Erro na IA. Verifique sua conexão.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    
    if (videoEngine === 'veo' && !hasPremiumKey) {
      addNotification?.("O motor Veo 3.1 exige uma Chave Premium ativada.", "info");
      return;
    }

    setLoading(true);
    setGeneratedVideo(null);
    
    if (videoEngine === 'veo') {
      setVideoLoadingStep('Conectando ao cluster Veo...');
      try {
        const steps = [
          'Analisando roteiro cinematográfico...',
          'Renderizando texturas e luz...',
          'Simulando física de movimento...',
          'Finalizando arquivo MP4...'
        ];
        
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
          if (stepIdx < steps.length) {
            setVideoLoadingStep(steps[stepIdx]);
            stepIdx++;
          }
        }, 7000);

        const videoUrl = await generateMarketingVideo(videoPrompt);
        clearInterval(stepInterval);

        if (videoUrl) {
          setGeneratedVideo(videoUrl);
          addNotification?.("Vídeo cinematográfico gerado!", "success");
        } else {
          addNotification?.("Demanda alta no Veo. Tente novamente.", "info");
        }
      } catch (e: any) {
        addNotification?.("Falha ao gerar vídeo Veo.", "error");
      } finally {
        setLoading(false);
        setVideoLoadingStep('');
      }
    } else {
      setVideoLoadingStep('Arcads AI: Selecionando Ator UGC...');
      try {
        const steps = [
          'Gerando roteiro de alta conversão...',
          'Sincronizando voz nativa e emoções...',
          'Aplicando edição automatizada Arcads...',
          'Exportando anúncio de performance...'
        ];
        
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
          if (stepIdx < steps.length) {
            setVideoLoadingStep(steps[stepIdx]);
            stepIdx++;
          }
        }, 2000);

        const videoUrl = await generateArcadsVideo(videoPrompt, arcadsActor);
        clearInterval(stepInterval);

        if (videoUrl) {
          setGeneratedVideo(videoUrl);
          addNotification?.("Vídeo Arcads (Ator IA) gerado!", "success");
        } else {
          addNotification?.("Erro ao conectar com Arcads AI.", "error");
        }
      } catch (e: any) {
        addNotification?.("Falha no motor Arcads.", "error");
      } finally {
        setLoading(false);
        setVideoLoadingStep('');
      }
    }
  };

  const handleDeploy = async () => {
    if (!strategy?.proposed_campaigns) return;
    const selected = strategy.proposed_campaigns.filter((_: any, i: number) => approvedCampaigns.includes(i.toString()));
    
    setDeploying(true);
    try {
      for (const camp of selected) {
        await superAdsApi.deployCampaign({ 
          budget: camp.budget, 
          platform: camp.platform,
          name: `${productName} - ${camp.platform}`
        });
      }
      
      addNotification?.("Campanhas lançadas e ativas! 🚀", "success");
      await refreshData();
      setActiveTab('dashboard');
    } catch (e: any) {
      addNotification?.(e.message, "error");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 border-b border-slate-200">
          <button onClick={() => setActiveTab('superads')} className={`px-4 py-2 font-bold text-xs transition-all ${activeTab === 'superads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>SuperAds ⚡</button>
          <button onClick={() => setActiveTab('video')} className={`px-4 py-2 font-bold text-xs transition-all ${activeTab === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Vídeo IA 🎥</button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 font-bold text-xs transition-all ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Performance</button>
        </div>
        
        <div className="flex items-center gap-4">
          {!hasPremiumKey && (
            <button 
              onClick={handleOpenKeySelector}
              className="bg-emerald-600 text-white text-[9px] px-4 py-2 rounded-xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              💎 ATIVAR IA PREMIUM (VEO/PRO)
            </button>
          )}
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Ads</p>
             <p className="font-black text-slate-900 text-lg">R$ {wallet.balance.toFixed(2)}</p>
             <button onClick={() => setShowTopUp(true)} className="bg-slate-900 text-white text-[9px] px-3 py-2 rounded-xl hover:bg-blue-600 transition-all font-black">+ RECARGA</button>
          </div>
        </div>
      </div>

      {activeTab === 'superads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-200 space-y-4 shadow-sm h-fit">
            <h3 className="font-black text-xl text-slate-900">Configurar Campanha</h3>
            <p className="text-xs text-slate-500 leading-relaxed">A IA cuida da estratégia e dos ativos criativos.</p>
            <div className="space-y-4 pt-4">
              <input type="text" placeholder="Nome do Produto / Nicho" className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all" value={productName} onChange={e => setProductName(e.target.value)} />
              <input type="number" placeholder="Verba Total (R$)" className="w-full border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all" value={budget} onChange={e => setBudget(parseInt(e.target.value) || 0)} />
              <button onClick={handleGenerateStrategy} disabled={loading || !productName} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg disabled:opacity-50 hover:bg-slate-800 transition-all">
                {loading ? 'Consultando IA...' : 'Gerar Criativos e Mídia'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            {strategy?.proposed_campaigns ? (
              <div className="grid gap-6">
                {strategy.proposed_campaigns.map((camp: any, idx: number) => {
                  const platName = String(camp?.platform || 'Rede Social');
                  const isSelected = approvedCampaigns.includes(idx.toString());
                  return (
                    <div key={idx} className={`p-8 bg-white rounded-[3rem] border-2 transition-all animate-in zoom-in-95 ${isSelected ? 'border-emerald-500 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                           <span className="text-3xl">{platName.toLowerCase().includes('tiktok') ? '🎵' : '📸'}</span>
                           <div>
                              <h5 className="font-black text-slate-900 text-lg leading-none">{platName}</h5>
                              <p className="text-[10px] font-black text-blue-600 uppercase mt-1 tracking-widest">Budget: R$ {camp?.budget || 0}</p>
                           </div>
                        </div>
                        <button onClick={() => setApprovedCampaigns(p => p.includes(idx.toString()) ? p.filter(i => i !== idx.toString()) : [...p, idx.toString()])} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                          {isSelected ? '✓ Selecionada' : 'Selecionar'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 relative group">
                          {creativeImages[idx] ? (
                             <img src={creativeImages[idx]} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                             <div className="h-full flex flex-col items-center justify-center text-[10px] text-slate-300 italic gap-2">
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                                IA gerando arte...
                             </div>
                          )}
                        </div>
                        <div className="space-y-4 flex flex-col justify-center">
                           <h6 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Copy Sugerido</h6>
                           <p className="font-black text-xl text-slate-900 leading-tight">{camp?.creatives?.[0]?.headline || 'Oferta Exclusiva'}</p>
                           <p className="text-sm text-slate-500 leading-relaxed italic">"{camp?.creatives?.[0]?.body || 'Iniciando redação publicitária...'}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={handleDeploy} disabled={deploying || approvedCampaigns.length === 0} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-50 mt-4 text-lg">
                  {deploying ? 'Lançando Campanhas...' : '🚀 LANÇAR CAMPANHAS NO AR'}
                </button>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center bg-slate-100 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-slate-400 text-center px-12">
                <span className="text-7xl mb-6">🤖</span>
                <p className="font-black uppercase tracking-[0.2em] text-sm">Pronto para escalar?</p>
                <p className="text-xs mt-2 font-medium">Configure os dados para começar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="max-w-4xl mx-auto bg-white p-16 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-10 animate-in zoom-in-95 relative overflow-hidden">
           {!hasPremiumKey && (
             <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="text-6xl">🔒</div>
                <h3 className="text-3xl font-black text-slate-900">Vídeo Factory IA (Veo 3.1)</h3>
                <p className="text-slate-600 max-w-md">O motor cinematográfico exige uma chave de API paga vinculada ao seu projeto.</p>
                <button 
                  onClick={handleOpenKeySelector}
                  className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl hover:bg-blue-700 transition-all"
                >
                  Vincular Chave Premium
                </button>
             </div>
           )}

           <div className="text-center space-y-3">
              <div className="flex justify-center gap-2">
                <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest cursor-pointer transition-all ${videoEngine === 'veo' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`} onClick={() => setVideoEngine('veo')}>Veo 3.1 Cinematic</span>
                <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest cursor-pointer transition-all ${videoEngine === 'arcads' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`} onClick={() => setVideoEngine('arcads')}>Arcads AI (UGC Actors)</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900">Vídeo Factory IA 🎥</h2>
              <p className="text-slate-500 text-lg">
                {videoEngine === 'veo' 
                  ? 'Gere vídeos cinematográficos de alta fidelidade com o motor Veo.' 
                  : 'Crie anúncios com atores reais de IA, vozes nativas e alta conversão.'}
              </p>
           </div>
           
           <div className="space-y-6">
              {videoEngine === 'arcads' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Tipo de Ator</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 ring-purple-500 font-bold text-sm"
                      value={arcadsActor}
                      onChange={e => setArcadsActor(e.target.value)}
                    >
                      <option value="marketing_expert">Especialista em Marketing</option>
                      <option value="casual_user">Usuário Casual (UGC)</option>
                      <option value="tech_enthusiast">Entusiasta de Tecnologia</option>
                      <option value="fashion_influencer">Influenciador de Moda</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Idioma / Sotaque</label>
                    <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-sm text-slate-500">
                      Português (Brasil) - Nativo
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                   {videoEngine === 'veo' ? 'Roteiro / Prompt do Vídeo' : 'Descrição do Produto para o Ator'}
                 </label>
                 <textarea 
                   placeholder={videoEngine === 'veo' ? "Ex: Drone agricola pulverizando plantação ao pôr do sol..." : "Ex: Tênis de corrida Ultra Boost, foco em conforto e durabilidade para maratonas."} 
                   className={`w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none focus:ring-2 transition-all min-h-[140px] text-lg font-medium ${videoEngine === 'veo' ? 'ring-blue-500' : 'ring-purple-500'}`}
                   value={videoPrompt}
                   onChange={e => setVideoPrompt(e.target.value)}
                 />
              </div>
              <button 
                onClick={handleGenerateVideo} 
                disabled={loading || !videoPrompt}
                className={`w-full text-white py-6 rounded-[2rem] font-black text-lg shadow-xl disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1 ${videoEngine === 'veo' ? 'bg-slate-900 hover:bg-blue-600' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {loading ? (
                   <>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        {videoEngine === 'veo' ? 'Gerando Vídeo Veo...' : 'Arcads: Gravando Ator...'}
                      </div>
                      <span className={`text-[10px] font-bold animate-pulse ${videoEngine === 'veo' ? 'text-blue-300' : 'text-purple-200'}`}>{videoLoadingStep}</span>
                   </>
                ) : (videoEngine === 'veo' ? 'Gerar Vídeo Profissional' : 'Gerar Anúncio com Ator Arcads')}
              </button>
           </div>

           {generatedVideo && (
             <div className="mt-12 space-y-6 animate-in slide-in-from-bottom-6">
                <div className="aspect-[9/16] max-w-[320px] mx-auto bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-900">
                   <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-center gap-4">
                   <a href={generatedVideo} download="video_hub.mp4" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg">Download MP4</a>
                   <button onClick={() => addNotification?.("Vídeo salvo na Biblioteca!")} className="bg-slate-100 text-slate-900 px-10 py-4 rounded-2xl font-black text-sm">Salvar no Hub</button>
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.length > 0 ? campaigns.map(c => (
            <div key={c.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
               <div className="flex justify-between mb-6">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{c.platform || 'Publicidade'}</span>
                  <div className="flex items-center gap-1">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                     <span className="text-emerald-500 font-black text-xs">{c.roas || 4.2}x ROAS</span>
                  </div>
               </div>
               <p className="font-black text-slate-900 text-xl mb-2 truncate">{c.name || 'Campanha IA'}</p>
               <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-50">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Investimento</p>
                     <p className="text-2xl font-black text-slate-900">R$ {c.budget?.toFixed(2) || '0.00'}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase">Sincronizado</span>
               </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center text-slate-400">
               <span className="text-6xl block mb-4">📈</span>
               <p className="font-black uppercase tracking-widest text-sm">Lance campanhas para ver a performance.</p>
            </div>
          )}
        </div>
      )}

      {showTopUp && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-900">Recarga Ads</h3>
                 <button onClick={() => setShowTopUp(false)} className="text-slate-300 hover:text-slate-900 text-2xl">✕</button>
              </div>
              <div className="grid gap-4">
                 <button onClick={() => handleTopUp(500, 'pix')} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-black hover:border-blue-500 transition-all flex items-center justify-between group">
                    <span className="flex items-center gap-4 text-sm group-hover:text-blue-600 transition-colors">💠 PIX Instantâneo</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">R$ 500</span>
                 </button>
                 <button onClick={() => handleTopUp(1000, 'credit_advance')} className="bg-slate-900 text-white p-6 rounded-3xl font-black hover:bg-blue-600 transition-all flex items-center justify-between group">
                    <span className="flex items-center gap-4 text-sm">🏦 Antecipação ML</span>
                    <span className="text-xs text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-lg">R$ 1.000</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
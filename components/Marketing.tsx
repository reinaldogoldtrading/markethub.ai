
import React, { useState, useEffect } from 'react';
import { SocialPlatform } from '../types';
import { generateSocialAdContent, generateSocialVideo, generateProductImage } from '../services/geminiService';

interface MarketingProps {
  addNotification?: (text: string, type?: 'success' | 'info') => void;
}

const loadingMessages = [
  "Analisando o DNA do seu produto...",
  "Renderizando visuais de alta conversão...",
  "Sincronizando luz, sombra e movimento...",
  "Otimizando para Reels e TikTok...",
  "Quase lá! Finalizando os detalhes cinematográficos..."
];

const Marketing: React.FC<MarketingProps> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState<'static' | 'video'>('static');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(SocialPlatform.INSTAGRAM);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [adContent, setAdContent] = useState<{headline: string, copy: string} | null>(null);
  const [adImage, setAdImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading && activeTab === 'video') {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [loading, activeTab]);

  const handleGenerateAd = async () => {
    if (!productName) return;
    setLoading(true);
    setAdImage(null);
    try {
      const [contentRes, imgRes] = await Promise.all([
        generateSocialAdContent(productName, selectedPlatform),
        generateProductImage(productName)
      ]);
      setAdContent(contentRes);
      setAdImage(imgRes);
      if (addNotification) addNotification("Criativo de alta conversão gerado! ✨");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!productName) return;

    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    setLoading(true);
    setLoadingMsgIdx(0);
    try {
      const url = await generateSocialVideo(productName);
      setVideoUrl(url);
      if (addNotification) addNotification("Vídeo cinematográfico concluído! 🎬");
    } catch (error: any) {
      if (addNotification) addNotification("Erro na geração do vídeo. Verifique faturamento.", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('static')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'static' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Anúncios Estáticos
        </button>
        <button 
          onClick={() => setActiveTab('video')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Social Video (Veo 3.1) 🎬
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-blue-600 text-2xl">{activeTab === 'static' ? '📣' : '🎥'}</span> 
              {activeTab === 'static' ? 'Marketing Visual IA' : 'Video Factory IA'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição do Produto</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-blue-500"
                  placeholder="Ex: Tênis de corrida neon com solado preto"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              {activeTab === 'static' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Plataforma</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(SocialPlatform).map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedPlatform === p ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleGenerateAd}
                    disabled={loading || !productName}
                    className="w-full mt-6 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Criar Campanha Visual'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <button 
                    onClick={handleGenerateVideo}
                    disabled={loading || !productName}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Produzir Vídeo Pro'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative min-h-[600px] flex flex-col items-center justify-center">
           {loading ? (
             <div className="flex flex-col items-center text-center max-w-sm gap-6">
               <div className="relative">
                  <div className="w-24 h-24 border-8 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
               <p className="text-slate-500 italic text-sm animate-pulse">"{loadingMessages[loadingMsgIdx]}"</p>
             </div>
           ) : activeTab === 'static' ? (
             !adContent ? (
                <div className="text-slate-300 text-center opacity-50">
                  <div className="text-8xl mb-4">📸</div>
                  <p className="font-bold text-xl">Sua campanha visual IA</p>
                </div>
             ) : (
                <div className="w-full space-y-8 animate-in zoom-in-95">
                  <div className="max-w-[380px] mx-auto border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white">
                     <div className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">MH</div>
                        <span className="text-xs font-bold">loja_oficial_ia</span>
                     </div>
                     <img src={adImage || 'https://picsum.photos/seed/placeholder/600'} className="w-full aspect-square object-cover" alt="Ad Visual" />
                     <div className="p-6">
                        <p className="text-xs font-black mb-2 text-blue-600 uppercase tracking-widest">{adContent.headline}</p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{adContent.copy}</p>
                        <div className="bg-slate-900 text-white text-center py-3 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">Comprar Agora</div>
                     </div>
                  </div>
                </div>
             )
           ) : (
             !videoUrl ? (
                <div className="text-slate-300 text-center opacity-50">
                  <div className="text-8xl mb-4">🎬</div>
                  <p className="font-bold text-xl">Preview Veo 3.1</p>
                </div>
             ) : (
                <div className="w-full h-full flex flex-col items-center animate-in zoom-in-95">
                  <video 
                    src={videoUrl} 
                    controls 
                    className="max-h-[500px] rounded-[2rem] shadow-2xl border-8 border-slate-900"
                    autoPlay
                    loop
                  />
                  <div className="mt-8">
                    <a 
                      href={videoUrl} 
                      download="marketing-video.mp4"
                      className="bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-blue-700 shadow-xl"
                    >
                      Baixar MP4
                    </a>
                  </div>
                </div>
             )
           )}
        </div>
      </div>
    </div>
  );
};

export default Marketing;

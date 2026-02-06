
import React, { useState, useRef, useEffect } from 'react';
import { Product, LiveSessionRecord } from '../types';
import { connectLiveAssistant, encode, decode, decodeAudioData, getLiveStrategicAdvice, generateLiveScript } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface LiveCommerceProps {
  products: Product[];
  addNotification: (t: string, type?: 'success' | 'info') => void;
  updateProduct?: (p: Product) => void;
}

interface StreamDestination {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  streamKey: string;
  isLive: boolean;
  stats: {
    viewers: number;
    sales: number;
    likes: number;
  };
}

const mockHistory: LiveSessionRecord[] = [
  { id: 'h1', date: '2024-05-10', startTime: '19:00', duration: '45min', totalSales: 12500.50, peakViewers: 850, totalLikes: 4200, bestPlatform: 'TikTok' },
  { id: 'h2', date: '2024-05-12', startTime: '20:30', duration: '60min', totalSales: 18900.00, peakViewers: 1200, totalLikes: 7800, bestPlatform: 'Instagram' },
  { id: 'h3', date: '2024-05-15', startTime: '15:00', duration: '30min', totalSales: 4200.20, peakViewers: 320, totalLikes: 1500, bestPlatform: 'YouTube' },
];

const LiveCommerce: React.FC<LiveCommerceProps> = ({ products, addNotification, updateProduct }) => {
  const [isLive, setIsLive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [liveScript, setLiveScript] = useState<{hook: string, benefits: string[], offer: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showQRCode, setShowQRCode] = useState(true);
  const [aiStrategicAdvice, setAiStrategicAdvice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'control' | 'analytics' | 'history'>('control');
  const [pastSessions, setPastSessions] = useState<LiveSessionRecord[]>(mockHistory);
  const [liveStartTime, setLiveStartTime] = useState<number | null>(null);

  const [livePrice, setLivePrice] = useState<number>(0);
  const [offerTag, setOfferTag] = useState('OFERTA RELÂMPAGO');
  const [isFlashSale, setIsFlashSale] = useState(false);

  const [destinations, setDestinations] = useState<StreamDestination[]>([
    { id: 'yt', name: 'YouTube Live', icon: '📺', color: 'bg-red-600', connected: false, streamKey: '', isLive: false, stats: { viewers: 0, sales: 0, likes: 0 } },
    { id: 'tk', name: 'TikTok Shop', icon: '🎵', color: 'bg-black', connected: false, streamKey: '', isLive: false, stats: { viewers: 0, sales: 0, likes: 0 } },
    { id: 'ig', name: 'Instagram Live', icon: '📸', color: 'bg-pink-600', connected: false, streamKey: '', isLive: false, stats: { viewers: 0, sales: 0, likes: 0 } },
    { id: 'fb', name: 'Facebook Live', icon: '👥', color: 'bg-blue-700', connected: false, streamKey: '', isLive: false, stats: { viewers: 0, sales: 0, likes: 0 } },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      initAiAssistant(stream);
    }
  }, [isLive, stream]);

  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        setDestinations(prev => prev.map(d => {
          if (d.isLive) {
            const newViewers = Math.max(0, d.stats.viewers + Math.floor(Math.random() * 10) - 4);
            const newLikes = d.stats.likes + Math.floor(Math.random() * 20);
            const sold = Math.random() > (isFlashSale ? 0.85 : 0.95) && selectedProduct ? d.stats.sales + livePrice : d.stats.sales;
            return { ...d, stats: { viewers: newViewers, likes: newLikes, sales: sold } };
          }
          return d;
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLive, selectedProduct, livePrice, isFlashSale]);

  const startLive = async () => {
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' }, 
        audio: true 
      });
      setStream(mediaStream);
      setIsLive(true);
      setLiveStartTime(Date.now());
      addNotification("Estúdio Multistream Ativado! 🚀", "success");
    } catch (err) {
      addNotification("Erro ao acessar câmera/microfone.", "info");
    } finally {
      setLoading(false);
    }
  };

  const stopAllLives = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (liveStartTime) {
      const durationMin = Math.floor((Date.now() - liveStartTime) / 60000);
      const totalSales = destinations.reduce((acc, d) => acc + d.stats.sales, 0);
      const peakViewers = Math.max(...destinations.map(d => d.stats.viewers));
      const bestChannel = [...destinations].sort((a, b) => b.stats.sales - a.stats.sales)[0];

      const newRecord: LiveSessionRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        startTime: new Date(liveStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: `${durationMin}min`,
        totalSales,
        peakViewers,
        totalLikes: destinations.reduce((acc, d) => acc + d.stats.likes, 0),
        bestPlatform: bestChannel.name.split(' ')[0]
      };
      setPastSessions(prev => [newRecord, ...prev]);
    }

    setIsLive(false);
    setShowOverlay(false);
    if (sessionPromiseRef.current) sessionPromiseRef.current.then(s => s.close());
    addNotification("Transmissão encerrada e salva.", "info");
  };

  const initAiAssistant = async (activeStream: MediaStream) => {
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;

    const sessionPromise = connectLiveAssistant({
      onopen: () => {
        const source = inputAudioContext.createMediaStreamSource(activeStream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
          const pcmData = encode(new Uint8Array(int16.buffer));
          sessionPromise.then(s => s.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } }));
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);

        const canvas = document.createElement('canvas');
        frameIntervalRef.current = window.setInterval(() => {
          if (videoRef.current && !videoRef.current.paused) {
            canvas.width = 320; canvas.height = 240;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              const base64Image = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Image, mimeType: 'image/jpeg' } }));
            }
          }
        }, 500);
      },
      onmessage: async (m: LiveServerMessage) => {
        const base64Audio = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio && audioContextRef.current) {
          const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.start();
        }
      },
      onerror: (e) => console.error(e),
      onclose: () => {}
    });
    sessionPromiseRef.current = sessionPromise;
  };

  const handleDisplayProduct = async (product: Product) => {
    setSelectedProduct(product);
    setLivePrice(product.price);
    setIsFlashSale(false);
    setShowOverlay(true);
    setLoading(true);
    try {
      const activePlatforms = destinations.filter(d => d.isLive).map(d => d.name).join(', ');
      const script = await generateLiveScript(`${product.name} (Transmitindo para: ${activePlatforms}. Preço normal R$ ${product.price}. Incentive o uso do QR Code)`);
      setLiveScript(script);
    } finally {
      setLoading(false);
    }
  };

  const launchFlashSale = async () => {
    if (!selectedProduct) return;
    setIsFlashSale(true);
    setLoading(true);
    addNotification(`Oferta Relâmpago Lançada: R$ ${livePrice.toFixed(2)}! ⚡`, "success");
    try {
      const script = await generateLiveScript(`${selectedProduct.name} - OFERTA RELÂMPAGO POR R$ ${livePrice.toFixed(2)}. Tag: ${offerTag}. Gere um script de extrema urgência.`);
      setLiveScript(script);
      if (updateProduct) {
        updateProduct({ ...selectedProduct, price: livePrice });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDestinationStream = (id: string) => {
    setDestinations(prev => prev.map(d => {
      if (d.id === id) {
        const newState = !d.isLive;
        addNotification(newState ? `Broadcasting para ${d.name} iniciado!` : `Transmissão encerrada.`);
        return { ...d, isLive: newState };
      }
      return d;
    }));
  };

  const totalViewers = destinations.reduce((acc, d) => acc + d.stats.viewers, 0);
  const totalSalesCurrent = destinations.reduce((acc, d) => acc + d.stats.sales, 0);
  const bestChannel = [...destinations].sort((a, b) => b.stats.sales - a.stats.sales)[0];

  const productUrl = selectedProduct ? `https://markethub-loja.com/p/${selectedProduct.sku}?live_price=${livePrice}&campaign=${encodeURIComponent(offerTag)}` : "https://markethub.ai";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(productUrl)}&bgcolor=ffffff&color=0f172a&margin=1`;
  const discountPercent = selectedProduct ? Math.round(((selectedProduct.price - livePrice) / selectedProduct.price) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)] animate-in fade-in duration-700">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="relative aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-800">
          {!isLive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-6">
              <div className="flex gap-4">
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl">🎥</div>
                 <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl">⚡</div>
              </div>
              <h3 className="text-3xl font-black mb-2 text-center">Multistream Studio Pro</h3>
              <button onClick={startLive} disabled={loading} className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all">Iniciar Estúdio</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">LIVE</div>
                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">👤 {totalViewers} total</div>
              </div>

              {showOverlay && selectedProduct && (
                <div className="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-10">
                  <div className={`backdrop-blur-xl p-8 rounded-[3rem] flex items-center gap-8 border shadow-2xl ${isFlashSale ? 'bg-red-600/90 border-red-400' : 'bg-white/95 border-white/40'}`}>
                    <div className="flex items-center gap-6 flex-1">
                      <img src={selectedProduct.image} className="w-24 h-24 rounded-[2rem] object-cover border-2 border-slate-100" alt="" />
                      <div className={isFlashSale ? 'text-white' : 'text-slate-900'}>
                        <p className={`text-[10px] font-black uppercase mb-1 ${isFlashSale ? 'text-yellow-300' : 'text-blue-600'}`}>
                           {isFlashSale ? offerTag : 'Destaque ⚡'}
                        </p>
                        <h4 className="text-xl font-black leading-tight">{selectedProduct.name}</h4>
                        <div className="flex items-center gap-3">
                           {isFlashSale && <span className="text-sm line-through opacity-50 font-bold">R$ {selectedProduct.price.toFixed(2)}</span>}
                           <p className="text-3xl font-black">R$ {livePrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    {showQRCode && (
                      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shrink-0 shadow-inner">
                        <img src={qrCodeUrl} className="w-28 h-28" alt="QR Code" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button onClick={stopAllLives} className="absolute top-6 right-6 bg-white/20 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-md transition-all">✕</button>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-4 mb-4">
              <button onClick={() => setActiveTab('control')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'control' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-400'}`}>Estoque Live</button>
              <button onClick={() => setActiveTab('analytics')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'analytics' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-400'}`}>ROI Canais</button>
              <button onClick={() => setActiveTab('history')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-400'}`}>Histórico</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'control' && (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4 pb-4">
                {products.map(p => (
                  <button key={p.id} onClick={() => handleDisplayProduct(p)} className={`p-3 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedProduct?.id === p.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <p className="text-[9px] font-bold text-slate-900 truncate w-full text-center">{p.name}</p>
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="h-full space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {destinations.map(d => (
                    <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between mb-2"><span className="text-xl">{d.icon}</span><span className={`w-2 h-2 rounded-full ${d.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span></div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">{d.name}</p>
                      <p className="text-sm font-black text-slate-900">R$ {d.stats.sales.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={destinations.map(d => ({ name: d.name.split(' ')[0], vendas: d.stats.sales }))}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Bar dataKey="vendas" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        {selectedProduct ? (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col gap-6">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Configuração de Oferta Live</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase">Ajuste Dinâmico</p>
            </div>
            <div className="space-y-4">
              <input type="text" value={offerTag} onChange={e => setOfferTag(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-2xl text-xs font-bold" />
              <div className="flex items-center gap-4">
                <input type="number" value={livePrice} onChange={e => setLivePrice(parseFloat(e.target.value))} className="flex-1 bg-slate-50 border p-3 rounded-2xl text-xl font-black" />
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Original</p>
                  <p className="text-sm font-bold text-slate-400 line-through">R$ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between">
                 <p className="text-[9px] font-black text-emerald-600 uppercase">Desconto</p>
                 <p className="text-lg font-black text-emerald-700">{discountPercent}% OFF</p>
              </div>
              <button onClick={launchFlashSale} disabled={loading} className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] hover:bg-red-700 transition-all">
                ⚡ Oferta Relâmpago
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-4">
             <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl">
                <p className="text-[9px] font-black uppercase opacity-60 mb-1">Rede Vencedora</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{bestChannel?.icon}</span>
                  <h5 className="font-black text-lg">{bestChannel?.name}</h5>
                </div>
             </div>
             <div className="space-y-2">
               {destinations.map(d => (
                 <div key={d.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                   <span className="text-xs font-bold">{d.icon} {d.name}</span>
                   <button onClick={() => toggleDestinationStream(d.id)} disabled={!isLive} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${d.isLive ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                     {d.isLive ? 'OFF' : 'ON'}
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] h-64 overflow-hidden flex flex-col">
            <h4 className="font-bold text-sm mb-4">Script IA Dinâmico</h4>
            {liveScript ? (
              <div className="flex-1 overflow-y-auto text-xs space-y-3 custom-scrollbar">
                <p className="italic text-blue-400">"{liveScript.hook}"</p>
                <ul className="space-y-1 opacity-70">
                  {liveScript.benefits.map((b, i) => <li key={i}>• {b}</li>)}
                </ul>
              </div>
            ) : (
              <p className="text-xs opacity-30 italic">Selecione um produto...</p>
            )}
        </div>
      </div>
      <style>{`.mirror { transform: scaleX(-1); }.custom-scrollbar::-webkit-scrollbar { width: 4px; }.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }`}</style>
    </div>
  );
};

export default LiveCommerce;

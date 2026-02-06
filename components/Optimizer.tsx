
import React, { useState } from 'react';
import { Marketplace, AIResponse, Product, ProductStatus, FulfillmentType } from '../types';
import { optimizeMultiChannel, generateProductImage } from '../services/geminiService';

interface OptimizerProps {
  addProduct: (p: Product) => void;
  addNotification: (t: string) => void;
}

const Optimizer: React.FC<OptimizerProps> = ({ addProduct, addNotification }) => {
  const [productName, setProductName] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Marketplace[]>([Marketplace.MERCADO_LIVRE]);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>(FulfillmentType.STOCK);
  const [supplierData, setSupplierData] = useState({ name: 'AliExpress', url: '' });
  const [price, setPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [results, setResults] = useState<Record<string, AIResponse> | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

  const toggleChannel = (channel: Marketplace) => {
    setSelectedChannels(prev => 
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const handleOptimize = async () => {
    if (!productName || selectedChannels.length === 0) return;
    setLoading(true);
    setImgLoading(true);
    try {
      const [aiRes, imgRes] = await Promise.all([
        optimizeMultiChannel(productName, selectedChannels, parseFloat(price)),
        generateProductImage(productName)
      ]);
      setResults(aiRes);
      setGeneratedImg(imgRes);
      setActiveTab(selectedChannels[0]);
      addNotification(`IA Otimizou anúncios para ${fulfillment}! ✨`);
    } catch (err) {
      alert("Erro na otimização multicanal.");
    } finally {
      setLoading(false);
      setImgLoading(false);
    }
  };

  const handleSaveDraft = () => {
    if (!results || !activeTab) return;
    const res = results[activeTab];
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: res.optimizedTitle,
      sku: `AI-${Math.floor(Math.random()*1000)}`,
      price: res.suggestedPrice,
      stock: fulfillment === FulfillmentType.DROPSHIPPING ? 999 : 0,
      marketplace: activeTab as Marketplace,
      status: ProductStatus.DRAFT,
      fulfillment: fulfillment,
      supplierName: fulfillment === FulfillmentType.DROPSHIPPING ? supplierData.name : undefined,
      supplierUrl: fulfillment === FulfillmentType.DROPSHIPPING ? supplierData.url : undefined,
      lastUpdated: 'Recém gerado',
      image: generatedImg || 'https://picsum.photos/seed/ai/200'
    };
    addProduct(product);
    addNotification(`Rascunho pronto para publicação via API!`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-700">
      <div className="xl:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Configuração Pro</h3>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">🤖</div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Modelo Logístico</label>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setFulfillment(FulfillmentType.STOCK)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${fulfillment === FulfillmentType.STOCK ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                📦 Estoque
              </button>
              <button 
                onClick={() => setFulfillment(FulfillmentType.DROPSHIPPING)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${fulfillment === FulfillmentType.DROPSHIPPING ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
              >
                🚚 Drop
              </button>
            </div>
          </div>

          {fulfillment === FulfillmentType.DROPSHIPPING && (
             <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl space-y-3 animate-in zoom-in-95">
                <div>
                   <label className="text-[10px] font-black text-orange-600 uppercase mb-1 block">Fornecedor Conectado</label>
                   <select 
                    value={supplierData.name}
                    onChange={e => setSupplierData({...supplierData, name: e.target.value})}
                    className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2 text-xs outline-none"
                   >
                     <option value="AliExpress">AliExpress (API Ativa)</option>
                     <option value="ZenDrop">ZenDrop (Token OK)</option>
                     <option value="Manual">Outro (Sinc. Manual)</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-orange-600 uppercase mb-1 block">Link de Origem</label>
                   <input 
                    type="text" 
                    value={supplierData.url}
                    onChange={e => setSupplierData({...supplierData, url: e.target.value})}
                    placeholder="Cole o link do produto aqui..."
                    className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2 text-xs outline-none"
                   />
                </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">O que vamos vender?</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-blue-500"
              placeholder="Ex: Teclado Mecânico RGB"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Publicar em:</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Marketplace).map(m => (
                <button
                  key={m}
                  onClick={() => toggleChannel(m)}
                  className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                    selectedChannels.includes(m) 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleOptimize}
            disabled={loading || selectedChannels.length === 0}
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "✨ Gerar Multicanal IA"}
          </button>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        {results && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {selectedChannels.map(m => (
                <button
                  key={m}
                  onClick={() => setActiveTab(m)}
                  className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                    activeTab === m 
                    ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {results[activeTab] && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-lg group">
                      {imgLoading ? (
                        <div className="aspect-square w-full bg-slate-50 flex flex-col items-center justify-center gap-3">
                           <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Gerando Foto...</p>
                        </div>
                      ) : (
                        <img src={generatedImg || 'https://picsum.photos/seed/ai/400'} className="w-full aspect-square object-cover" alt="Product" />
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${fulfillment === FulfillmentType.STOCK ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                        {fulfillment}
                       </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Título Sugerido ({activeTab})</h4>
                      <p className="text-xl font-bold text-slate-900 leading-tight">{results[activeTab].optimizedTitle}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Copy SEO IA</h4>
                      <ul className="space-y-2">
                        {results[activeTab].bulletPoints.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-blue-500 mt-1">✦</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 flex items-center justify-between">
                    <div className="text-white">
                       <p className="text-[9px] font-black uppercase opacity-60">Preço Sugerido</p>
                       <p className="text-lg font-bold text-emerald-400">R$ {results[activeTab].suggestedPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleSaveDraft}
                        className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-all text-sm"
                      >
                        Salvar Rascunho
                      </button>
                      <button 
                        onClick={() => addNotification(`Publicando anúncio de ${fulfillment} no ${activeTab} via API oficial! 🚀`)}
                        className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg text-sm"
                      >
                        Publicar em 1-Clique
                      </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Optimizer;

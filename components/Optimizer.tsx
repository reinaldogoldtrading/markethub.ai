
import React, { useState, useEffect } from 'react';
import { Marketplace, AIResponse, Product, ProductStatus, FulfillmentType } from '../types';
import { optimizeMultiChannel, generateProductImage } from '../services/geminiService';
import { marketplaceApi } from '../services/api/marketplaceApi';

interface OptimizerProps {
  addProduct: (p: Product) => void;
  addNotification: (t: string) => void;
}

const Optimizer: React.FC<OptimizerProps> = ({ addProduct, addNotification }) => {
  const [productName, setProductName] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Marketplace[]>([Marketplace.MERCADO_LIVRE]);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>(FulfillmentType.STOCK);
  const [supplierData, setSupplierData] = useState({ name: 'AliExpress', url: '', cost: 0 });
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [results, setResults] = useState<Record<string, AIResponse> | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [profitDetails, setProfitDetails] = useState<any>(null);

  const toggleChannel = (channel: Marketplace) => {
    setSelectedChannels(prev => 
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const calculateTotalProfit = async (suggestedPrice: number, cost: number) => {
    if (suggestedPrice <= 0) {
      setProfitDetails({
        mktFee: 0,
        shippingCost: 0,
        hubFee: 0,
        netProfit: -cost,
        margin: -100
      });
      return;
    }

    // Busca taxas reais da API (incluindo frete e taxas fixas)
    const fees = await marketplaceApi.calculateMLFees(suggestedPrice, 'me2', 'premium');
    
    const hubFee = suggestedPrice * 0.012; // 1.2% do Hub por antecipação
    const saasDilution = 0.50; // Rateio de mensalidade por venda
    
    const netProfit = suggestedPrice - fees.marketplaceFee - fees.shippingCost - cost - hubFee - saasDilution;
    
    setProfitDetails({
      mktFee: fees.marketplaceFee,
      shippingCost: fees.shippingCost,
      hubFee,
      netProfit,
      margin: (netProfit / suggestedPrice) * 100
    });
  };

  const handleOptimize = async () => {
    if (!productName || selectedChannels.length === 0) return;
    setLoading(true);
    setImgLoading(true);
    try {
      const [aiRes, imgRes] = await Promise.all([
        optimizeMultiChannel(productName, selectedChannels, supplierData.cost),
        generateProductImage(productName)
      ]);
      setResults(aiRes);
      setGeneratedImg(imgRes);
      setActiveTab(selectedChannels[0]);
      
      const suggestedPrice = aiRes[selectedChannels[0]]?.suggestedPrice || 0;
      await calculateTotalProfit(suggestedPrice, supplierData.cost);

      addNotification(`IA analisou margem considerando Frete e Comissões! 📊`);
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
      costPrice: supplierData.cost,
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
    addNotification(`Produto salvo com lucro líquido de R$ ${profitDetails.netProfit.toFixed(2)}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-700">
      <div className="xl:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-2xl font-black text-slate-900 leading-tight">Radar de Lucro & Suprimentos IA</h3>
        <p className="text-xs text-slate-500 italic">"Cálculo real incluindo impostos, taxas e frete obrigatório."</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Custo Atual (R$)</label>
            <input 
              type="number" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-emerald-500"
              placeholder="Quanto você paga hoje?"
              value={supplierData.cost}
              onChange={(e) => setSupplierData({...supplierData, cost: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Produto</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-blue-500"
              placeholder="Ex: Teclado Mecânico RGB"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <button 
            onClick={handleOptimize}
            disabled={loading || !productName}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Simular Operação Real"}
          </button>
        </div>

        {results && results[activeTab]?.supplierInsight && (
          <div className={`p-6 rounded-[2rem] border-2 animate-in zoom-in-95 ${results[activeTab].supplierInsight!.bestSupplierPrice < supplierData.cost ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
             <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{results[activeTab].supplierInsight!.bestSupplierPrice < supplierData.cost ? '🎯' : '💎'}</span>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">
                  {results[activeTab].supplierInsight!.bestSupplierPrice < supplierData.cost ? 'Economia Detectada!' : 'Melhor Custo Atual'}
                </h4>
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Melhor Fornecedor:</span>
                   <span className="font-bold text-slate-900">{results[activeTab].supplierInsight!.bestSupplierName}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-slate-500">Preço de Mercado:</span>
                   <span className="font-bold text-slate-900">R$ {results[activeTab].supplierInsight!.bestSupplierPrice.toFixed(2)}</span>
                </div>
                {results[activeTab].supplierInsight!.bestSupplierPrice < supplierData.cost && (
                   <div className="pt-2 border-t border-amber-200">
                      <p className="text-[10px] font-black text-amber-600 uppercase">Economia no Fornecedor</p>
                      <p className="text-xl font-black text-amber-700">+ R$ {(supplierData.cost - results[activeTab].supplierInsight!.bestSupplierPrice).toFixed(2)} / un</p>
                   </div>
                )}
             </div>
          </div>
        )}
      </div>

      <div className="xl:col-span-8 space-y-6">
        {results && activeTab && profitDetails && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4">
            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-5 space-y-4">
                  <div className="relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl">
                    <img src={generatedImg || 'https://picsum.photos/seed/ai/400'} className="w-full aspect-square object-cover" alt="" />
                  </div>
                  
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                     <p className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest">DRE Unitário (Análise de Frete)</p>
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                           <span className="opacity-60">Preço Sugerido:</span>
                           <span className="font-bold">R$ {results[activeTab].suggestedPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="opacity-60">Custo do Produto:</span>
                           <span className="font-bold text-red-400">- R$ {supplierData.cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="opacity-60">Comissão Canal (16.5%):</span>
                           <span className="font-bold text-red-400">- R$ {profitDetails.mktFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="opacity-60">Logística (Frete):</span>
                           <span className={`font-bold ${profitDetails.shippingCost > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                             {profitDetails.shippingCost > 0 ? `- R$ ${profitDetails.shippingCost.toFixed(2)}` : 'Pago pelo Comprador'}
                           </span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="opacity-60">Taxa Hub (Antecipação):</span>
                           <span className="font-bold text-red-400">- R$ {profitDetails.hubFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
                           <span className="text-sm font-black">Lucro Líquido:</span>
                           <span className={`text-lg font-black ${profitDetails.netProfit > 0 ? 'text-emerald-400' : 'text-red-500'}`}>R$ {profitDetails.netProfit.toFixed(2)}</span>
                        </div>
                        <div className={`text-[10px] text-center font-bold pt-1 ${profitDetails.margin > 15 ? 'text-emerald-400' : 'text-amber-500'}`}>
                           MARGEM FINAL: {profitDetails.margin.toFixed(1)}%
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-7 space-y-6">
                  <div className={`${profitDetails.netProfit > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} p-6 rounded-3xl border`}>
                     <h4 className={`font-black text-xs uppercase mb-2 ${profitDetails.netProfit > 0 ? 'text-emerald-700' : 'text-red-700'}`}>Veredito Financeiro IA</h4>
                     <p className={`text-sm leading-relaxed font-medium ${profitDetails.netProfit > 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                       {profitDetails.netProfit > 0 
                         ? `Operação viável. O custo de frete (R$ ${profitDetails.shippingCost}) representa ${( (profitDetails.shippingCost / results[activeTab].suggestedPrice) * 100 ).toFixed(1)}% do preço. Sua margem está protegida.` 
                         : `Atenção: Operação arriscada. O frete obrigatório para produtos acima de R$ 79 está consumindo seu lucro. Considere subir o preço para R$ ${( (supplierData.cost + profitDetails.mktFee + profitDetails.shippingCost) * 1.2 ).toFixed(2)} para manter 20% de margem.`}
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                     <h4 className="font-bold text-slate-900">Otimização de Anúncio</h4>
                     <p className="text-xl font-bold text-slate-900 leading-tight">{results[activeTab].optimizedTitle}</p>
                     <ul className="space-y-2">
                        {results[activeTab].bulletPoints.slice(0, 3).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-blue-500 mt-1">✦</span> {b}
                          </li>
                        ))}
                     </ul>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button onClick={handleSaveDraft} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all">Publicar no Hub</button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Optimizer;

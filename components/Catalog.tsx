import React, { useState } from 'react';
import { Marketplace, ProductStatus, Product, FulfillmentType } from '../types';
import { analyzeCompetitorPrice } from '../services/geminiService';

interface CatalogProps {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addNotification: (t: string, type?: 'success' | 'info' | 'error') => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, addProduct, updateProduct, deleteProduct, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repricingId, setRepricingId] = useState<string | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<{id: string, price: number} | null>(null);
  
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    sku: '', 
    price: '', 
    costPrice: '',
    stock: '', 
    marketplace: Marketplace.MERCADO_LIVRE,
    fulfillment: FulfillmentType.STOCK,
    supplierName: '',
    supplierUrl: ''
  });

  const filtered = (products || []).filter(p => {
    const name = (p.name || "").toLowerCase();
    const sku = (p.sku || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || sku.includes(search);
  });

  const handleRepricing = async (product: Product) => {
    setRepricingId(product.id);
    try {
      const analysis = await analyzeCompetitorPrice(product.name, product.price);
      if (analysis && analysis.suggestedPrice) {
        setSuggestedPrice({ id: product.id, price: analysis.suggestedPrice });
        addNotification(`IA sugere R$ ${analysis.suggestedPrice.toFixed(2)} para o ${product.sku}`, 'info');
      }
    } catch (e) {
      addNotification("Erro ao analisar concorrência", "error");
    } finally {
      setRepricingId(null);
    }
  };

  const applyNewPrice = (product: Product) => {
    if (!suggestedPrice) return;
    updateProduct({ ...product, price: suggestedPrice.price });
    setSuggestedPrice(null);
    addNotification(`Preço do ${product.sku} atualizado para R$ ${suggestedPrice.price.toFixed(2)}`, 'success');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name,
      sku: newProduct.sku,
      price: parseFloat(newProduct.price) || 0,
      costPrice: parseFloat(newProduct.costPrice) || 0,
      stock: newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? 999 : (parseInt(newProduct.stock) || 0),
      marketplace: newProduct.marketplace,
      status: ProductStatus.DRAFT,
      fulfillment: newProduct.fulfillment,
      supplierName: newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? newProduct.supplierName : undefined,
      supplierUrl: newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? newProduct.supplierUrl : undefined,
      lastUpdated: 'Agora',
      image: `https://picsum.photos/seed/${newProduct.sku || Date.now()}/200`,
      trustScore: Math.floor(Math.random() * 40) + 60
    };
    addProduct(product);
    addNotification(`Produto registrado com sucesso!`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por SKU ou Nome..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg">+ Novo Anúncio IA</button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saúde (Meli)</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financeiro</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logística</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{product.name || 'Sem nome'}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{product.sku || 'Sem SKU'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center justify-between max-w-[120px]">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Qualidade</span>
                        <span className={`text-[10px] font-bold ${product.trustScore && product.trustScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {product.trustScore || 0}%
                        </span>
                     </div>
                     <div className="w-full max-w-[120px] bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${product.trustScore && product.trustScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                          style={{width: `${product.trustScore || 0}%`}}
                        ></div>
                     </div>
                     <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Elegível para Full</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900">R$ {(product.price || 0).toFixed(2)}</p>
                  <p className="text-[10px] text-red-400 font-bold tracking-tighter">Custo: R$ {(product.costPrice || 0).toFixed(2)}</p>
                </td>
                <td className="px-6 py-5">
                   <div className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase text-center w-fit ${
                      product.fulfillment === FulfillmentType.STOCK ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                   }`}>
                      {product.fulfillment}
                   </div>
                </td>
                <td className="px-6 py-5">
                  <button 
                    onClick={() => handleRepricing(product)}
                    className="p-2 bg-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-xs"
                    title="Repricer Inteligente"
                  >
                    🤖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8">Novo Anúncio MarketHub</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <input 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500" 
                placeholder="Título do Produto"
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none" placeholder="Preço" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <input required type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none" placeholder="Custo" onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700">Criar Anúncio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
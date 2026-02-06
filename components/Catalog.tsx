
import React, { useState } from 'react';
import { Marketplace, ProductStatus, Product, FulfillmentType } from '../types';
import { analyzeCompetitorPrice } from '../services/geminiService';

interface CatalogProps {
  products: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addNotification: (t: string) => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, addProduct, deleteProduct, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repricingId, setRepricingId] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    sku: '', 
    price: '', 
    stock: '', 
    marketplace: Marketplace.MERCADO_LIVRE,
    fulfillment: FulfillmentType.STOCK,
    supplierName: '',
    supplierUrl: ''
  });

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepricing = async (product: Product) => {
    setRepricingId(product.id);
    try {
      const analysis = await analyzeCompetitorPrice(product.name, product.price);
      addNotification(`Análise Concluída! Preço sugerido: R$ ${analysis.suggestedPrice}. Confiança: ${analysis.confidence}%`);
    } finally {
      setRepricingId(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name,
      sku: newProduct.sku,
      price: parseFloat(newProduct.price),
      stock: newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? 999 : parseInt(newProduct.stock),
      marketplace: newProduct.marketplace,
      status: ProductStatus.DRAFT,
      fulfillment: newProduct.fulfillment,
      supplierName: newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? newProduct.supplierName : undefined,
      supplierUrl: newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? newProduct.supplierUrl : undefined,
      lastUpdated: 'Agora',
      image: `https://picsum.photos/seed/${newProduct.sku}/200`
    };
    addProduct(product);
    addNotification(`Produto (${product.fulfillment}) registrado no hub!`);
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
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl font-semibold hover:bg-slate-50">📥 Importar XML/CSV</button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg">+ Adicionar Produto</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Produto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Origem / Logística</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Preço/Estoque</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Canais Ativos</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ações IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt={product.name} />
                    <div>
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border w-fit ${
                      product.fulfillment === FulfillmentType.STOCK 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      <span className="text-xs">{product.fulfillment === FulfillmentType.STOCK ? '📦' : '🚚'}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{product.fulfillment}</span>
                    </div>
                    {product.fulfillment === FulfillmentType.DROPSHIPPING && (
                      <span className="text-[9px] text-slate-400 font-medium italic">Fornecedor: {product.supplierName || 'AliExpress'}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900">R$ {product.price.toFixed(2)}</p>
                  <p className={`text-xs ${product.stock > 0 ? 'text-slate-500' : 'text-red-500 font-bold'}`}>
                    {product.fulfillment === FulfillmentType.DROPSHIPPING ? '🟢 Sincronizado' : `Qtd: ${product.stock}`}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-black uppercase border border-slate-200">{product.marketplace}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <button 
                    onClick={() => handleRepricing(product)}
                    disabled={repricingId === product.id}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${repricingId === product.id ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                  >
                    {repricingId === product.id ? <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : '🔍'}
                    Repricer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Novo Produto no Hub</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Decision Box: Stock or Drop */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setNewProduct({...newProduct, fulfillment: FulfillmentType.STOCK})}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${newProduct.fulfillment === FulfillmentType.STOCK ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-100 bg-slate-50 grayscale hover:grayscale-0'}`}
                >
                  <span className="text-4xl">📦</span>
                  <div className="text-center">
                    <p className="font-bold text-slate-900">Estoque Próprio</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Eu despacho o produto</p>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={() => setNewProduct({...newProduct, fulfillment: FulfillmentType.DROPSHIPPING})}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${newProduct.fulfillment === FulfillmentType.DROPSHIPPING ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-slate-100 bg-slate-50 grayscale hover:grayscale-0'}`}
                >
                  <span className="text-4xl">🚚</span>
                  <div className="text-center">
                    <p className="font-bold text-slate-900">Dropshipping</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Fornecedor despacha</p>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome do Produto</label>
                  <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500" placeholder="Ex: Tênis Ultra Boost v2" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">SKU Interno</label>
                  <input required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500" placeholder="TEN-MOD-01" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Preço de Venda</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500" placeholder="R$ 0,00" />
                </div>

                {newProduct.fulfillment === FulfillmentType.STOCK ? (
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantidade em Estoque</label>
                    <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500" placeholder="0" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 block">Fornecedor</label>
                      <select 
                        value={newProduct.supplierName} 
                        onChange={e => setNewProduct({...newProduct, supplierName: e.target.value})}
                        className="w-full bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 outline-none"
                      >
                        <option value="">Selecione...</option>
                        <option value="AliExpress">AliExpress</option>
                        <option value="ZenDrop">ZenDrop</option>
                        <option value="Fornecedor Nacional">Fornecedor Nacional</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 block">Link/URL do Produto</label>
                      <input value={newProduct.supplierUrl} onChange={e => setNewProduct({...newProduct, supplierUrl: e.target.value})} className="w-full bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 outline-none" placeholder="https://..." />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 font-bold text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  Salvar no Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;

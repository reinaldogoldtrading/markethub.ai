
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import Optimizer from './components/Optimizer';
import Integrations from './components/Integrations';
import Trends from './components/Trends';
import Financial from './components/Financial';
import Crm from './components/Crm';
import Marketing from './components/Marketing';
import Academy from './components/Academy';
import LiveCommerce from './components/LiveCommerce'; 
import InvestorPitch from './components/InvestorPitch';
import AuditCenter from './components/AuditCenter';
import Intelligence from './components/Intelligence';
import ConversationalCommerce from './components/ConversationalCommerce';
import { Product, Marketplace, ProductStatus, FulfillmentType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([
    { id: '1', sku: 'TEN-001', name: 'Tênis Ultra Boost v2', price: 299.90, stock: 45, marketplace: Marketplace.MERCADO_LIVRE, status: ProductStatus.SYNCED, fulfillment: FulfillmentType.STOCK, lastUpdated: '2h atrás', image: 'https://picsum.photos/seed/p1/200', trustScore: 92 },
    { id: '2', sku: 'CAM-054', name: 'Camiseta Algodão Egípcio', price: 89.90, stock: 120, marketplace: Marketplace.SHOPEE, status: ProductStatus.SYNCED, fulfillment: FulfillmentType.STOCK, lastUpdated: '5m atrás', image: 'https://picsum.photos/seed/p2/200', trustScore: 85 },
    { id: '3', sku: 'TEN-MAR-01', name: 'Tênis Maratona Pro - Pisada Pronada', price: 549.90, stock: 15, marketplace: Marketplace.AMAZON, status: ProductStatus.SYNCED, fulfillment: FulfillmentType.STOCK, lastUpdated: '1h atrás', image: 'https://picsum.photos/seed/marathon/200', trustScore: 98, description: 'Especialmente projetado para maratonistas com pisada pronada. Amortecimento reativo e estabilidade máxima.' },
  ]);
  const [notifications, setNotifications] = useState<{id: number, text: string, type: 'success' | 'info' | 'error'}[]>([]);

  const addNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    addNotification(`Produto ${product.sku} adicionado!`);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addNotification("Produto removido.", "info");
  };

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard': return <Dashboard addNotification={addNotification} />;
        case 'shopping': return <ConversationalCommerce products={products} addNotification={addNotification} />;
        case 'catalog': return <Catalog products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} addNotification={addNotification} />;
        case 'optimizer': return <Optimizer addProduct={addProduct} addNotification={addNotification} />;
        case 'intelligence': return <Intelligence products={products} addNotification={addNotification} />;
        case 'live-commerce': return <LiveCommerce products={products} addNotification={addNotification} updateProduct={updateProduct} />; 
        case 'crm': return <Crm addNotification={addNotification} />;
        case 'marketing': return <Marketing addNotification={addNotification} />;
        case 'academy': return <Academy addNotification={addNotification} />;
        case 'financial': return <Financial addNotification={addNotification} />;
        case 'audit': return <AuditCenter addNotification={addNotification} />;
        case 'trends': return <Trends addNotification={addNotification} />;
        case 'integrations': return <Integrations addNotification={addNotification} />;
        case 'pitch': return <InvestorPitch />;
        default: return <Dashboard addNotification={addNotification} />;
      }
    } catch (err) {
      console.error("Erro ao renderizar aba:", activeTab, err);
      return (
        <div className="p-20 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao carregar módulo</h2>
          <button onClick={() => setActiveTab('dashboard')} className="bg-slate-900 text-white px-6 py-2 rounded-xl">Voltar ao Início</button>
        </div>
      );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
      
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 pointer-events-auto ${
              n.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
              n.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
              'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <span className="text-xl">{n.type === 'success' ? '✅' : n.type === 'error' ? '🚨' : 'ℹ️'}</span>
            <p className="font-bold text-sm leading-tight">{n.text}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;

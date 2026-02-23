
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeOrderRisk } from '../services/geminiService';
import { Order, Marketplace } from '../types';

const fraudStats = [
  { category: 'Wash Trading', value: 45, prevented: 'R$ 12.400' },
  { category: 'Risco Cancelamento', value: 35, prevented: 'R$ 8.900' },
  { category: 'Credential Stuffing', value: 85, prevented: 'Segurança API' },
  { category: 'Logística Reversa Evitada', value: 65, prevented: 'R$ 15.200' },
];

const mockOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Carlos Abreu', productName: 'Tênis Ultra Boost', totalValue: 299.90, costValue: 120.00, marketplaceFee: 45.00, profit: 134.90, status: 'shipped', riskScore: 5, cancellationRisk: 12, timestamp: '10:15', marketplace: Marketplace.AMAZON },
  { id: 'ORD-002', customerName: 'Juliana Lima', productName: 'Camiseta Algodão', totalValue: 89.90, costValue: 35.00, marketplaceFee: 13.40, profit: 41.50, status: 'paid_supplier', riskScore: 12, cancellationRisk: 5, timestamp: '11:20', marketplace: Marketplace.MERCADO_LIVRE },
  { id: 'ORD-003', customerName: 'Roberto Dias', productName: 'Relógio Smart', totalValue: 450.00, costValue: 210.00, marketplaceFee: 67.50, profit: 172.50, status: 'quarantine', riskScore: 85, cancellationRisk: 92, riskReason: "Comprador novo em item de luxo com endereço em zona de risco.", potentialLoss: 48.00, timestamp: '12:05', marketplace: Marketplace.SHOPEE },
];

const AuditCenter: React.FC<{ addNotification?: (t: string, type?: any) => void }> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState<'forensics' | 'risk_management' | 'soc'>('risk_management');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const handleManualVerification = async (order: Order) => {
    setLoadingOrderId(order.id);
    addNotification?.(`Auditando pedido ${order.id} com rede neural profunda...`, 'info');
    try {
      const result = await analyzeOrderRisk(order);
      setOrders(prev => prev.map(o => o.id === order.id ? { 
        ...o, 
        riskScore: result.riskScore, 
        cancellationRisk: result.cancellationRisk,
        riskReason: result.reason,
        potentialLoss: result.potentialLoss,
        status: result.action === 'hold' || result.action === 'block' ? 'quarantine' : o.status
      } : o));
      
      const isDangerous = result.cancellationRisk > 60 || result.riskScore > 70;
      addNotification?.(
        isDangerous ? `ALERTA: Risco de ${result.cancellationRisk}% detectado!` : `Pedido validado com sucesso.`, 
        isDangerous ? 'error' : 'success'
      );
    } finally {
      setLoadingOrderId(null);
    }
  };

  const confirmOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'paid_supplier' } : o));
    addNotification?.("Pedido confirmado pelo lojista. Liberando para expedição.", "success");
  };

  const cancelOrderPreventive = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    addNotification?.("Pedido cancelado preventivamente. Frete de devolução evitado! 🛡️", "info");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('forensics')} className={`px-6 py-3 font-bold text-xs rounded-xl transition-all ${activeTab === 'forensics' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>Timeline Forense</button>
          <button onClick={() => setActiveTab('risk_management')} className={`px-6 py-3 font-bold text-xs rounded-xl transition-all ${activeTab === 'risk_management' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>🛡️ Prevenção & Arrependimento</button>
          <button onClick={() => setActiveTab('soc')} className={`px-6 py-3 font-bold text-xs rounded-xl transition-all ${activeTab === 'soc' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>Métricas SOC</button>
        </div>
        <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
           <p className="text-[10px] font-black text-red-600 uppercase">Acesso Restrito: Auditoria Anti-Devolução</p>
        </div>
      </div>

      {activeTab === 'risk_management' && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 italic">Shield Engine 3.0 - Prevenção de Logística Reversa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-[10px] text-blue-400 font-black uppercase mb-1 tracking-widest">Prejuízo de Frete Evitado</p>
                      <p className="text-3xl font-black text-emerald-400">R$ 15.200,00</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-[10px] text-red-400 font-black uppercase mb-1 tracking-widest">Pedidos em Quarentena</p>
                      <p className="text-3xl font-black">{orders.filter(o => o.status === 'quarantine').length}</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-[10px] text-amber-400 font-black uppercase mb-1 tracking-widest">Taxa de Arrependimento</p>
                      <p className="text-3xl font-black">1.2% <span className="text-xs text-slate-400">(vs 4.5% mercado)</span></p>
                   </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 text-9xl opacity-10">🚚</div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Monitoramento de Intencionalidade (Pré-Envio)</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Escaneamento Automático Ativo</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">ID Pedido / Cliente</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Risco de Cancelamento</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Perda de Frete (Est.)</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Ação IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map(order => (
                      <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${order.status === 'quarantine' ? 'bg-red-50/20' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${order.status === 'quarantine' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {order.marketplace.charAt(0)}
                             </div>
                             <div>
                                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{order.id}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className={`h-full ${order.cancellationRisk && order.cancellationRisk > 70 ? 'bg-red-500' : order.cancellationRisk && order.cancellationRisk > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${order.cancellationRisk || 0}%`}}></div>
                             </div>
                             <span className={`text-xs font-black ${order.cancellationRisk && order.cancellationRisk > 70 ? 'text-red-600' : 'text-slate-500'}`}>{order.cancellationRisk || 0}%</span>
                          </div>
                          {order.riskReason && <p className="text-[10px] text-slate-400 mt-1 italic max-w-xs leading-tight">"{order.riskReason}"</p>}
                        </td>
                        <td className="px-8 py-6">
                           <p className={`font-black ${order.potentialLoss && order.potentialLoss > 40 ? 'text-red-600' : 'text-slate-900'}`}>
                              R$ {order.potentialLoss?.toFixed(2) || '0.00'}
                           </p>
                           <p className="text-[9px] text-slate-400 uppercase font-bold">Risco Unitário</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {order.status === 'quarantine' ? (
                               <>
                                  <button onClick={() => confirmOrder(order.id)} className="bg-emerald-600 text-white p-2 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-700 transition-all">Liberar</button>
                                  <button onClick={() => cancelOrderPreventive(order.id)} className="bg-red-600 text-white p-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-all">Barrar</button>
                               </>
                            ) : (
                               <button 
                                onClick={() => handleManualVerification(order)}
                                disabled={loadingOrderId === order.id}
                                className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                              >
                                {loadingOrderId === order.id ? 'Auditando...' : 'Re-Analisar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'soc' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in zoom-in-95">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-red-500/30 text-white shadow-2xl relative overflow-hidden group">
             <h4 className="text-[10px] font-black uppercase text-red-400 mb-2 tracking-widest">Prejuízo Total Evitado</h4>
             <p className="text-4xl font-black">R$ 26.500</p>
             <p className="text-xs text-slate-400 mt-2">Logística Reversa Protegida pela IA</p>
             <div className="absolute -right-4 -bottom-4 text-7xl opacity-10">🛡️</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Acerto de Detecção</h4>
             <p className="text-4xl font-black text-emerald-500">92%</p>
             <p className="text-xs text-slate-400 mt-2">Precisão da Rede Neural</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Intervenções Automáticas</h4>
             <p className="text-4xl font-black text-slate-900">482</p>
             <p className="text-xs text-slate-400 mt-2">Pedidos filtrados pré-expedição</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl">
             <h4 className="text-[10px] font-black uppercase text-blue-100 mb-2 tracking-widest">ROI do Módulo Audit</h4>
             <p className="text-4xl font-black">12x</p>
             <p className="text-xs text-blue-200 mt-2">Economia vs Custo SaaS</p>
          </div>
        </div>
      )}

      {activeTab === 'forensics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8">Timeline Forense de Segurança</h3>
              <div className="space-y-4">
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center gap-6">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center text-xl">🚨</div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase">14:20 • SEC-882</p>
                       <p className="font-bold text-slate-900">Bloqueio Preventivo de Logística Reversa</p>
                       <p className="text-xs text-red-600 font-bold">Risco de cancelamento altíssimo para SKU-012. Pedido em Quarentena.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-blue-400">Distribuição de Vetores de Risco</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fraudStats}>
                    <XAxis dataKey="category" hide />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem' }} />
                    <Bar dataKey="value">
                      {fraudStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 1 ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AuditCenter;

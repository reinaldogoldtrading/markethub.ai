
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { fintechApi, CreditPartner } from '../services/api/fintechApi';
import { Order } from '../types';

const financialData = [
  { month: 'Jan', revenue: 45000, profit: 13000 },
  { month: 'Fev', revenue: 52000, profit: 17000 },
  { month: 'Mar', revenue: 48000, profit: 15000 },
  { month: 'Abr', revenue: 61000, profit: 20000 },
  { month: 'Mai', revenue: 75000, profit: 27000 },
  { month: 'Jun', revenue: 82000, profit: 30000 },
];

const comparisonData = [
  { name: 'Vendedor Tradicional', lucro: 8500, custos_fixos: 4500, estoque_parado: 35000 },
  { name: 'Vendedor MarketHub', lucro: 14200, custos_fixos: 1200, estoque_parado: 0 },
];

const mockOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Carlos Abreu', productName: 'Tênis Ultra Boost', totalValue: 299.90, costValue: 120.00, marketplaceFee: 45.00, profit: 134.90, status: 'shipped', riskScore: 5, timestamp: '10:15', marketplace: 'Amazon' as any },
  { id: 'ORD-002', customerName: 'Juliana Lima', productName: 'Camiseta Algodão', totalValue: 89.90, costValue: 35.00, marketplaceFee: 13.40, profit: 41.50, status: 'paid_supplier', riskScore: 12, timestamp: '11:20', marketplace: 'Mercado Livre' as any },
  { id: 'ORD-003', customerName: 'Roberto Dias', productName: 'Relógio Smart', totalValue: 450.00, costValue: 210.00, marketplaceFee: 67.50, profit: 172.50, status: 'splitting', riskScore: 85, timestamp: '12:05', marketplace: 'Shopee' as any },
];

const Financial: React.FC<{ addNotification?: (t: string, type?: any) => void }> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'viability' | 'split' | 'advance'>('overview');
  const [credit, setCredit] = useState({ available: 0, total: 0 });
  const [partners, setPartners] = useState<CreditPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  useEffect(() => {
    const loadFintechData = async () => {
      const [limit, partnersData] = await Promise.all([
        fintechApi.checkCreditLimit(),
        fintechApi.getCreditPartners()
      ]);
      setCredit(limit);
      setPartners(partnersData);
      setSelectedPartner(partnersData[0].id);
    };
    loadFintechData();
  }, []);

  const handleAdvance = async (order: Order) => {
    if (order.riskScore > 70) {
      addNotification?.(`Pedido ${order.id} retido por suspeita de fraude. Antecipação bloqueada.`, 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fintechApi.requestAdvance(order.id, order.costValue, selectedPartner);
      if (res.success && addNotification) {
        addNotification(`Crédito liberado! Fornecedor do pedido ${order.id} pago via FIDC. 🏦`, 'success');
        setCredit(prev => ({ ...prev, available: prev.available - order.costValue }));
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'shipped' } : o));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Visão Geral</button>
        <button onClick={() => setActiveTab('viability')} className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'viability' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Viabilidade & ROI 📈</button>
        <button onClick={() => setActiveTab('split')} className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'split' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Split Automático</button>
        <button onClick={() => setActiveTab('advance')} className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'advance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Marketplace de Crédito 🏦</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Fluxo de Caixa Consolidado</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={0.1} fill="#3b82f6" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={0.1} fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Capital Disponível para Fornecedores</h4>
                 <p className="text-3xl font-black mb-2">R$ {credit.available.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                 <p className="text-xs text-slate-400 mb-6 italic">Você não usa seu capital para comprar estoque. O Hub antecipa.</p>
                 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                    <div className="bg-emerald-500 h-full" style={{width: `${(credit.available / credit.total) * 100}%`}}></div>
                 </div>
                 <button onClick={() => setActiveTab('advance')} className="w-full bg-emerald-600 py-4 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg">Acessar Crédito</button>
               </div>
               <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">💰</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'viability' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                 <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Eficiência Financeira: Tradicional vs Hub</h3>
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="lucro" name="Lucro Líquido (R$)" fill="#10b981" radius={[10, 10, 0, 0]} />
                          <Bar dataKey="custos_fixos" name="Custos Fixos (RH/Ferramentas)" fill="#ef4444" radius={[10, 10, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl space-y-6">
                 <h3 className="text-2xl font-black italic">Por que você ganha mais?</h3>
                 <div className="space-y-4">
                    <div className="flex items-start gap-4">
                       <span className="text-2xl">🧩</span>
                       <div>
                          <p className="font-bold">Diluição de Mensalidade</p>
                          <p className="text-xs text-blue-100 opacity-80">Seu custo fixo cai de R$ 4.500 (funcionários) para R$ 299 (MarketHub). A margem sobra no seu bolso.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <span className="text-2xl">⚡</span>
                       <div>
                          <p className="font-bold">Velocidade de Giro</p>
                          <p className="text-xs text-blue-100 opacity-80">O concorrente espera 15 dias pelo ML. Você paga o fornecedor hoje e já vende o próximo item. O volume compensa a taxa.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <span className="text-2xl">📉</span>
                       <div>
                          <p className="font-bold">Preço Inteligente</p>
                          <p className="text-xs text-blue-100 opacity-80">A IA não baixa seu preço se você for o único com estoque. Ela garante sua margem mínima de 15% em todas as operações.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'split' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Liquidação Automática</h3>
               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Gateway Conectado</span>
             </div>

             <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pedido: {order.id}</p>
                        <p className="font-bold text-slate-900">{order.productName}</p>
                     </div>
                     <div className="flex items-center gap-8 text-center">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Venda</p>
                           <p className="font-bold text-slate-900">R$ {order.totalValue.toFixed(2)}</p>
                        </div>
                        <div className="text-blue-600 font-bold">➔</div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-black text-red-500 uppercase mb-1">Custo + Taxas</p>
                           <p className="font-bold text-red-500">R$ {(order.costValue + order.marketplaceFee).toFixed(2)}</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Seu Lucro</p>
                           <p className="font-bold text-blue-600">R$ {order.profit.toFixed(2)}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {activeTab === 'advance' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Marketplace de Antecipação de Recebíveis</span>
                  <h2 className="text-4xl font-black mb-4">Seu estoque pago por <br/><span className="text-blue-500">Bancos e FIDCs</span>.</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">Selecione o parceiro com a melhor taxa diária. O MarketHub valida sua venda e o fundo paga o fornecedor instantaneamente.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                   <p className="text-[10px] text-slate-400 font-black uppercase mb-2">Linha de Crédito Atual</p>
                   <p className="text-3xl font-black text-emerald-400">R$ {credit.available.toLocaleString('pt-BR')}</p>
                   <p className="text-[9px] text-slate-500 mt-2">Capacidade total: R$ {credit.total.toLocaleString('pt-BR')}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             <div className="lg:col-span-4 space-y-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest px-2 mb-2">Parceiros de Crédito</h4>
                {partners.map(partner => (
                  <button 
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner.id)}
                    className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center justify-between group ${selectedPartner === partner.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-200 hover:border-blue-400'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{partner.logo}</span>
                      <div>
                        <p className={`font-bold text-sm ${selectedPartner === partner.id ? 'text-white' : 'text-slate-900'}`}>{partner.name}</p>
                        <p className={`text-[10px] font-black ${selectedPartner === partner.id ? 'text-blue-100' : 'text-slate-400'}`}>Rating: {partner.rating}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-sm font-black ${selectedPartner === partner.id ? 'text-white' : 'text-blue-600'}`}>{partner.dailyRate}% / dia</p>
                       <p className={`text-[8px] font-bold uppercase ${selectedPartner === partner.id ? 'text-blue-200' : 'text-slate-400'}`}>Taxa de Cessão</p>
                    </div>
                  </button>
                ))}
             </div>

             <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Recebíveis Prontos para Cessão</h3>
                   <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Filtro: Risco Baixo</span>
                </div>

                <div className="space-y-6">
                  {orders.filter(o => o.status !== 'shipped').map(order => (
                    <div key={order.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-blue-200 transition-all">
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase">{order.id}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${order.riskScore < 20 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                              Risco {order.riskScore}%
                            </span>
                          </div>
                          <p className="font-bold text-slate-900">{order.productName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Aguardando Pagamento Fornecedor (R$ {order.costValue.toFixed(2)})</p>
                       </div>
                       
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-sm font-black text-slate-900">R$ {order.costValue.toFixed(2)}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Valor Antecipável</p>
                          </div>
                          <button 
                            onClick={() => handleAdvance(order)}
                            disabled={loading}
                            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase transition-all shadow-lg ${order.riskScore > 70 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
                          >
                            {loading ? '...' : 'Antecipar'}
                          </button>
                       </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status !== 'shipped').length === 0 && (
                    <div className="py-20 text-center opacity-30 italic text-slate-400">
                      Nenhum recebível disponível para cessão no momento.
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;

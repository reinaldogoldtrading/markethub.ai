
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getFinancialProjection } from '../services/geminiService';

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const financialData = [
  { month: 'Jan', revenue: 45000, costs: 32000, profit: 13000 },
  { month: 'Fev', revenue: 52000, costs: 35000, profit: 17000 },
  { month: 'Mar', revenue: 48000, costs: 33000, profit: 15000 },
  { month: 'Abr', revenue: 61000, costs: 41000, profit: 20000 },
  { month: 'Mai', revenue: 75000, costs: 48000, profit: 27000 },
  { month: 'Jun', revenue: 82000, costs: 52000, profit: 30000 },
];

const expenseDistribution = [
  { name: 'Impostos (15%)', value: 12300 },
  { name: 'Mercadoria (CMV)', value: 24600 },
  { name: 'Marketing (Ads)', value: 8200 },
  { name: 'Funcionários', value: 4500 },
  { name: 'Plataformas', value: 2400 },
];

interface FinancialProps {
  addNotification?: (text: string, type?: 'success' | 'info') => void;
}

const Financial: React.FC<FinancialProps> = ({ addNotification }) => {
  const [adsInvestment, setAdsInvestment] = useState(8200);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [pricingModel, setPricingModel] = useState<'fixed' | 'commission'>('fixed');

  const marketHubCost = pricingModel === 'fixed' ? 299 : (30000 * 0.05);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const insight = await getFinancialProjection(82000, adsInvestment, 4500);
      setAiInsight(insight);
      if (addNotification) addNotification("Novos insights financeiros gerados!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSimulation(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Lucro Líquido (Jun)', value: `R$ ${(30000 - marketHubCost).toLocaleString()}`, color: 'emerald' },
          { label: 'Investimento Ads', value: `R$ ${adsInvestment.toLocaleString()}`, color: 'indigo' },
          { label: 'Custo MarketHub', value: `R$ ${marketHubCost.toLocaleString()}`, color: 'blue' },
          { label: 'ROI Plataforma', value: `${((30000 / marketHubCost)).toFixed(1)}x`, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Histórico vs Projeção IA</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button 
                onClick={() => setPricingModel('fixed')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${pricingModel === 'fixed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
               >
                 Plano Fixo
               </button>
               <button 
                onClick={() => setPricingModel('commission')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${pricingModel === 'commission' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
               >
                 5% Comissão
               </button>
            </div>
          </div>
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

        <div className="lg:col-span-4 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl">
          <h3 className="text-xl font-bold mb-6">Simulador de Expansão</h3>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Investimento Mensal em Tráfego</label>
              <input 
                type="range" min="1000" max="50000" step="1000"
                value={adsInvestment}
                onChange={(e) => setAdsInvestment(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-right text-blue-400 font-bold mt-2">R$ {adsInvestment.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Impacto no Lucro Estimado</p>
              <h4 className="text-3xl font-black text-emerald-400">+ R$ {(adsInvestment * 2.5).toLocaleString()}</h4>
            </div>
            <div className="pt-4 border-t border-white/10">
               <p className="text-xs text-slate-400 leading-relaxed italic">
                 {pricingModel === 'fixed' 
                   ? "No modelo Fixo, seu lucro escala sem aumentar o custo da ferramenta. Ideal para grandes volumes." 
                   : "No modelo Comissão, você só paga se vender. Ideal para quem está começando agora."}
               </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">🤖</div>
              <h3 className="text-xl font-bold text-slate-900">Análise Financeira IA</h3>
           </div>
           <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 min-h-[150px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                   <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-slate-400 text-sm italic">Auditando sua margem de contribuição...</p>
                </div>
              ) : (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;

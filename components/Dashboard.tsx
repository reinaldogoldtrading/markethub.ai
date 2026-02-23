
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CloudBotLog from './CloudBotLog';
import { Marketplace } from '../types';
import { fintechApi } from '../services/api/fintechApi';

const data = [
  { name: 'Seg', sales: 4000, growth: 2400 },
  { name: 'Ter', sales: 3000, growth: 1398 },
  { name: 'Qua', sales: 2000, growth: 9800 },
  { name: 'Qui', sales: 2780, growth: 3908 },
  { name: 'Sex', sales: 1890, growth: 4800 },
  { name: 'Sab', sales: 2390, growth: 3800 },
  { name: 'Dom', sales: 3490, growth: 4300 },
];

interface DashboardProps {
  addNotification: (t: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ addNotification }) => {
  const [sharing, setSharing] = useState(false);
  const [credit, setCredit] = useState({ available: 0, total: 0 });

  useEffect(() => {
    fintechApi.checkCreditLimit().then(setCredit);
  }, []);

  const stats = [
    { label: 'Vendas Totais', value: 'R$ 45.231,00', color: 'blue' },
    { label: 'Saldo Adiantável', value: `R$ ${credit.available.toLocaleString()}`, color: 'emerald' },
    { label: 'Taxa de Conversão', value: '4.82%', color: 'emerald' },
    { label: 'Insights CloudBot', value: '24 Ativos', color: 'orange' },
  ];

  const syncStatus = [
    { marketplace: Marketplace.MERCADO_LIVRE, status: 'synced', count: 124, lastSync: '2m atrás' },
    { marketplace: Marketplace.AMAZON, status: 'synced', count: 56, lastSync: '10s atrás' },
    { marketplace: Marketplace.SHOPEE, status: 'synced', count: 89, lastSync: '5m atrás' },
    { marketplace: Marketplace.SHEIN, status: 'pending', count: 12, lastSync: 'Sincronizando...' },
  ];

  const handleShare = () => {
    setSharing(true);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Dia,Vendas,Crescimento\n"
        + data.map(e => `${e.name},${e.sales},${e.growth}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "performance_markethub.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSharing(false);
      addNotification("Relatório de ROI exportado com sucesso! 📊");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">Zero Capital Active</span>
            <span className="bg-emerald-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">Fintech Bridge OK</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Operação <span className="text-emerald-400">100% Antecipada</span>! ⚡</h2>
          <p className="text-slate-400 text-lg max-w-xl">Você tem R$ {credit.available.toLocaleString()} para pagar fornecedores hoje, independente do repasse do ML.</p>
        </div>
        <button 
          onClick={handleShare}
          disabled={sharing}
          className="relative z-10 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-3 whitespace-nowrap shadow-xl shadow-blue-600/30 disabled:opacity-50"
        >
          {sharing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "📊 Exportar Performance"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">Monitor de Sincronização Global</h3>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Tempo Real</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {syncStatus.map((s, i) => (
                  <div key={i} className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all ${
                    s.status === 'synced' ? 'bg-slate-50 border-slate-100' : 
                    s.status === 'pending' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'
                  }`}>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{s.marketplace}</span>
                       <div className={`w-2 h-2 rounded-full ${
                         s.status === 'synced' ? 'bg-emerald-500' : 
                         s.status === 'pending' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                       }`}></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-900">{s.count}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">SKUs</span>
                    </div>
                    <p className={`text-[9px] font-black uppercase ${
                       s.status === 'synced' ? 'text-emerald-600' : 
                       s.status === 'pending' ? 'text-blue-600' : 'text-red-600'
                    }`}>{s.lastSync}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">Fluxo de Caixa IA vs Real</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="growth" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <CloudBotLog />
          
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
             <h4 className="text-lg font-bold mb-2">Próxima Sugestão SuperAds</h4>
             <p className="text-slate-400 text-xs mb-6 italic">"Aumentar o investimento em 'Moda Verão' devido à previsão meteorológica."</p>
             <button 
                onClick={() => addNotification("CloudBot: Estratégia de 'Moda Verão' aplicada no SuperAds.")}
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-400 transition-all text-sm"
             >
                Aceitar e Lançar
             </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
             <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Saúde do Sistema</h4>
             <div className="space-y-4">
                {[
                  { name: 'API Mercado Livre', status: 'OK', color: 'emerald' },
                  { name: 'Fintech Advance API', status: 'OK', color: 'emerald' },
                  { name: 'API Shopee', status: 'OK', color: 'emerald' },
                  { name: 'Veo Video Generator', status: 'OK', color: 'emerald' },
                  { name: 'CloudBot Core', status: 'LATENCY 12ms', color: 'emerald' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                    <span className={`text-[9px] font-black text-${item.color}-600 uppercase`}>{item.status}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

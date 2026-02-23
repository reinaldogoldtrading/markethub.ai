
import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps"; // Usaremos SVG direto para evitar deps pesadas
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getGeographicMarketHeat, calculateABCAnalysis } from '../services/geminiService';
import { Product } from '../types';

// Mock de estados simplificado para o Heatmap (SVG inline)
const states = [
  { id: 'SP', name: 'São Paulo', path: 'M...' }, // Paths omitidos para brevidade, usaremos círculos representativos
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PR', name: 'Paraná' },
  { id: 'RS', name: 'Rio G. do Sul' },
  { id: 'BA', name: 'Bahia' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'CE', name: 'Ceará' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'DF', name: 'Distrito Fed.' },
];

const Intelligence: React.FC<{ products: Product[], addNotification?: (t: string) => void }> = ({ products, addNotification }) => {
  const [activeTab, setActiveTab] = useState<'geo' | 'abc'>('geo');
  const [niche, setNiche] = useState('Eletrônicos');
  const [geoData, setGeoData] = useState<Record<string, number>>({});
  const [abcData, setAbcData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleLoadData();
  }, []);

  const handleLoadData = async () => {
    setLoading(true);
    try {
      const [geo, abc] = await Promise.all([
        getGeographicMarketHeat(niche),
        calculateABCAnalysis(products)
      ]);
      setGeoData(geo.heatmap || {});
      setAbcData(abc);
      addNotification?.("Relatório de Inteligência de Mercado Atualizado!");
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (value: number) => {
    if (value > 80) return '#ef4444'; // Crítico/Alto
    if (value > 50) return '#f59e0b'; // Médio
    return '#3b82f6'; // Baixo
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-6">
          <button onClick={() => setActiveTab('geo')} className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'geo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Mapa de Calor Geográfico 🗺️</button>
          <button onClick={() => setActiveTab('abc')} className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'abc' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Curva ABC (Pareto) 📊</button>
        </div>
        <div className="flex gap-2">
           <input 
            type="text" 
            value={niche} 
            onChange={e => setNiche(e.target.value)} 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
           />
           <button onClick={handleLoadData} disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black">ATUALIZAR IA</button>
        </div>
      </div>

      {activeTab === 'geo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
              <h3 className="text-xl font-black text-slate-900 mb-2">Volume de Interesse Regional</h3>
              <p className="text-xs text-slate-500 mb-8 italic">Onde as pessoas mais pesquisam por "{niche}" no Brasil hoje.</p>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                 {Object.entries(geoData).map(([uf, val]) => (
                   <div key={uf} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-2 group hover:shadow-xl transition-all">
                      {/* Fix: cast 'val' as number to resolve type error */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg shadow-lg" style={{ backgroundColor: getHeatColor(val as number) }}>
                         {uf}
                      </div>
                      <p className="text-xs font-black text-slate-900">{val}%</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Intensidade</p>
                   </div>
                 ))}
              </div>
              
              <div className="mt-10 p-6 bg-blue-600 rounded-[2rem] text-white flex items-center gap-6">
                 <div className="text-4xl">🚀</div>
                 <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">Estratégia Recomendada</h4>
                    <p className="text-xs text-blue-100">Foque suas campanhas de SuperAds em SP e RJ. Há uma demanda reprimida nestas capitais para seu nicho.</p>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                 <h4 className="text-[10px] font-black uppercase text-blue-400 mb-6 tracking-widest">Market Share Externo</h4>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={Object.entries(geoData).map(([n, v]) => ({ name: n, value: v }))} 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                             {Object.entries(geoData).map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#1e293b'} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-2xl font-black">{geoData['SP'] || 0}%</p>
                    <p className="text-[9px] font-black uppercase text-slate-500">Líder: SP</p>
                 </div>
              </div>
              
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                 <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Top Cidades em Alta</h4>
                 <div className="space-y-3">
                    {['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR'].map((city, i) => (
                      <div key={i} className="flex justify-between items-center text-sm font-bold p-3 bg-slate-50 rounded-xl">
                         <span className="text-slate-900">{city}</span>
                         <span className="text-emerald-500">↑ {12 + i}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'abc' && abcData && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                 <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-80">Classe A (Estrelas)</h4>
                 <p className="text-4xl font-black">{abcData.A.length}</p>
                 <p className="text-xs mt-2 text-emerald-100 italic">Responsáveis por 80% do seu faturamento.</p>
                 <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:rotate-12 transition-transform">⭐</div>
              </div>
              <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                 <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-80">Classe B (Estáveis)</h4>
                 <p className="text-4xl font-black">{abcData.B.length}</p>
                 <p className="text-xs mt-2 text-blue-100 italic">Giram constantemente com margem média.</p>
                 <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:rotate-12 transition-transform">⚖️</div>
              </div>
              <div className="bg-slate-400 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                 <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-80">Classe C (Cauda Longa)</h4>
                 <p className="text-4xl font-black">{abcData.C.length}</p>
                 <p className="text-xs mt-2 text-slate-100 italic">Muitos itens, pouco impacto financeiro.</p>
                 <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:rotate-12 transition-transform">📦</div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8">Visualização de Pareto</h3>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Classe A', total: 80, items: abcData.A.length },
                      { name: 'Classe B', total: 15, items: abcData.B.length },
                      { name: 'Classe C', total: 5, items: abcData.C.length },
                    ]}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip />
                       <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#94a3b8" />
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              
              <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Insight Estratégico do Coach IA 🤖</p>
                 <p className="text-slate-700 text-sm leading-relaxed italic">"{abcData.summary || 'Concentrando seus esforços nos produtos da Classe A, você pode dobrar o lucro sem aumentar o estoque.'}"</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Intelligence;

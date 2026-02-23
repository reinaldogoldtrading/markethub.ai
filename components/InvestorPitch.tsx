
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const projectionData = [
  { year: 'Q1 2024', mrr: 50000, creditVolume: 200000 },
  { year: 'Q2 2024', mrr: 120000, creditVolume: 650000 },
  { year: 'Q3 2024', mrr: 280000, creditVolume: 1800000 },
  { year: 'Q4 2024', mrr: 650000, creditVolume: 5200000 },
  { year: 'Q1 2025', mrr: 1200000, creditVolume: 12000000 },
];

const modules = [
  {
    id: 'brain',
    title: 'IA Core (O Cérebro)',
    icon: '🧠',
    description: 'Nossa IA não é apenas um assistente, é o Gerente de E-commerce autônomo.',
    topics: [
      { name: 'Otimização Multicanal', detail: 'Ajusta títulos e fotos para o algoritmo específico de cada rede (ML vs Amazon).' },
      { name: 'Análise Competitiva', detail: 'Monitora preços de rivais 24/7 e sugere mudanças para manter o Buy Box.' },
      { name: 'Social Listening', detail: 'Detecta crises de marca em fóruns e redes externas antes de chegarem ao SAC.' },
      { name: 'Sales Coach', detail: 'Treina a equipe de vendas simulando clientes reais com base em dados históricos.' }
    ],
    tech: 'Google Gemini 3 Pro / 2.5 Flash'
  },
  {
    id: 'finance',
    title: 'Fintech Bridge (A Alavanca)',
    icon: '🏦',
    description: 'Resolvemos a falta de capital sem o risco de crédito tradicional.',
    topics: [
      { name: 'Marketplace de Crédito', detail: 'Conecta lojistas a FIDCs parceiros que buscam rentabilidade segura em recebíveis.' },
      { name: 'Split Automático', detail: 'Separa o dinheiro do fornecedor e do lojista no momento exato da venda.' },
      { name: 'Cessão de Recebíveis', detail: 'O MarketHub atesta a entrega e o fundo libera o valor para o fornecedor na hora.' },
      { name: 'Antecipação Zero-Risco', detail: 'Operação garantida pela venda já realizada. Risco de crédito quase inexistente.' }
    ],
    tech: 'Open Banking API / Smart Contracts'
  },
  {
    id: 'ops',
    title: 'Operational Hub (A Escala)',
    icon: '⚙️',
    description: 'Eliminamos o trabalho manual que impede o crescimento de 10x.',
    topics: [
      { name: 'Dropshipping No-Click', detail: 'Sincronização total com fornecedores globais. Pedido gerado sem intervenção humana.' },
      { name: 'Live Commerce', detail: 'Venda ao vivo em múltiplas redes com controle de estoque e QR Code unificado.' },
      { name: 'Unified CRM IA', detail: 'Inbox centralizado que responde dúvidas técnicas usando a base de conhecimento do produto.' },
      { name: 'Academy Gamificada', detail: 'Treinamento contínuo para lojistas escalarem suas operações dentro do Hub.' }
    ],
    tech: 'Node.js / React / API-First Architecture'
  }
];

const InvestorPitch: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const slides = [
    {
      title: "MarketHub AI: A Próxima Fronteira do Varejo",
      subtitle: "Não somos apenas um ERP. Somos o sistema operacional que funde IA Generativa com Liquidez Financeira.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-blue-500/30 transform hover:scale-105 transition-all">
            <h4 className="text-4xl font-black text-blue-400 mb-2">R$ 5B+</h4>
            <p className="text-slate-400 text-sm">é o volume de vendas travado por burocracia bancária em marketplaces mensalmente.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-emerald-500/30 transform hover:scale-105 transition-all">
            <h4 className="text-4xl font-black text-emerald-400 mb-2">90%</h4>
            <p className="text-slate-400 text-sm">de redução no custo operacional de atendimento ao cliente via CloudBot IA.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-amber-500/30 transform hover:scale-105 transition-all">
            <h4 className="text-4xl font-black text-amber-400 mb-2">Take-Rate</h4>
            <p className="text-slate-400 text-sm">Ganhamos no SaaS e no Spread Financeiro. Dupla fonte de receita por lojista.</p>
          </div>
        </div>
      )
    },
    {
      title: "Arquitetura do Ecossistema",
      subtitle: "Três pilares que resolvem: Tempo (IA), Dinheiro (Fintech) e Escala (Ops).",
      content: (
        <div className="space-y-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {modules.map((m) => (
              <button 
                key={m.id} 
                onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
                className={`text-left p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${expandedModule === m.id ? 'bg-blue-600 border-blue-400 shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-blue-500'}`}
              >
                <div className="text-5xl mb-4">{m.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">{m.title}</h4>
                <p className={`text-xs mb-6 ${expandedModule === m.id ? 'text-blue-100' : 'text-slate-400'}`}>{m.description}</p>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Clique para detalhar 🔍</div>
                {expandedModule === m.id && <div className="absolute top-4 right-6 text-2xl">⚡</div>}
              </button>
            ))}
          </div>

          {expandedModule && (
            <div className="bg-white/5 border border-blue-500/30 p-10 rounded-[3rem] animate-in slide-in-from-top-4">
               <h5 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-6">Detalhamento Técnico & Negócio</h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {modules.find(m => m.id === expandedModule)?.topics.map((t, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                       <div>
                          <p className="font-bold text-white mb-1">{t.name}</p>
                          <p className="text-sm text-slate-400 leading-relaxed">{t.detail}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Modelo de Receita: SaaS + Fintech",
      subtitle: "Como monetizamos cada etapa da jornada do vendedor.",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10">
           <div className="space-y-4">
              <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Software (SaaS)</span>
                    <span className="text-blue-400 font-black">Recorrência</span>
                 </div>
                 <p className="text-xs text-slate-400">Mensalidades de R$ 299 a R$ 2.499 dependendo do volume de SKUs e Canais.</p>
              </div>
              <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Fintech (Take-Rate)</span>
                    <span className="text-emerald-400 font-black">Variável</span>
                 </div>
                 <p className="text-xs text-slate-400">Cerca de 1.2% de fee em cada operação de antecipação aprovada via nossa ponte.</p>
              </div>
              <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Academy & Ads</span>
                    <span className="text-amber-400 font-black">Serviços</span>
                 </div>
                 <p className="text-xs text-slate-400">Upsell de treinamento e crédito para campanhas SuperAds gerenciadas pela IA.</p>
              </div>
           </div>
           <div className="bg-blue-600 rounded-[3rem] p-10 flex flex-col justify-center shadow-2xl">
              <h4 className="text-2xl font-black mb-4">Market Size (TAM)</h4>
              <p className="text-blue-100 mb-8">O e-commerce na América Latina cresce 20% ao ano, mas a infraestrutura financeira ainda é a de 2010.</p>
              <div className="space-y-4">
                 <div className="flex justify-between border-b border-blue-400 pb-2">
                    <span className="text-sm font-bold">TAM</span>
                    <span className="font-black">US$ 150B</span>
                 </div>
                 <div className="flex justify-between border-b border-blue-400 pb-2">
                    <span className="text-sm font-bold">SAM (E-com Brasil)</span>
                    <span className="font-black">US$ 45B</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-sm font-bold">SOM (Nossa Meta)</span>
                    <span className="font-black text-xl">US$ 500M</span>
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      title: "Growth: Projeção 24 Meses",
      subtitle: "A combinação de crédito e automação cria um efeito 'Lock-in' imbatível.",
      content: (
        <div className="mt-10 bg-slate-800 p-10 rounded-[3.5rem] border border-slate-700 h-96 relative group">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                />
                <Area type="monotone" dataKey="mrr" name="MRR (SaaS)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={4} />
                <Area type="monotone" dataKey="creditVolume" name="Volume de Crédito" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={4} />
              </AreaChart>
           </ResponsiveContainer>
           <div className="absolute top-4 right-10 bg-black/40 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-[10px] font-bold text-slate-400">
             Valores em R$ (Milhões)
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[calc(100vh-180px)] bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col shadow-2xl">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">MH</div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest text-white leading-none">MarketHub AI</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Equity Round 2024</p>
             </div>
          </div>
          <div className="flex gap-2">
             {slides.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${activeSlide === i ? 'w-16 bg-blue-500' : 'w-4 bg-slate-700'}`}></div>
             ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-right-10 duration-700 flex-1">
           <div className="max-w-4xl">
             <h2 className="text-6xl font-black mb-6 leading-tight tracking-tighter">{slides[activeSlide].title}</h2>
             <p className="text-2xl text-slate-400 font-medium leading-relaxed">{slides[activeSlide].subtitle}</p>
           </div>
           {slides[activeSlide].content}
        </div>

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => { setActiveSlide(prev => Math.max(0, prev - 1)); setExpandedModule(null); }}
                className="p-6 rounded-full border border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-30"
                disabled={activeSlide === 0}
              >
                ←
              </button>
              <button 
                onClick={() => { setActiveSlide(prev => Math.min(slides.length - 1, prev + 1)); setExpandedModule(null); }}
                className="bg-white text-slate-900 px-12 py-6 rounded-[2rem] font-black text-lg hover:bg-blue-50 transition-all flex items-center gap-3 shadow-2xl disabled:opacity-30"
                disabled={activeSlide === slides.length - 1}
              >
                {activeSlide === slides.length - 1 ? 'Final do Deck' : 'Próximo Slide →'}
              </button>
           </div>
           
           <div className="hidden lg:flex items-center gap-12">
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacidade de Operação</p>
                 <p className="text-xl font-bold text-white uppercase tracking-tighter">Multichannel Cloud Sync</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance</p>
                 <p className="text-xl font-bold text-emerald-500 uppercase tracking-tighter">Bacen / LGPD Ready</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorPitch;

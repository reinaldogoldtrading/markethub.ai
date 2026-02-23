
import React, { useState, useEffect } from 'react';
import { startSalesRoleplay, getSalesCoachFeedback, getAcademyDynamicInsights, generateDynamicLesson, getIntegrationSupport } from '../services/geminiService';

const scenarios = [
  { id: '1', title: 'Cliente pedindo desconto', description: 'O cliente amou o produto mas diz que o concorrente está R$ 20 mais barato.', icon: '🏷️' },
  { id: '2', title: 'Dúvida técnica avançada', description: 'O cliente quer saber detalhes profundos sobre a compatibilidade do produto.', icon: '⚙️' },
  { id: '3', title: 'Cliente irritado com atraso', description: 'O produto ainda não chegou e o cliente está ameaçando cancelar.', icon: '😠' },
];

const integrationGuides = [
  {
    id: 'ml-oauth',
    title: 'Mercado Livre (OAuth 2.0)',
    platform: 'Mercado Livre',
    difficulty: 'Fácil',
    time: '2 min',
    steps: [
      'Vá na aba "Integrações" do MarketHub.',
      'Clique no botão "Vincular Conta" do Mercado Livre.',
      'Você será levado ao site oficial do Mercado Livre para fazer login.',
      'Clique em "Autorizar" para gerar seu Token Seguro.',
      'Pronto! Suas vendas e estoque serão sincronizados via API.'
    ],
    security: 'Nunca pedimos sua senha. O acesso é via Token Digital criptografado.'
  },
  {
    id: 'amazon-spapi',
    title: 'Amazon (Selling Partner API)',
    platform: 'Amazon',
    difficulty: 'Médio',
    time: '6 min',
    steps: [
      'Acesse sua conta na Amazon Seller Central.',
      'Em "Apps & Services", clique em "Manage Your Apps".',
      'Autorize o MarketHub AI como um integrador oficial.',
      'Copie o seu LWA Client Secret e Client ID.',
      'Cole as chaves na aba de Integrações do Hub para ativar a SP-API.'
    ],
    security: 'Conformidade total com a Política de Proteção de Dados de Dados da Amazon.'
  },
  {
    id: 'shopee-oauth',
    title: 'Shopee (Partner API)',
    platform: 'Shopee',
    difficulty: 'Fácil',
    time: '3 min',
    steps: [
      'Acesse seu Seller Center da Shopee.',
      'No MarketHub, clique em "Vincular Shopee".',
      'Faça o login seguro na janela oficial da Shopee.',
      'Selecione sua loja e confirme a autorização de parceiro.',
      'Aguarde a luz verde de "Sincronizado" no seu painel.'
    ],
    security: 'Conexão protegida por SSL e protocolo de parceria oficial Shopee.'
  },
  {
    id: 'drop-api',
    title: 'Dropshipping (API Key)',
    platform: 'AliExpress / ZenDrop',
    difficulty: 'Médio',
    time: '5 min',
    steps: [
      'Acesse o painel de desenvolvedor do seu fornecedor.',
      'Gere uma nova "API Key" ou "Access Token".',
      'Copie a chave e cole na aba "Conectores Dropshipping" do MarketHub.',
      'Clique em "Validar Conexão".',
      'O CloudBot agora monitorará o estoque do fornecedor por você.'
    ],
    security: 'Sua chave de API é armazenada em um cofre digital (Vault) e nunca é exposta.'
  }
];

const Academy: React.FC<{ addNotification: (t: string) => void }> = ({ addNotification }) => {
  const [activeView, setActiveView] = useState<'courses' | 'coach' | 'live' | 'guides'>('live');
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<typeof integrationGuides[0] | null>(null);
  const [chat, setChat] = useState<{role: string, text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  // Dynamic Content States
  const [liveInsights, setLiveInsights] = useState<string>('');
  const [niche, setNiche] = useState('Moda & Acessórios');
  const [dynamicLesson, setDynamicLesson] = useState<any>(null);
  const [lessonTopic, setLessonTopic] = useState('');

  // Integration Support State
  const [integrationQuery, setIntegrationQuery] = useState('');
  const [aiSupportData, setAiSupportData] = useState<{text: string, sources: any[]} | null>(null);

  useEffect(() => {
    if (activeView === 'live' && !liveInsights) {
      handleFetchInsights();
    }
  }, [activeView]);

  const handleFetchInsights = async () => {
    setLoading(true);
    try {
      const insights = await getAcademyDynamicInsights(niche);
      setLiveInsights(insights);
      addNotification("Insights de mercado atualizados via Gemini! ⚡");
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationSupport = async () => {
    if (!integrationQuery || !selectedGuide) return;
    setLoading(true);
    try {
      const response = await getIntegrationSupport(integrationQuery, selectedGuide.platform);
      setAiSupportData(response);
      addNotification("Resposta técnica gerada via Gemini Search! 🛡️");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLesson = async () => {
    if (!lessonTopic) return;
    setLoading(true);
    try {
      const lesson = await generateDynamicLesson(lessonTopic);
      setDynamicLesson(lesson);
      addNotification("Micro-aula gerada com sucesso! 🎓");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoleplay = (s: typeof scenarios[0]) => {
    setSelectedScenario(s);
    setChat([{ role: 'cliente', text: 'Olá, gostaria de falar sobre este produto...' }]);
    setActiveView('coach');
    setFeedback(null);
  };

  const handleSendMessage = async () => {
    if (!userInput || !selectedScenario) return;
    const newHistory = [...chat, { role: 'vendedor', text: userInput }];
    setChat(newHistory);
    setUserInput('');
    setLoading(true);

    try {
      const response = await startSalesRoleplay(selectedScenario.title, userInput);
      setChat(prev => [...prev, { role: 'cliente', text: response }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRoleplay = async () => {
    setLoading(true);
    try {
      const res = await getSalesCoachFeedback(chat);
      setFeedback(res);
      addNotification("Avaliação do Sales Coach concluída! 🏆");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveView('live')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeView === 'live' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          <span className="mr-2">📡</span> Market Live
        </button>
        <button 
          onClick={() => setActiveView('guides')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeView === 'guides' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          <span className="mr-2">🔌</span> Guias de Integração
        </button>
        <button 
          onClick={() => setActiveView('courses')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeView === 'courses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          <span className="mr-2">📚</span> Aulas Dinâmicas
        </button>
        <button 
          onClick={() => setActiveView('coach')}
          className={`px-6 py-4 font-bold text-sm transition-all ${activeView === 'coach' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          <span className="mr-2">🎯</span> Sales Coach IA
        </button>
      </div>

      {activeView === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xl font-black text-slate-900 mb-6">Tutoriais de Conexão</h3>
              <div className="space-y-3">
                {integrationGuides.map(guide => (
                  <button 
                    key={guide.id}
                    onClick={() => { setSelectedGuide(guide); setAiSupportData(null); }}
                    className={`w-full p-6 text-left rounded-3xl border transition-all ${selectedGuide?.id === guide.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{guide.platform}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${guide.difficulty === 'Fácil' ? 'bg-emerald-400/20 text-emerald-100' : guide.difficulty === 'Médio' ? 'bg-orange-400/20 text-orange-100' : 'bg-red-400/20 text-red-100'}`}>
                        {guide.difficulty}
                      </span>
                    </div>
                    <h4 className="font-bold">{guide.title}</h4>
                    <p className="text-[10px] mt-2 opacity-60">Tempo estimado: {guide.time}</p>
                  </button>
                ))}
              </div>
           </div>

           <div className="lg:col-span-8 space-y-8">
              {!selectedGuide ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <span className="text-8xl">🔌</span>
                   <p className="font-bold text-xl text-center">Selecione uma plataforma para configurar <br/>sua operação profissional</p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm animate-in zoom-in-95 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Guia Passo-a-Passo</p>
                          <h2 className="text-3xl font-black text-slate-900">{selectedGuide.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-2xl">
                          🛡️ Verificado
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        {selectedGuide.steps.map((step, i) => (
                          <div key={i} className="flex gap-6 items-start group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-blue-600 transition-colors">
                              {i + 1}
                            </div>
                            <div className="pt-3 border-b border-slate-50 pb-4 flex-1">
                              <p className="text-slate-700 font-bold leading-relaxed">{step}</p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] flex items-center gap-6">
                        <div className="text-4xl">🔐</div>
                        <div>
                          <h4 className="font-black text-sm uppercase tracking-widest mb-1">Cofre de Segurança Ativo</h4>
                          <p className="text-blue-100 text-sm italic">{selectedGuide.security}</p>
                        </div>
                    </div>
                  </div>

                  {/* IA Integration Assistant */}
                  <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl space-y-6">
                    <div className="flex items-center gap-4 text-white">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl animate-pulse">🤖</div>
                      <div>
                        <h4 className="font-bold">Assistente Técnico IA</h4>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Dúvidas em tempo real sobre APIs</p>
                      </div>
                    </div>

                    <div className="relative">
                      <input 
                        type="text"
                        value={integrationQuery}
                        onChange={e => setIntegrationQuery(e.target.value)}
                        placeholder={`Ex: Como criar um App ID no ${selectedGuide.platform}?`}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 ring-blue-500 pr-32"
                      />
                      <button 
                        onClick={handleIntegrationSupport}
                        disabled={loading || !integrationQuery}
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-black text-xs uppercase hover:bg-blue-500 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Buscando...' : 'Perguntar'}
                      </button>
                    </div>

                    {aiSupportData && (
                      <div className="bg-white/10 p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 space-y-4">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Resposta Técnica IA ✨</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{aiSupportData.text}</p>
                        {aiSupportData.sources && aiSupportData.sources.length > 0 && (
                          <div className="pt-4 border-t border-white/10">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fontes Consultadas</p>
                             <div className="flex flex-col gap-2">
                               {aiSupportData.sources.map((source: any, i: number) => (
                                 <a key={i} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                                   🔗 {source.web?.title || 'Documentação Oficial'}
                                 </a>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {activeView === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Tendências para {niche}
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                    placeholder="Mudar nicho..."
                  />
                  <button onClick={handleFetchInsights} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">🔄</button>
                </div>
              </div>

              {loading && !liveInsights ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 font-medium italic">Gemini vasculhando o mercado por oportunidades...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                    {liveInsights}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <h4 className="font-bold text-slate-900 mb-4">Algoritmo em Foco</h4>
               <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl">
                     <p className="text-[10px] font-black text-yellow-700 uppercase mb-1">Mercado Livre</p>
                     <p className="text-xs text-yellow-900 font-medium">Priorizando vídeos curtos nas listagens. Recomenda-se usar a Video Factory.</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                     <p className="text-[10px] font-black text-orange-700 uppercase mb-1">Amazon</p>
                     <p className="text-xs text-orange-900 font-medium">Títulos curtos com foco em marca estão perfomando 15% melhor esta semana.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                 <h3 className="text-xl font-bold text-slate-900 mb-6">O que quer aprender hoje?</h3>
                 <div className="space-y-4">
                    <input 
                      type="text" 
                      value={lessonTopic}
                      onChange={(e) => setLessonTopic(e.target.value)}
                      placeholder="Ex: Como lidar com reembolsos injustos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-blue-500 transition-all"
                    />
                    <button 
                      onClick={handleGenerateLesson}
                      disabled={loading || !lessonTopic}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                    >
                      {loading ? 'IA Gerando Aula...' : 'Gerar Micro-Aula Personalizada'}
                    </button>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-7">
              {!dynamicLesson ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                   <span className="text-8xl">📖</span>
                   <p className="font-bold text-xl">Sua aula aparecerá aqui</p>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-500">
                   <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Aula Gerada por IA</span>
                   <h2 className="text-3xl font-black text-slate-900 mb-6">{dynamicLesson.title}</h2>
                   <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                      {dynamicLesson.content}
                   </div>
                   <div className="space-y-4">
                      <h4 className="font-bold text-slate-900">Plano de Ação 📝</h4>
                      {dynamicLesson.actionPoints.map((p: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700">
                           <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0">{i+1}</span>
                           {p}
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {activeView === 'coach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Escolha um Cenário</h3>
              <p className="text-xs text-slate-500">Pratique sua abordagem com a IA</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {scenarios.map(s => (
                <button 
                  key={s.id}
                  onClick={() => handleStartRoleplay(s)}
                  className={`w-full p-6 text-left border-b border-slate-50 hover:bg-slate-50 transition-all ${selectedScenario?.id === s.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col overflow-hidden relative">
            {!selectedScenario ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                <span className="text-8xl">🎯</span>
                <p className="font-bold">Selecione um cenário para treinar suas vendas</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl">{selectedScenario.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900">Cenário: {selectedScenario.title}</h4>
                      <p className="text-xs text-slate-500">Treinando técnicas de persuasão</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleFinishRoleplay}
                    className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700"
                  >
                    Finalizar & Avaliar
                  </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-6">
                  {chat.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'vendedor' ? 'items-end' : 'items-start'} gap-2`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${
                        msg.role === 'vendedor' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                        {msg.role === 'vendedor' ? 'Você (Vendedor)' : 'IA (Cliente)'}
                      </span>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-blue-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  )}
                </div>

                {feedback && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 p-10 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center animate-in zoom-in-95 duration-500">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl font-black text-blue-600">{feedback.score}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Sua Nota: {feedback.score}/100</h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{feedback.analysis}</p>
                      
                      <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100 text-left">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dica do Coach ✨</p>
                        <p className="text-blue-900 text-sm font-medium">{feedback.tip}</p>
                      </div>

                      <button 
                        onClick={() => { setFeedback(null); setChat([]); setSelectedScenario(null); }}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
                      >
                        Tentar outro Cenário
                      </button>
                    </div>
                  </div>
                )}

                {!feedback && (
                  <div className="p-6 border-t border-slate-100 flex items-center gap-3">
                    <input 
                      type="text" 
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Sua resposta de mestre..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-blue-500 transition-all"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={loading || !userInput}
                      className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20"
                    >
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;

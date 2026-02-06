
import React, { useState, useEffect } from 'react';
import { Marketplace, SocialPlatform, CrmMessage } from '../types';
import { draftCrmReply, getSocialListeningData, extractCrisisAlerts } from '../services/geminiService';

const initialMessages: CrmMessage[] = [
  { id: '1', customer: 'João Silva', platform: Marketplace.MERCADO_LIVRE, text: 'O frete para 01000-000 é grátis?', sentiment: 'neutral', type: 'private_message', timestamp: '10:05', isRead: false },
  { id: '2', customer: 'Maria Fashion', platform: SocialPlatform.YOUTUBE, text: 'Acabei de ver na live! Qual a garantia?', sentiment: 'positive', type: 'public_comment', timestamp: '10:12', isRead: false },
  { id: '3', customer: 'Pedro Tech', platform: Marketplace.SHOPEE, text: 'Meu pedido ainda não chegou, o que houve?', sentiment: 'negative', type: 'private_message', timestamp: '09:45', isRead: true },
  { id: '4', customer: 'GamerX', platform: SocialPlatform.TIKTOK, text: 'Esse produto é original ou paralelo?', sentiment: 'neutral', type: 'public_comment', timestamp: '10:20', isRead: false },
];

interface CrmProps {
  addNotification?: (text: string, type?: 'success' | 'info') => void;
}

const Crm: React.FC<CrmProps> = ({ addNotification }) => {
  const [messages, setMessages] = useState<CrmMessage[]>(initialMessages);
  const [selectedMsg, setSelectedMsg] = useState<CrmMessage | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'crisis'>('all');
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [isScanningCrisis, setIsScanningCrisis] = useState(false);

  // Efeito de Simulação de Novos Comentários (CloudBot)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newMsg: CrmMessage = {
          id: Math.random().toString(),
          customer: `User_${Math.floor(Math.random() * 1000)}`,
          platform: Math.random() > 0.5 ? SocialPlatform.YOUTUBE : Marketplace.MERCADO_LIVRE,
          text: 'Interessado no produto! Quanto tempo entrega?',
          sentiment: 'neutral',
          type: Math.random() > 0.5 ? 'public_comment' : 'private_message',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        };
        setMessages(prev => [newMsg, ...prev]);
        if (addNotification) addNotification(`Nova interação no ${newMsg.platform}! 💬`, 'info');
      }
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMessage = async (msg: CrmMessage) => {
    setSelectedMsg(msg);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    
    if (!msg.aiDraft) {
      setLoading(true);
      try {
        const draft = await draftCrmReply(msg.text);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, aiDraft: draft } : m));
        setReply(draft);
      } finally {
        setLoading(false);
      }
    } else {
      setReply(msg.aiDraft);
    }
  };

  const handleScanCrisis = async () => {
    setIsScanningCrisis(true);
    if (addNotification) addNotification("Escaneando a web por crises de reputação...", "info");
    
    try {
      // Usamos o termo "MarketHub AI" como marca padrão para o exemplo
      const listening = await getSocialListeningData("MarketHub AI");
      const alerts = await extractCrisisAlerts(listening.text);
      
      if (alerts.length > 0) {
        const crisisMessages: CrmMessage[] = alerts.map((a, i) => ({
          id: `crisis-${Date.now()}-${i}`,
          customer: a.customer || 'Usuário Externo',
          platform: 'Web (Social Listening)',
          text: a.text || 'Possível menção negativa detectada.',
          sentiment: 'negative',
          type: 'crisis_alert',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          isCrisis: true,
          sourceUrl: listening.sources[0]?.web?.uri
        }));
        
        setMessages(prev => [...crisisMessages, ...prev]);
        setFilter('crisis');
        if (addNotification) addNotification(`⚠️ Alerta: ${alerts.length} novas ameaças de crise detectadas!`, "info");
      } else {
        if (addNotification) addNotification("Nenhuma menção negativa crítica encontrada na web.", "success");
      }
    } catch (err) {
      console.error(err);
      if (addNotification) addNotification("Erro ao escanear menções externas.", "info");
    } finally {
      setIsScanningCrisis(false);
    }
  };

  const handleSend = () => {
    if (!selectedMsg) return;
    addNotification?.(`Resposta enviada para ${selectedMsg.customer} via ${selectedMsg.platform}!`, 'success');
    setMessages(prev => prev.filter(m => m.id !== selectedMsg.id));
    setSelectedMsg(null);
    setReply('');
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'public') return m.type === 'public_comment';
    if (filter === 'crisis') return m.isCrisis === true;
    return m.type === 'private_message';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)] animate-in fade-in duration-700">
      {/* Sidebar - Message List */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[3rem] shadow-sm flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900">Unified Inbox</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Autônomo</span>
               <button 
                onClick={() => setAutonomousMode(!autonomousMode)}
                className={`w-8 h-4 rounded-full relative p-0.5 transition-all ${autonomousMode ? 'bg-blue-600' : 'bg-slate-300'}`}
               >
                 <div className={`w-3 h-3 bg-white rounded-full transition-all ${autonomousMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
               </button>
            </div>
          </div>
          
          <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-4">
            <button onClick={() => setFilter('all')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Tudo</button>
            <button onClick={() => setFilter('crisis')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === 'crisis' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500'}`}>Crise</button>
            <button onClick={() => setFilter('public')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === 'public' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Público</button>
            <button onClick={() => setFilter('private')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Privado</button>
          </div>

          <button 
            onClick={handleScanCrisis}
            disabled={isScanningCrisis}
            className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${isScanningCrisis ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-red-600 shadow-lg'}`}
          >
            {isScanningCrisis ? <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : '🔍'}
            Escanear Gestão de Crise (Social Listening)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredMessages.map(msg => (
            <button 
              key={msg.id}
              onClick={() => handleSelectMessage(msg)}
              className={`w-full p-6 text-left border-b border-slate-50 transition-all hover:bg-slate-50 flex items-start gap-4 relative ${selectedMsg?.id === msg.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''} ${msg.isCrisis ? 'bg-red-50/30' : ''}`}
            >
              {!msg.isRead && <div className={`absolute top-6 right-6 w-2 h-2 rounded-full animate-pulse ${msg.isCrisis ? 'bg-red-600' : 'bg-blue-600'}`}></div>}
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shrink-0 shadow-sm ${
                msg.isCrisis ? 'bg-red-600' :
                msg.platform === SocialPlatform.YOUTUBE ? 'bg-red-600' : 
                msg.platform === SocialPlatform.TIKTOK ? 'bg-black' :
                msg.platform === Marketplace.MERCADO_LIVRE ? 'bg-blue-600' : 'bg-orange-500'
              }`}>
                {msg.isCrisis ? '🚨' : msg.platform === SocialPlatform.YOUTUBE ? 'YT' : msg.platform === SocialPlatform.TIKTOK ? 'TK' : 'ML'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-sm truncate ${msg.isCrisis ? 'text-red-700' : 'text-slate-900'}`}>{msg.customer}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{msg.timestamp}</span>
                </div>
                <p className={`text-xs line-clamp-2 leading-relaxed ${msg.isCrisis ? 'text-red-900 font-medium' : 'text-slate-500'}`}>{msg.text}</p>
                
                <div className="flex items-center gap-2 mt-3">
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                     msg.isCrisis ? 'bg-red-100 text-red-600' :
                     msg.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-600' :
                     msg.sentiment === 'negative' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                   }`}>
                     {msg.isCrisis ? 'Gestão de Crise' : msg.sentiment}
                   </span>
                   {msg.type === 'public_comment' && <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">🌐 Comentário</span>}
                </div>
              </div>
            </button>
          ))}
          {filteredMessages.length === 0 && (
            <div className="py-20 text-center opacity-30 italic text-sm">Nenhuma mensagem neste filtro. ☕</div>
          )}
        </div>
      </div>

      {/* Main Chat / Details */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[3rem] shadow-sm flex flex-col overflow-hidden relative">
        {!selectedMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 gap-6">
            <div className="text-9xl">📬</div>
            <div className="text-center">
              <p className="font-black text-2xl text-slate-300">Selecione uma interação</p>
              <p className="text-sm font-medium">IA Pronta para responder seus canais sociais</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-500">
            {/* Header */}
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${selectedMsg.isCrisis ? 'bg-red-50/50' : 'bg-slate-50/30'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black ${selectedMsg.isCrisis ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                  {selectedMsg.isCrisis ? '!' : selectedMsg.customer.charAt(0)}
                </div>
                <div>
                   <h4 className={`font-black text-lg leading-tight ${selectedMsg.isCrisis ? 'text-red-700' : 'text-slate-900'}`}>{selectedMsg.customer}</h4>
                   <p className="text-xs text-slate-500 flex items-center gap-2">
                     via {selectedMsg.platform} 
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                     {selectedMsg.isCrisis ? 'Alerta Crítico de Reputação' : selectedMsg.type === 'public_comment' ? 'Comentário Público' : 'Mensagem Direta'}
                   </p>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedMsg.sourceUrl && (
                  <a href={selectedMsg.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-xs font-bold">Ver Origem 🔗</a>
                )}
                <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-sm">🚫 Banir</button>
              </div>
            </div>

            {/* Conversation Content */}
            <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-slate-50/20">
               {selectedMsg.isCrisis && (
                 <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-4 animate-in zoom-in-95">
                    <span className="text-3xl">🚨</span>
                    <div>
                      <h5 className="font-black text-sm uppercase tracking-widest mb-1">Modo Gestão de Crise Ativado</h5>
                      <p className="text-xs text-red-100">Esta menção foi encontrada fora dos seus canais oficiais e pode afetar sua reputação. A IA preparou uma resposta diplomática.</p>
                    </div>
                 </div>
               )}

               <div className="flex flex-col items-start gap-3 max-w-[85%]">
                 <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm text-sm text-slate-700 leading-relaxed">
                   {selectedMsg.text}
                 </div>
                 <span className="text-[10px] text-slate-400 font-bold px-4">{selectedMsg.timestamp} • {selectedMsg.customer}</span>
               </div>

               {loading ? (
                 <div className="flex flex-col items-end gap-3 animate-pulse">
                    <div className="bg-blue-600/5 w-72 h-32 rounded-[2rem] rounded-tr-none border border-blue-600/10"></div>
                 </div>
               ) : (
                 reply && (
                   <div className="flex flex-col items-end gap-3 max-w-[85%] ml-auto group">
                    <div className={`${selectedMsg.isCrisis ? 'bg-slate-900' : 'bg-blue-600'} p-6 rounded-[2rem] rounded-tr-none text-white text-sm shadow-xl shadow-blue-600/10 leading-relaxed relative`}>
                      {reply}
                      <div className="absolute -top-3 -left-3 bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded-lg border border-blue-100 shadow-sm">
                        {selectedMsg.isCrisis ? 'DIPLOMATIC CRISIS DRAFT 🛡️' : 'GEMINI AI DRAFT ✨'}
                      </div>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setReply('')} className="text-[10px] font-black text-red-500 uppercase">Descartar</button>
                      <button className="text-[10px] font-black text-blue-500 uppercase">Regerar</button>
                    </div>
                   </div>
                 )
               )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-slate-100">
               <div className={`rounded-[2.5rem] p-3 flex items-end gap-3 border-2 transition-all ${selectedMsg.isCrisis ? 'bg-red-50 border-red-200 ring-red-500' : 'bg-slate-100 border-transparent focus-within:ring-2 ring-blue-500'}`}>
                 <textarea 
                   className="flex-1 bg-transparent border-none outline-none p-4 text-sm text-slate-700 resize-none max-h-40"
                   placeholder={selectedMsg.isCrisis ? "Dê um posicionamento oficial da marca..." : "Escreva sua resposta ou deixe a IA sugerir..."}
                   rows={2}
                   value={reply}
                   onChange={(e) => setReply(e.target.value)}
                 />
                 <button 
                  onClick={handleSend}
                  disabled={!reply}
                  className={`${selectedMsg.isCrisis ? 'bg-red-600' : 'bg-slate-900'} text-white font-black px-10 py-5 rounded-[2rem] hover:opacity-90 shadow-2xl transition-all disabled:opacity-50`}
                 >
                   {selectedMsg.isCrisis ? 'Enviar Resposta de Crise' : 'Publicar Resposta'}
                 </button>
               </div>
               <p className="text-center mt-4 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                 {selectedMsg.isCrisis 
                  ? "CUIDADO: Respostas de crise devem ser precisas e empáticas." 
                  : `Sua resposta será publicada como um ${selectedMsg.type === 'public_comment' ? 'comentário público' : 'mensagem privada'} oficial.`
                 }
               </p>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Crm;

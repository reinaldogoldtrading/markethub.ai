
import React, { useState } from 'react';
import CommandCenter from './CommandCenter';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
    { id: 'catalog', label: 'Catálogo Hub', icon: '📦' },
    { id: 'optimizer', label: 'Otimizador IA', icon: '✨' },
    { id: 'live-commerce', label: 'Live Commerce', icon: '🎥' },
    { id: 'crm', label: 'Atendimento IA', icon: '💬' },
    { id: 'marketing', label: 'Marketing Social', icon: '📣' },
    { id: 'academy', label: 'Academy & Vendas', icon: '🎓' },
    { id: 'financial', label: 'Financeiro Pro', icon: '💰' },
    { id: 'trends', label: 'Tendências', icon: '📈' },
    { id: 'integrations', label: 'Integrações & Segurança', icon: '🔌' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">M</div>
          <span className="text-xl font-bold tracking-tight">MarketHub <span className="text-blue-400">AI</span></span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-slate-800/50 m-4 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">🛡️</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Monitor de Segurança</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-emerald-400 font-bold">VPN ATIVA</span>
            <span className="text-[10px] text-slate-500 italic">Logs OK</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full w-full"></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
             <button 
              onClick={() => setIsCommandOpen(true)}
              className="w-full bg-slate-100 text-slate-500 text-left px-6 py-3 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between group"
             >
               <span className="text-sm font-medium">Comando de Voz ou Texto IA... (⌘ + K)</span>
               <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 text-[10px] font-bold group-hover:text-blue-600">CMD K</kbd>
             </button>
          </div>
          <div className="flex items-center gap-4 ml-8 relative">
            <div 
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">Admin Master</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Conta Protegida</p>
              </div>
              <img src="https://picsum.photos/seed/user/40/40" className="w-10 h-10 rounded-full border-2 border-emerald-500 shadow-sm" alt="User" />
            </div>

            {isProfileOpen && (
              <div className="absolute top-14 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-top-2 z-50">
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold flex items-center gap-2">👤 Perfil & Conta</button>
                  <button 
                    onClick={() => { setActiveTab('integrations'); setIsProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    🛡️ Gerenciar Conexões
                  </button>
                  <div className="border-t border-slate-100 my-2"></div>
                  <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">🚪 Sair do MarketHub</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>

        {isCommandOpen && <CommandCenter onClose={() => setIsCommandOpen(false)} />}
      </main>
    </div>
  );
};

export default Layout;


import React, { useState, useEffect } from 'react';
import { processBulkCommand } from '../services/geminiService';

interface CommandCenterProps {
  onClose: () => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ onClose }) => {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleExecute = async () => {
    if (!command) return;
    setLoading(true);
    try {
      const res = await processBulkCommand(command, { active_ads: 124, stock_level: 'stable' });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-start justify-center pt-24 p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-10 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">⚡</div>
             <div>
                <h3 className="text-xl font-bold text-slate-900">Centro de Comando IA</h3>
                <p className="text-xs text-slate-500">Controle o seu hub com linguagem natural</p>
             </div>
          </div>

          <div className="relative">
            <input 
              autoFocus
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-lg font-medium outline-none focus:border-blue-500 transition-all pr-24"
              placeholder="Ex: Pausar anúncios com ROI menor que 2..."
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleExecute()}
            />
            <button 
              onClick={handleExecute}
              disabled={loading || !command}
              className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? '...' : 'Executar'}
            </button>
          </div>

          {result && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl animate-in fade-in zoom-in-95">
               <div className="flex items-center gap-3 mb-2">
                  <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Ação: {result.action}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               </div>
               <p className="text-emerald-900 font-medium">{result.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Exemplos Rápidos</p>
                <div className="space-y-2">
                  <button onClick={() => setCommand("Aumentar estoque do SKU-442 em 50 unidades")} className="text-xs text-blue-600 font-medium block hover:underline">Sincronizar Estoque</button>
                  <button onClick={() => setCommand("Gerar relatório de ROI do último mês")} className="text-xs text-blue-600 font-medium block hover:underline">Gerar Relatórios</button>
                </div>
             </div>
             <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Comandos Ativos</p>
                <div className="space-y-2 text-xs text-slate-500">
                  <p>• Repricer: <span className="text-emerald-500 font-bold">Ativo</span></p>
                  <p>• CloudBot: <span className="text-emerald-500 font-bold">Autônomo</span></p>
                </div>
             </div>
          </div>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600 tracking-widest uppercase">Pressione ESC para fechar</button>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;

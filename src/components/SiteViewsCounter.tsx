import React, { useEffect, useState } from 'react';
import { Eye, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import { subscribeToSiteStats, registerDeviceVisitOnce, getSiteStats } from '../services/firebase';
import { SiteStats } from '../types';

interface SiteViewsCounterProps {
  className?: string;
  variant?: 'card' | 'compact' | 'minimal';
}

export const SiteViewsCounter: React.FC<SiteViewsCounterProps> = ({ 
  className = '',
  variant = 'card'
}) => {
  const [stats, setStats] = useState<SiteStats>({ totalViews: 1 });
  const [isLivePulsing, setIsLivePulsing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 1. Register visit ONLY if this device has never been counted before (persisted in localStorage)
    registerDeviceVisitOnce().then((realCount) => {
      setStats(prev => ({ ...prev, totalViews: realCount }));
    }).catch(() => {});

    // 2. Real-time subscription to Firestore for new devices entering
    const unsubscribe = subscribeToSiteStats((updatedStats) => {
      setStats((prev) => {
        if (prev.totalViews !== updatedStats.totalViews) {
          setIsLivePulsing(true);
          setTimeout(() => setIsLivePulsing(false), 2000);
        }
        return updatedStats;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync button only fetches latest data from Firestore; it NEVER increments the counter!
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const latest = await getSiteStats();
      setStats(latest);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Format number with Brazilian Portuguese thousands separator (e.g. 1, 2, 10, 1.200)
  const formattedCount = stats.totalViews.toLocaleString('pt-BR');

  // Split into digits for the tactile editorial counter display
  const digits = formattedCount.split('');

  if (variant === 'compact') {
    return (
      <div 
        id="site-views-counter-compact"
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono ${className}`}
        title="Contador oficial auditado (1 visualização por dispositivo)"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Eye className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Dispositivos:</span>
        <span className="font-bold text-white tracking-wider">{formattedCount}</span>
      </div>
    );
  }

  return (
    <div 
      id="site-views-counter"
      className={`relative overflow-hidden bg-gradient-to-b from-zinc-950 to-black border border-zinc-850 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-zinc-700 ${className}`}
    >
      {/* Subtle background ambient corner highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        
        {/* Left: Indicator & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isLivePulsing ? 'animate-ping' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-emerald-400 font-semibold flex items-center gap-1.5">
              <span>MÉTRICA REAL</span>
              <span className="text-zinc-600">•</span>
              <span>1 POR DISPOSITIVO</span>
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-zinc-400" />
            Total de Visualizações do Site
          </h3>

          <p className="text-xs text-zinc-400 font-light max-w-md leading-relaxed">
            Contagem real de dispositivos únicos que acessaram o portal <span className="text-zinc-200 font-normal">Olhares da Cena</span>. Recarregar a página não gera novas visualizações.
          </p>
        </div>

        {/* Right: The Counter Digits Display */}
        <div className="flex items-center gap-3 sm:self-center">
          <div 
            className="flex items-center gap-1 bg-black border border-zinc-800 p-2 sm:p-2.5 shadow-inner"
            title="Total auditado de dispositivos únicos"
          >
            {digits.map((char, index) => {
              if (char === '.') {
                return (
                  <span 
                    key={`dot-${index}`} 
                    className="font-mono text-xl sm:text-2xl font-bold text-zinc-500 px-0.5"
                  >
                    .
                  </span>
                );
              }
              return (
                <div
                  key={`digit-${index}`}
                  className="w-7 h-9 sm:w-8 sm:h-11 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg sm:text-2xl font-serif font-bold text-white shadow-sm"
                >
                  <span className={`transition-transform duration-300 ${isLivePulsing ? 'scale-110 text-amber-300' : ''}`}>
                    {char}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sync Button (Read-only check) */}
          <button
            type="button"
            id="refresh-site-views-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer"
            title="Sincronizar com o banco de dados (não adiciona visualizações)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Micro footer line inside counter */}
      <div className="relative z-10 mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-400 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Filtro anti-duplicação ativo</span>
        </span>
        <span className="text-zinc-500">
          Atualizar a página ou clicar no botão não aumenta a contagem
        </span>
      </div>
    </div>
  );
};

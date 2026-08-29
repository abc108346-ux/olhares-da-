import React from 'react';
import { FichaTecnica as FichaTecnicaType } from '../types';
import { Users, Clapperboard, FileText, Sparkles, Lightbulb, Music, Clock, AlertCircle } from 'lucide-react';

interface FichaTecnicaProps {
  ficha?: FichaTecnicaType;
  nomeEspetaculo?: string;
  companhia?: string;
  cidade?: string;
  estado?: string;
}

export const FichaTecnica: React.FC<FichaTecnicaProps> = ({
  ficha,
  nomeEspetaculo,
  companhia,
  cidade,
  estado,
}) => {
  if (!ficha && !nomeEspetaculo && !companhia) {
    return null;
  }

  const items = [
    { label: 'ESPETÁCULO', value: nomeEspetaculo, icon: Clapperboard },
    { label: 'COMPANHIA / GRUPO', value: companhia, icon: Users },
    { label: 'ORIGEM', value: [cidade, estado].filter(Boolean).join(' - '), icon: null },
    { label: 'DIREÇÃO', value: ficha?.direcao, icon: null },
    { label: 'TEXTO / DRAMATURGIA', value: ficha?.texto || ficha?.dramaturgia, icon: FileText },
    { label: 'ELENCO', value: ficha?.elenco, icon: null },
    { label: 'CENOGRAFIA', value: ficha?.cenografia, icon: Sparkles },
    { label: 'ILUMINAÇÃO', value: ficha?.iluminacao, icon: Lightbulb },
    { label: 'FIGURINO', value: ficha?.figurino, icon: null },
    { label: 'TRILHA SONORA', value: ficha?.trilhaSonora, icon: Music },
    { label: 'PRODUÇÃO', value: ficha?.producao, icon: null },
    { label: 'TEMPORADA / LOCAL', value: ficha?.temporada || ficha?.local, icon: null },
    { label: 'DURAÇÃO', value: ficha?.duracao, icon: Clock },
    { label: 'CLASSIFICAÇÃO', value: ficha?.classificacao, icon: AlertCircle },
  ].filter(item => Boolean(item.value));

  if (items.length === 0) return null;

  return (
    <section id="ficha-tecnica-section" className="my-12 p-6 sm:p-8 bg-zinc-950 border border-zinc-850">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <h3 className="font-display tracking-[0.2em] text-white font-bold text-sm sm:text-base uppercase">
          FICHA TÉCNICA
        </h3>
        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
          DOCUMENTAÇÃO CÊNICA
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-1.5 border-b border-zinc-900/80"
          >
            <span className="font-mono uppercase tracking-wider text-zinc-400 text-[11px] min-w-[130px] flex-shrink-0 font-medium">
              {item.label}:
            </span>
            <span className="font-sans text-zinc-200 leading-relaxed break-words font-light">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

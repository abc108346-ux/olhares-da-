import React from 'react';
import { ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';
import { Critica } from '../types';

interface CriticaCardProps {
  critica: Critica;
  onSelect: (slug: string) => void;
  featured?: boolean;
}

export const formatDateBr = (dateStr: string): string => {
  try {
    if (!dateStr) return '';
    // Handle YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day.toString().padStart(2, '0')} ${months[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    }
  } catch {
    // fallback
  }
  return dateStr;
};

export const CriticaCard: React.FC<CriticaCardProps> = ({ critica, onSelect, featured = false }) => {
  const formattedDate = formatDateBr(critica.dataPublicacao);

  if (featured) {
    return (
      <article 
        id={`critica-card-featured-${critica.slug}`}
        onClick={() => onSelect(critica.slug)}
        className="group relative bg-zinc-950 border border-zinc-850 hover:border-zinc-500 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 overflow-hidden cursor-pointer"
      >
        {/* Large Media */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[340px] overflow-hidden bg-black">
          <img
            src={critica.imagemPrincipal}
            alt={critica.titulo}
            loading="lazy"
            className="w-full h-full object-cover object-center grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent lg:hidden" />
          <div className="absolute top-4 left-4">
            <span className="bg-black/90 text-white text-[10px] uppercase font-bold tracking-[0.25em] px-3 py-1.5 border border-zinc-700">
              DESTAQUE EDITORIAL
            </span>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="uppercase tracking-[0.2em] font-semibold text-white bg-zinc-900 px-2.5 py-1 border border-zinc-800">
                {critica.categoria}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-zinc-500" />
                {formattedDate}
              </span>
              {(critica.cidade || critica.estado) && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  {[critica.cidade, critica.estado].filter(Boolean).join(' - ')}
                </span>
              )}
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight leading-tight group-hover:text-zinc-200 transition-colors">
              {critica.titulo}
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base line-clamp-4 font-serif leading-relaxed font-light">
              {critica.resumo}
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400">
              Crítica por <strong className="text-white font-normal">{critica.autor}</strong>
            </span>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-white group-hover:translate-x-1 transition-transform">
              LER CRÍTICA <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={`critica-card-${critica.slug}`}
      onClick={() => onSelect(critica.slug)}
      className="group bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-black border-b border-zinc-900">
        <img
          src={critica.imagemPrincipal}
          alt={critica.titulo}
          loading="lazy"
          className="w-full h-full object-cover object-center grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-black/90 text-white text-[10px] uppercase font-semibold tracking-[0.2em] px-2.5 py-1 border border-zinc-800">
            {critica.categoria}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Metadata line */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Calendar className="w-3 h-3 text-zinc-500" />
              {formattedDate}
            </span>
            {critica.estado && (
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">
                {critica.cidade ? `${critica.cidade} (${critica.estado})` : critica.estado}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-zinc-200 transition-colors uppercase">
            {critica.titulo}
          </h3>

          {/* Excerpt */}
          <p className="text-zinc-400 text-xs sm:text-sm line-clamp-3 font-serif font-light leading-relaxed">
            {critica.resumo}
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-4 border-t border-zinc-900/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
            {critica.autor}
          </span>
          <span className="inline-flex items-center gap-1.5 uppercase tracking-[0.18em] font-semibold text-white group-hover:translate-x-1 transition-transform">
            LER CRÍTICA <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};

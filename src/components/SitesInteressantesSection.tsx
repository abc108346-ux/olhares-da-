import React from 'react';
import { SiteInteressante } from '../types';
import { Globe, ArrowUpRight, ExternalLink, Bookmark } from 'lucide-react';

interface SitesInteressantesSectionProps {
  sites: SiteInteressante[];
  className?: string;
  variant?: 'sidebar' | 'bottom';
}

export const SitesInteressantesSection: React.FC<SitesInteressantesSectionProps> = ({ 
  sites, 
  className = '',
  variant = 'sidebar'
}) => {
  const activeSites = sites.filter(s => s.ativo);

  return (
    <div 
      id="sites-interessantes-section"
      className={`border border-zinc-850 bg-zinc-950/70 backdrop-blur-sm p-5 sm:p-6 transition-all ${className}`}
    >
      {/* Subtitle Header */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-400" />
          <h3 className="font-serif text-sm sm:text-base font-bold tracking-[0.2em] text-white uppercase">
            Sites Interessantes
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Referências
        </span>
      </div>

      {/* Sites List or Empty State */}
      {activeSites.length > 0 ? (
        <ul className="space-y-3">
          {activeSites.map((site) => (
            <li key={site.id}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors leading-snug">
                    {site.titulo}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5" />
                </div>
                {site.descricao && (
                  <p className="text-[11px] text-zinc-400 font-light mt-1 line-clamp-2 leading-relaxed">
                    {site.descricao}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-zinc-500 truncate">
                  <span className="truncate">
                    {site.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 px-3 text-center border border-dashed border-zinc-800/80 bg-zinc-950">
          <Bookmark className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 font-mono">
            Nenhum site adicionado ainda.
          </p>
          <p className="text-[11px] text-zinc-500 font-light mt-1">
            Links e referências recomendadas podem ser cadastrados no painel administrativo.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useMemo } from 'react';
import { PremioOlhares } from '../types';
import { Award, ArrowUpRight, Trophy, Sparkles, ExternalLink } from 'lucide-react';

interface PremioOlharesPageProps {
  premios: PremioOlhares[];
  onNavigate: (path: string) => void;
  isAdmin?: boolean;
}

export const PremioOlharesPage: React.FC<PremioOlharesPageProps> = ({ 
  premios, 
  onNavigate,
  isAdmin = false
}) => {
  // Sort by order
  const sortedPremios = useMemo(() => {
    if (premios && premios.length > 0) {
      return [...premios].sort((a, b) => a.ordem - b.ordem);
    }
    // Ensure default 15 slots if completely empty
    const slots: PremioOlhares[] = Array.from({ length: 15 }, (_, idx) => {
      const num = idx + 1;
      const numStr = num < 10 ? `0${num}` : `${num}`;
      return {
        id: `premio-${num}`,
        ordem: num,
        titulo: `Prêmio ${numStr}`,
        subtitulo: '',
        link: '',
        imagem: '',
        descricao: '',
        ativo: true,
      };
    });
    return slots;
  }, [premios]);

  const handleLinkClick = (e: React.MouseEvent, link: string) => {
    if (!link) return;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      // External link: let default anchor behavior happen
      return;
    }
    // Internal link
    e.preventDefault();
    onNavigate(link.startsWith('/') ? link : `/${link}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="premio-olhares-page" className="min-h-screen bg-black text-white selection:bg-amber-400 selection:text-black">
      
      {/* Editorial Hero Header */}
      <section className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-black pt-14 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono uppercase tracking-[0.25em]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Edição Especial • {sortedPremios.length} Prêmios</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase max-w-4xl mx-auto leading-[1.1]">
            Prêmio <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">Olhares da Cena</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Celebrando a inventividade, o vigor estético e o impacto social das artes cênicas. 
            Acompanhe aqui a seleção de cada um dos nossos prêmios e destaques teatrais.
          </p>

          {isAdmin && (
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/admin')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gerenciar Prêmios no Painel Admin</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Grid of Awards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Galeria de Prêmios
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            {sortedPremios.length} {sortedPremios.length === 1 ? 'Prêmio' : 'Prêmios'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sortedPremios.map((premio) => {
            const hasImage = Boolean(premio.imagem);
            const validLinks: { url: string; titulo?: string }[] = (() => {
              if (Array.isArray(premio.links) && premio.links.length > 0) {
                const list = premio.links
                  .filter(l => Boolean(l && l.url && l.url.trim()))
                  .map(l => ({ url: l.url.trim(), titulo: (l.titulo || '').trim() }));
                if (list.length > 0) return list;
              }
              if (premio.link && premio.link.trim()) {
                return [{ url: premio.link.trim(), titulo: '' }];
              }
              return [];
            })();

            const hasLink = validLinks.length > 0;
            const formattedNum = premio.ordem < 10 ? `0${premio.ordem}` : `${premio.ordem}`;

            return (
              <article
                key={premio.id}
                id={`premio-card-${premio.ordem}`}
                className={`group flex flex-col bg-zinc-950 border transition-all duration-300 ${
                  hasLink 
                    ? 'border-zinc-850 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5' 
                    : 'border-zinc-900'
                }`}
              >
                {/* Image / Banner Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-zinc-850">
                  {hasImage ? (
                    <img
                      src={premio.imagem}
                      alt={premio.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-zinc-600">
                      <Trophy className="w-10 h-10 stroke-[1.2] mb-2 text-zinc-700 group-hover:text-amber-400/60 transition-colors" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                        Prêmio {formattedNum}
                      </span>
                    </div>
                  )}

                  {/* Badge Number */}
                  <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 border border-zinc-700/60 flex items-center gap-1.5 shadow-md">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      #{formattedNum}
                    </span>
                  </div>

                  {/* Status if inactive */}
                  {!premio.ativo && (
                    <div className="absolute top-3 right-3 bg-zinc-900/90 text-zinc-400 text-[10px] font-mono uppercase px-2 py-0.5 border border-zinc-700">
                      Oculto
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {premio.subtitulo && (
                      <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest line-clamp-1 block">
                        {premio.subtitulo}
                      </span>
                    )}

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors leading-snug">
                      {premio.titulo}
                    </h3>

                    {premio.descricao && (
                      <p className="text-xs text-zinc-400 font-light leading-relaxed line-clamp-3">
                        {premio.descricao}
                      </p>
                    )}
                  </div>

                  {/* Link / CTA Button(s) */}
                  <div className="pt-3 border-t border-zinc-900 mt-auto">
                    {hasLink ? (
                      validLinks.length === 1 ? (
                        <a
                          href={validLinks[0].url}
                          onClick={(e) => handleLinkClick(e, validLinks[0].url)}
                          target={validLinks[0].url.startsWith('http') ? '_blank' : undefined}
                          rel={validLinks[0].url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center justify-between w-full p-2.5 bg-zinc-900 group-hover:bg-amber-400 group-hover:text-black text-zinc-200 text-xs font-mono uppercase tracking-wider font-semibold border border-zinc-800 group-hover:border-amber-300 transition-all duration-200 cursor-pointer"
                        >
                          <span className="truncate pr-2">{validLinks[0].titulo || 'Acessar Prêmio'}</span>
                          {validLinks[0].url.startsWith('http') ? (
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          )}
                        </a>
                      ) : (
                        <div className="space-y-1.5 w-full">
                          {validLinks.map((item, lIdx) => (
                            <a
                              key={lIdx}
                              href={item.url}
                              onClick={(e) => handleLinkClick(e, item.url)}
                              target={item.url.startsWith('http') ? '_blank' : undefined}
                              rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="inline-flex items-center justify-between w-full px-3 py-2 bg-zinc-900 hover:bg-amber-400 hover:text-black text-zinc-200 text-xs font-mono uppercase tracking-wider font-semibold border border-zinc-850 hover:border-amber-300 transition-all duration-150 cursor-pointer group/link"
                            >
                              <span className="truncate pr-2">
                                {item.titulo || `Link #${lIdx + 1}`}
                              </span>
                              {item.url.startsWith('http') ? (
                                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover/link:text-black" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover/link:text-black group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                              )}
                            </a>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-between py-2 text-zinc-600 text-xs font-mono uppercase">
                        <span>Link em preparação</span>
                        <span className="text-[10px] text-zinc-700">#Espaço {formattedNum}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Editorial Footer Quote */}
      <section className="border-t border-zinc-900 bg-zinc-950/60 py-12 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-serif italic text-zinc-300 text-sm sm:text-base leading-relaxed">
            &ldquo;O teatro é o espaço sagrado onde nos olhamos e reconhecemos nossa humanidade compartilhada.&rdquo;
          </p>
          <span className="block text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Olhares da Cena • Crítica & Reconhecimento
          </span>
        </div>
      </section>

    </div>
  );
};

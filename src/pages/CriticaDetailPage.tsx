import React, { useEffect } from 'react';
import { Critica } from '../types';
import { formatDateBr } from '../components/CriticaCard';
import { FichaTecnica } from '../components/FichaTecnica';
import { RichContentRenderer } from '../components/RichContentRenderer';
import { ShareButtons } from '../components/ShareButtons';
import { CriticaCard } from '../components/CriticaCard';
import { ArrowLeft, Calendar, User, MapPin, Tag, Share2, Compass, Layers } from 'lucide-react';

interface CriticaDetailPageProps {
  critica: Critica;
  allCriticas: Critica[];
  onNavigate: (path: string) => void;
  onSelectCritica: (slug: string) => void;
}

export const CriticaDetailPage: React.FC<CriticaDetailPageProps> = ({
  critica,
  allCriticas,
  onNavigate,
  onSelectCritica,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update document title dynamically
    document.title = `Olhar(es) da Cena | ${critica.titulo}`;
    return () => {
      document.title = 'Olhar(es) da Cena | Crítica e Reflexão sobre as Artes da Cena';
    };
  }, [critica]);

  const formattedDate = formatDateBr(critica.dataPublicacao);

  // 3 Related Critiques (matching category, tags or recent)
  const relatedCriticas = allCriticas
    .filter(c => c.id !== critica.id && c.publicada)
    .sort((a, b) => {
      if (a.categoria === critica.categoria && b.categoria !== critica.categoria) return -1;
      if (b.categoria === critica.categoria && a.categoria !== critica.categoria) return 1;
      return new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime();
    })
    .slice(0, 3);

  return (
    <article id={`critica-detail-${critica.slug}`} className="min-h-screen bg-black text-white pb-24">
      
      {/* Back button bar */}
      <div className="border-b border-zinc-900 bg-zinc-950/80 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            id="back-to-criticas-btn"
            onClick={() => onNavigate('/criticas')}
            className="text-xs uppercase tracking-[0.2em] font-mono text-zinc-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Arquivo</span>
          </button>

          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
            Olhares da Cena • Crítica Cultural
          </span>
        </div>
      </div>

      {/* Main Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 space-y-6 text-center">
        
        {/* Category Pill & Destaque Centered */}
        <div className="flex items-center justify-center gap-3">
          <span className="inline-block px-3.5 py-1 bg-white text-black text-xs uppercase font-bold tracking-[0.25em]">
            {critica.categoria}
          </span>
          {critica.destaque && (
            <span className="inline-block px-2.5 py-1 border border-zinc-700 text-zinc-300 text-[10px] uppercase font-mono tracking-widest">
              Destaque
            </span>
          )}
        </div>

        {/* Centered Big Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase leading-[1.15] text-center max-w-3xl mx-auto break-words">
          {critica.titulo}
        </h1>

        {/* Centered Metadata bar */}
        <div className="flex flex-wrap items-center justify-center gap-y-2.5 gap-x-6 text-xs text-zinc-400 font-mono border-y border-zinc-900 py-3.5 max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Publicado em {formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span>Por <strong className="text-zinc-200 font-normal">{critica.autor}</strong></span>
          </div>

          {(critica.cidade || critica.estado) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{[critica.cidade, critica.estado].filter(Boolean).join(' - ')}</span>
            </div>
          )}
        </div>

        {/* Centered Lead Summary Excerpt */}
        {critica.resumo && (
          <div className="max-w-2xl mx-auto pt-2 pb-1">
            <p className="font-serif italic text-lg sm:text-xl md:text-2xl text-zinc-200 leading-relaxed font-light text-center py-4 px-4 sm:px-8 border-y border-zinc-800/80 bg-zinc-950/40">
              "{critica.resumo}"
            </p>
          </div>
        )}

      </header>

      {/* Main Feature Image */}
      {critica.imagemPrincipal && (
        <figure className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 space-y-2.5">
          <div className="overflow-hidden border border-zinc-850 bg-zinc-950 shadow-2xl">
            <img
              src={critica.imagemPrincipal}
              alt={critica.titulo}
              className="w-full h-auto max-h-[600px] object-cover object-center grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
            />
          </div>
          {critica.legendaImagemPrincipal && (
            <figcaption className="text-center font-mono text-xs text-zinc-500 italic pt-1">
              {critica.legendaImagemPrincipal}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Body Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 w-full overflow-x-hidden">
        
        {/* Full Rich Markdown / HTML content */}
        <RichContentRenderer content={critica.conteudo} />

        {/* Ficha Técnica */}
        <FichaTecnica
          ficha={critica.fichaTecnica}
          nomeEspetaculo={critica.nomeEspetaculo}
          companhia={critica.companhia}
          cidade={critica.cidade}
          estado={critica.estado}
        />

        {/* Additional Images Gallery if any */}
        {critica.imagens && critica.imagens.length > 0 && (
          <div className="my-12 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-[0.25em] text-zinc-400 border-b border-zinc-900 pb-2 text-center sm:text-left">
              GALERIA DE CENA
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {critica.imagens.map((imgUrl, i) => (
                <div key={i} className="border border-zinc-850 overflow-hidden bg-black">
                  <img
                    src={imgUrl}
                    alt={`Cena adicional ${i + 1}`}
                    loading="lazy"
                    className="w-full h-56 object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {critica.tags && critica.tags.length > 0 && (
          <div className="my-8 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs uppercase font-mono text-zinc-500 mr-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              TAGS:
            </span>
            {critica.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onNavigate(`/pesquisa?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 bg-zinc-950 hover:bg-white text-zinc-400 hover:text-black border border-zinc-800 hover:border-white text-xs font-mono lowercase transition-colors cursor-pointer"
              >
                #{tag.replace(/^#/, '')}
              </button>
            ))}
          </div>
        )}

        {/* Share Bar */}
        <div className="my-8 p-4 bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-serif italic text-zinc-300 text-center sm:text-left">
            Apreciou esta reflexão sobre a cena? Compartilhe com a comunidade teatral.
          </div>
          <ShareButtons titulo={critica.titulo} />
        </div>

      </section>

      {/* Related 3 Critiques Section ("OUTRAS CRÍTICAS") */}
      {relatedCriticas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-zinc-900 space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="font-display tracking-[0.25em] text-white font-bold text-sm sm:text-base uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              OUTRAS CRÍTICAS
            </h3>
            <button
              onClick={() => onNavigate('/criticas')}
              className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Ver Todas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCriticas.map((related) => (
              <CriticaCard
                key={related.id}
                critica={related}
                onSelect={onSelectCritica}
              />
            ))}
          </div>
        </section>
      )}

    </article>
  );
};

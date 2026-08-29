import React, { useEffect } from 'react';
import { Pagina } from '../types';
import { RichContentRenderer } from '../components/RichContentRenderer';

interface PaginaDetailPageProps {
  pagina: Pagina;
}

export const PaginaDetailPage: React.FC<PaginaDetailPageProps> = ({ pagina }) => {
  useEffect(() => {
    document.title = `${pagina.titulo} | Olhares da Cena`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pagina.titulo]);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header Spacer */}
      <div className="h-24 sm:h-32" />

      <main className="max-w-3xl mx-auto px-6 sm:px-8">
        <header className="mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-6 leading-tight">
            {pagina.titulo}
          </h1>
          {pagina.resumo && (
            <p className="font-serif text-xl sm:text-2xl text-zinc-400 leading-relaxed italic">
              {pagina.resumo}
            </p>
          )}
        </header>

        {pagina.imagemPrincipal && (
          <figure className="mb-16">
            <div className="relative aspect-video w-full bg-zinc-900 border border-zinc-800">
              <img
                src={pagina.imagemPrincipal}
                alt={pagina.titulo}
                className="w-full h-full object-cover grayscale opacity-90"
              />
            </div>
          </figure>
        )}

        <div className="font-serif text-lg sm:text-xl leading-relaxed text-zinc-300 space-y-6">
          <RichContentRenderer content={pagina.conteudo} />
        </div>
      </main>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Pagina } from '../types';
import Markdown from 'react-markdown';

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
          <Markdown
            components={{
              p: ({ node, ...props }) => <p className="mb-6 leading-relaxed" {...props} />,
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold uppercase text-white mt-12 mb-6" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold uppercase text-white mt-10 mb-5" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold uppercase text-white mt-8 mb-4" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
              a: ({ node, ...props }) => <a className="text-white underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-white pl-6 italic text-zinc-400 my-8" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
            }}
          >
            {pagina.conteudo}
          </Markdown>
        </div>
      </main>
    </div>
  );
};

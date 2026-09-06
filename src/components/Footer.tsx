import React from 'react';
import { Instagram, ArrowUpRight, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';
import { SiteViewsCounter } from './SiteViewsCounter';
import { Pagina } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  paginas?: Pagina[];
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, paginas = [] }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerPages = paginas
    .filter(p => p.publicada && p.mostrarNoFooter)
    .sort((a, b) => (a.ordemFooter || 0) - (b.ordemFooter || 0));

  return (
    <footer id="main-footer" className="bg-black text-white border-t border-zinc-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-zinc-900">
          
          {/* Brand and Mission */}
          <div className="md:col-span-6 space-y-5">
            <button 
              id="footer-logo-link"
              onClick={() => { onNavigate('/'); scrollToTop(); }}
              className="text-left cursor-pointer"
            >
              <Logo size="md" />
            </button>
            <p className="font-serif italic text-zinc-400 text-lg sm:text-xl max-w-md leading-relaxed">
              “Crítica e reflexão sobre as artes da cena.”
            </p>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed font-light">
              Portal independente e arquivo contemporâneo dedicado ao pensamento crítico sobre teatro, 
              dança, performance e dramaturgia.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-white font-semibold border-b border-zinc-900 pb-2">
              NAVEGAÇÃO
            </h4>
            <ul className="space-y-2.5 text-xs uppercase tracking-[0.18em]">
              <li>
                <button 
                  id="footer-link-inicio"
                  onClick={() => { onNavigate('/'); scrollToTop(); }} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Início
                </button>
              </li>
              <li>
                <button 
                  id="footer-link-criticas"
                  onClick={() => { onNavigate('/criticas'); scrollToTop(); }} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Críticas & Arquivo
                </button>
              </li>
              <li>
                <button 
                  id="footer-link-pesquisa"
                  onClick={() => { onNavigate('/pesquisa'); scrollToTop(); }} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Pesquisar no Acervo
                </button>
              </li>
              {footerPages.map((p) => (
                <li key={p.id}>
                  <button 
                    onClick={() => { onNavigate(`/${p.slug}`); scrollToTop(); }} 
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer capitalize"
                  >
                    {p.titulo}
                  </button>
                </li>
              ))}
              <li>
                <button 
                  id="footer-link-sitemap"
                  onClick={() => { onNavigate('/sitemap.xml'); scrollToTop(); }} 
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-[11px]"
                >
                  Sitemap (XML)
                </button>
              </li>
            </ul>
          </div>

          {/* Social / Editorial Connection */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-white font-semibold border-b border-zinc-900 pb-2">
              REDES & CONTATO
            </h4>
            <div className="space-y-3">
              <a
                id="footer-instagram-btn"
                href="https://www.instagram.com/olharesdacena/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 border border-zinc-800 hover:border-white transition-all duration-200 bg-zinc-950"
              >
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-mono text-zinc-300 group-hover:text-white">
                    @olharesdacena
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                Acompanhe coberturas de festivais, estreias teatrais e debates cênicos em tempo real.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Olhares da Cena. Todos os direitos reservados.</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <a
              id="footer-author-credit"
              href="https://bwwebdesign.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-zinc-400 hover:text-white transition-all group"
            >
              <span className="text-zinc-400">Produzido por</span>
              <span className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline decoration-amber-400/50 hover:decoration-amber-300 underline-offset-4 tracking-wide">
                BW Bernardo Web Design
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <SiteViewsCounter variant="compact" />
            <span className="hidden sm:inline text-zinc-500">ISSN / Arquivo Cultural Cênico</span>
            <button
              id="footer-back-to-top"
              onClick={scrollToTop}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

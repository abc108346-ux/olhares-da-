import React from 'react';
import { Instagram, ArrowUpRight, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                  id="footer-link-sobre"
                  onClick={() => { onNavigate('/sobre'); scrollToTop(); }} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Sobre o Projeto
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <span>© {new Date().getFullYear()} Olhares da Cena. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center space-x-6">
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

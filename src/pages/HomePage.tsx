import React, { useState } from 'react';
import { ArrowRight, Sparkles, BookOpen, Compass, Search } from 'lucide-react';
import { Critica } from '../types';
import { Logo } from '../components/Logo';
import { CriticaCard } from '../components/CriticaCard';
import { SearchBar } from '../components/SearchBar';

interface HomePageProps {
  criticas: Critica[];
  onNavigate: (path: string) => void;
  onSelectCritica: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ criticas, onNavigate, onSelectCritica }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Official Hero Image provided in user prompt
  const HERO_IMAGE_URL = "https://blogger.googleusercontent.com/img/a/AVvXsEhElA3KqcSpB1S-r4XP-FkCjJEjxjOLu0stZo9jyNzaKsom_FKQtibjmxUTU-WyYpJvyCAqWk-gCSF9-TC0X8AihtdD8nz6UTpM_PLcqEY1wUGxVm4RPqqASBiIgM-RuB5dtoYwf4BlLAoMa0zEFDUiL2wLcODiESPk7Y6RltvXOR7579sZqUb_t4gtcn2O=s910";

  // Filter published only for public viewing
  const publishedCriticas = criticas.filter(c => c.publicada);
  
  // Featured / Lead critique
  const featured = publishedCriticas.find(c => c.destaque) || publishedCriticas[0];
  
  // Recent 6 critiques (excluding or including featured)
  const recentCriticas = publishedCriticas.slice(0, 6);

  const handleSearchSubmit = (term: string) => {
    if (term.trim()) {
      onNavigate(`/pesquisa?q=${encodeURIComponent(term.trim())}`);
    }
  };

  return (
    <div id="home-page" className="min-h-screen bg-black text-white space-y-12 sm:space-y-16 pb-20">
      
      {/* =========================================================================
          1. HERO SECTION (Only the image in right proportions, no text overlay)
         ========================================================================= */}
      <section id="hero-section" className="w-full border-b border-zinc-900 bg-black pt-4 pb-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative border border-zinc-850 bg-zinc-950 overflow-hidden shadow-2xl">
            <img
              src={HERO_IMAGE_URL}
              alt="Olhares da Cena"
              fetchPriority="high"
              className="w-full max-h-[300px] sm:max-h-[380px] md:max-h-[420px] object-cover object-center grayscale contrast-125 brightness-95"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SEARCH BAR SECTION (Acervo Search)
         ========================================================================= */}
      <section id="home-search-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 bg-zinc-950 border border-zinc-850 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <h2 className="font-display uppercase tracking-[0.2em] text-xs font-semibold text-white flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              Pesquisar no Acervo Crítico
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              {publishedCriticas.length} {publishedCriticas.length === 1 ? 'crítica catalogada' : 'críticas catalogadas'}
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit(searchTerm);
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Pesquisar críticas por título, espetáculo, ator, autor, cidade..."
                />
              </div>
              <button
                type="submit"
                id="home-submit-search"
                className="px-6 py-3 bg-white text-black font-semibold uppercase tracking-[0.18em] text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer sm:self-start"
              >
                <span>PESQUISAR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED EDITORIAL CRITIQUE OR EMPTY STATE
         ========================================================================= */}
      {featured ? (
        <section id="home-featured-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="font-display tracking-[0.25em] text-white font-bold text-xs sm:text-sm uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                CRÍTICA EM DESTAQUE
              </h2>
              <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-500">
                EDIÇÃO ATUAL
              </span>
            </div>

            <CriticaCard
              critica={featured}
              onSelect={onSelectCritica}
              featured={true}
            />
          </div>
        </section>
      ) : null}

      {/* =========================================================================
          4. RECENT CRITIQUES SECTION
         ========================================================================= */}
      {publishedCriticas.length > 0 ? (
        <section id="home-recent-criticas-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header with Title and "Ver Todas" link */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-850 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-500 block mb-1">
                PUBLICAÇÕES MAIS RECENTES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase tracking-tight">
                Críticas Recentes
              </h2>
            </div>

            <button
              id="see-all-criticas-top-btn"
              onClick={() => onNavigate('/criticas')}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>VER TODAS AS CRÍTICAS</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Grid items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {recentCriticas.map((critica) => (
              <CriticaCard
                key={critica.id}
                critica={critica}
                onSelect={onSelectCritica}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-8 border-t border-zinc-900">
            <button
              id="home-ver-todas-bottom-btn"
              onClick={() => onNavigate('/criticas')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-950 hover:bg-white text-white hover:text-black border border-zinc-800 hover:border-white font-semibold uppercase tracking-[0.22em] text-xs transition-all duration-300 cursor-pointer group"
            >
              <span>ACESSAR ARQUIVO COMPLETO DE CRÍTICAS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      ) : (
        /* Clean Editorial Empty State when 0 critiques exist */
        <section id="home-empty-state-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="p-10 sm:p-14 border border-zinc-850 bg-zinc-950 text-center space-y-4">
            <div className="w-6 h-6 border border-zinc-600 rotate-45 mx-auto flex items-center justify-center mb-1">
              <div className="w-1.5 h-1.5 bg-white" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight uppercase">
              Acervo Crítico
            </h3>
            <p className="text-zinc-400 font-serif italic text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Nenhuma crítica publicada no momento. Os ensaios e análises dramatúrgicas serão disponibilizados aqui assim que publicados pela equipe editorial.
            </p>
          </div>
        </section>
      )}

      {/* =========================================================================
          5. EDITORIAL MANIFESTO / QUOTE BANNER
         ========================================================================= */}
      <section id="home-manifesto-banner" className="border-y border-zinc-900 bg-zinc-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-8 h-8 border border-white rotate-45 mx-auto flex items-center justify-center mb-2">
            <div className="w-2 h-2 bg-white" />
          </div>

          <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-zinc-200 leading-relaxed font-light">
            “A crítica de teatro não é um tribunal de julgamentos sumários, mas o prolongamento da experiência sensível do palco através da escrita e do debate rigoroso.”
          </blockquote>

          <div className="pt-2">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono">
              Olhares da Cena • Arquivo Crítico Teatral
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

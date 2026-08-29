import React, { useState, useMemo } from 'react';
import { Critica, CategoriaTipo } from '../types';
import { CriticaCard } from '../components/CriticaCard';
import { SearchBar } from '../components/SearchBar';
import { Filter, Calendar, Layers, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface CriticasPageProps {
  criticas: Critica[];
  onSelectCritica: (slug: string) => void;
  initialCategory?: string;
}

export const CriticasPage: React.FC<CriticasPageProps> = ({ 
  criticas, 
  onSelectCritica,
  initialCategory = 'Todas'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Available years from dataset
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    criticas.forEach(c => {
      if (c.dataPublicacao) {
        const y = c.dataPublicacao.substring(0, 4);
        if (y) years.add(y);
      }
    });
    return ['Todos', ...Array.from(years).sort().reverse()];
  }, [criticas]);

  // Filter and sort items (Newest to Oldest)
  const filteredCriticas = useMemo(() => {
    return criticas
      .filter(c => c.publicada)
      .filter(c => {
        // Search term matching
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = c.titulo.toLowerCase().includes(term);
          const matchContent = c.conteudo.toLowerCase().includes(term);
          const matchSummary = c.resumo.toLowerCase().includes(term);
          const matchAuthor = c.autor.toLowerCase().includes(term);
          const matchShow = c.nomeEspetaculo?.toLowerCase().includes(term);
          const matchCompany = c.companhia?.toLowerCase().includes(term);
          const matchCity = c.cidade?.toLowerCase().includes(term);
          const matchTags = c.tags?.some(t => t.toLowerCase().includes(term));
          if (!matchTitle && !matchContent && !matchSummary && !matchAuthor && !matchShow && !matchCompany && !matchCity && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'Todas' && c.categoria !== selectedCategory) {
          return false;
        }

        // Year filter
        if (selectedYear !== 'Todos' && !c.dataPublicacao.startsWith(selectedYear)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
  }, [criticas, searchTerm, selectedCategory, selectedYear]);

  const visibleCriticas = filteredCriticas.slice(0, itemsPerPage);
  const hasMore = itemsPerPage < filteredCriticas.length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setSelectedYear('Todos');
  };

  return (
    <div id="criticas-archive-page" className="min-h-screen bg-black text-white space-y-12 pb-24">
      
      {/* Header section */}
      <section className="border-b border-zinc-900 bg-zinc-950 pt-12 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black border border-zinc-800 text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-400">
            ARQUIVO DE CRÍTICAS & ENSAIOS
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase">
            CRÍTICAS
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-zinc-300 font-light max-w-2xl">
            Um arquivo de olhares sobre a cena contemporânea.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Filter Controls Bar */}
        <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
            {/* Search Input */}
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                resultsCount={filteredCriticas.length}
                showResultsCount={true}
                placeholder="Pesquisar por título, companhia, cidade, ator ou autor..."
              />
            </div>

            {/* Year Selector and Reset */}
            <div className="flex items-center gap-3 self-end lg:self-center">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Ano:
                </span>
                <select
                  id="select-filter-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-black text-white text-xs border border-zinc-800 px-3 py-2 uppercase font-mono focus:border-white focus:outline-none cursor-pointer"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedCategory !== 'Todas' || selectedYear !== 'Todos') && (
                <button
                  id="reset-filters-btn"
                  onClick={handleResetFilters}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredCriticas.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {visibleCriticas.map((critica) => (
                <CriticaCard
                  key={critica.id}
                  critica={critica}
                  onSelect={onSelectCritica}
                />
              ))}
            </div>

            {/* Progressive Loading Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  id="load-more-criticas-btn"
                  onClick={() => setItemsPerPage(prev => prev + 6)}
                  className="px-8 py-3.5 bg-zinc-950 hover:bg-white text-white hover:text-black border border-zinc-800 hover:border-white font-semibold uppercase tracking-[0.2em] text-xs transition-all duration-200 cursor-pointer"
                >
                  CARREGAR MAIS CRÍTICAS ({filteredCriticas.length - itemsPerPage} restantes)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 border border-zinc-900 bg-zinc-950 text-center space-y-4">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="font-serif text-2xl text-white font-bold uppercase">
              Nenhuma crítica encontrada
            </h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto font-light">
              Nenhum texto corresponde aos filtros selecionados. Experimente buscar por outros termos ou limpar os filtros.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-6 py-2.5 bg-white text-black font-semibold uppercase tracking-wider text-xs hover:bg-zinc-200 cursor-pointer"
            >
              Ver Todas as Críticas
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

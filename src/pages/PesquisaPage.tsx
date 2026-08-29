import React, { useState, useMemo, useEffect } from 'react';
import { Critica } from '../types';
import { CriticaCard } from '../components/CriticaCard';
import { SearchBar } from '../components/SearchBar';
import { Search, Compass, Sparkles, Filter, RefreshCw } from 'lucide-react';

interface PesquisaPageProps {
  criticas: Critica[];
  onSelectCritica: (slug: string) => void;
  initialQuery?: string;
}

export const PesquisaPage: React.FC<PesquisaPageProps> = ({
  criticas,
  onSelectCritica,
  initialQuery = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  const searchResults = useMemo(() => {
    const published = criticas.filter(c => c.publicada);
    if (!searchTerm.trim() && selectedCategory === 'Todas') {
      return published;
    }

    const term = searchTerm.toLowerCase().trim();

    return published.filter(c => {
      // Category filter
      if (selectedCategory !== 'Todas' && c.categoria !== selectedCategory) {
        return false;
      }

      if (!term) return true;

      // Deep match across all relevant fields
      const matchTitle = c.titulo?.toLowerCase().includes(term);
      const matchContent = c.conteudo?.toLowerCase().includes(term);
      const matchSummary = c.resumo?.toLowerCase().includes(term);
      const matchAuthor = c.autor?.toLowerCase().includes(term);
      const matchShow = c.nomeEspetaculo?.toLowerCase().includes(term);
      const matchCompany = c.companhia?.toLowerCase().includes(term);
      const matchCity = c.cidade?.toLowerCase().includes(term);
      const matchState = c.estado?.toLowerCase().includes(term);
      const matchCategory = c.categoria?.toLowerCase().includes(term);
      const matchTags = c.tags?.some(t => t.toLowerCase().includes(term));
      const matchFicha = c.fichaTecnica ? Object.values(c.fichaTecnica).some(val => typeof val === 'string' && val.toLowerCase().includes(term)) : false;

      return Boolean(
        matchTitle ||
        matchContent ||
        matchSummary ||
        matchAuthor ||
        matchShow ||
        matchCompany ||
        matchCity ||
        matchState ||
        matchCategory ||
        matchTags ||
        matchFicha
      );
    }).sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
  }, [criticas, searchTerm, selectedCategory]);

  const popularTags = [
    'teatro', 'dança', 'performance', 'porto alegre', 'monólogo', 'comédia', 'gógol', 'rio grande do sul', '2026'
  ];

  return (
    <div id="pesquisa-page" className="min-h-screen bg-black text-white space-y-12 pb-24">
      
      {/* Search Header */}
      <section className="border-b border-zinc-900 bg-zinc-950 pt-12 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black border border-zinc-800 text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-400">
            <Search className="w-3 h-3" />
            SISTEMA DE BUSCA NO ACERVO
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
            PESQUISA EDITORIAL
          </h1>

          <p className="text-zinc-400 font-serif text-base sm:text-lg font-light leading-relaxed">
            Localize críticas, espetáculos, autores, companhias, cidades e análises de cena em todo o catálogo do Olhares da Cena.
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              resultsCount={searchResults.length}
              showResultsCount={true}
              autoFocus={true}
              placeholder="Digite o nome do espetáculo, companhia, dramaturgo, ator ou termo de busca..."
            />
          </div>

          {/* Suggested Quick Search Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
              Sugestões:
            </span>
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="px-2.5 py-1 bg-black border border-zinc-800 hover:border-white text-zinc-400 hover:text-white font-mono text-[11px] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Results Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {searchResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="font-display tracking-[0.2em] text-white font-bold text-xs uppercase">
                RESULTADOS DA PESQUISA ({searchResults.length})
              </h2>
              {searchTerm && (
                <span className="text-xs font-mono text-zinc-500">
                  Filtro ativo: &ldquo;{searchTerm}&rdquo;
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {searchResults.map((critica) => (
                <CriticaCard
                  key={critica.id}
                  critica={critica}
                  onSelect={onSelectCritica}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-16 border border-zinc-900 bg-zinc-950 text-center space-y-4 max-w-xl mx-auto">
            <Compass className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="font-serif text-2xl text-white font-bold uppercase">
              Nenhum resultado encontrado
            </h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Não encontramos críticas correspondentes aos termos &ldquo;{searchTerm}&rdquo;. Tente buscar por termos mais amplos como &ldquo;Teatro&rdquo;, &ldquo;Dança&rdquo; ou o nome da cidade.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todas');
              }}
              className="mt-4 px-6 py-2.5 bg-white text-black font-semibold uppercase tracking-wider text-xs hover:bg-zinc-200 cursor-pointer"
            >
              Limpar Busca
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

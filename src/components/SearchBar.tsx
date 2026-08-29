import React from 'react';
import { Search, X } from 'lucide-react';
import { CategoriaTipo } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  resultsCount?: number;
  showResultsCount?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const CATEGORIAS_LIST: (CategoriaTipo | 'Todas')[] = [
  'Todas',
  'Teatro',
  'Dança',
  'Performance',
  'Circo',
  'Ópera',
  'Festival',
  'Outros'
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  selectedCategory = 'Todas',
  onSelectCategory,
  resultsCount,
  showResultsCount = false,
  placeholder = 'Pesquisar críticas, espetáculos, companhias, autores...',
  autoFocus = false
}) => {
  return (
    <div id="search-bar-container" className="w-full space-y-4">
      {/* Input box */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-zinc-500 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="critica-search-input"
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-zinc-950 text-white placeholder-zinc-500 pl-12 pr-12 py-4 border border-zinc-800 focus:border-white focus:outline-none transition-colors font-sans text-sm sm:text-base"
        />
        {value && (
          <button
            id="clear-search-btn"
            onClick={() => onChange('')}
            className="absolute right-4 text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
            aria-label="Limpar pesquisa"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories filter pills */}
      {onSelectCategory && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline">
            Filtrar:
          </span>
          {CATEGORIAS_LIST.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`filter-category-${cat.toLowerCase()}`}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-black font-semibold border-white'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Optional results counter */}
      {showResultsCount && typeof resultsCount === 'number' && (
        <div id="search-results-counter" className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-900">
          <span>
            {resultsCount === 0 ? (
              'Nenhuma crítica encontrada'
            ) : resultsCount === 1 ? (
              <strong className="text-white font-medium">1 crítica encontrada</strong>
            ) : (
              <span>
                <strong className="text-white font-medium">{resultsCount}</strong> críticas encontradas
              </span>
            )}
          </span>
          {value && (
            <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[200px]">
              termo: &ldquo;{value}&rdquo;
            </span>
          )}
        </div>
      )}
    </div>
  );
};

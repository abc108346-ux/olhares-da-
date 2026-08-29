import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Instagram, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile, Pagina } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser?: UserProfile | null;
  paginas?: Pagina[];
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, currentUser, paginas = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerPages = paginas
    .filter(p => p.publicada && p.mostrarNoHeader)
    .sort((a, b) => (a.ordemHeader || 0) - (b.ordemHeader || 0));

  const allNavItems = [
    { label: 'INÍCIO', path: '/' },
    { label: 'CRÍTICAS', path: '/criticas' },
    ...headerPages.map(p => ({ label: p.titulo.toUpperCase(), path: `/${p.slug}` })),
  ];

  const MAX_DESKTOP_ITEMS = 5;
  const desktopVisibleItems = allNavItems.slice(0, MAX_DESKTOP_ITEMS);
  const desktopMoreItems = allNavItems.slice(MAX_DESKTOP_ITEMS);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header 
      id="main-header"
      className={`sticky top-0 z-50 bg-black transition-all duration-300 border-b ${
        isScrolled ? 'border-zinc-800/80 bg-black/95 backdrop-blur-md py-3' : 'border-zinc-900 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand Link */}
          <button 
            id="header-logo-btn"
            onClick={() => handleNavClick('/')} 
            className="flex items-center text-left focus:outline-none group cursor-pointer"
            aria-label="Ir para a página inicial"
          >
            <Logo size={isScrolled ? 'sm' : 'md'} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
            {desktopVisibleItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={`nav-link-${item.label.toLowerCase()}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 relative py-1 cursor-pointer ${
                    isActive 
                      ? 'text-white font-semibold' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white animate-in fade-in" />
                  )}
                </button>
              );
            })}

            {desktopMoreItems.length > 0 && (
              <div className="relative group">
                <button
                  className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  onBlur={() => setTimeout(() => setMoreMenuOpen(false), 200)}
                >
                  MAIS
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                <div 
                  className={`absolute top-full right-0 mt-4 w-48 bg-zinc-950 border border-zinc-800 shadow-2xl transition-all duration-200 origin-top-right ${
                    moreMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                  }`}
                >
                  <div className="py-2 flex flex-col">
                    {desktopMoreItems.map(item => (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className="text-left px-4 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Instagram link */}
            <a
              id="header-instagram-link"
              href="https://www.instagram.com/olharesdacena/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
              title="Instagram @olharesdacena (Abre em nova aba)"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>INSTAGRAM</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>

            {/* Search Icon Trigger */}
            <button
              id="header-search-btn"
              onClick={() => handleNavClick('/pesquisa')}
              className={`p-2 transition-colors cursor-pointer rounded-none border border-transparent hover:border-zinc-700 ${
                currentPath === '/pesquisa' ? 'text-white border-zinc-700 bg-zinc-900' : 'text-zinc-400 hover:text-white'
              }`}
              aria-label="Pesquisar críticas"
              title="Pesquisar no acervo"
            >
              <Search className="w-4 h-4" />
            </button>
          </nav>

          {/* Mobile menu and Search buttons */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              id="mobile-search-trigger"
              onClick={() => handleNavClick('/pesquisa')}
              className="p-2 text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Pesquisar"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Abrir menu principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden bg-black border-t border-zinc-900 px-6 pt-4 pb-8 space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4 pt-2">
            {allNavItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={`mobile-nav-${item.label.toLowerCase()}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-left text-sm uppercase tracking-[0.2em] py-2 border-b border-zinc-900 transition-colors ${
                    isActive ? 'text-white font-bold pl-2 border-l-2 border-l-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <a
              id="mobile-instagram-link"
              href="https://www.instagram.com/olharesdacena/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left text-sm uppercase tracking-[0.2em] py-2 text-zinc-400 hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                INSTAGRAM (@olharesdacena)
              </span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

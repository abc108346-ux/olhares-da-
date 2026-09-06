import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Instagram, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile, Pagina } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser?: UserProfile | null;
  paginas?: Pagina[];
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, paginas = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Detect scroll to add subtle backdrop blur without shifting height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreMenuOpen]);

  // Auto-close mobile drawer on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerPages = paginas
    .filter(p => p.publicada && p.mostrarNoHeader)
    .sort((a, b) => (a.ordemHeader || 0) - (b.ordemHeader || 0));

  const allNavItems = [
    { label: 'INÍCIO', path: '/' },
    { label: 'CRÍTICAS', path: '/criticas' },
    ...headerPages.map(p => ({ label: p.titulo.toUpperCase(), path: `/${p.slug}` })),
  ];

  // Up to 3 items shown directly on tablet (md), 5 on desktop (lg/xl)
  const MAX_DESKTOP_ITEMS = 4;
  const desktopVisibleItems = allNavItems.slice(0, MAX_DESKTOP_ITEMS);
  const desktopMoreItems = allNavItems.slice(MAX_DESKTOP_ITEMS);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header 
      id="main-header"
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b ${
        isScrolled 
          ? 'border-zinc-800/80 bg-black/95 backdrop-blur-md shadow-lg shadow-black/60' 
          : 'border-zinc-900 bg-black'
      }`}
    >
      {/* 
        Fixed height container (h-16 on mobile, h-20 on desktop)
        Prevents layout shifts, jittering and bouncing at scroll position boundaries
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Logo Brand Link */}
        <button 
          id="header-logo-btn"
          onClick={() => handleNavClick('/')} 
          className="flex items-center text-left focus:outline-none group cursor-pointer shrink-0"
          aria-label="Ir para a página inicial"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 shrink-0">
          {desktopVisibleItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                id={`nav-link-${item.label.toLowerCase()}`}
                onClick={() => handleNavClick(item.path)}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-150 relative py-1.5 cursor-pointer whitespace-nowrap ${
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

          {/* More menu dropdown if items exceed visible limit */}
          {desktopMoreItems.length > 0 && (
            <div className="relative" ref={moreMenuRef}>
              <button
                id="header-more-menu-btn"
                className={`text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-1.5 transition-colors py-1.5 cursor-pointer whitespace-nowrap ${
                  moreMenuOpen ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                aria-expanded={moreMenuOpen}
                aria-haspopup="true"
              >
                <span>MAIS</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
              
              {/* Dropdown Menu Box */}
              <div 
                className={`absolute top-full right-0 pt-2 w-48 transition-all duration-150 origin-top-right z-50 ${
                  moreMenuOpen 
                    ? 'opacity-100 scale-100 visible pointer-events-auto' 
                    : 'opacity-0 scale-95 invisible pointer-events-none'
                }`}
              >
                <div className="bg-zinc-950 border border-zinc-800 shadow-2xl py-2 flex flex-col divide-y divide-zinc-900">
                  {desktopMoreItems.map(item => (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className="text-left px-4 py-2.5 text-xs uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instagram Link */}
          <a
            id="header-instagram-link"
            href="https://www.instagram.com/olharesdacena/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors py-1.5 cursor-pointer whitespace-nowrap"
            title="Instagram @olharesdacena (Abre em nova aba)"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">INSTAGRAM</span>
            <ArrowUpRight className="w-3 h-3 opacity-60 hidden xl:inline" />
          </a>

          {/* Search Icon Trigger */}
          <button
            id="header-search-btn"
            onClick={() => handleNavClick('/pesquisa')}
            className={`p-2 transition-colors cursor-pointer rounded-none border ${
              currentPath === '/pesquisa' 
                ? 'text-white border-zinc-700 bg-zinc-900' 
                : 'text-zinc-400 border-transparent hover:border-zinc-800 hover:text-white hover:bg-zinc-900/50'
            }`}
            aria-label="Pesquisar críticas"
            title="Pesquisar no acervo"
          >
            <Search className="w-4 h-4" />
          </button>
        </nav>

        {/* Mobile Controls (Search + Hamburger) */}
        <div className="flex md:hidden items-center space-x-2 shrink-0">
          <button
            id="mobile-search-trigger"
            onClick={() => handleNavClick('/pesquisa')}
            className="p-2 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Pesquisar"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu principal"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with scroll container */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer" 
          className="md:hidden bg-black border-t border-zinc-900 px-6 pt-4 pb-8 space-y-5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="flex flex-col space-y-3 pt-1">
            {allNavItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={`mobile-nav-${item.label.toLowerCase()}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-left text-xs uppercase tracking-[0.2em] py-2.5 border-b border-zinc-900 transition-colors ${
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
              className="text-left text-xs uppercase tracking-[0.2em] py-2.5 text-zinc-400 hover:text-white flex items-center justify-between pt-2"
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

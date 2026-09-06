/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Critica, UserProfile, Pagina, SiteInteressante } from './types';
import { 
  fetchAllCriticas, 
  fetchAllPaginas,
  subscribeToAuth, 
  subscribeToCriticas,
  subscribeToPaginas,
  subscribeToSitesInteressantes,
  getLocalCriticas,
  getLocalPaginas,
  getLocalSitesInteressantes
} from './services/firebase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CriticasPage } from './pages/CriticasPage';
import { CriticaDetailPage } from './pages/CriticaDetailPage';
import { PaginaDetailPage } from './pages/PaginaDetailPage';
import { PesquisaPage } from './pages/PesquisaPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SitemapPage } from './pages/SitemapPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [criticas, setCriticas] = useState<Critica[]>(() => getLocalCriticas());
  const [paginas, setPaginas] = useState<Pagina[]>(() => getLocalPaginas());
  const [sitesInteressantes, setSitesInteressantes] = useState<SiteInteressante[]>(() => getLocalSitesInteressantes());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse path and query
  const getPathAndQuery = () => {
    const path = window.location.pathname || '/';
    const search = window.location.search || '';
    return { path, search };
  };

  // Sync with browser URL
  useEffect(() => {
    const handlePopState = () => {
      const { path, search } = getPathAndQuery();
      setCurrentPath(search ? `${path}${search}` : path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (to: string) => {
    if (to.startsWith('http')) {
      window.open(to, '_blank', 'noopener,noreferrer');
      return;
    }
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial Data Load and Auth state
  useEffect(() => {
    let isMounted = true;

    // 1. Subscribe to Firebase auth
    const unsubAuth = subscribeToAuth((user) => {
      if (isMounted) {
        setCurrentUser(user);
      }
    });

    // 2. Real-time subscription to Critiques across all devices
    const unsubCriticas = subscribeToCriticas((items) => {
      if (isMounted && items) {
        setCriticas(items);
        setLoading(false);
      }
    });

    // 3. Real-time subscription to Pages
    const unsubPaginas = subscribeToPaginas((paginasData) => {
      if (isMounted && paginasData) {
        setPaginas(paginasData);
      }
    });

    // 4. Real-time subscription to Sites Interessantes
    const unsubSites = subscribeToSitesInteressantes((sitesData) => {
      if (isMounted && sitesData) {
        setSitesInteressantes(sitesData);
      }
    });

    return () => {
      isMounted = false;
      if (unsubAuth) unsubAuth();
      if (unsubCriticas) unsubCriticas();
      if (unsubPaginas) unsubPaginas();
      if (unsubSites) unsubSites();
    };
  }, []);

  // Determine active view from currentPath
  const cleanPath = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');
  const initialSearchQuery = searchParams.get('q') || '';

  // Check if viewing a single critique /criticas/:slug
  const isSingleCriticaRoute = cleanPath.startsWith('/criticas/') && cleanPath !== '/criticas';
  const selectedSlug = isSingleCriticaRoute ? cleanPath.replace('/criticas/', '') : null;
  const selectedCritica = selectedSlug ? criticas.find(c => c.slug === selectedSlug) : null;

  // Render Page Content
  const renderContent = () => {
    // Admin route
    if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
      if (!currentUser) {
        return (
          <AdminLoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              navigateTo('/admin');
            }}
            onNavigate={navigateTo}
          />
        );
      }
      return (
        <AdminDashboardPage
          currentUser={currentUser}
          criticas={criticas}
          paginas={paginas}
          sitesInteressantes={sitesInteressantes}
          onCriticasChange={(updated) => setCriticas(updated)}
          onPaginasChange={(updated) => setPaginas(updated)}
          onSitesChange={(updated) => setSitesInteressantes(updated)}
          onNavigate={navigateTo}
          onSelectCritica={(slug) => navigateTo(`/criticas/${slug}`)}
        />
      );
    }

    if (cleanPath === '/login') {
      return (
        <AdminLoginPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            navigateTo('/admin');
          }}
          onNavigate={navigateTo}
        />
      );
    }

    // Single Critique Page
    if (isSingleCriticaRoute) {
      if (selectedCritica) {
        return (
          <CriticaDetailPage
            critica={selectedCritica}
            allCriticas={criticas}
            sitesInteressantes={sitesInteressantes}
            onNavigate={navigateTo}
            onSelectCritica={(slug) => navigateTo(`/criticas/${slug}`)}
          />
        );
      }
      // Not found fallback
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-black text-white">
          <h2 className="font-serif text-3xl font-bold uppercase text-white mb-2">404</h2>
          <h3 className="font-serif text-2xl font-bold uppercase text-zinc-300">Crítica não encontrada</h3>
          <p className="text-zinc-400 text-sm max-w-md mt-4">
            Esta crítica não existe, foi removida ou não está disponível.
          </p>
          <button
            onClick={() => navigateTo('/criticas')}
            className="mt-8 px-6 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors"
          >
            VOLTAR PARA CRÍTICAS
          </button>
        </div>
      );
    }

    // All Critiques Archive
    if (cleanPath === '/criticas') {
      return (
        <CriticasPage
          criticas={criticas}
          sitesInteressantes={sitesInteressantes}
          onSelectCritica={(slug) => navigateTo(`/criticas/${slug}`)}
        />
      );
    }

    // Pesquisa Page
    if (cleanPath === '/pesquisa') {
      return (
        <PesquisaPage
          criticas={criticas}
          initialQuery={initialSearchQuery}
          onSelectCritica={(slug) => navigateTo(`/criticas/${slug}`)}
        />
      );
    }

    // Sitemap XML Page
    if (cleanPath === '/sitemap.xml' || cleanPath === '/sitemap') {
      return (
        <SitemapPage
          criticas={criticas}
          paginas={paginas}
          onNavigate={navigateTo}
        />
      );
    }

    if (cleanPath === '/') {
      return (
        <HomePage
          criticas={criticas}
          onNavigate={navigateTo}
          onSelectCritica={(slug) => navigateTo(`/criticas/${slug}`)}
        />
      );
    }

    // Dynamic Pages Fallback
    const pageSlug = cleanPath.replace(/^\//, '');
    const selectedPagina = paginas.find(p => p.slug === pageSlug);

    if (selectedPagina && selectedPagina.publicada) {
      return <PaginaDetailPage pagina={selectedPagina} />;
    }

    // 404 Route for anything else
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-black text-white">
        <h2 className="font-serif text-3xl font-bold uppercase text-white mb-2">404</h2>
        <h3 className="font-serif text-2xl font-bold uppercase text-zinc-300">Página não encontrada</h3>
        <p className="text-zinc-400 text-sm max-w-md mt-4">
          Esta página não existe, foi removida ou não está disponível.
        </p>
        <button
          onClick={() => navigateTo('/')}
          className="mt-8 px-6 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors"
        >
          VOLTAR PARA O INÍCIO
        </button>
      </div>
    );
  };

  const isAdminView = cleanPath.startsWith('/admin') && currentUser;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col">
      {/* Show header on public pages */}
      {!isAdminView && (
        <Header
          currentPath={currentPath}
          onNavigate={navigateTo}
          currentUser={currentUser}
          paginas={paginas}
        />
      )}

      {/* Main View Container */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Show footer on public pages */}
      {!isAdminView && (
        <Footer 
          onNavigate={navigateTo} 
          paginas={paginas}
        />
      )}
    </div>
  );
}

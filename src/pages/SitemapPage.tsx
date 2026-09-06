import React, { useState, useMemo } from 'react';
import { Critica, Pagina } from '../types';
import { generateSitemapXml, downloadSitemapXmlFile } from '../utils/sitemap';
import { Copy, Check, Download, ArrowLeft, Globe, FileCode2, ExternalLink } from 'lucide-react';

interface SitemapPageProps {
  criticas: Critica[];
  paginas: Pagina[];
  onNavigate: (path: string) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({ criticas, paginas, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const xmlContent = useMemo(() => {
    return generateSitemapXml(criticas, paginas);
  }, [criticas, paginas]);

  const publishedCriticasCount = useMemo(() => criticas.filter(c => c.publicada).length, [criticas]);
  const publishedPaginasCount = useMemo(() => paginas.filter(p => p.publicada).length, [paginas]);
  const totalUrls = 3 + publishedPaginasCount + publishedCriticasCount;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleDownload = () => {
    downloadSitemapXmlFile(xmlContent);
  };

  return (
    <div id="sitemap-page" className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            Sitemap Protocol 0.9
          </span>
        </div>

        {/* Page Title & Stats */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 border border-zinc-700 text-white">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                Sitemap XML (Mapa do Site)
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-sans">
                Arquivo XML estruturado para indexação em motores de busca (Google Search Console, Bing Webmaster).
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-zinc-950 border border-zinc-850">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Total de URLs</span>
              <span className="text-lg font-mono font-bold text-white">{totalUrls}</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-850">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Críticas</span>
              <span className="text-lg font-mono font-bold text-white">{publishedCriticasCount}</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-850">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Páginas</span>
              <span className="text-lg font-mono font-bold text-white">{publishedPaginasCount}</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-850">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Rotas Principais</span>
              <span className="text-lg font-mono font-bold text-white">3</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <FileCode2 className="w-4 h-4 text-zinc-400" />
            <span>sitemap.xml gerado em tempo real</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar XML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar sitemap.xml</span>
            </button>
          </div>
        </div>

        {/* Raw XML Box */}
        <div className="border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Conteúdo do Arquivo</span>
            <span>UTF-8 • XML</span>
          </div>
          <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[500px]">
            {xmlContent}
          </pre>
        </div>

      </div>
    </div>
  );
};

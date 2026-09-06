import { Critica, Pagina } from '../types';

export const BASE_SITE_URL = 'https://olharesdacena.com.br';

/**
 * Generates a standard, valid XML sitemap string following the sitemaps.org protocol.
 */
export function generateSitemapXml(
  criticas: Critica[] = [],
  paginas: Pagina[] = [],
  baseUrl: string = BASE_SITE_URL
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const publishedCriticas = criticas.filter(c => c.publicada);
  const publishedPaginas = paginas.filter(p => p.publicada);

  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [
    {
      loc: `${cleanBase}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      loc: `${cleanBase}/criticas`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      loc: `${cleanBase}/pesquisa`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.6',
    },
  ];

  // Add all published institutional/custom pages
  for (const pag of publishedPaginas) {
    const slug = pag.slug.replace(/^\/+/, '');
    urls.push({
      loc: `${cleanBase}/${slug}`,
      lastmod: pag.dataAtualizacao 
        ? new Date(pag.dataAtualizacao).toISOString().split('T')[0] 
        : (pag.dataCriacao ? new Date(pag.dataCriacao).toISOString().split('T')[0] : today),
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  // Add all published critiques
  for (const crit of publishedCriticas) {
    const lastmod = crit.dataAtualizacao 
      ? new Date(crit.dataAtualizacao).toISOString().split('T')[0]
      : (crit.dataPublicacao ? new Date(crit.dataPublicacao).toISOString().split('T')[0] : today);
    
    urls.push({
      loc: `${cleanBase}/criticas/${crit.slug}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  const xmlUrls = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

/**
 * Triggers a browser download of the generated sitemap.xml file.
 */
export function downloadSitemapXmlFile(xmlContent: string, filename = 'sitemap.xml') {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to optimize Blogger and Google-hosted CDN image URLs for modern WebP format
 * and tailored dimensions, drastically reducing mobile data transfer.
 */
export function optimizeImageUrl(url: string | undefined, width: number = 800): string {
  if (!url) return '';
  if (url.includes('blogger.googleusercontent.com')) {
    const base = url.split('=')[0];
    return `${base}=w${width}-rw`;
  }
  return url;
}

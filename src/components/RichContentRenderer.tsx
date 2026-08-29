import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface RichContentRendererProps {
  content: string;
  className?: string;
  enableDropCap?: boolean;
}

// Detect if string contains HTML markup tags
const containsHtml = (str: string): boolean => {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

// Safe HTML sanitizer & transformer for YouTube embeds, tables, and images
const sanitizeAndProcessHtml = (html: string): string => {
  if (!html) return '';

  let processed = html;

  // Ensure iframe embeds (e.g. YouTube) have proper wrapper for responsive 16:9
  processed = processed.replace(
    /<iframe([^>]*?)src=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/embed\/|player\.vimeo\.com\/video\/)[^"']+)["']([^>]*?)><\/iframe>/gi,
    (_match, before, src, after) => {
      return `<div class="my-8 aspect-video w-full overflow-hidden border border-zinc-800 bg-black shadow-2xl"><iframe src="${src}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ${before} ${after}></iframe></div>`;
    }
  );

  return processed;
};

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  const isHtml = useMemo(() => containsHtml(content), [content]);

  if (isHtml) {
    const processedHtml = sanitizeAndProcessHtml(content);

    return (
      <div
        className={`editorial-rich-content w-full max-w-[760px] mx-auto text-zinc-200 font-serif leading-[1.9] text-base sm:text-lg tracking-normal break-words overflow-x-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    );
  }

  // Fallback for markdown-only posts
  return (
    <div 
      className={`prose prose-invert w-full max-w-[760px] mx-auto text-zinc-200 font-serif leading-[1.9] text-base sm:text-lg tracking-normal break-words overflow-x-hidden ${className}`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight mt-10 mb-5 border-b border-zinc-900 pb-3 break-words text-center sm:text-left">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight mt-10 mb-5 border-b border-zinc-900 pb-3 break-words">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-xl sm:text-2xl text-white font-semibold tracking-tight mt-8 mb-4 break-words">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-serif text-lg sm:text-xl text-white font-medium tracking-tight mt-6 mb-3 break-words">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-6 font-light text-zinc-300 leading-[1.9] break-words">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 pl-6 border-l-2 border-white italic font-serif text-lg sm:text-xl text-zinc-100 bg-zinc-950/60 py-4 pr-4 break-words">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 mb-6 text-zinc-300 font-sans text-sm sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 mb-6 text-zinc-300 font-sans text-sm sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed break-words">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-200">
              {children}
            </em>
          ),
          hr: () => (
            <div className="my-10 flex items-center justify-center gap-2">
              <div className="w-12 h-[1px] bg-zinc-800" />
              <div className="w-2 h-2 rotate-45 border border-zinc-700" />
              <div className="w-12 h-[1px] bg-zinc-800" />
            </div>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors break-words"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <figure className="my-10 space-y-2.5 max-w-full">
              <div className="overflow-hidden border border-zinc-850 bg-black">
                <img
                  src={src}
                  alt={alt || 'Fotografia de cena'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full max-w-full h-auto object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                />
              </div>
              {alt && (
                <figcaption className="text-center font-mono text-xs text-zinc-500 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

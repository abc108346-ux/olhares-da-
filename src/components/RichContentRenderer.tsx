import React from 'react';
import ReactMarkdown from 'react-markdown';

interface RichContentRendererProps {
  content: string;
  className?: string;
  enableDropCap?: boolean;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  className = '',
  enableDropCap = true,
}) => {
  if (!content) return null;

  return (
    <div 
      className={`prose prose-invert max-w-[760px] mx-auto text-zinc-300 font-serif leading-[1.8] text-base sm:text-lg tracking-normal ${className}`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight mt-10 mb-5 border-b border-zinc-900 pb-3">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight mt-10 mb-5 border-b border-zinc-900 pb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-xl sm:text-2xl text-white font-semibold tracking-tight mt-8 mb-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 font-light text-zinc-300">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 pl-6 border-l-2 border-white italic font-serif text-lg sm:text-xl text-zinc-100 bg-zinc-950/60 py-4 pr-4">
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
            <li className="leading-relaxed">
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
              className="text-white underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <figure className="my-10 space-y-2.5">
              <div className="overflow-hidden border border-zinc-850 bg-black">
                <img
                  src={src}
                  alt={alt || 'Fotografia de cena'}
                  loading="lazy"
                  className="w-full h-auto object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
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

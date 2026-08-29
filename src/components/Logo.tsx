import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = false 
}) => {
  const [imgError, setImgError] = useState(false);

  // Official logo image asset provided in prompt
  const officialLogoUrl = "https://i.postimg.cc/MZNhH7P0/Chat-GPT-Image-29-de-ago-de-2026-00-06-46.png";

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    hero: 'h-20 sm:h-24 md:h-28',
  };

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center gap-3 bg-black">
        {!imgError ? (
          <img
            src={officialLogoUrl}
            alt="Olhares da Cena - Logo Oficial"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`${sizeClasses[size]} w-auto object-contain transition-opacity duration-300 contrast-125`}
          />
        ) : (
          /* High-fidelity geometric emblem fallback in strict compliance with the white geometric symbol on black background */
          <div className="flex items-center gap-3.5 py-1 px-1">
            <div className="relative flex items-center justify-center w-10 h-10 border-2 border-white rounded-none bg-black">
              {/* Geometric theater aperture / scene focal symbol */}
              <div className="w-5 h-5 border border-white rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display tracking-[0.18em] text-white font-bold text-lg sm:text-xl uppercase leading-none">
                Olhares da Cena
              </span>
              <span className="text-[9px] tracking-[0.35em] text-zinc-400 uppercase mt-1 font-sans">
                Crítica • Teatro • Cena
              </span>
            </div>
          </div>
        )}
      </div>

      {showSubtitle && (
        <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 mt-2 font-sans font-light">
          Crítica • Teatro • Dança • Artes Cênicas
        </span>
      )}
    </div>
  );
};

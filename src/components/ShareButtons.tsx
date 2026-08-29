import React, { useState } from 'react';
import { Share2, Link, Check, MessageSquare, Twitter } from 'lucide-react';

interface ShareButtonsProps {
  titulo: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ titulo, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Leia a crítica "${titulo}" no Olhares da Cena:\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Crítica teatral: "${titulo}" | @olharesdacena`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="uppercase tracking-[0.2em] font-mono text-zinc-500 text-[10px] hidden sm:inline">
        COMPARTILHAR:
      </span>

      {/* Copy link button */}
      <button
        onClick={handleCopyLink}
        className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono cursor-pointer ${
          copied 
            ? 'border-white bg-white text-black font-semibold' 
            : 'border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white bg-zinc-950'
        }`}
        title="Copiar link"
      >
        {copied ? <Check className="w-3 h-3 text-black" /> : <Link className="w-3 h-3" />}
        <span>{copied ? 'Link Copiado' : 'Copiar Link'}</span>
      </button>

      {/* WhatsApp share */}
      <button
        onClick={shareWhatsApp}
        className="p-1.5 border border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white bg-zinc-950 transition-colors cursor-pointer"
        title="Compartilhar no WhatsApp"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </button>

      {/* Twitter/X share */}
      <button
        onClick={shareTwitter}
        className="p-1.5 border border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white bg-zinc-950 transition-colors cursor-pointer"
        title="Compartilhar no X (Twitter)"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadManagerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  helperText?: string;
}

export const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  label,
  value,
  onChange,
  caption,
  onCaptionChange,
  helperText = 'Adicione a imagem por link direto (URL) ou faça upload de um arquivo do seu computador.'
}) => {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState(value || '');

  useEffect(() => {
    setInputUrl(value || '');
  }, [value]);

  const handleApplyUrl = () => {
    onChange(inputUrl.trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g. limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onChange(base64);
      setInputUrl(base64);
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Erro ao ler a imagem. Tente novamente.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChange('');
    setInputUrl('');
  };

  return (
    <div className="space-y-3 p-4 bg-zinc-950 border border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs uppercase tracking-wider font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            {label}
          </label>
          {helperText && (
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">{helperText}</p>
          )}
        </div>

        {/* Option Tabs: URL or Upload */}
        <div className="flex items-center border border-zinc-800 bg-black p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[10px] transition-colors ${
              mode === 'url' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Opção 1: URL</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[10px] transition-colors ${
              mode === 'upload' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Opção 2: Upload</span>
          </button>
        </div>
      </div>

      {/* Input depending on mode */}
      {mode === 'url' ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onBlur={handleApplyUrl}
            placeholder="https://exemplo.com/fotografia-cena.jpg"
            className="flex-1 bg-black text-white text-xs border border-zinc-800 px-3 py-2.5 focus:border-white focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white uppercase text-[11px] font-mono tracking-wider cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 p-4 text-center bg-black transition-colors">
          <input
            type="file"
            id={`file-upload-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor={`file-upload-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2"
          >
            <Upload className="w-6 h-6 text-zinc-400" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white underline underline-offset-4">Clique para selecionar</span> ou arraste a imagem
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">PNG, JPG, WEBP até 5MB</span>
          </label>
          {uploading && (
            <p className="text-xs text-zinc-400 mt-2 font-mono animate-pulse">
              Processando imagem...
            </p>
          )}
        </div>
      )}

      {/* Caption field if enabled */}
      {onCaptionChange && (
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1 font-mono">
            Legenda / Créditos da Imagem (Opcional)
          </label>
          <input
            type="text"
            value={caption || ''}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Ex: Foto de divulgação por André Furtado"
            className="w-full bg-black text-white text-xs border border-zinc-800 px-3 py-2 focus:border-white focus:outline-none"
          />
        </div>
      )}

      {/* Image Preview Box */}
      {value && (
        <div className="relative mt-3 p-2 bg-black border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-16 h-16 object-cover border border-zinc-800 bg-zinc-900 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-xs space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Imagem Carregada com Sucesso</span>
              </div>
              <p className="text-zinc-500 font-mono text-[10px] truncate max-w-xs">
                {value.startsWith('data:') ? 'Arquivo local codificado' : value}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveImage}
            className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Remover Imagem"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

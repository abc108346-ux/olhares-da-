import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Minus, 
  Eye, 
  Edit3,
  HelpCircle
} from 'lucide-react';
import { RichContentRenderer } from './RichContentRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  label?: string;
  helperText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  minHeight = '360px',
  label = 'Conteúdo da Crítica',
  helperText = 'Suporta formatação rica: títulos, citações em destaque, listas, itálico/negrito e imagens no meio do texto.'
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('write');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = document.getElementById('rich-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const replacement = before + selected + after;
    
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleInsertImage = () => {
    if (!imgUrlInput.trim()) return;
    const mdImage = `\n\n![${imgCaptionInput.trim() || 'Fotografia de cena'}](${imgUrlInput.trim()})\n\n`;
    insertText(mdImage, '', '');
    setImgUrlInput('');
    setImgCaptionInput('');
    setShowImageModal(false);
  };

  return (
    <div className="w-full space-y-2">
      {/* Label and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs uppercase tracking-wider font-semibold text-white">
            {label}
          </label>
          {helperText && (
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">{helperText}</p>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
          <button
            type="button"
            id="editor-tab-write"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] transition-colors ${
              activeTab === 'write' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            id="editor-tab-preview"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] transition-colors ${
              activeTab === 'preview' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Prévia</span>
          </button>
          <button
            type="button"
            id="editor-tab-split"
            onClick={() => setActiveTab('split')}
            className={`hidden lg:flex px-3 py-1 items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] transition-colors ${
              activeTab === 'split' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Dividido</span>
          </button>
        </div>
      </div>

      {/* Editor Main Container */}
      <div className="border border-zinc-800 bg-zinc-950 flex flex-col">
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300">
          <button
            type="button"
            onClick={() => insertText('### ', '', 'Título da Seção')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Subtítulo H3 (### Título)"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('## ', '', 'Título Principal')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Título H2 (## Título)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
          <button
            type="button"
            onClick={() => insertText('**', '**', 'texto em negrito')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Negrito (**texto**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*', 'texto em itálico')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Itálico (*texto*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
          <button
            type="button"
            onClick={() => insertText('\n> ', '', 'Citação de destaque da encenação ou fala do espetáculo.')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Bloco de Citação (> citação)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('\n- ', '', 'Item da lista')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Lista com marcadores (- item)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('\n1. ', '', 'Primeiro ponto')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Lista numerada (1. item)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
          <button
            type="button"
            onClick={() => insertText('[', '](https://exemplo.com)', 'Texto do link')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Inserir Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors flex items-center gap-1 text-xs"
            title="Inserir Imagem no texto"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-[10px] uppercase font-mono tracking-wider">+ Imagem</span>
          </button>
          <button
            type="button"
            onClick={() => insertText('\n\n---\n\n', '')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-none transition-colors"
            title="Divisor Editorial"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className={`w-full ${activeTab === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800' : ''}`}>
          
          {/* Write Mode */}
          {(activeTab === 'write' || activeTab === 'split') && (
            <textarea
              id="rich-editor-textarea"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Escreva a crítica teatral aqui... Você pode adicionar títulos com '##', citações com '>', e inserir imagens com o botão da barra superior."
              style={{ minHeight }}
              className="w-full bg-black text-zinc-100 p-4 font-mono text-sm leading-relaxed border-none focus:outline-none focus:ring-0 resize-y"
            />
          )}

          {/* Preview Mode */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div 
              style={{ minHeight }} 
              className="p-6 bg-zinc-950 overflow-y-auto max-h-[600px]"
            >
              {value.trim() ? (
                <RichContentRenderer content={value} />
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 text-xs font-mono uppercase tracking-widest py-12">
                  Prévia vazia. Comece a digitar para ver o resultado editorial.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal / Popover to insert Image inside text */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-display uppercase tracking-wider text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Inserir Imagem no Texto
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block uppercase text-zinc-400 font-mono tracking-wider mb-1">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={imgUrlInput}
                  onChange={(e) => setImgUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/foto-espetaculo.jpg"
                  className="w-full bg-black border border-zinc-800 p-2.5 text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-zinc-400 font-mono tracking-wider mb-1">
                  Legenda / Créditos da Foto (Opcional)
                </label>
                <input
                  type="text"
                  value={imgCaptionInput}
                  onChange={(e) => setImgCaptionInput(e.target.value)}
                  placeholder="Ex: Cena do terceiro ato (Foto: Divulgação / Acervo)"
                  className="w-full bg-black border border-zinc-800 p-2.5 text-white focus:border-white focus:outline-none"
                />
              </div>

              {imgUrlInput && (
                <div className="p-2 border border-zinc-850 bg-black max-h-36 overflow-hidden">
                  <img
                    src={imgUrlInput}
                    alt="Preview"
                    className="h-28 w-auto mx-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white uppercase tracking-wider text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imgUrlInput.trim()}
                className="px-4 py-2 bg-white text-black font-semibold uppercase tracking-wider text-xs hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
              >
                Inserir no Texto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

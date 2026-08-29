import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Undo,
  Redo,
  Type,
  Heading,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Baseline,
  Highlighter,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Video,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Minus,
  Table as TableIcon,
  Code,
  CornerDownLeft,
  Eraser,
  Eye,
  Code2,
  Check,
  X,
  Upload,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { RichContentRenderer } from './RichContentRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  label?: string;
  helperText?: string;
  draftKey?: string;
}

const FONT_FAMILIES = [
  { name: 'Padrão Editorial (Serif)', value: '"Newsreader", "Playfair Display", Georgia, serif', sample: 'Newsreader' },
  { name: 'Playfair Display', value: '"Playfair Display", Georgia, serif', sample: 'Playfair Display' },
  { name: 'Garamond Clássica', value: 'Garamond, "EB Garamond", serif', sample: 'Garamond' },
  { name: 'Georgia', value: 'Georgia, serif', sample: 'Georgia' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif', sample: 'Times New Roman' },
  { name: 'Inter / Sem Serifa', value: '"Plus Jakarta Sans", Inter, system-ui, sans-serif', sample: 'Inter Sans' },
  { name: 'Máquina de Escrever (Mono)', value: '"Courier New", Courier, monospace', sample: 'Courier Mono' },
];

const FONT_SIZES = [
  { name: 'Muito Pequeno', px: '12px', label: '12px' },
  { name: 'Pequeno', px: '14px', label: '14px' },
  { name: 'Normal (Padrão)', px: '16px', label: '16px' },
  { name: 'Médio', px: '18px', label: '18px' },
  { name: 'Grande', px: '22px', label: '22px' },
  { name: 'Muito Grande', px: '28px', label: '28px' },
  { name: 'Título Destaque', px: '36px', label: '36px' },
];

const TEXT_STYLES = [
  { name: 'Texto Normal', tag: 'p', desc: 'Parágrafo editorial comum' },
  { name: 'Título 1 (Principal)', tag: 'h1', desc: 'Cabeçalho de grande destaque' },
  { name: 'Título 2 (Seção)', tag: 'h2', desc: 'Divisão de atos / seções' },
  { name: 'Título 3 (Subseção)', tag: 'h3', desc: 'Tópicos específicos' },
  { name: 'Título 4 (Pequeno)', tag: 'h4', desc: 'Subtítulos menores' },
  { name: 'Subtítulo Editorial', tag: 'subtitle', desc: 'Frase de apoio estilizada' },
  { name: 'Citação Teatral', tag: 'blockquote', desc: 'Falas e trechos marcantes' },
];

const COLOR_PALETTE = [
  { name: 'Branco Puro', value: '#ffffff' },
  { name: 'Cinza Claro', value: '#d4d4d8' },
  { name: 'Cinza Médio', value: '#a1a1aa' },
  { name: 'Dourado / Âmbar', value: '#f59e0b' },
  { name: 'Amarelo Ouro', value: '#eab308' },
  { name: 'Laranja Teatral', value: '#f97316' },
  { name: 'Vermelho Carmim', value: '#ef4444' },
  { name: 'Rosa Vivo', value: '#f43f5e' },
  { name: 'Violeta / Púrpura', value: '#a855f7' },
  { name: 'Azul Sereno', value: '#38bdf8' },
  { name: 'Ciano Claro', value: '#22d3ee' },
  { name: 'Verde Esmeralda', value: '#10b981' },
];

const HIGHLIGHT_PALETTE = [
  { name: 'Sem Destaque', value: 'transparent', previewBg: '#18181b' },
  { name: 'Amarelo Marcatexto', value: 'rgba(234, 179, 8, 0.38)', previewBg: '#eab308' },
  { name: 'Verde Suave', value: 'rgba(16, 185, 129, 0.35)', previewBg: '#10b981' },
  { name: 'Azul Translúcido', value: 'rgba(56, 189, 248, 0.35)', previewBg: '#38bdf8' },
  { name: 'Vermelho / Rosa', value: 'rgba(244, 63, 94, 0.35)', previewBg: '#f43f5e' },
  { name: 'Laranja Suave', value: 'rgba(249, 115, 22, 0.35)', previewBg: '#f97316' },
  { name: 'Violeta Suave', value: 'rgba(168, 85, 247, 0.35)', previewBg: '#a855f7' },
  { name: 'Destaque Escuro', value: 'rgba(255, 255, 255, 0.15)', previewBg: '#52525b' },
];

const EMOJI_LIST = [
  '🎭', '🎬', '🎟️', '👏', '⭐', '✨', '🏛️', '🎪', '🎙️', '🎶',
  '🖋️', '📖', '💡', '🔍', '📌', '📜', '⚖️', '💬', '💭', '📝',
  '👁️', '🔥', '❤️', '🙌', '🤔', '😮', '🤩', '🍷', '🥀', '🕯️'
];

const SPECIAL_CHARS = [
  { label: 'Travessão (—)', value: '—' },
  { label: 'Meia-risca (–)', value: '–' },
  { label: 'Aspas Inglesas (“ ”)', value: '“ ”' },
  { label: 'Aspas Simples (‘ ’)', value: '‘ ’' },
  { label: 'Copyright (©)', value: '©' },
  { label: 'Marca Reg. (®)', value: '®' },
  { label: 'Trademark (™)', value: '™' },
  { label: 'Parágrafo (§)', value: '§' },
  { label: 'Marcador (•)', value: '•' },
  { label: 'Cruz (†)', value: '†' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  minHeight = '420px',
  label = 'Conteúdo do Artigo / Crítica',
  helperText = 'Editor completo estilo Blogger com formatação tipográfica, imagens, vídeos, cores, tabelas e modo HTML.',
  draftKey = 'olhares_draft_autosave'
}) => {
  const [editorMode, setEditorMode] = useState<'visual' | 'html' | 'preview'>('visual');
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Active styles labels for dropdown displays
  const [currentFontName, setCurrentFontName] = useState('Fonte');
  const [currentFontSize, setCurrentFontSize] = useState('Tamanho');
  const [currentStyleName, setCurrentStyleName] = useState('Estilo');
  const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('transparent');

  // Custom Color Input
  const [customTextColor, setCustomTextColor] = useState('#f59e0b');
  const [customBgColor, setCustomBgColor] = useState('#eab308');

  // Link Modal State
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  // Image Modal State
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [imgSize, setImgSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium');
  const [imgAlign, setImgAlign] = useState<'center' | 'left' | 'right'>('center');

  // Video Modal State
  const [videoUrl, setVideoUrl] = useState('');

  // Table Modal State
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeader, setTableHeader] = useState(true);

  // Autosave State
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasDraftToRestore, setHasDraftToRestore] = useState(false);

  // Active Formatting Indicators
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarContainerRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isInternalChangeRef = useRef(false);

  // Save current DOM selection
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  // Find enclosing block element (p, h1, h2, h3, h4, blockquote, etc.)
  const getBlockParent = (node: Node | null): HTMLElement | null => {
    let current = node;
    while (current && current !== editorRef.current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const tag = (current as HTMLElement).tagName.toLowerCase();
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'div'].includes(tag)) {
          return current as HTMLElement;
        }
      }
      current = current.parentNode;
    }
    return null;
  };

  // Restore DOM selection
  const restoreSelection = (): Range | null => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
      return savedSelectionRef.current;
    }
    if (sel && sel.rangeCount > 0) {
      return sel.getRangeAt(0);
    }
    return null;
  };

  // Select an entire element and maintain active selection range
  const selectElement = (el: HTMLElement) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.addRange(range);
      savedSelectionRef.current = range.cloneRange();
    }
  };

  // Auto-expand to word if selection is collapsed
  const expandToWordOrBlockIfCollapsed = (sel: Selection): Range | null => {
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return range;

    const node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const text = node.textContent;
      const offset = range.startOffset;
      let start = offset;
      while (start > 0 && /\S/.test(text[start - 1])) {
        start--;
      }
      let end = offset;
      while (end < text.length && /\S/.test(text[end])) {
        end++;
      }
      if (start < end) {
        const newRange = document.createRange();
        newRange.setStart(node, start);
        newRange.setEnd(node, end);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedSelectionRef.current = newRange.cloneRange();
        return newRange;
      }
    }
    return range;
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarContainerRef.current && !toolbarContainerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update active format indicators
  const checkActiveFormats = useCallback(() => {
    if (editorMode !== 'visual') return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
      saveSelection();

      // Detect font, size, and style of current selection
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const node = sel.anchorNode;
        if (node && editorRef.current.contains(node)) {
          const elem = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
          if (elem) {
            const block = getBlockParent(elem);
            if (block) {
              const tag = block.tagName.toLowerCase();
              if (block.classList.contains('editorial-subtitle')) {
                setCurrentStyleName('Subtítulo');
              } else if (tag === 'h1') {
                setCurrentStyleName('Título 1');
              } else if (tag === 'h2') {
                setCurrentStyleName('Título 2');
              } else if (tag === 'h3') {
                setCurrentStyleName('Título 3');
              } else if (tag === 'h4') {
                setCurrentStyleName('Título 4');
              } else if (tag === 'blockquote') {
                setCurrentStyleName('Citação');
              } else {
                setCurrentStyleName('Parágrafo');
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }, [editorMode]);

  // Initial Sync into contentEditable div
  useEffect(() => {
    if (editorRef.current && editorMode === 'visual') {
      if (!isInternalChangeRef.current) {
        let initialHtml = value || '';
        if (initialHtml && !/<[a-z][\s\S]*>/i.test(initialHtml)) {
          initialHtml = initialHtml
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br/>');
          initialHtml = `<p>${initialHtml}</p>`;
        }
        editorRef.current.innerHTML = initialHtml;
      }
    }
    isInternalChangeRef.current = false;
  }, [value, editorMode]);

  // Check autosave cache
  useEffect(() => {
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft && draft.trim() && draft !== value) {
        setHasDraftToRestore(true);
      }
    } catch {
      // ignore
    }
  }, [draftKey, value]);

  // Debounced Autosave
  useEffect(() => {
    if (!value || value.trim().length === 0) return;
    setAutosaveStatus('saving');

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, value);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(timeStr);
        setAutosaveStatus('saved');
      } catch (err) {
        console.warn('Autosave error:', err);
        setAutosaveStatus('idle');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [value, draftKey]);

  // Content change callback
  const handleContentChange = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    checkActiveFormats();
  };

  // Generic execCommand with focus & selection protection
  const execCmd = (command: string, val: string | undefined = undefined) => {
    if (editorMode !== 'visual') return;
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, val);
    saveSelection();
    handleContentChange();
    checkActiveFormats();
  };

  // Robust Inline Style Applicator (for Font Size, Font Family, Colors) with seamless selection retention
  const applySpanStyle = (styleProp: 'fontSize' | 'fontFamily' | 'color' | 'backgroundColor', styleValue: string) => {
    if (editorMode !== 'visual' || !editorRef.current) return;
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = expandToWordOrBlockIfCollapsed(sel);
    if (!range) return;

    // Check if the selection is already inside an existing styled span we can directly modify
    let targetSpan: HTMLElement | null = null;
    const startParent = range.startContainer.nodeType === Node.ELEMENT_NODE 
      ? (range.startContainer as HTMLElement) 
      : range.startContainer.parentElement;

    if (
      startParent && 
      startParent.tagName === 'SPAN' && 
      editorRef.current.contains(startParent) &&
      (startParent.textContent?.trim() === range.toString().trim() || range.collapsed)
    ) {
      targetSpan = startParent;
    }

    if (targetSpan) {
      if (styleProp === 'fontSize') targetSpan.style.fontSize = styleValue;
      if (styleProp === 'fontFamily') targetSpan.style.fontFamily = styleValue;
      if (styleProp === 'color') targetSpan.style.color = styleValue;
      if (styleProp === 'backgroundColor') {
        if (styleValue === 'transparent') {
          targetSpan.style.backgroundColor = 'transparent';
          targetSpan.style.padding = '';
          targetSpan.style.borderRadius = '';
        } else {
          targetSpan.style.backgroundColor = styleValue;
          targetSpan.style.padding = '0.1rem 0.3rem';
          targetSpan.style.borderRadius = '2px';
        }
      }
      selectElement(targetSpan);
      handleContentChange();
      return;
    }

    // Apply to selected range without losing selection
    if (!range.collapsed) {
      try {
        const contents = range.extractContents();
        const span = document.createElement('span');

        if (styleProp === 'fontSize') span.style.fontSize = styleValue;
        if (styleProp === 'fontFamily') span.style.fontFamily = styleValue;
        if (styleProp === 'color') span.style.color = styleValue;
        if (styleProp === 'backgroundColor') {
          if (styleValue !== 'transparent') {
            span.style.backgroundColor = styleValue;
            span.style.padding = '0.1rem 0.3rem';
            span.style.borderRadius = '2px';
          }
        }

        span.appendChild(contents);
        range.insertNode(span);

        // Keep newly styled span selected!
        selectElement(span);
        handleContentChange();
        return;
      } catch (e) {
        console.warn('Error applying inline style:', e);
      }
    }

    // Fallback
    document.execCommand('styleWithCSS', false, 'true');
    if (styleProp === 'color') document.execCommand('foreColor', false, styleValue);
    if (styleProp === 'backgroundColor') document.execCommand('hiliteColor', false, styleValue);
    if (styleProp === 'fontFamily') document.execCommand('fontName', false, styleValue);
    if (styleProp === 'fontSize') document.execCommand('fontSize', false, styleValue);
    saveSelection();
    handleContentChange();
  };

  // Apply Heading / Style with automatic block selection retention
  const handleStyleChange = (tag: string, name: string) => {
    setActivePopover(null);
    setCurrentStyleName(name);

    if (editorMode !== 'visual' || !editorRef.current) return;
    restoreSelection();

    if (tag === 'subtitle') {
      document.execCommand('formatBlock', false, 'p');
      const sel = window.getSelection();
      const updatedBlock = getBlockParent(sel?.anchorNode || null);
      if (updatedBlock) {
        updatedBlock.className = 'editorial-subtitle font-sans text-xl sm:text-2xl text-zinc-300 font-light italic leading-relaxed my-4';
        selectElement(updatedBlock);
      }
    } else {
      document.execCommand('formatBlock', false, tag);
      const sel = window.getSelection();
      const updatedBlock = getBlockParent(sel?.anchorNode || null);
      if (updatedBlock) {
        if (tag !== 'p' || updatedBlock.classList.contains('editorial-subtitle')) {
          updatedBlock.classList.remove('editorial-subtitle');
        }
        // Keep the block selected so the user can immediately change font/size/color!
        selectElement(updatedBlock);
      }
    }

    handleContentChange();
    checkActiveFormats();
  };

  // Apply Font Family
  const handleFontChange = (fontValue: string, fontName: string) => {
    setActivePopover(null);
    setCurrentFontName(fontName);
    applySpanStyle('fontFamily', fontValue);
  };

  // Apply Font Size
  const handleFontSizeChange = (px: string, labelText: string) => {
    setActivePopover(null);
    setCurrentFontSize(labelText);
    applySpanStyle('fontSize', px);
  };

  // Apply Text Color
  const handleTextColorChange = (color: string) => {
    setActivePopover(null);
    setSelectedTextColor(color);
    applySpanStyle('color', color);
  };

  // Apply Highlight Color
  const handleHighlightColorChange = (color: string) => {
    setActivePopover(null);
    setSelectedHighlightColor(color);
    applySpanStyle('backgroundColor', color);
  };

  // Insert Link Action
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    restoreSelection();

    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const displayText = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}"${targetAttr} style="color: #ffffff; text-decoration: underline; text-underline-offset: 4px;">${displayText}</a>`;

    execCmd('insertHTML', linkHtml);
    setLinkUrl('');
    setLinkText('');
    setActivePopover(null);
  };

  // Insert Image Action
  const handleInsertImage = () => {
    if (!imgUrl.trim()) return;
    restoreSelection();

    let sizeStyle = 'max-width: 100%;';
    if (imgSize === 'small') sizeStyle = 'max-width: 320px;';
    if (imgSize === 'medium') sizeStyle = 'max-width: 600px;';
    if (imgSize === 'large') sizeStyle = 'max-width: 900px;';
    if (imgSize === 'full') sizeStyle = 'width: 100%;';

    let alignClass = 'text-center my-8';
    let floatStyle = 'margin: 0 auto; display: block;';
    if (imgAlign === 'left') {
      alignClass = 'float-left mr-6 mb-4 my-2';
      floatStyle = 'display: inline-block;';
    } else if (imgAlign === 'right') {
      alignClass = 'float-right ml-6 mb-4 my-2';
      floatStyle = 'display: inline-block;';
    }

    const figureHtml = `
      <figure class="${alignClass}" style="${floatStyle}">
        <div style="overflow: hidden; border: 1px solid #27272a; background-color: #000000; ${sizeStyle}">
          <img 
            src="${imgUrl.trim()}" 
            alt="${imgAlt.trim() || 'Fotografia editorial de cena'}" 
            loading="lazy" 
            referrerpolicy="no-referrer"
            style="width: 100%; height: auto; object-fit: cover; display: block;" 
          />
        </div>
        ${imgCaption.trim() ? `<figcaption style="font-family: ui-monospace, monospace; font-size: 0.75rem; color: #71717a; text-align: center; margin-top: 0.5rem; font-style: italic;">${imgCaption.trim()}</figcaption>` : ''}
      </figure>
      <p><br/></p>
    `;

    execCmd('insertHTML', figureHtml);
    setImgUrl('');
    setImgAlt('');
    setImgCaption('');
    setActivePopover(null);
  };

  // Handle local image file upload (base64)
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImgUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Insert Video Action
  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;
    restoreSelection();

    let embedUrl = videoUrl.trim();

    if (embedUrl.includes('youtube.com/watch?v=')) {
      const videoId = embedUrl.split('watch?v=')[1]?.split('&')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('youtube.com/shorts/')) {
      const videoId = embedUrl.split('youtube.com/shorts/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('vimeo.com/')) {
      const videoId = embedUrl.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    const videoHtml = `
      <div style="margin: 2rem 0; aspect-ratio: 16/9; width: 100%; overflow: hidden; border: 1px solid #27272a; background-color: #000000;">
        <iframe 
          src="${embedUrl}" 
          style="width: 100%; height: 100%; border: none;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
      <p><br/></p>
    `;

    execCmd('insertHTML', videoHtml);
    setVideoUrl('');
    setActivePopover(null);
  };

  // Insert Table Action
  const handleInsertTable = () => {
    restoreSelection();
    let tableHtml = '<div style="overflow-x: auto; margin: 2rem 0;"><table style="width: 100%; border-collapse: collapse; border: 1px solid #27272a; background-color: #09090b; font-size: 0.875rem;">';

    if (tableHeader) {
      tableHtml += '<thead style="background-color: #18181b; color: #ffffff;"><tr>';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<th style="padding: 0.75rem 1rem; border: 1px solid #27272a; text-align: left;">Coluna ${c + 1}</th>`;
      }
      tableHtml += '</tr></thead>';
    }

    tableHtml += '<tbody>';
    for (let r = 0; r < tableRows; r++) {
      const bg = r % 2 === 0 ? '#09090b' : '#0d0d10';
      tableHtml += `<tr style="background-color: ${bg};">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="padding: 0.75rem 1rem; border: 1px solid #27272a; color: #d4d4d8;">Texto ${r + 1}-${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table></div><p><br/></p>';

    execCmd('insertHTML', tableHtml);
    setActivePopover(null);
  };

  // Insert Special Characters / Emojis
  const handleInsertChar = (char: string) => {
    restoreSelection();
    execCmd('insertHTML', char);
    setActivePopover(null);
  };

  // Insert Code Block
  const handleInsertCodeBlock = () => {
    restoreSelection();
    const codeHtml = `
      <pre style="background-color: #09090b; border: 1px solid #27272a; padding: 1rem; margin: 1.5rem 0; overflow-x: auto;"><code style="font-family: monospace; color: #e4e4e7; font-size: 0.875rem;">// Insira seu texto técnico ou citação teatral aqui...</code></pre>
      <p><br/></p>
    `;
    execCmd('insertHTML', codeHtml);
    setActivePopover(null);
  };

  // Restore Draft
  const handleRestoreDraft = () => {
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        onChange(draft);
        if (editorRef.current) {
          editorRef.current.innerHTML = draft;
        }
        setHasDraftToRestore(false);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div id="rich-text-editor-container" className="w-full space-y-2 select-none-toolbar">
      
      {/* Header Bar: Label, Autosave Status & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-wider font-semibold text-white">
            {label}
          </label>

          {/* Autosave Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {autosaveStatus === 'saving' && (
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Salvando...
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Salvo {lastSavedTime ? `às ${lastSavedTime}` : ''}
              </span>
            )}
            {hasDraftToRestore && (
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="ml-2 px-2 py-0.5 bg-amber-950/60 border border-amber-600/60 text-amber-300 hover:bg-amber-900 text-[10px] uppercase font-mono tracking-wider cursor-pointer"
                title="Existe um rascunho salvo no seu navegador para este artigo"
              >
                Restaurar rascunho anterior
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher: Visual (WYSIWYG) / HTML Code / Preview */}
        <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
          <button
            type="button"
            id="editor-btn-mode-visual"
            onClick={() => setEditorMode('visual')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] transition-colors ${
              editorMode === 'visual' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            title="Editor Visual (WYSIWYG)"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Visual</span>
          </button>

          <button
            type="button"
            id="editor-btn-mode-html"
            onClick={() => setEditorMode('html')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] transition-colors ${
              editorMode === 'html' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            title="Editor de Código HTML (<>)"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML (&lt;&gt;)</span>
          </button>

          <button
            type="button"
            id="editor-btn-mode-preview"
            onClick={() => setEditorMode('preview')}
            className={`px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] transition-colors ${
              editorMode === 'preview' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
            title="Prévia do Artigo Publicado"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Prévia</span>
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-zinc-500 font-light">{helperText}</p>
      )}

      {/* Main Box Container */}
      <div className="border border-zinc-800 bg-zinc-950 flex flex-col relative shadow-2xl">
        
        {/* =========================================================================
            BLOGGER-INSPIRED FULL FORMATTING TOOLBAR
           ========================================================================= */}
        {editorMode === 'visual' && (
          <div 
            id="blogger-toolbar" 
            ref={toolbarContainerRef}
            className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 relative z-30 select-none"
          >
            
            {/* 1. DESFAZER & REFAZER */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                id="toolbar-undo"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('undo')}
                className="p-1.5 hover:bg-zinc-800 hover:text-white text-zinc-300 transition-colors cursor-pointer"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-redo"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('redo')}
                className="p-1.5 hover:bg-zinc-800 hover:text-white text-zinc-300 transition-colors cursor-pointer border-l border-zinc-800"
                title="Refazer (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 2. FONTE (Font Family Dropdown) */}
            <div className="relative">
              <button
                type="button"
                id="toolbar-font-family"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'font' ? null : 'font');
                }}
                className={`px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 text-zinc-200 border ${
                  activePopover === 'font' ? 'border-white bg-zinc-800 text-white' : 'border-zinc-800'
                } transition-colors cursor-pointer`}
                title="Escolher Família da Fonte"
              >
                <Type className="w-3.5 h-3.5 text-zinc-400" />
                <span className="max-w-[90px] truncate">{currentFontName}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {activePopover === 'font' && (
                <div 
                  id="popover-font-family"
                  className="absolute left-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 w-64 space-y-1 animate-in fade-in zoom-in-95"
                >
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono text-zinc-400 tracking-wider border-b border-zinc-800 flex items-center justify-between">
                    <span>Família de Fontes</span>
                    <button 
                      type="button" 
                      onClick={() => setActivePopover(null)} 
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  {FONT_FAMILIES.map(f => (
                    <button
                      key={f.name}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleFontChange(f.value, f.sample)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer flex items-center justify-between group rounded-none"
                    >
                      <span style={{ fontFamily: f.value }} className="text-sm font-medium">
                        {f.name}
                      </span>
                      {currentFontName === f.sample && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. TAMANHO DO TEXTO (Font Size Dropdown) */}
            <div className="relative">
              <button
                type="button"
                id="toolbar-font-size"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'size' ? null : 'size');
                }}
                className={`px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 text-zinc-200 border ${
                  activePopover === 'size' ? 'border-white bg-zinc-800 text-white' : 'border-zinc-800'
                } transition-colors cursor-pointer`}
                title="Escolher Tamanho do Texto"
              >
                <span className="text-xs font-bold text-zinc-400">Aa</span>
                <span>{currentFontSize}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {activePopover === 'size' && (
                <div 
                  id="popover-font-size"
                  className="absolute left-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 w-52 space-y-1 animate-in fade-in zoom-in-95"
                >
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono text-zinc-400 tracking-wider border-b border-zinc-800 flex items-center justify-between">
                    <span>Tamanho do Texto</span>
                    <button 
                      type="button" 
                      onClick={() => setActivePopover(null)} 
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  {FONT_SIZES.map(s => (
                    <button
                      key={s.px}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleFontSizeChange(s.px, s.label)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <span style={{ fontSize: s.px }} className="leading-none text-zinc-200 group-hover:text-white">
                        {s.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                        {s.px}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. ESTILO / TÍTULOS (Format Block) */}
            <div className="relative">
              <button
                type="button"
                id="toolbar-text-style"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'style' ? null : 'style');
                }}
                className={`px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 text-zinc-200 border ${
                  activePopover === 'style' ? 'border-white bg-zinc-800 text-white' : 'border-zinc-800'
                } transition-colors cursor-pointer`}
                title="Estilo de Parágrafo / Títulos"
              >
                <Heading className="w-3.5 h-3.5 text-zinc-400" />
                <span className="max-w-[80px] truncate">{currentStyleName}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {activePopover === 'style' && (
                <div 
                  id="popover-text-style"
                  className="absolute left-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 w-60 space-y-1 animate-in fade-in zoom-in-95"
                >
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono text-zinc-400 tracking-wider border-b border-zinc-800 flex items-center justify-between">
                    <span>Estrutura do Texto</span>
                    <button 
                      type="button" 
                      onClick={() => setActivePopover(null)} 
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  {TEXT_STYLES.map(st => (
                    <button
                      key={st.name}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleStyleChange(st.tag, st.name)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer flex flex-col"
                    >
                      <div className="flex items-center justify-between font-medium text-white">
                        <span>{st.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">&lt;{st.tag}&gt;</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-light">{st.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 5. NEGRITO, ITÁLICO, SUBLINHADO, TACHADO */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                id="toolbar-bold"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('bold')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer ${
                  activeFormats.bold ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:text-white'
                }`}
                title="Negrito (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-italic"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('italic')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.italic ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Itálico (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-underline"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('underline')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.underline ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Sublinhado (Ctrl+U)"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-strike"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('strikeThrough')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.strikeThrough ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Tachado / Riscado"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 6. COR DO TEXTO (Text Color Dropdown) */}
            <div className="relative">
              <button
                type="button"
                id="toolbar-text-color"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'textColor' ? null : 'textColor');
                }}
                className={`px-2 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border ${
                  activePopover === 'textColor' ? 'border-white bg-zinc-800 text-white' : 'border-zinc-800'
                } transition-colors cursor-pointer flex items-center gap-1`}
                title="Cor do Texto"
              >
                <div className="flex flex-col items-center">
                  <Baseline className="w-3.5 h-3.5" />
                  <div 
                    className="w-3.5 h-1 mt-0.5 border border-zinc-700" 
                    style={{ backgroundColor: selectedTextColor }} 
                  />
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {activePopover === 'textColor' && (
                <div 
                  id="popover-text-color"
                  className="absolute left-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-3 w-64 space-y-2.5 animate-in fade-in zoom-in-95"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-[11px] uppercase font-mono text-zinc-300 font-bold">
                      Cor do Texto
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setActivePopover(null)} 
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Palette Grid */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleTextColorChange(c.value)}
                        style={{ backgroundColor: c.value }}
                        className="w-8 h-8 border border-zinc-700 hover:scale-110 hover:border-white transition-all cursor-pointer flex items-center justify-center"
                        title={c.name}
                      >
                        {selectedTextColor === c.value && (
                          <Check className={`w-3.5 h-3.5 ${c.value === '#ffffff' || c.value === '#d4d4d8' || c.value === '#eab308' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTextColor}
                        onChange={(e) => {
                          setCustomTextColor(e.target.value);
                          handleTextColorChange(e.target.value);
                        }}
                        className="w-7 h-7 bg-transparent border border-zinc-700 cursor-pointer"
                        title="Seletor de cor livre"
                      />
                      <span className="text-[11px] font-mono text-zinc-400">Personalizada</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{customTextColor.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 7. MARCADOR / DESTAQUE (Highlight Color Dropdown) */}
            <div className="relative">
              <button
                type="button"
                id="toolbar-highlight-color"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'highlightColor' ? null : 'highlightColor');
                }}
                className={`px-2 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border ${
                  activePopover === 'highlightColor' ? 'border-white bg-zinc-800 text-white' : 'border-zinc-800'
                } transition-colors cursor-pointer flex items-center gap-1`}
                title="Cor de Destaque / Fundo (Marcador)"
              >
                <div className="flex flex-col items-center">
                  <Highlighter className="w-3.5 h-3.5" />
                  <div 
                    className="w-3.5 h-1 mt-0.5 border border-zinc-700" 
                    style={{ backgroundColor: selectedHighlightColor === 'transparent' ? '#27272a' : selectedHighlightColor }} 
                  />
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {activePopover === 'highlightColor' && (
                <div 
                  id="popover-highlight-color"
                  className="absolute left-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-3 w-64 space-y-2.5 animate-in fade-in zoom-in-95"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-[11px] uppercase font-mono text-zinc-300 font-bold">
                      Marcador de Fundo
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setActivePopover(null)} 
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {HIGHLIGHT_PALETTE.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleHighlightColorChange(c.value)}
                        style={{ backgroundColor: c.previewBg }}
                        className="h-8 border border-zinc-700 hover:scale-105 hover:border-white transition-all cursor-pointer flex items-center justify-center text-[10px] font-mono text-black font-bold"
                        title={c.name}
                      >
                        {c.value === 'transparent' ? (
                          <span className="text-zinc-400">Nenhum</span>
                        ) : selectedHighlightColor === c.value ? (
                          <Check className="w-3.5 h-3.5 text-black" />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  {/* Custom Background Color Picker */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customBgColor}
                        onChange={(e) => {
                          setCustomBgColor(e.target.value);
                          handleHighlightColorChange(e.target.value);
                        }}
                        className="w-7 h-7 bg-transparent border border-zinc-700 cursor-pointer"
                        title="Seletor de cor de fundo livre"
                      />
                      <span className="text-[11px] font-mono text-zinc-400">Personalizado</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{customBgColor.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 8. INSERIR MÍDIAS (Link, Imagem, Vídeo) */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800">
              
              {/* Link Button */}
              <button
                type="button"
                id="toolbar-insert-link"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  const selText = window.getSelection()?.toString() || '';
                  setLinkText(selText);
                  setActivePopover(activePopover === 'link' ? null : 'link');
                }}
                className={`p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer ${
                  activePopover === 'link' ? 'bg-zinc-800 text-white' : ''
                }`}
                title="Inserir / Editar Link (Ctrl+K)"
              >
                <LinkIcon className="w-4 h-4" />
              </button>

              {/* Imagem Button */}
              <button
                type="button"
                id="toolbar-insert-image"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'image' ? null : 'image');
                }}
                className={`p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800 ${
                  activePopover === 'image' ? 'bg-zinc-800 text-white' : ''
                }`}
                title="Inserir Imagem / Fotografia"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Vídeo Button */}
              <button
                type="button"
                id="toolbar-insert-video"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'video' ? null : 'video');
                }}
                className={`p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800 ${
                  activePopover === 'video' ? 'bg-zinc-800 text-white' : ''
                }`}
                title="Inserir Vídeo (YouTube / Vimeo)"
              >
                <Video className="w-4 h-4" />
              </button>

              {/* Tabela Button */}
              <button
                type="button"
                id="toolbar-insert-table"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'table' ? null : 'table');
                }}
                className={`p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800 ${
                  activePopover === 'table' ? 'bg-zinc-800 text-white' : ''
                }`}
                title="Inserir Tabela"
              >
                <TableIcon className="w-4 h-4" />
              </button>

              {/* Emojis Button */}
              <button
                type="button"
                id="toolbar-emojis"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'emojis' ? null : 'emojis');
                }}
                className={`p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800 ${
                  activePopover === 'emojis' ? 'bg-zinc-800 text-white' : ''
                }`}
                title="Inserir Emoji Teatral"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Símbolos Especiais */}
              <button
                type="button"
                id="toolbar-special-chars"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setActivePopover(activePopover === 'specialChars' ? null : 'specialChars');
                }}
                className={`p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800 ${
                  activePopover === 'specialChars' ? 'bg-zinc-800 text-white' : ''
                }`}
                title="Caracteres Tipográficos (—, ©, “ ”)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 9. ALINHAMENTO (Left, Center, Right, Justify) */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                id="toolbar-align-left"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyLeft')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer ${
                  activeFormats.justifyLeft ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Alinhar à Esquerda"
              >
                <AlignLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-align-center"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyCenter')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.justifyCenter ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Centralizar"
              >
                <AlignCenter className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-align-right"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyRight')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.justifyRight ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Alinhar à Direita"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-align-justify"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyFull')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.justifyFull ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Justificar"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 10. LISTAS E RECUOS */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                id="toolbar-bullet-list"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('insertUnorderedList')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer ${
                  activeFormats.insertUnorderedList ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Lista com Marcadores"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-ordered-list"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('insertOrderedList')}
                className={`p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ${
                  activeFormats.insertOrderedList ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Lista Numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-outdent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('outdent')}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800"
                title="Diminuir Recuo"
              >
                <Outdent className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-indent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('indent')}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800"
                title="Aumentar Recuo"
              >
                <Indent className="w-4 h-4" />
              </button>
            </div>

            <div className="w-[1px] h-5 bg-zinc-700 mx-0.5" />

            {/* 11. CITAÇÃO, DIVISOR, CÓDIGO & LIMPAR */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                id="toolbar-blockquote"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleStyleChange('blockquote', 'Citação')}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Bloco de Citação em Destaque"
              >
                <Quote className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-hr"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('insertHorizontalRule')}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800"
                title="Linha Divisora Horizontal"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-code-block"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleInsertCodeBlock}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-l border-zinc-800"
                title="Bloco de Código"
              >
                <Code className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="toolbar-clear-format"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('removeFormat')}
                className="p-1.5 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer border-l border-zinc-800"
                title="Limpar Formatação do Texto Selecionado"
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* =====================================================================
                FLOATING POPOVERS (LINK, IMAGE, VIDEO, TABLE, EMOJIS, SPECIAL CHARS)
               ===================================================================== */}

            {/* LINK POPOVER */}
            {activePopover === 'link' && (
              <div 
                id="popover-link-modal"
                className="absolute left-2 sm:left-48 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-4 w-72 sm:w-80 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                    Inserir / Editar Link
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Texto de Exibição</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Ex: Companhia Teatral..."
                    className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">URL de Destino *</label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:border-white focus:outline-none font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="w-3.5 h-3.5 accent-white"
                  />
                  <span>Abrir link em nova aba</span>
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCmd('unlink');
                      setActivePopover(null);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Unlink className="w-3 h-3" />
                    Remover link
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleInsertLink}
                    disabled={!linkUrl.trim()}
                    className="px-3.5 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 disabled:opacity-40 cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}

            {/* IMAGE POPOVER */}
            {activePopover === 'image' && (
              <div 
                id="popover-image-modal"
                className="absolute left-2 sm:left-60 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-4 w-80 sm:w-96 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                    Inserir Fotografia de Cena
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">URL da Imagem</label>
                  <input
                    type="url"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://exemplo.com/cena.jpg"
                    className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:border-white focus:outline-none font-mono"
                  />
                </div>

                {/* Local Upload */}
                <div className="border border-dashed border-zinc-800 p-2.5 text-center bg-black/40 hover:border-zinc-600 transition-colors">
                  <label className="cursor-pointer text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload direto do computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Dimensão</label>
                    <select
                      value={imgSize}
                      onChange={(e) => setImgSize(e.target.value as any)}
                      className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:outline-none font-mono"
                    >
                      <option value="small">Pequena (320px)</option>
                      <option value="medium">Média (600px)</option>
                      <option value="large">Grande (900px)</option>
                      <option value="full">Largura Total (100%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Posicionamento</label>
                    <select
                      value={imgAlign}
                      onChange={(e) => setImgAlign(e.target.value as any)}
                      className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:outline-none font-mono"
                    >
                      <option value="center">Centralizada</option>
                      <option value="left">Flutuante à Esquerda</option>
                      <option value="right">Flutuante à Direita</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Legenda / Créditos da Fotografia</label>
                  <input
                    type="text"
                    value={imgCaption}
                    onChange={(e) => setImgCaption(e.target.value)}
                    placeholder="Ex: Cena do 2º Ato (Foto: João / Divulgação)"
                    className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Texto Alternativo (ALT)</label>
                  <input
                    type="text"
                    value={imgAlt}
                    onChange={(e) => setImgAlt(e.target.value)}
                    placeholder="Descrição para acessibilidade"
                    className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:border-white focus:outline-none"
                  />
                </div>

                {imgUrl && (
                  <div className="p-2 bg-black border border-zinc-800 max-h-28 overflow-hidden flex items-center justify-center">
                    <img src={imgUrl} alt="Preview" className="max-h-24 w-auto object-contain" />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleInsertImage}
                    disabled={!imgUrl.trim()}
                    className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 disabled:opacity-40 cursor-pointer"
                  >
                    Inserir Imagem
                  </button>
                </div>
              </div>
            )}

            {/* VIDEO POPOVER */}
            {activePopover === 'video' && (
              <div 
                id="popover-video-modal"
                className="absolute left-2 sm:left-72 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-4 w-80 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-zinc-400" />
                    Inserir Vídeo
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Link do Vídeo (YouTube, Shorts ou Vimeo)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-black border border-zinc-800 text-white p-2 text-xs focus:border-white focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Renderiza em player responsivo 16:9 de alta definição.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleInsertVideo}
                    disabled={!videoUrl.trim()}
                    className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 disabled:opacity-40 cursor-pointer"
                  >
                    Inserir Player
                  </button>
                </div>
              </div>
            )}

            {/* TABLE POPOVER */}
            {activePopover === 'table' && (
              <div 
                id="popover-table-modal"
                className="absolute left-2 sm:left-80 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-4 w-72 space-y-3 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-zinc-400" />
                    Inserir Tabela
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Linhas</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={tableRows}
                      onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-black border border-zinc-800 text-white p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Colunas</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={tableCols}
                      onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-black border border-zinc-800 text-white p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tableHeader}
                    onChange={(e) => setTableHeader(e.target.checked)}
                    className="w-3.5 h-3.5 accent-white"
                  />
                  <span>Incluir cabeçalho estilizado</span>
                </label>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleInsertTable}
                    className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 cursor-pointer"
                  >
                    Inserir Tabela
                  </button>
                </div>
              </div>
            )}

            {/* EMOJIS POPOVER */}
            {activePopover === 'emojis' && (
              <div 
                id="popover-emojis-modal"
                className="absolute left-2 sm:left-96 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-3 w-64 space-y-2 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-[11px] uppercase font-mono text-zinc-300 font-bold">
                    Emojis Teatrais & Crítica
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1 text-lg">
                  {EMOJI_LIST.map((em, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertChar(em)}
                      className="p-1.5 hover:bg-zinc-800 transition-transform text-center cursor-pointer hover:scale-125"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SPECIAL CHARS POPOVER */}
            {activePopover === 'specialChars' && (
              <div 
                id="popover-special-chars-modal"
                className="absolute right-2 sm:right-auto sm:left-96 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 shadow-2xl p-3 w-72 space-y-2 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-[11px] uppercase font-mono text-zinc-300 font-bold">
                    Caracteres Tipográficos
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPECIAL_CHARS.map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertChar(c.value)}
                      className="p-2 bg-black border border-zinc-800 hover:border-zinc-500 text-left text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            EDITOR CONTENT BODY (WYSIWYG / HTML / PREVIEW)
           ========================================================================= */}
        <div className="w-full relative z-10">
          
          {/* 1. Visual WYSIWYG Editor (ContentEditable) */}
          {editorMode === 'visual' && (
            <div
              id="rich-editor-visual"
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onKeyUp={checkActiveFormats}
              onMouseUp={checkActiveFormats}
              style={{ minHeight }}
              className="editorial-rich-editor-content w-full bg-black text-zinc-100 p-6 sm:p-8 font-serif text-base sm:text-lg leading-relaxed focus:outline-none overflow-y-auto"
              data-placeholder="Comece a escrever o texto aqui... Selecione qualquer palavra ou frase e use as ferramentas da barra superior para trocar fontes, tamanhos, cores de texto e destaques de fundo."
            />
          )}

          {/* 2. HTML Code Editor */}
          {editorMode === 'html' && (
            <div className="w-full bg-zinc-950 p-2">
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-2">
                <span>Modo de Edição HTML Direto (&lt;&gt;)</span>
                <span>As alterações no código são refletidas instantaneamente</span>
              </div>
              <textarea
                id="rich-editor-html-textarea"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={{ minHeight }}
                className="w-full bg-black text-emerald-300 p-4 font-mono text-xs sm:text-sm leading-relaxed border border-zinc-850 focus:border-white focus:outline-none resize-y"
                placeholder="<p>Escreva seu código HTML aqui...</p>"
              />
            </div>
          )}

          {/* 3. Live Published Article Preview */}
          {editorMode === 'preview' && (
            <div 
              style={{ minHeight }} 
              className="p-6 sm:p-10 bg-zinc-950/80 overflow-y-auto"
            >
              <div className="max-w-[780px] mx-auto border-b border-zinc-900 pb-4 mb-8">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500">
                  Prévia em Tempo Real • Visualização do Leitor
                </span>
              </div>
              {value && value.trim() ? (
                <RichContentRenderer content={value} />
              ) : (
                <div className="h-48 flex items-center justify-center text-zinc-600 text-xs font-mono uppercase tracking-widest">
                  Nenhum conteúdo para exibir na prévia.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Editor Bottom Bar */}
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span>Palavras: {(value || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length}</span>
            <span>Caracteres: {(value || '').replace(/<[^>]*>/g, '').length}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Modo: {editorMode.toUpperCase()}</span>
            <span className="text-zinc-600">|</span>
            <span>Olhares da Cena Editor</span>
          </div>
        </div>

      </div>
    </div>
  );
};

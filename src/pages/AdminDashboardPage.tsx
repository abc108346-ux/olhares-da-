import React, { useState, useMemo, useEffect } from 'react';
import { 
  Critica, 
  UserProfile, 
  CategoriaTipo, 
  FichaTecnica as FichaTecnicaType,
  Pagina
} from '../types';
import { 
  saveCriticaToDb, 
  deleteCriticaFromDb, 
  savePaginaToDb,
  deletePaginaFromDb,
  seedDatabaseIfEmpty, 
  logoutAdminUser,
  getHomeSettings,
  saveHomeSettings
} from '../services/firebase';
import { Logo } from '../components/Logo';
import { RichTextEditor } from '../components/RichTextEditor';
import { ImageUploadManager } from '../components/ImageUploadManager';
import { ModalConfirm } from '../components/ModalConfirm';
import { formatDateBr } from '../components/CriticaCard';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Tags, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search, 
  Database, 
  Calendar, 
  Layers, 
  Save, 
  Sparkles, 
  Check, 
  AlertCircle,
  Menu,
  X,
  Loader2,
  CheckCheck,
  FileCode2,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface AdminDashboardPageProps {
  currentUser: UserProfile;
  criticas: Critica[];
  paginas?: Pagina[];
  onCriticasChange: (criticas: Critica[]) => void;
  onPaginasChange?: (paginas: Pagina[]) => void;
  onNavigate: (path: string) => void;
  onSelectCritica: (slug: string) => void;
}

type AdminView = 'dashboard' | 'criticas' | 'nova-critica' | 'editar-critica' | 'paginas' | 'nova-pagina' | 'editar-pagina' | 'categorias' | 'midia' | 'configuracoes' | 'home-settings';

const CATEGORIAS_PADRAO: CategoriaTipo[] = [
  'Teatro',
  'Dança',
  'Performance',
  'Circo',
  'Ópera',
  'Festival',
  'Outros'
];

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  criticas,
  paginas = [],
  onCriticasChange,
  onPaginasChange,
  onNavigate,
  onSelectCritica,
}) => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [editingCriticaId, setEditingCriticaId] = useState<string | null>(null);
  const [editingPaginaId, setEditingPaginaId] = useState<string | null>(null);
  const [searchTable, setSearchTable] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [criticaToDelete, setCriticaToDelete] = useState<Critica | null>(null);
  
  const [deletePaginaModalOpen, setDeletePaginaModalOpen] = useState(false);
  const [paginaToDelete, setPaginaToDelete] = useState<Pagina | null>(null);

  // Pagina Form State
  const [paginaFormData, setPaginaFormData] = useState<{
    titulo: string;
    slug: string;
    resumo: string;
    conteudo: string;
    imagemPrincipal: string;
    publicada: boolean;
    mostrarNoHeader: boolean;
    ordemHeader: number;
    mostrarNoFooter: boolean;
    ordemFooter: number;
  }>({
    titulo: '',
    slug: '',
    resumo: '',
    conteudo: '',
    imagemPrincipal: '',
    publicada: true,
    mostrarNoHeader: false,
    ordemHeader: 0,
    mostrarNoFooter: false,
    ordemFooter: 0,
  });

  // Form State
  const [formData, setFormData] = useState<{
    titulo: string;
    slug: string;
    resumo: string;
    conteudo: string;
    autor: string;
    categoria: CategoriaTipo;
    tags: string;
    dataPublicacao: string;
    imagemPrincipal: string;
    legendaImagemPrincipal: string;
    imagensAdicionais: string[];
    publicada: boolean;
    destaque: boolean;
    nomeEspetaculo: string;
    companhia: string;
    cidade: string;
    estado: string;
    fichaTecnica: FichaTecnicaType;
  }>({
    titulo: '',
    slug: '',
    resumo: '',
    conteudo: '',
    autor: currentUser.displayName || 'Marcelo Manique',
    categoria: 'Teatro',
    tags: 'teatro, critica, 2026',
    dataPublicacao: new Date().toISOString().split('T')[0],
    imagemPrincipal: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
    legendaImagemPrincipal: '',
    imagensAdicionais: [],
    publicada: true,
    destaque: false,
    nomeEspetaculo: '',
    companhia: '',
    cidade: 'Porto Alegre',
    estado: 'RS',
    fichaTecnica: {
      elenco: '',
      direcao: '',
      texto: '',
      dramaturgia: '',
      cenografia: '',
      iluminacao: '',
      figurino: '',
      trilhaSonora: '',
      producao: '',
      duracao: '',
      classificacao: '14 anos',
      temporada: '',
    }
  });

  const [homeSettingsFormData, setHomeSettingsFormData] = useState({
    heroImageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEhElA3KqcSpB1S-r4XP-FkCjJEjxjOLu0stZo9jyNzaKsom_FKQtibjmxUTU-WyYpJvyCAqWk-gCSF9-TC0X8AihtdD8nz6UTpM_PLcqEY1wUGxVm4RPqqASBiIgM-RuB5dtoYwf4BlLAoMa0zEFDUiL2wLcODiESPk7Y6RltvXOR7579sZqUb_t4gtcn2O=s910',
    manifestoText: 'A crítica de teatro não é um tribunal de julgamentos sumários, mas o prolongamento da experiência sensível do palco através da escrita e do debate rigoroso.',
    manifestoCaption: 'Olhares da Cena • Arquivo Crítico Teatral'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getHomeSettings();
      if (settings && settings.heroImageUrl && !settings.heroImageUrl.includes('unsplash.com') && !settings.heroImageUrl.includes('postimg.cc')) {
        setHomeSettingsFormData(settings);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveHomeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage(null);
    try {
      await saveHomeSettings(homeSettingsFormData);
      setSaveSuccessMessage('Página inicial atualizada com sucesso!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
      showNotification('Página inicial atualizada', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao atualizar a página', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Dashboard Metrics
  const stats = useMemo(() => {
    const total = criticas.length;
    const published = criticas.filter(c => c.publicada).length;
    const drafts = total - published;
    const sorted = [...criticas].sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
    const lastPublished = sorted.find(c => c.publicada);
    const uniqueCategories = new Set(criticas.map(c => c.categoria)).size;

    return {
      total,
      published,
      drafts,
      lastPublishedDate: lastPublished ? formatDateBr(lastPublished.dataPublicacao) : 'Nenhuma',
      lastPublishedTitle: lastPublished?.titulo || '—',
      totalCategories: uniqueCategories || CATEGORIAS_PADRAO.length,
    };
  }, [criticas]);

  // Filtered list for table
  const tableCriticas = useMemo(() => {
    return criticas
      .filter(c => {
        if (statusFilter === 'published') return c.publicada;
        if (statusFilter === 'draft') return !c.publicada;
        return true;
      })
      .filter(c => {
        if (!searchTable.trim()) return true;
        const term = searchTable.toLowerCase();
        return (
          c.titulo.toLowerCase().includes(term) ||
          c.categoria.toLowerCase().includes(term) ||
          c.nomeEspetaculo?.toLowerCase().includes(term) ||
          c.cidade?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
  }, [criticas, searchTable, statusFilter]);

  // Handle Form Open for New
  const handleOpenNewCritica = () => {
    setEditingCriticaId(null);
    setSaveSuccessMessage(null);
    setIsSaving(false);
    setFormData({
      titulo: '',
      slug: '',
      resumo: '',
      conteudo: '',
      autor: currentUser.displayName || 'Marcelo Manique',
      categoria: 'Teatro',
      tags: 'teatro, critica, 2026',
      dataPublicacao: new Date().toISOString().split('T')[0],
      imagemPrincipal: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
      legendaImagemPrincipal: '',
      imagensAdicionais: [],
      publicada: true,
      destaque: false,
      nomeEspetaculo: '',
      companhia: '',
      cidade: 'Porto Alegre',
      estado: 'RS',
      fichaTecnica: {
        elenco: '',
        direcao: '',
        texto: '',
        dramaturgia: '',
        cenografia: '',
        iluminacao: '',
        figurino: '',
        trilhaSonora: '',
        producao: '',
        duracao: '',
        classificacao: '14 anos',
        temporada: '',
      }
    });
    setActiveView('nova-critica');
  };

  // Handle Form Open for Edit
  const handleOpenEditCritica = (critica: Critica) => {
    setEditingCriticaId(critica.id);
    setSaveSuccessMessage(null);
    setIsSaving(false);
    setFormData({
      titulo: critica.titulo || '',
      slug: critica.slug || '',
      resumo: critica.resumo || '',
      conteudo: critica.conteudo || '',
      autor: critica.autor || currentUser?.displayName || 'Editor(a)',
      categoria: critica.categoria || 'Teatro',
      tags: (critica.tags || []).join(', '),
      dataPublicacao: critica.dataPublicacao || new Date().toISOString().split('T')[0],
      imagemPrincipal: critica.imagemPrincipal || '',
      legendaImagemPrincipal: critica.legendaImagemPrincipal || '',
      imagensAdicionais: critica.imagens || [],
      publicada: critica.publicada || false,
      destaque: Boolean(critica.destaque),
      nomeEspetaculo: critica.nomeEspetaculo || '',
      companhia: critica.companhia || '',
      cidade: critica.cidade || '',
      estado: critica.estado || '',
      fichaTecnica: {
        elenco: critica.fichaTecnica?.elenco || '',
        direcao: critica.fichaTecnica?.direcao || '',
        texto: critica.fichaTecnica?.texto || '',
        dramaturgia: critica.fichaTecnica?.dramaturgia || '',
        cenografia: critica.fichaTecnica?.cenografia || '',
        iluminacao: critica.fichaTecnica?.iluminacao || '',
        figurino: critica.fichaTecnica?.figurino || '',
        trilhaSonora: critica.fichaTecnica?.trilhaSonora || '',
        producao: critica.fichaTecnica?.producao || '',
        duracao: critica.fichaTecnica?.duracao || '',
        classificacao: critica.fichaTecnica?.classificacao || '',
        temporada: critica.fichaTecnica?.temporada || '',
      }
    });
    setActiveView('editar-critica');
  };

  // Pagina Handlers
  const filteredPaginas = useMemo(() => {
    return paginas.filter(p => {
      if (!searchTable.trim()) return true;
      const term = searchTable.toLowerCase();
      return p.titulo.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term);
    }).sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  }, [paginas, searchTable]);

  const handleOpenNewPagina = () => {
    setEditingPaginaId(null);
    setSaveSuccessMessage(null);
    setIsSaving(false);
    setPaginaFormData({
      titulo: '',
      slug: '',
      resumo: '',
      conteudo: '',
      imagemPrincipal: '',
      publicada: true,
      mostrarNoHeader: false,
      ordemHeader: 0,
      mostrarNoFooter: false,
      ordemFooter: 0,
    });
    setActiveView('nova-pagina');
  };

  const handleOpenEditPagina = (pagina: Pagina) => {
    setEditingPaginaId(pagina.id);
    setSaveSuccessMessage(null);
    setIsSaving(false);
    setPaginaFormData({
      titulo: pagina.titulo || '',
      slug: pagina.slug || '',
      resumo: pagina.resumo || '',
      conteudo: pagina.conteudo || '',
      imagemPrincipal: pagina.imagemPrincipal || '',
      publicada: pagina.publicada || false,
      mostrarNoHeader: pagina.mostrarNoHeader || false,
      ordemHeader: pagina.ordemHeader || 0,
      mostrarNoFooter: pagina.mostrarNoFooter || false,
      ordemFooter: pagina.ordemFooter || 0,
    });
    setActiveView('editar-pagina');
  };

  const handleSavePagina = async (asDraft = false) => {
    if (!paginaFormData.titulo.trim()) {
      showNotification('O título da página é obrigatório.', 'error');
      return;
    }

    const finalSlug = paginaFormData.slug.trim() || generateSlug(paginaFormData.titulo);

    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      const isNew = !editingPaginaId;
      const id = editingPaginaId || crypto.randomUUID();

      const newPagina: Pagina = {
        id,
        titulo: paginaFormData.titulo.trim(),
        slug: finalSlug,
        resumo: paginaFormData.resumo.trim(),
        conteudo: paginaFormData.conteudo,
        imagemPrincipal: paginaFormData.imagemPrincipal.trim() || undefined,
        publicada: asDraft ? false : paginaFormData.publicada,
        dataCriacao: isNew ? new Date().toISOString() : paginas.find(p => p.id === id)?.dataCriacao || new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        mostrarNoHeader: paginaFormData.mostrarNoHeader,
        ordemHeader: paginaFormData.ordemHeader,
        mostrarNoFooter: paginaFormData.mostrarNoFooter,
        ordemFooter: paginaFormData.ordemFooter,
      };

      const savedPagina = await savePaginaToDb(newPagina);

      let updatedPaginas;
      if (isNew) {
        updatedPaginas = [savedPagina, ...paginas];
      } else {
        updatedPaginas = paginas.map(p => p.id === savedPagina.id ? savedPagina : p);
      }
      onPaginasChange?.(updatedPaginas);

      if (isNew) {
        setEditingPaginaId(savedPagina.id);
      }

      setSaveSuccessMessage(`Página "${savedPagina.titulo}" ${asDraft ? 'salva como rascunho' : 'publicada'} com sucesso!`);
      showNotification('Página salva com sucesso!', 'success');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error(err);
      showNotification('Erro ao salvar a página. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeletePagina = async () => {
    if (!paginaToDelete) return;
    
    try {
      await deletePaginaFromDb(paginaToDelete.id);
      const updatedList = paginas.filter(p => p.id !== paginaToDelete.id);
      onPaginasChange?.(updatedList);
      showNotification('Página excluída com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao excluir página.', 'error');
    } finally {
      setDeletePaginaModalOpen(false);
      setPaginaToDelete(null);
      if (activeView === 'editar-pagina') {
        setActiveView('paginas');
      }
    }
  };

  // Save Critique Form
  const handleSaveCritica = async (asDraft = false) => {
    if (!formData.titulo.trim()) {
      showNotification('O título da crítica é obrigatório.', 'error');
      return;
    }

    const finalSlug = formData.slug.trim() || generateSlug(formData.titulo);
    const parsedTags = formData.tags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newCritica: Critica = {
      id: editingCriticaId || `critica-${finalSlug}-${Date.now().toString().slice(-4)}`,
      titulo: formData.titulo.trim(),
      slug: finalSlug,
      resumo: formData.resumo.trim(),
      conteudo: formData.conteudo.trim(),
      autor: formData.autor.trim() || 'Equipe Olhares da Cena',
      categoria: formData.categoria,
      tags: parsedTags,
      dataPublicacao: formData.dataPublicacao,
      imagemPrincipal: formData.imagemPrincipal.trim() || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
      legendaImagemPrincipal: formData.legendaImagemPrincipal.trim(),
      imagens: formData.imagensAdicionais.filter(Boolean),
      publicada: asDraft ? false : formData.publicada,
      destaque: formData.destaque,
      nomeEspetaculo: formData.nomeEspetaculo.trim() || formData.titulo.trim(),
      companhia: formData.companhia.trim(),
      cidade: formData.cidade.trim(),
      estado: formData.estado.trim(),
      fichaTecnica: formData.fichaTecnica,
    };

    try {
      setIsSaving(true);
      setSaveSuccessMessage(null);

      await saveCriticaToDb(newCritica);
      
      // Update in-memory state
      const updatedList = [...criticas];
      const existingIdx = updatedList.findIndex(c => c.id === newCritica.id);
      if (existingIdx >= 0) {
        updatedList[existingIdx] = newCritica;
      } else {
        updatedList.unshift(newCritica);
      }
      onCriticasChange(updatedList);

      const msg = editingCriticaId 
        ? 'Crítica atualizada com sucesso!' 
        : (asDraft ? 'Rascunho salvo com sucesso!' : 'Crítica criada com sucesso!');
      
      setSaveSuccessMessage(msg);
      showNotification(msg, 'success');

      // Allow user to see the success state on the button and form before returning to table
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccessMessage(null);
        setActiveView('criticas');
      }, 1400);

    } catch (err: any) {
      console.error('Error saving critique:', err);
      setIsSaving(false);
      showNotification('Erro ao salvar crítica. Verifique sua conexão e tente novamente.', 'error');
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (critica: Critica) => {
    const updated: Critica = {
      ...critica,
      publicada: !critica.publicada,
    };
    try {
      await saveCriticaToDb(updated);
      const updatedList = criticas.map(c => c.id === updated.id ? updated : c);
      onCriticasChange(updatedList);
      showNotification(`Crítica ${updated.publicada ? 'publicada' : 'despublicada'} com sucesso.`);
    } catch {
      showNotification('Erro ao alterar status de publicação.', 'error');
    }
  };

  // Delete flow with confirmation modal
  const handleRequestDelete = (critica: Critica) => {
    setCriticaToDelete(critica);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!criticaToDelete) return;
    try {
      await deleteCriticaFromDb(criticaToDelete.id);
      const updatedList = criticas.filter(c => c.id !== criticaToDelete.id);
      onCriticasChange(updatedList);
      showNotification(`Crítica "${criticaToDelete.titulo}" excluída com sucesso.`);
    } catch {
      showNotification('Erro ao excluir crítica.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setCriticaToDelete(null);
    }
  };

  const handleLogout = async () => {
    await logoutAdminUser();
    onNavigate('/');
  };

  const handleSeedData = async () => {
    await seedDatabaseIfEmpty();
    showNotification('Base de dados sincronizada com críticas iniciais!');
  };

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      
      {/* =========================================================================
          1. SIDEBAR NAVIGATION
         ========================================================================= */}
      
      {/* Mobile Top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800">
        <Logo size="sm" />
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-zinc-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-850 flex flex-col justify-between transition-transform duration-300
        md:translate-x-0 md:sticky md:top-0 md:h-screen flex-shrink-0 overflow-y-auto
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Logo Brand */}
          <div className="border-b border-zinc-850 pb-5">
            <Logo size="sm" />
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Painel Administrativo
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 truncate mt-1">
              {currentUser.email}
            </div>
          </div>

          {/* Nav Items with scroll support */}
          <nav className="space-y-1.5 text-xs font-mono uppercase tracking-wider">
            <button
              id="admin-nav-dashboard"
              onClick={() => { setActiveView('dashboard'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'dashboard' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>DASHBOARD</span>
            </button>

            <button
              id="admin-nav-criticas"
              onClick={() => { setActiveView('criticas'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'criticas' || activeView === 'editar-critica' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>CRÍTICAS</span>
            </button>

            <button
              id="admin-nav-nova-critica"
              onClick={() => { handleOpenNewCritica(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'nova-critica' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>NOVA CRÍTICA</span>
            </button>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            <button
              id="admin-nav-paginas"
              onClick={() => { setActiveView('paginas'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'paginas' || activeView === 'editar-pagina' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>PÁGINAS</span>
            </button>

            <button
              id="admin-nav-nova-pagina"
              onClick={() => { handleOpenNewPagina(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'nova-pagina' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>NOVA PÁGINA</span>
            </button>

            <div className="h-px w-full bg-zinc-800 my-2"></div>

            <button
              id="admin-nav-categorias"
              onClick={() => { setActiveView('categorias'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'categorias' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>CATEGORIAS</span>
            </button>

            <button
              id="admin-nav-midia"
              onClick={() => { setActiveView('midia'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'midia' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>MÍDIA / IMAGENS</span>
            </button>

            <button
              id="admin-nav-home-settings"
              onClick={() => { setActiveView('home-settings'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'home-settings' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>PÁGINA INICIAL</span>
            </button>

            <button
              id="admin-nav-config"
              onClick={() => { setActiveView('configuracoes'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                activeView === 'configuracoes' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>CONFIGURAÇÕES</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-zinc-850 space-y-2 flex-shrink-0 bg-zinc-950 sticky bottom-0">
          <button
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white bg-black border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <span>VER SITE PÚBLICO</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>SAIR DO PAINEL</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT & FOOTER COLUMN
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-black">
        <main className="flex-1 p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Notification Toast */}
            {notification && (
              <div className={`fixed top-6 right-6 z-50 p-4 border max-w-md shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 ${
                notification.type === 'success' ? 'bg-zinc-950 border-white text-white' : 'bg-red-950 border-red-700 text-red-100'
              }`}>
                {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                <span className="text-xs font-mono">{notification.message}</span>
              </div>
            )}

        {/* ==========================================================
            VIEW: DASHBOARD
           ========================================================== */}
        {activeView === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                  Visão Geral do Editorial
                </h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Gerenciamento de críticas, reflexões cênicas e estatísticas da plataforma.
                </p>
              </div>

              <button
                id="dashboard-new-critica-btn"
                onClick={handleOpenNewCritica}
                className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>NOVA CRÍTICA</span>
              </button>
            </div>

            {/* Metrics 5-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  TOTAL DE CRÍTICAS
                </span>
                <p className="font-serif text-3xl font-bold text-white">
                  {stats.total}
                </p>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                  PUBLICADAS
                </span>
                <p className="font-serif text-3xl font-bold text-white">
                  {stats.published}
                </p>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">
                  RASCUNHOS
                </span>
                <p className="font-serif text-3xl font-bold text-white">
                  {stats.drafts}
                </p>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  CATEGORIAS
                </span>
                <p className="font-serif text-3xl font-bold text-white">
                  {stats.totalCategories}
                </p>
              </div>

              <div className="p-5 bg-zinc-950 border border-zinc-850 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  ÚLTIMA PUBLICAÇÃO
                </span>
                <p className="font-mono text-xs text-white truncate pt-1">
                  {stats.lastPublishedDate}
                </p>
                <p className="font-serif text-xs text-zinc-400 truncate">
                  {stats.lastPublishedTitle}
                </p>
              </div>
            </div>

            {/* Recent Critiques Table on Dashboard */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <h3 className="font-display uppercase tracking-wider text-xs font-bold text-white">
                  CRÍTICAS RECENTES NO SISTEMA
                </h3>
                <button
                  onClick={() => setActiveView('criticas')}
                  className="text-xs font-mono uppercase text-zinc-400 hover:text-white tracking-wider"
                >
                  Ver Todas ({criticas.length}) →
                </button>
              </div>

              <div className="border border-zinc-850 bg-zinc-950 overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                    <tr>
                      <th className="p-3.5">Título / Espetáculo</th>
                      <th className="p-3.5 whitespace-nowrap">Categoria</th>
                      <th className="p-3.5 whitespace-nowrap">Data</th>
                      <th className="p-3.5 whitespace-nowrap">Status</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {criticas.slice(0, 5).map((critica) => (
                      <tr key={critica.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-3.5 min-w-[240px]">
                          <div className="font-serif font-bold text-sm text-white uppercase">
                            {critica.titulo}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            {critica.nomeEspetaculo} • {critica.cidade || 'RS'}
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-black border border-zinc-800 text-[10px] uppercase font-mono">
                            {critica.categoria}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                          {formatDateBr(critica.dataPublicacao)}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 border ${
                            critica.publicada ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                          }`}>
                            {critica.publicada ? 'Publicada' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleOpenEditCritica(critica)}
                            className="p-1.5 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            title="Editar crítica"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectCritica(critica.slug)}
                            className="p-1.5 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            title="Ver crítica pública"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: CRÍTICAS TABLE & MANAGEMENT
           ========================================================== */}
        {activeView === 'criticas' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                  Gerenciamento de Críticas
                </h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Crie, edite, publique, despublique e organize todo o acervo do Olhares da Cena.
                </p>
              </div>

              <button
                id="table-new-critica-btn"
                onClick={handleOpenNewCritica}
                className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ NOVA CRÍTICA</span>
              </button>
            </div>

            {/* Filter and Search Table Bar */}
            <div className="p-4 bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  placeholder="Filtrar por título, categoria, espetáculo..."
                  className="w-full bg-black text-white pl-9 pr-3 py-2 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-2 border uppercase tracking-wider ${
                    statusFilter === 'all' ? 'bg-white text-black font-bold border-white' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}
                >
                  Todas ({criticas.length})
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-2 border uppercase tracking-wider ${
                    statusFilter === 'published' ? 'bg-white text-black font-bold border-white' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}
                >
                  Publicadas
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-2 border uppercase tracking-wider ${
                    statusFilter === 'draft' ? 'bg-white text-black font-bold border-white' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}
                >
                  Rascunhos
                </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="border border-zinc-850 bg-zinc-950 overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">Mídia</th>
                    <th className="p-3.5">Título</th>
                    <th className="p-3.5 whitespace-nowrap">Categoria</th>
                    <th className="p-3.5 whitespace-nowrap">Data</th>
                    <th className="p-3.5 whitespace-nowrap">Status</th>
                    <th className="p-3.5 text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {tableCriticas.map((critica) => (
                    <tr key={critica.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 w-16">
                        <img
                          src={critica.imagemPrincipal}
                          alt={critica.titulo}
                          className="w-12 h-12 object-cover border border-zinc-800 bg-black"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                      </td>
                      <td className="p-3.5 min-w-[260px]">
                        <div className="font-serif font-bold text-sm text-white uppercase">
                          {critica.titulo}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-light line-clamp-1 mt-0.5">
                          {critica.resumo}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          slug: /{critica.slug}
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-black border border-zinc-800 text-[10px] uppercase font-mono text-zinc-300">
                          {critica.categoria}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {formatDateBr(critica.dataPublicacao)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(critica)}
                          className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-1 border transition-colors cursor-pointer ${
                            critica.publicada 
                              ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50' 
                              : 'border-amber-700 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                          }`}
                          title="Clique para alternar Publicada / Rascunho"
                        >
                          {critica.publicada ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Publicada</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-amber-400" />
                              <span>Rascunho</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenEditCritica(critica)}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-zinc-200 transition-colors uppercase font-mono text-[10px] cursor-pointer"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onSelectCritica(critica.slug)}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-zinc-200 transition-colors uppercase font-mono text-[10px] cursor-pointer"
                          title="Visualizar no site"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleRequestDelete(critica)}
                          className="p-1.5 bg-zinc-900 hover:bg-red-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                          title="Excluir crítica"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tableCriticas.length === 0 && (
                <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                  Nenhuma crítica encontrada com os filtros atuais.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: CREATE / EDIT CRITICA FORM
           ========================================================== */}
        {(activeView === 'nova-critica' || activeView === 'editar-critica') && (
          <div className="space-y-8 max-w-5xl animate-in fade-in pb-16">
            
            {/* Form Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
              <div>
                <button
                  onClick={() => setActiveView('criticas')}
                  disabled={isSaving}
                  className="text-xs uppercase font-mono text-zinc-500 hover:text-white mb-2 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  ← Voltar para a lista de críticas
                </button>
                <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                  {editingCriticaId ? 'Editar Crítica' : 'Criar Nova Crítica'}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveCritica(true)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase font-mono text-xs tracking-wider cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Salvar Rascunho
                </button>
                <button
                  type="button"
                  id="admin-save-publish-btn"
                  disabled={isSaving}
                  onClick={() => handleSaveCritica(false)}
                  className={`px-6 py-2.5 font-bold uppercase font-mono text-xs tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    saveSuccessMessage
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : isSaving
                      ? 'bg-zinc-300 text-black opacity-80 cursor-wait'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>SALVANDO...</span>
                    </>
                  ) : saveSuccessMessage ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-black" />
                      <span>{saveSuccessMessage}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingCriticaId ? 'Salvar Alterações' : 'Salvar e Publicar Crítica'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Success Banner */}
            {saveSuccessMessage && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-100 text-xs font-mono flex items-center gap-3 animate-in fade-in shadow-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-sm tracking-wide">{saveSuccessMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-8">
              
              {/* Section 1: Informações Principais */}
              <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-4">
                <h3 className="font-display uppercase tracking-wider text-xs font-bold text-white border-b border-zinc-900 pb-2">
                  1. INFORMAÇÕES EDITORIAIS PRINCIPAIS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block uppercase font-mono text-zinc-300 mb-1 font-semibold">
                      Título da Crítica * (Ex: O INSPETOR GERAL (RS))
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          titulo: newTitle,
                          slug: editingCriticaId ? prev.slug : generateSlug(newTitle),
                          nomeEspetaculo: prev.nomeEspetaculo || newTitle.replace(/\s*\([^)]*\)/g, '').trim()
                        }));
                      }}
                      placeholder="Ex: O INSPETOR GERAL (RS)"
                      className="w-full bg-black text-white p-3 border border-zinc-800 text-sm font-serif font-bold uppercase focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Slug da URL amigável (/criticas/slug)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                      placeholder="o-inspetor-geral-rs"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 font-mono text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Autor da Crítica
                    </label>
                    <input
                      type="text"
                      value={formData.autor}
                      onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))}
                      placeholder="Marcelo Manique"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Categoria
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as CategoriaTipo }))}
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 uppercase font-mono text-xs focus:border-white focus:outline-none cursor-pointer"
                    >
                      {CATEGORIAS_PADRAO.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Data de Publicação
                    </label>
                    <input
                      type="date"
                      value={formData.dataPublicacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataPublicacao: e.target.value }))}
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 font-mono text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Resumo / Chamada Editorial (Excerpt)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.resumo}
                      onChange={(e) => setFormData(prev => ({ ...prev, resumo: e.target.value }))}
                      placeholder="Breve parágrafo de introdução e impacto da crítica para os cards da home e cabeçalho..."
                      className="w-full bg-black text-white p-3 border border-zinc-800 font-serif text-sm focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="teatro, gogol, comedia, rio-grande-do-sul, 2026"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 font-mono text-xs focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Imagens */}
              <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-4">
                <h3 className="font-display uppercase tracking-wider text-xs font-bold text-white border-b border-zinc-900 pb-2">
                  2. IMAGEM PRINCIPAL & FOTOGRAFIAS DE CENA
                </h3>

                <ImageUploadManager
                  label="Imagem Principal da Crítica"
                  value={formData.imagemPrincipal}
                  onChange={(url) => setFormData(prev => ({ ...prev, imagemPrincipal: url }))}
                  caption={formData.legendaImagemPrincipal}
                  onCaptionChange={(cap) => setFormData(prev => ({ ...prev, legendaImagemPrincipal: cap }))}
                  helperText="Esta imagem será destacada no cabeçalho da matéria e nos cards do site."
                />
              </div>

              {/* Section 3: Rich Text Editor */}
              <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-4">
                <h3 className="font-display uppercase tracking-wider text-xs font-bold text-white border-b border-zinc-900 pb-2">
                  3. TEXTO COMPLETO DA CRÍTICA (EDITOR RICO)
                </h3>

                <RichTextEditor
                  value={formData.conteudo}
                  onChange={(val) => setFormData(prev => ({ ...prev, conteudo: val }))}
                  minHeight="450px"
                  draftKey={`olhares_draft_critica_${editingCriticaId || 'new'}`}
                  label="3. TEXTO COMPLETO DA CRÍTICA (EDITOR RICO)"
                  helperText="Barra de formatação completa: fontes, tamanhos, títulos, negrito, itálico, cores, imagens, vídeos do YouTube, tabelas e modo HTML (<>)."
                />
              </div>

              {/* Section 4: Ficha Técnica & Espetáculo */}
              <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-4">
                <h3 className="font-display uppercase tracking-wider text-xs font-bold text-white border-b border-zinc-900 pb-2">
                  4. ESPETÁCULO & FICHA TÉCNICA
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Nome do Espetáculo
                    </label>
                    <input
                      type="text"
                      value={formData.nomeEspetaculo}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomeEspetaculo: e.target.value }))}
                      placeholder="O Inspetor Geral"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Companhia / Grupo Teatral
                    </label>
                    <input
                      type="text"
                      value={formData.companhia}
                      onChange={(e) => setFormData(prev => ({ ...prev, companhia: e.target.value }))}
                      placeholder="Cia. Dramática do Sul"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      placeholder="Porto Alegre"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Estado (Sigla)
                    </label>
                    <input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                      placeholder="RS"
                      maxLength={2}
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 uppercase font-mono text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Direção
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.direcao || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, direcao: e.target.value }
                      }))}
                      placeholder="Marcelo Manique"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Texto / Dramaturgia
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.texto || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, texto: e.target.value }
                      }))}
                      placeholder="Nikolai Gógol / Adaptação"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Elenco (Nomes separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.elenco || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, elenco: e.target.value }
                      }))}
                      placeholder="Amanda Batista, Bianca Lazzaretti, Carlos Eduardo Souza..."
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Cenografia
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.cenografia || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, cenografia: e.target.value }
                      }))}
                      placeholder="Lauro Vasconcelos"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Iluminação
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.iluminacao || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, iluminacao: e.target.value }
                      }))}
                      placeholder="Clarissa Moraes"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Trilha Sonora
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.trilhaSonora || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, trilhaSonora: e.target.value }
                      }))}
                      placeholder="Arthur Fontoura"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-zinc-400 mb-1">
                      Duração
                    </label>
                    <input
                      type="text"
                      value={formData.fichaTecnica.duracao || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fichaTecnica: { ...prev.fichaTecnica, duracao: e.target.value }
                      }))}
                      placeholder="85 minutos"
                      className="w-full bg-black text-white p-2.5 border border-zinc-800 text-xs focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Publicação & Destaque */}
              <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-4">
                <h3 className="font-display uppercase tracking-wider text-xs font-bold text-white border-b border-zinc-900 pb-2">
                  5. STATUS E VISIBILIDADE
                </h3>

                <div className="flex flex-col sm:flex-row gap-6 text-xs font-mono">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.publicada}
                      onChange={(e) => setFormData(prev => ({ ...prev, publicada: e.target.checked }))}
                      className="w-4 h-4 rounded-none bg-black border-zinc-700 text-white focus:ring-0"
                    />
                    <span className="text-zinc-200 uppercase tracking-wider">
                      Publicada (Visível para o público no portal)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.destaque}
                      onChange={(e) => setFormData(prev => ({ ...prev, destaque: e.target.checked }))}
                      className="w-4 h-4 rounded-none bg-black border-zinc-700 text-white focus:ring-0"
                    />
                    <span className="text-zinc-200 uppercase tracking-wider">
                      Destaque na Página Inicial (Hero / Lead)
                    </span>
                  </label>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-850">
                <div className="text-xs font-mono text-zinc-500">
                  {saveSuccessMessage ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> {saveSuccessMessage}
                    </span>
                  ) : (
                    <span>* Campos obrigatórios: Título</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setActiveView('criticas')}
                    className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white uppercase font-mono text-xs tracking-wider cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveCritica(false)}
                    className={`px-8 py-3 font-bold uppercase font-mono text-xs tracking-widest transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      saveSuccessMessage
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : isSaving
                        ? 'bg-zinc-300 text-black opacity-80 cursor-wait'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>SALVANDO...</span>
                      </>
                    ) : saveSuccessMessage ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-black" />
                        <span>{saveSuccessMessage}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingCriticaId ? 'Salvar Alterações' : 'Salvar e Publicar Crítica'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: PÁGINAS TABLE & MANAGEMENT
           ========================================================== */}
        {activeView === 'paginas' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                  Gerenciamento de Páginas
                </h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Crie, edite e organize páginas institucionais dinâmicas (ex: Sobre, Contato).
                </p>
              </div>

              <button
                onClick={handleOpenNewPagina}
                className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Nova Página
              </button>
            </div>

            {/* Table Area */}
            <div className="border border-zinc-850 bg-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-zinc-950/80 border-b border-zinc-850">
                    <tr>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Página</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">Header / Footer</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">Status</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {filteredPaginas.map((pagina) => (
                      <tr key={pagina.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4 min-w-[220px]">
                          <div className="font-serif font-bold text-sm text-white uppercase">{pagina.titulo}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">/{pagina.slug}</div>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-zinc-400 space-y-1">
                          {pagina.mostrarNoHeader && <div className="text-emerald-400">Header (Ordem: {pagina.ordemHeader || 0})</div>}
                          {pagina.mostrarNoFooter && <div className="text-blue-400">Footer (Ordem: {pagina.ordemFooter || 0})</div>}
                          {!pagina.mostrarNoHeader && !pagina.mostrarNoFooter && <span>Nenhum menu</span>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 border ${
                            pagina.publicada ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                          }`}>
                            {pagina.publicada ? 'Publicada' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditPagina(pagina)}
                            className="p-2 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            title="Editar página"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setPaginaToDelete(pagina);
                              setDeletePaginaModalOpen(true);
                            }}
                            className="p-2 bg-zinc-900 hover:bg-red-500 hover:text-white hover:border-red-500 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            title="Excluir página"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredPaginas.length === 0 && (
                  <div className="p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    Nenhuma página encontrada.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: CREATE / EDIT PAGINA FORM
           ========================================================== */}
        {(activeView === 'nova-pagina' || activeView === 'editar-pagina') && (
          <div className="space-y-8 max-w-5xl animate-in fade-in pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                  {activeView === 'editar-pagina' ? 'Editar Página' : 'Nova Página Dinâmica'}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleSavePagina(true)}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-zinc-900 text-white border border-zinc-700 font-bold uppercase tracking-wider text-[11px] hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Salvar Rascunho
                </button>
                <button
                  onClick={() => handleSavePagina(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Publicar Página
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">Título da Página *</label>
                    <input
                      type="text"
                      required
                      value={paginaFormData.titulo}
                      onChange={(e) => setPaginaFormData({ ...paginaFormData, titulo: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 font-serif text-lg focus:border-white focus:outline-none transition-colors"
                      placeholder="Ex: Sobre o Projeto"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">URL Slug (Opcional - Gerado automaticamente)</label>
                    <div className="flex">
                      <span className="bg-zinc-900 border border-zinc-800 border-r-0 text-zinc-500 p-3 font-mono text-xs flex items-center">
                        olharesdacena.com/
                      </span>
                      <input
                        type="text"
                        value={paginaFormData.slug}
                        onChange={(e) => setPaginaFormData({ ...paginaFormData, slug: generateSlug(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 font-mono text-xs focus:border-white focus:outline-none transition-colors"
                        placeholder="sobre-o-projeto"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <RichTextEditor
                    value={paginaFormData.conteudo}
                    onChange={(val) => setPaginaFormData({ ...paginaFormData, conteudo: val })}
                    minHeight="500px"
                    draftKey={`olhares_draft_pagina_${editingPaginaId || 'new'}`}
                    label="CONTEÚDO PRINCIPAL DA PÁGINA INSTITUCIONAL"
                    helperText="Editor de texto completo com barra de formatação estilo Blogger."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-950 border border-zinc-850 p-5 space-y-5">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white border-b border-zinc-900 pb-2">Status & Menus</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 flex items-center justify-center border transition-colors ${paginaFormData.publicada ? 'bg-white border-white' : 'bg-black border-zinc-700 group-hover:border-zinc-500'}`}>
                      {paginaFormData.publicada && <Check className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={paginaFormData.publicada} 
                      onChange={(e) => setPaginaFormData({ ...paginaFormData, publicada: e.target.checked })} 
                    />
                    <span className="text-sm text-zinc-300 select-none font-medium uppercase tracking-wider">
                      Página Publicada
                    </span>
                  </label>

                  <div className="pt-4 border-t border-zinc-900 space-y-4">
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group mb-2">
                        <div className={`w-5 h-5 flex items-center justify-center border transition-colors ${paginaFormData.mostrarNoHeader ? 'bg-white border-white' : 'bg-black border-zinc-700 group-hover:border-zinc-500'}`}>
                          {paginaFormData.mostrarNoHeader && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={paginaFormData.mostrarNoHeader} 
                          onChange={(e) => setPaginaFormData({ ...paginaFormData, mostrarNoHeader: e.target.checked })} 
                        />
                        <span className="text-sm text-zinc-300 select-none font-medium uppercase tracking-wider">
                          Mostrar no Header
                        </span>
                      </label>
                      {paginaFormData.mostrarNoHeader && (
                        <div className="pl-8">
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Ordem (Header)</label>
                          <input
                            type="number"
                            value={paginaFormData.ordemHeader}
                            onChange={(e) => setPaginaFormData({ ...paginaFormData, ordemHeader: parseInt(e.target.value) || 0 })}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 font-mono text-xs focus:border-white focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group mb-2">
                        <div className={`w-5 h-5 flex items-center justify-center border transition-colors ${paginaFormData.mostrarNoFooter ? 'bg-white border-white' : 'bg-black border-zinc-700 group-hover:border-zinc-500'}`}>
                          {paginaFormData.mostrarNoFooter && <Check className="w-3.5 h-3.5 text-black" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={paginaFormData.mostrarNoFooter} 
                          onChange={(e) => setPaginaFormData({ ...paginaFormData, mostrarNoFooter: e.target.checked })} 
                        />
                        <span className="text-sm text-zinc-300 select-none font-medium uppercase tracking-wider">
                          Mostrar no Footer
                        </span>
                      </label>
                      {paginaFormData.mostrarNoFooter && (
                        <div className="pl-8">
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Ordem (Footer)</label>
                          <input
                            type="number"
                            value={paginaFormData.ordemFooter}
                            onChange={(e) => setPaginaFormData({ ...paginaFormData, ordemFooter: parseInt(e.target.value) || 0 })}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 font-mono text-xs focus:border-white focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-5 space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white border-b border-zinc-900 pb-2">Resumo (Opcional)</h3>
                  <textarea
                    value={paginaFormData.resumo}
                    onChange={(e) => setPaginaFormData({ ...paginaFormData, resumo: e.target.value })}
                    className="w-full bg-black border border-zinc-800 text-white p-3 font-serif text-sm focus:border-white focus:outline-none transition-colors min-h-[100px] resize-y"
                    placeholder="Subtítulo ou introdução curta..."
                  />
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-5 space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white border-b border-zinc-900 pb-2">Imagem de Cabeçalho</h3>
                  <ImageUploadManager
                    label="Imagem Principal da Página"
                    value={paginaFormData.imagemPrincipal}
                    onChange={(url) => setPaginaFormData({ ...paginaFormData, imagemPrincipal: url })}
                    helperText="Opcional. Imagem que aparecerá no cabeçalho da página."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: CATEGORIAS
           ========================================================== */}
        {activeView === 'categorias' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in">
            <div className="border-b border-zinc-850 pb-6">
              <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                Categorias Editoriais
              </h1>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Eixos temáticos para catalogação e filtragem das críticas teatrais.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIAS_PADRAO.map(cat => {
                const count = criticas.filter(c => c.categoria === cat).length;
                return (
                  <div key={cat} className="p-5 bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold uppercase text-sm text-white">{cat}</h4>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">{count} {count === 1 ? 'crítica' : 'críticas'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchTable(cat);
                        setActiveView('criticas');
                      }}
                      className="text-xs font-mono uppercase text-zinc-400 hover:text-white border border-zinc-800 px-2 py-1"
                    >
                      Filtrar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: MÍDIA / IMAGENS
           ========================================================== */}
        {activeView === 'midia' && (
          <div className="space-y-6 max-w-5xl animate-in fade-in">
            <div className="border-b border-zinc-850 pb-6">
              <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                Galeria de Mídia e Imagens de Cena
              </h1>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Imagens cadastradas no acervo do Olhares da Cena.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {criticas.map(c => (
                <div key={c.id} className="border border-zinc-850 bg-zinc-950 overflow-hidden space-y-1.5 p-2">
                  <img
                    src={c.imagemPrincipal}
                    alt={c.titulo}
                    className="w-full h-32 object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                  <p className="text-[10px] font-mono text-zinc-300 truncate uppercase font-semibold">
                    {c.titulo}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500 truncate">
                    {c.cidade || 'RS'} • {c.categoria}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: HOME SETTINGS
           ========================================================== */}
        {activeView === 'home-settings' && (
          <form onSubmit={handleSaveHomeSettings} className="space-y-8 max-w-5xl animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
              <div>
                <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                  Página Inicial
                </h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Personalize o banner principal e o manifesto editorial do portal.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {saveSuccessMessage && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" /> {saveSuccessMessage}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-950 border border-zinc-850 p-6 space-y-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white border-b border-zinc-900 pb-3">
                    Manifesto Editorial
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                      Texto do Manifesto (Citação)
                    </label>
                    <textarea
                      required
                      value={homeSettingsFormData.manifestoText}
                      onChange={(e) => setHomeSettingsFormData(prev => ({ ...prev, manifestoText: e.target.value }))}
                      placeholder="Ex: A crítica de teatro não é um tribunal..."
                      className="w-full h-32 bg-zinc-900 border border-zinc-800 text-white p-4 font-serif text-lg focus:border-white focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                      Assinatura / Legenda
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettingsFormData.manifestoCaption}
                      onChange={(e) => setHomeSettingsFormData(prev => ({ ...prev, manifestoCaption: e.target.value }))}
                      placeholder="Ex: Olhares da Cena • Arquivo Crítico"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 font-mono text-xs focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-950 border border-zinc-850 p-6 space-y-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white border-b border-zinc-900 pb-3">
                    Imagem de Destaque (Banner)
                  </h3>
                  <div className="space-y-4">
                    {homeSettingsFormData.heroImageUrl && (
                      <div className="relative bg-black border border-zinc-800 overflow-hidden group flex items-center justify-center p-2">
                        <img 
                          src={homeSettingsFormData.heroImageUrl} 
                          alt="Banner Preview" 
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                    )}
                    <ImageUploadManager
                      label="Banner da Página Inicial"
                      value={homeSettingsFormData.heroImageUrl}
                      onChange={(url) => setHomeSettingsFormData(prev => ({ ...prev, heroImageUrl: url }))}
                      helperText="Escolha a imagem que será exibida no topo da página inicial."
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ==========================================================
            VIEW: CONFIGURAÇÕES
           ========================================================== */}
        {activeView === 'configuracoes' && (
          <div className="space-y-8 max-w-4xl animate-in fade-in">
            <div className="border-b border-zinc-850 pb-6">
              <h1 className="font-serif text-3xl font-bold uppercase text-white tracking-tight">
                Configurações do Sistema
              </h1>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Status da infraestrutura, persistência de dados e sessão editorial.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-mono text-sm uppercase text-white font-bold">
                      Banco de Dados & Nuvem
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Conexão com a base de dados em nuvem do portal.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] uppercase font-mono font-bold">
                  CONECTADO
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono text-zinc-300">
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Servidor / Portal:</span>
                  <span className="text-white">olhares-e28d7</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Status do Banco de Dados:</span>
                  <span className="text-emerald-400">Produção Ativa (Sincronizado)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Usuário Conectado:</span>
                  <span className="text-white">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Armazenamento Local (Cache):</span>
                  <span className="text-emerald-400">Ativo para respostas ultrarrápidas</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs uppercase font-mono text-white font-semibold">
                    Sincronizar Dados Iniciais
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Carrega ou restaura as críticas de exemplo de referência caso o banco esteja vazio.
                  </p>
                </div>
                <button
                  onClick={handleSeedData}
                  className="px-4 py-2 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-700 text-white font-mono text-xs uppercase cursor-pointer transition-colors"
                >
                  Sincronizar Banco de Dados
                </button>
              </div>
            </div>
          </div>
        )}

          </div>
        </main>

        {/* Admin Bottom Footer Credit Bar */}
        <footer id="admin-footer" className="border-t border-zinc-900 bg-zinc-950 py-6 px-4 sm:px-8 text-xs text-zinc-400 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span>© {new Date().getFullYear()} Olhares da Cena — Painel Administrativo</span>
              <span className="hidden sm:inline text-zinc-700">•</span>
              <a
                id="admin-footer-author-credit"
                href="https://bwwebdesign.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-zinc-400 hover:text-white transition-all group"
              >
                <span>Produzido por</span>
                <span className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline decoration-amber-400/50 hover:decoration-amber-300 underline-offset-4 tracking-wide">
                  BW Bernardo Web Design
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">v2.5 • Produção Editorial</span>
          </div>
        </footer>
      </div>

      {/* Delete Confirmation Modal for Critica */}
      <ModalConfirm
        isOpen={deleteModalOpen}
        title="Excluir Crítica"
        message={`Tem certeza que deseja excluir permanentemente a crítica "${criticaToDelete?.titulo}"? Esta ação removerá o artigo do banco de dados e do portal público.`}
        confirmText="Sim, Excluir Crítica"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCriticaToDelete(null);
        }}
      />

      {/* Delete Confirmation Modal for Pagina */}
      <ModalConfirm
        isOpen={deletePaginaModalOpen}
        title="Excluir Página"
        message={`Tem certeza que deseja excluir permanentemente a página "${paginaToDelete?.titulo}"? Esta ação removerá a página do banco de dados e do portal público.`}
        confirmText="Sim, Excluir Página"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeletePagina}
        onCancel={() => {
          setDeletePaginaModalOpen(false);
          setPaginaToDelete(null);
        }}
      />

    </div>
  );
};

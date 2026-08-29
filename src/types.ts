export interface FichaTecnica {
  elenco?: string;
  direcao?: string;
  texto?: string;
  dramaturgia?: string;
  cenografia?: string;
  coreografia?: string;
  iluminacao?: string;
  figurino?: string;
  trilhaSonora?: string;
  producao?: string;
  classificacao?: string;
  duracao?: string;
  temporada?: string;
  local?: string;
  outros?: { rotulo: string; valor: string }[];
  [key: string]: any;
}

export type CategoriaTipo = 
  | 'Teatro'
  | 'Dança'
  | 'Performance'
  | 'Circo'
  | 'Ópera'
  | 'Festival'
  | 'Outros';

export interface Critica {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  autor: string;
  categoria: CategoriaTipo;
  tags: string[];
  dataPublicacao: string; // ISO format or YYYY-MM-DD
  dataAtualizacao?: string;
  imagemPrincipal: string;
  legendaImagemPrincipal?: string;
  imagens?: string[];
  publicada: boolean;
  nomeEspetaculo: string;
  companhia?: string;
  cidade?: string;
  estado?: string;
  fichaTecnica?: FichaTecnica;
  destaque?: boolean;
  views?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAdmin?: boolean;
}

export interface Pagina {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemPrincipal?: string;
  publicada: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  dataPublicacao?: string;
  mostrarNoHeader: boolean;
  ordemHeader?: number;
  mostrarNoFooter: boolean;
  ordemFooter?: number;
}

export interface SearchFilterState {
  termo: string;
  categoria: string;
  ano: string;
  tag: string;
}

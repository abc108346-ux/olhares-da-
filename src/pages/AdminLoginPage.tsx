import React, { useState } from 'react';
import { loginWithEmail } from '../services/firebase';
import { UserProfile } from '../types';
import { Logo } from '../components/Logo';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor, preencha o e-mail e a senha do administrador.');
      return;
    }

    try {
      setLoading(true);
      const user = await loginWithEmail(email.trim(), password);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = err.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos. Verifique suas credenciais de administrador.');
      } else if (code === 'auth/invalid-email') {
        setError('O formato do e-mail informado é inválido.');
      } else if (code === 'auth/user-disabled') {
        setError('Esta conta de usuário foi desativada pelo administrador.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('O acesso por e-mail e senha não está habilitado no servidor.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas sem sucesso. Por favor, aguarde alguns minutos antes de tentar novamente.');
      } else {
        setError(err.message || 'Falha na autenticação. Verifique os dados informados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-page" className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Return to site link */}
      <div className="max-w-md w-full mx-auto mb-6">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs uppercase font-mono tracking-widest text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Portal Público</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto space-y-7 bg-zinc-950 p-8 sm:p-10 border border-zinc-850 shadow-2xl">
        
        {/* Brand & Title */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] uppercase font-mono tracking-widest text-zinc-300">
              <Shield className="w-3 h-3 text-white" />
              ACESSO RESTRITO EDITORIAL
            </div>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white uppercase tracking-wide">
            Painel Administrativo
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Digite o e-mail e a senha de administrador para acessar o sistema.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider font-mono text-zinc-300 mb-1.5 font-medium">
              E-mail do Administrador
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@olharesdacena.com"
                className="w-full bg-black text-white pl-10 pr-3.5 py-3 border border-zinc-800 focus:border-white focus:outline-none transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-mono text-zinc-300 mb-1.5 font-medium">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black text-white pl-10 pr-3.5 py-3 border border-zinc-800 focus:border-white focus:outline-none transition-colors font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-[0.2em] font-mono text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PAINEL'}
          </button>
        </form>

      </div>
    </div>
  );
};

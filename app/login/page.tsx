'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        const msg = err.message?.toLowerCase().includes('invalid')
          ? 'E-mail ou senha incorretos. Se acabou de se cadastrar, confirme o e-mail no link enviado.'
          : (err.message || 'Erro ao entrar. Tente novamente.');
        setError(msg);
        return;
      }
      if (data?.session) {
        router.push(searchParams.get('next') || '/');
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
        <div className="mb-6 flex justify-center">
          <Image src="/logo.jpg" alt="" width={180} height={48} className="h-12 w-auto object-contain" />
        </div>
        <h1 className="text-xl font-bold mb-4">Entrar</h1>
        {searchParams.get('error') === 'auth' && (
          <p className="text-red-400 text-sm mb-4">Falha na autenticação. Tente novamente.</p>
        )}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-[var(--text-muted)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-[var(--text-muted)] mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[var(--active-tab-bg)] border border-[var(--border-color)] text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

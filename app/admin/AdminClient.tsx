'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IA_SLUGS, IA_LABELS } from '@/app/lib/auth/constants';

type UserRow = {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
  ia_slugs: string[];
};

type Props = { embedded?: boolean };

export default function AdminClient({ embedded }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createSlugs, setCreateSlugs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSlugs, setEditSlugs] = useState<string[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(await res.json().then((r) => r.error || 'Erro'));
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          ia_slugs: createSlugs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar');
      setCreateEmail('');
      setCreatePassword('');
      setCreateSlugs([]);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCreateSlug = (slug: string) => {
    setCreateSlugs((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  };

  const openEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditSlugs(u.ia_slugs);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${editingId}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ia_slugs: editSlugs }),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      setEditingId(null);
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col w-full max-w-full overflow-x-hidden p-4 sm:p-6 ${embedded ? 'min-h-0' : 'flex-1 min-h-0 overflow-y-auto'}`}>
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {!embedded && (
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Administração – Usuários</h1>
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)]"
            >
              <i className="fa-solid fa-arrow-left"></i> Voltar
            </Link>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] space-y-4">
          <h2 className="font-semibold">Criar usuário</h2>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              required
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
              placeholder="usuario@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Senha</label>
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">Acesso às IAs</label>
            <div className="flex flex-wrap gap-3">
              {IA_SLUGS.map((slug) => (
                <label key={slug} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createSlugs.includes(slug)}
                    onChange={() => toggleCreateSlug(slug)}
                    className="rounded border-[var(--border-color)]"
                  />
                  <span className="text-sm">{IA_LABELS[slug]}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-[var(--active-tab-bg)] border border-[var(--border-color)] text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Criando…' : 'Criar usuário'}
          </button>
        </form>

        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--border-color)] font-semibold">Usuários</h2>
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Carregando…</div>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {users.map((u) => (
                <li key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{u.email || u.id}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {u.role === 'admin' ? 'Admin (acesso total)' : `IAs: ${u.ia_slugs.length ? u.ia_slugs.map((s) => IA_LABELS[s as keyof typeof IA_LABELS] ?? s).join(', ') : 'nenhuma'}`}
                    </p>
                  </div>
                  {u.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="text-sm px-3 py-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--accent-color)]"
                    >
                      Editar acessos
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-10">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="font-semibold">Editar acessos às IAs</h3>
            <div className="flex flex-wrap gap-3">
              {IA_SLUGS.map((slug) => (
                <label key={slug} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSlugs.includes(slug)}
                    onChange={() => setEditSlugs((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]))}
                    className="rounded border-[var(--border-color)]"
                  />
                  <span className="text-sm">{IA_LABELS[slug]}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-3 py-1.5 rounded-md border border-[var(--border-color)] text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={submitting}
                className="px-3 py-1.5 rounded-md bg-[var(--active-tab-bg)] border border-[var(--border-color)] text-sm disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

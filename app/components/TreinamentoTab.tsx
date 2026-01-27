'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type AgentKind = 'hm' | 'bm';
type TrainingType = 'TEXT' | 'WEBSITE' | 'VIDEO' | 'DOCUMENT';

type TrainingItem = {
  id: string;
  type?: string;
  text?: string;
  image?: string;
  [k: string]: unknown;
};

const TYPE_LABELS: Record<TrainingType, string> = {
  TEXT: 'Texto',
  WEBSITE: 'Link',
  VIDEO: 'Vídeo',
  DOCUMENT: 'Documento',
};

export const AGENT_LABELS: Record<AgentKind, string> = {
  hm: 'HM',
  bm: 'BM',
};

function normalizeListPayload(data: unknown): TrainingItem[] {
  if (Array.isArray(data)) return data as TrainingItem[];
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as TrainingItem[];
    if (Array.isArray(d.trainings)) return d.trainings as TrainingItem[];
  }
  return [];
}

type Props = { lockedAgent?: AgentKind };

export default function TreinamentoTab({ lockedAgent }: Props) {
  const [agent, setAgent] = useState<AgentKind>(lockedAgent ?? 'hm');
  const isLocked = Boolean(lockedAgent);
  const effectiveAgent = isLocked ? lockedAgent! : agent;
  const [list, setList] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<TrainingType>('TEXT');
  const [formText, setFormText] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCallbackUrl, setFormCallbackUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editImage, setEditImage] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trainings?agent=${effectiveAgent}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setList(normalizeListPayload(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveAgent]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        agent: effectiveAgent,
        type: formType,
        text: formText.trim() || '',
      };
      if (formImage.trim()) payload.image = formImage.trim();
      if (formCallbackUrl.trim()) payload.callbackUrl = formCallbackUrl.trim();
      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setFormText('');
      setFormImage('');
      setFormCallbackUrl('');
      await fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TEXT',
          text: editText.trim() || '',
          ...(editImage.trim() && { image: editImage.trim() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setEditingId(null);
      setEditText('');
      setEditImage('');
      await fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este treinamento?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/trainings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      await fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao remover');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: TrainingItem) => {
    setEditingId(t.id);
    setEditText(t.text ?? '');
    setEditImage(t.image ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditImage('');
  };

  const isUrlType = formType !== 'TEXT';
  const placeholder = isUrlType
    ? formType === 'WEBSITE'
      ? 'https://exemplo.com'
      : formType === 'VIDEO'
        ? 'https://youtube.com/... ou URL do vídeo'
        : 'https://... link do documento (PDF, etc.)'
    : 'Cole ou digite o texto do treinamento...';

  return (
    <div className="p-5 overflow-auto h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">
          Treinamento{isLocked ? ` ${AGENT_LABELS[effectiveAgent]}` : ''}
        </h2>

        {!isLocked && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 p-1 bg-[#0f0f0f] rounded-lg border border-[var(--border-color)] w-fit">
              {(['hm', 'bm'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAgent(a)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    agent === a
                      ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {AGENT_LABELS[a]}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Abrir em página separada:{' '}
              <Link href="/treinamento/hm" className="underline hover:text-[var(--foreground)]">
                Treinamento HM
              </Link>
              {' · '}
              <Link href="/treinamento/bm" className="underline hover:text-[var(--foreground)]">
                Treinamento BM
              </Link>
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] space-y-4"
        >
          <h3 className="font-semibold">Adicionar treinamento</h3>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">
              Tipo
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as TrainingType)}
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
            >
              {(Object.keys(TYPE_LABELS) as TrainingType[]).map((k) => (
                <option key={k} value={k}>
                  {TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">
              {isUrlType ? 'URL' : 'Texto'}
            </label>
            {isUrlType ? (
              <input
                type="url"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
              />
            ) : (
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm resize-y"
              />
            )}
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">
              Imagem (URL, opcional)
            </label>
            <input
              type="url"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">
              Webhook (opcional)
            </label>
            <input
              type="url"
              value={formCallbackUrl}
              onChange={(e) => setFormCallbackUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !formText.trim()}
            className="px-4 py-2 rounded-md bg-[var(--active-tab-bg)] border border-[var(--border-color)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a]"
          >
            {submitting ? 'Enviando…' : 'Criar treinamento'}
          </button>
        </form>

        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-color)] font-semibold">
            Treinamentos ({AGENT_LABELS[effectiveAgent]})
          </div>
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              Carregando…
            </div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              Nenhum treinamento. Adicione um acima.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {list.map((t) => (
                <li key={t.id} className="p-4">
                  {editingId === t.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                      />
                      <input
                        type="url"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="URL da imagem (opcional)"
                        className="w-full bg-[#0f0f0f] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(t.id)}
                          disabled={submitting}
                          className="px-3 py-1.5 rounded-md bg-green-900/40 border border-green-700 text-green-200 text-sm disabled:opacity-50"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={submitting}
                          className="px-3 py-1.5 rounded-md border border-[var(--border-color)] text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="inline-block px-2 py-0.5 rounded text-xs bg-[var(--accent-color)] text-[var(--text-muted)] mr-2">
                            {t.type ?? 'TEXT'}
                          </span>
                          <p className="text-sm mt-1 break-words">
                            {(t.text ?? '').slice(0, 200)}
                            {(t.text?.length ?? 0) > 200 ? '…' : ''}
                          </p>
                          {t.image && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Imagem: {t.image}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {(t.type === 'TEXT' || !t.type) && (
                            <button
                              type="button"
                              onClick={() => startEdit(t)}
                              disabled={submitting}
                              className="p-2 rounded text-[var(--text-muted)] hover:bg-[var(--accent-color)] hover:text-[var(--foreground)] disabled:opacity-50"
                              title="Editar (apenas texto)"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            disabled={submitting}
                            className="p-2 rounded text-[var(--text-muted)] hover:bg-red-900/40 hover:text-red-300 disabled:opacity-50"
                            title="Remover"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

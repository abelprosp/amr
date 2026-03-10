'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatSlug } from '@/app/lib/chats';

type Message = { role: 'user' | 'assistant'; content: string };

type Props = {
  slug: ChatSlug;
  label: string;
  agent: 'hm' | 'bm';
};

export default function ChatClient({ slug, label, agent }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer ?? '' }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-full min-w-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0"
      >
        {messages.length === 0 && (
          <p className="text-[var(--text-muted)] text-sm text-center py-6 sm:py-8 px-2">
            Envie uma mensagem para conversar com a IA da Redobrai. As respostas usam o conteúdo dos treinamentos como contexto.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[75%] rounded-xl sm:rounded-lg px-3.5 py-2.5 sm:px-3 sm:py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)]'
                  : 'bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--foreground)]'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl sm:rounded-lg px-3.5 py-2.5 sm:px-3 sm:py-2 text-sm bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--text-muted)]">
              Pensando…
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="px-3 sm:px-4 pb-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--background)] shrink-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-w-0 bg-[#0f0f0f] border border-[var(--border-color)] rounded-xl sm:rounded-lg px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm min-h-[48px] sm:min-h-0"
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg bg-[var(--active-tab-bg)] border border-[var(--border-color)] text-sm font-medium disabled:opacity-50 shrink-0 min-h-[48px] sm:min-h-0 flex items-center justify-center"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

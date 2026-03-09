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
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0"
      >
        {messages.length === 0 && (
          <p className="text-[var(--text-muted)] text-sm text-center py-8">
            Envie uma mensagem para conversar com a IA. As respostas usam o conteúdo dos treinamentos como contexto (ChatGPT).
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 text-sm ${
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
            <div className="rounded-lg px-3 py-2 text-sm bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--text-muted)]">
              Pensando…
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="px-4 pb-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="p-3 border-t border-[var(--border-color)] bg-[var(--background)] shrink-0"
      >
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-w-0 bg-[#0f0f0f] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-[var(--active-tab-bg)] border border-[var(--border-color)] text-sm font-medium disabled:opacity-50 shrink-0"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

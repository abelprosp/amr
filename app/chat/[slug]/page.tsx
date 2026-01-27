import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CHAT_CONFIG, CHAT_SLUGS, type ChatSlug } from '@/app/lib/chats';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!CHAT_SLUGS.includes(slug as ChatSlug)) return { title: 'Chat' };
  return {
    title: `${CHAT_CONFIG[slug as ChatSlug].label} | IA Visor Integrado`,
  };
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!CHAT_SLUGS.includes(slug as ChatSlug)) notFound();
  const { label, iframeSrc } = CHAT_CONFIG[slug as ChatSlug];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <header className="flex justify-between items-center px-6 py-3 bg-[var(--background)] border-b border-[var(--border-color)] h-[60px] shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-[0.95rem] hover:opacity-80"
          >
            <i className="fa-solid fa-brain"></i> IA Visor Integrado
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="font-medium">{label}</span>
        </div>
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--accent-color)]"
        >
          <i className="fa-solid fa-arrow-left"></i> Voltar ao painel
        </Link>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden bg-[var(--card-bg)]">
        <iframe
          src={iframeSrc}
          allow="microphone;"
          className="w-full h-full border-none"
          title={label}
        />
      </main>
    </div>
  );
}

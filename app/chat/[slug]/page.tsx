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
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full">
      <header className="flex justify-between items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-[var(--background)] border-b border-[var(--border-color)] shrink-0 min-h-[52px] sm:min-h-[60px]">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-[0.85rem] sm:text-[0.95rem] hover:opacity-80 shrink-0"
          >
            <i className="fa-solid fa-brain"></i>
            <span className="truncate">IA Visor Integrado</span>
          </Link>
          <span className="text-[var(--text-muted)] shrink-0">/</span>
          <span className="font-medium truncate">{label}</span>
        </div>
        <Link
          href="/"
          className="text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--accent-color)] shrink-0 whitespace-nowrap"
        >
          <i className="fa-solid fa-arrow-left"></i> Voltar
        </Link>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden bg-[var(--card-bg)] flex flex-col">
        <div className="flex-1 min-h-0 w-full relative">
          <iframe
            src={iframeSrc}
            allow="microphone;"
            className="absolute inset-0 w-full h-full border-none"
            title={label}
          />
        </div>
      </main>
    </div>
  );
}

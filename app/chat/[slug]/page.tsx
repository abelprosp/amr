import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { CHAT_CONFIG, CHAT_SLUGS, type ChatSlug } from '@/app/lib/chats';
import { getProfile } from '@/app/lib/auth/get-profile';
import ChatClient from './ChatClient';

const SLUG_TO_ACCESS: Record<ChatSlug, string> = {
  bluemilk: 'chat_bluemilk',
  usoulimpou: 'chat_usoulimpou',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!CHAT_SLUGS.includes(slug as ChatSlug)) return { title: 'Chat' };
  return {
    title: `${CHAT_CONFIG[slug as ChatSlug].label} | IA da Redobrai`,
  };
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!CHAT_SLUGS.includes(slug as ChatSlug)) notFound();
  const profile = await getProfile();
  if (!profile) redirect('/login');
  const requiredAccess = SLUG_TO_ACCESS[slug as ChatSlug];
  const hasAccess = profile.role === 'admin' || profile.ia_slugs.includes(requiredAccess);
  if (!hasAccess) redirect('/');
  const config = CHAT_CONFIG[slug as ChatSlug];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-x-hidden overflow-y-hidden w-full max-w-full min-w-0">
      <header className="flex justify-between items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-[var(--background)] border-b border-[var(--border-color)] shrink-0 min-h-[52px] sm:min-h-[60px] w-full max-w-full min-w-0 overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 min-w-0">
          <Link href="/" className="shrink-0 flex items-center hover:opacity-80" aria-label="Início">
            <Image src="/logo.jpg" alt="" width={120} height={32} className="h-6 sm:h-7 w-auto object-contain" />
          </Link>
          <span className="text-[var(--text-muted)] shrink-0 hidden sm:inline">/</span>
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Image
              src={config.logo}
              alt=""
              width={28}
              height={28}
              className="shrink-0 rounded object-contain w-7 h-7 sm:w-7 sm:h-7"
            />
            <span className="font-medium truncate text-sm sm:text-base">{config.label}</span>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 px-3 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--accent-color)] shrink-0 whitespace-nowrap min-h-[44px] sm:min-h-0 justify-center"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden></i> Voltar
        </Link>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden bg-[var(--card-bg)] flex flex-col min-w-0">
        <ChatClient slug={slug as ChatSlug} label={config.label} agent={config.agent} />
      </main>
    </div>
  );
}

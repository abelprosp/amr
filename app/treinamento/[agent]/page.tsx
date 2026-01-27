import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TreinamentoTab, { AGENT_LABELS } from '@/app/components/TreinamentoTab';

type Agent = 'hm' | 'bm';

const VALID_AGENTS: Agent[] = ['hm', 'bm'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agent: string }>;
}): Promise<Metadata> {
  const { agent } = await params;
  if (!VALID_AGENTS.includes(agent as Agent)) return { title: 'Treinamento' };
  return { title: `Treinamento ${AGENT_LABELS[agent as Agent]} | IA Visor Integrado` };
}

export default async function TreinamentoAgentPage({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = await params;
  if (!VALID_AGENTS.includes(agent as Agent)) notFound();
  const label = AGENT_LABELS[agent as Agent];

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
          <span className="font-medium">Treinamento {label}</span>
        </div>
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--accent-color)]"
        >
          <i className="fa-solid fa-arrow-left"></i> Voltar ao painel
        </Link>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">
        <TreinamentoTab lockedAgent={agent as Agent} />
      </main>
    </div>
  );
}

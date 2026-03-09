'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import TreinamentoTab from './components/TreinamentoTab';
import { useAuth, useHasAccess } from './components/AuthProvider';

const linkClass =
  'px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-all duration-200 whitespace-nowrap shrink-0';

export default function Home() {
  const { profile, loading, signOut } = useAuth();
  const hasDashboard = useHasAccess('dashboard');
  const hasTreinamento = useHasAccess('treinamento');
  const hasTreinamentoHm = useHasAccess('treinamento_hm');
  const hasTreinamentoBm = useHasAccess('treinamento_bm');
  const hasChatBluemilk = useHasAccess('chat_bluemilk');
  const hasChatUsoulimpou = useHasAccess('chat_usoulimpou');

  const firstTab = useMemo(() => {
    if (hasDashboard) return 'dashboard';
    if (hasTreinamento) return 'treinamento';
    return 'dashboard';
  }, [hasDashboard, hasTreinamento]);

  const [activeTab, setActiveTab] = useState(firstTab);

  const tabClass = (tab: string) =>
    `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
      activeTab === tab
        ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)] shadow-sm'
        : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent'
    }`;

  if (loading || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--text-muted)]">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-x-hidden overflow-y-hidden">
      <header className="flex justify-between items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-[var(--background)] border-b border-[var(--border-color)] shrink-0 min-h-[52px] sm:min-h-[60px] w-full max-w-full min-w-0 overflow-x-hidden">
        <div className="flex items-center gap-2 font-semibold text-[0.85rem] sm:text-[0.95rem] shrink-0 min-w-0">
          <i className="fa-solid fa-brain"></i>
          <span className="truncate">IA Visor Integrado</span>
        </div>

        <nav className="flex gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#222] overflow-x-auto overflow-y-hidden flex-1 min-w-0 max-w-full nav-scroll">
          {hasDashboard && (
            <button onClick={() => setActiveTab('dashboard')} className={tabClass('dashboard')}>
              Dashboard
            </button>
          )}
          {hasTreinamento && (
            <button onClick={() => setActiveTab('treinamento')} className={tabClass('treinamento')}>
              Treinamento
            </button>
          )}
          {hasTreinamentoHm && (
            <Link href="/treinamento/hm" className={linkClass}>
              Treinamento HM
            </Link>
          )}
          {hasTreinamentoBm && (
            <Link href="/treinamento/bm" className={linkClass}>
              Treinamento BM
            </Link>
          )}
          {hasChatBluemilk && (
            <Link href="/chat/bluemilk" className={linkClass}>
              Chat BlueMilk
            </Link>
          )}
          {hasChatUsoulimpou && (
            <Link href="/chat/usoulimpou" className={linkClass}>
              Chat UsouLimpou
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {profile.role === 'admin' && (
            <Link
              href="/admin"
              className="bg-[#1e1e1e] border border-[#333] text-[var(--foreground)] px-3 py-1.5 rounded-md text-xs hover:bg-[var(--accent-color)]"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="bg-[#1e1e1e] border border-[#333] text-[var(--foreground)] px-3 py-1.5 rounded-md text-xs hover:bg-[var(--accent-color)]"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 min-w-0 relative overflow-hidden max-w-full">
        {hasDashboard && (
          <section
            id="dashboard"
            className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''} p-4 sm:p-5 overflow-auto`}
          >
            <h2 className="mb-4 sm:mb-5 text-xl sm:text-2xl font-bold">Dashboard</h2>
            <div className="w-full min-h-[200px] flex-1 bg-[var(--card-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
              <div className="text-center text-[var(--text-muted)]">
                <p className="text-lg mb-1">Dashboard em andamento...</p>
                <small>Configure os widgets nas Configurações</small>
              </div>
            </div>
          </section>
        )}

        {hasTreinamento && (
          <section
            id="treinamento"
            className={`tab-content ${activeTab === 'treinamento' ? 'active' : ''}`}
          >
            <TreinamentoTab />
          </section>
        )}

        {!hasDashboard && !hasTreinamento && !hasTreinamentoHm && !hasTreinamentoBm && !hasChatBluemilk && !hasChatUsoulimpou && (
          <section className="tab-content active p-4 sm:p-5 overflow-auto">
            <p className="text-[var(--text-muted)]">Nenhum acesso configurado. Peça ao administrador.</p>
          </section>
        )}
      </main>
    </div>
  );
}

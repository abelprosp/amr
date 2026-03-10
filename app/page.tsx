'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TreinamentoTab from './components/TreinamentoTab';
import AdminClient from './admin/AdminClient';
import { useAuth, useHasAccess } from './components/AuthProvider';

const linkClass =
  'px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-all duration-200 whitespace-nowrap shrink-0';

const navItemClass =
  'block w-full text-left px-4 py-3 rounded-lg text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-colors font-medium';

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const tabClass = (tab: string) =>
    `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
      activeTab === tab
        ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)] shadow-sm'
        : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent'
    }`;

  const closeMenu = () => setMenuOpen(false);

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
        <Link href="/" className="shrink-0 flex items-center min-w-0" aria-label="Início">
          <Image src="/logo.jpg" alt="" width={140} height={36} className="h-8 w-auto object-contain" />
        </Link>

        {/* Desktop: nav + actions */}
        <nav className="hidden sm:flex gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#222] overflow-x-auto overflow-y-hidden flex-1 min-w-0 max-w-full nav-scroll">
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
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="sm:hidden p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--active-tab-bg)]"
            aria-label="Abrir menu"
          >
            <i className="fa-solid fa-bars text-lg" aria-hidden />
          </button>
          {/* Desktop: Admin + Sair */}
          {profile.role === 'admin' && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex bg-[#1e1e1e] border border-[#333] text-[var(--foreground)] px-3 py-1.5 rounded-md text-xs hover:bg-[var(--accent-color)]"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="hidden sm:inline-flex bg-[#1e1e1e] border border-[#333] text-[var(--foreground)] px-3 py-1.5 rounded-md text-xs hover:bg-[var(--accent-color)]"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Mobile menu overlay + drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 sm:hidden"
            onClick={closeMenu}
            aria-hidden
          />
          <div className="fixed top-0 right-0 bottom-0 w-[min(280px,85vw)] bg-[var(--background)] border-l border-[var(--border-color)] z-50 flex flex-col sm:hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <Image src="/logo.jpg" alt="" width={120} height={30} className="h-7 w-auto object-contain" />
              <button
                type="button"
                onClick={closeMenu}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--active-tab-bg)]"
                aria-label="Fechar menu"
              >
                <i className="fa-solid fa-times text-lg" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {hasDashboard && (
                <button onClick={() => { setActiveTab('dashboard'); closeMenu(); }} className={navItemClass}>
                  Dashboard
                </button>
              )}
              {hasTreinamento && (
                <button onClick={() => { setActiveTab('treinamento'); closeMenu(); }} className={navItemClass}>
                  Treinamento
                </button>
              )}
              {hasTreinamentoHm && (
                <Link href="/treinamento/hm" onClick={closeMenu} className={navItemClass}>
                  Treinamento HM
                </Link>
              )}
              {hasTreinamentoBm && (
                <Link href="/treinamento/bm" onClick={closeMenu} className={navItemClass}>
                  Treinamento BM
                </Link>
              )}
              {hasChatBluemilk && (
                <Link href="/chat/bluemilk" onClick={closeMenu} className={navItemClass}>
                  Chat BlueMilk
                </Link>
              )}
              {hasChatUsoulimpou && (
                <Link href="/chat/usoulimpou" onClick={closeMenu} className={navItemClass}>
                  Chat UsouLimpou
                </Link>
              )}
            </nav>
            <div className="p-3 border-t border-[var(--border-color)] space-y-1">
              {profile.role === 'admin' && (
                <Link href="/admin" onClick={closeMenu} className={navItemClass}>
                  Admin
                </Link>
              )}
              <button onClick={() => { closeMenu(); signOut(); }} className={`${navItemClass} w-full text-left text-red-300 hover:bg-red-950/30`}>
                Sair
              </button>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 min-h-0 min-w-0 relative flex flex-col overflow-hidden max-w-full">
        {hasDashboard && (
          <section
            id="dashboard"
            className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''} flex flex-col flex-1 min-h-0 min-w-0`}
          >
            {profile.role === 'admin' ? (
              <>
                <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 shrink-0">
                  <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Adicione usuários e defina quais acessos cada um tem.</p>
                </div>
                <AdminClient embedded />
              </>
            ) : (
              <div className="p-4 sm:p-5">
                <h2 className="mb-4 sm:mb-5 text-xl sm:text-2xl font-bold">Dashboard</h2>
                <div className="w-full min-h-[200px] flex-1 bg-[var(--card-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
                  <div className="text-center text-[var(--text-muted)]">
                    <p className="text-lg mb-1">Dashboard em andamento...</p>
                    <small>Configure os widgets nas Configurações</small>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {hasTreinamento && (
          <section
            id="treinamento"
            className={`tab-content ${activeTab === 'treinamento' ? 'active' : ''} flex flex-col flex-1 min-h-0 min-w-0`}
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

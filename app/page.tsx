'use client';

import { useState } from 'react';
import Link from 'next/link';
import TreinamentoTab from './components/TreinamentoTab';
import { CHAT_CONFIG } from './lib/chats';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabClass = (tab: string) =>
    `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
      activeTab === tab
        ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)] shadow-sm'
        : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent'
    }`;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
      {/* Header / Navegação */}
      <header className="flex justify-between items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-[var(--background)] border-b border-[var(--border-color)] shrink-0 min-h-[52px] sm:min-h-[60px]">
        <div className="flex items-center gap-2 font-semibold text-[0.85rem] sm:text-[0.95rem] shrink-0 min-w-0">
          <i className="fa-solid fa-brain"></i>
          <span className="truncate">IA Visor Integrado</span>
        </div>

        <nav className="flex gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#222] overflow-x-auto overflow-y-hidden flex-1 min-w-0 justify-center nav-scroll">
          <button onClick={() => setActiveTab('dashboard')} className={`${tabClass('dashboard')} whitespace-nowrap shrink-0`}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab('bluemilk')} className={`${tabClass('bluemilk')} whitespace-nowrap shrink-0`}>
            IA BlueMilk
          </button>
          <button onClick={() => setActiveTab('usoulimpou')} className={`${tabClass('usoulimpou')} whitespace-nowrap shrink-0`}>
            IA UsouLimpou
          </button>
          <button onClick={() => setActiveTab('treinamento')} className={`${tabClass('treinamento')} whitespace-nowrap shrink-0`}>
            Treinamento
          </button>
          <Link
            href="/treinamento/hm"
            className="px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-all duration-200 whitespace-nowrap shrink-0"
          >
            Treinamento HM
          </Link>
          <Link
            href="/treinamento/bm"
            className="px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-all duration-200 whitespace-nowrap shrink-0"
          >
            Treinamento BM
          </Link>
          <Link
            href="/chat/bluemilk"
            className="px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-all duration-200 whitespace-nowrap shrink-0"
          >
            Chat BlueMilk
          </Link>
          <Link
            href="/chat/usoulimpou"
            className="px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--active-tab-bg)] transition-all duration-200 whitespace-nowrap shrink-0"
          >
            Chat UsouLimpou
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-base">
            <i className="fa-solid fa-moon"></i>
          </button>
          <button className="bg-[#1e1e1e] border border-[#333] text-[var(--foreground)] px-3 py-1.5 rounded-md text-xs cursor-pointer">
            Redobrai
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 min-h-0 relative overflow-hidden">
        {/* Tela 1: Dashboard */}
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

        {/* Tela 2: IA BlueMilk */}
        <section
          id="bluemilk"
          className={`tab-content ${activeTab === 'bluemilk' ? 'active' : ''}`}
        >
          <div className="w-full h-full min-h-0 bg-[var(--card-bg)] overflow-hidden flex-1 flex flex-col">
            <iframe
              src={CHAT_CONFIG.bluemilk.iframeSrc}
              allow="microphone;"
              title={CHAT_CONFIG.bluemilk.label}
            />
          </div>
        </section>

        {/* Tela 3: IA UsouLimpou */}
        <section
          id="usoulimpou"
          className={`tab-content ${activeTab === 'usoulimpou' ? 'active' : ''}`}
        >
          <div className="w-full h-full min-h-0 bg-[var(--card-bg)] overflow-hidden flex-1 flex flex-col">
            <iframe
              src={CHAT_CONFIG.usoulimpou.iframeSrc}
              allow="microphone;"
              title={CHAT_CONFIG.usoulimpou.label}
            />
          </div>
        </section>

        {/* Tela 4: Treinamento */}
        <section
          id="treinamento"
          className={`tab-content ${activeTab === 'treinamento' ? 'active' : ''}`}
        >
          <TreinamentoTab />
        </section>
      </main>
    </div>
  );
}

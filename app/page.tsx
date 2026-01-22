'use client';

import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      {/* Header / Navegação */}
      <header className="flex justify-between items-center px-6 py-3 bg-[var(--background)] border-b border-[var(--border-color)] h-[60px] shrink-0">
        <div className="flex items-center gap-2 font-semibold text-[0.95rem]">
          <i className="fa-solid fa-brain"></i> IA Visor Integrado
        </div>

        <nav className="flex gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#222]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bluemilk')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'bluemilk'
                ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent'
            }`}
          >
            IA BlueMilk
          </button>
          <button
            onClick={() => setActiveTab('usoulimpou')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'usoulimpou'
                ? 'bg-[var(--active-tab-bg)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent'
            }`}
          >
            IA UsouLimpou
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-base">
            <i className="fa-solid fa-moon"></i>
          </button>
          <button className="bg-[#1e1e1e] border border-[#333] text-[var(--foreground)] px-3 py-1.5 rounded-md text-xs cursor-pointer">
            Redobrai
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 relative overflow-hidden">
        {/* Tela 1: Dashboard */}
        <section
          id="dashboard"
          className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''} p-5`}
        >
          <h2 className="mb-5 text-2xl font-bold">Dashboard</h2>
          <div className="w-full h-full bg-[var(--card-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
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
          <div className="w-full h-full bg-[var(--card-bg)] overflow-hidden">
            <iframe
              src="https://app.gptmaker.ai/widget/3ED9B41F212FF3B0AB29EE45785CCB51/iframe"
              allow="microphone;"
            ></iframe>
          </div>
        </section>

        {/* Tela 3: IA UsouLimpou */}
        <section
          id="usoulimpou"
          className={`tab-content ${activeTab === 'usoulimpou' ? 'active' : ''}`}
        >
          <div className="w-full h-full bg-[var(--card-bg)] overflow-hidden">
            <iframe
              src="https://app.gptmaker.ai/widget/3ED9B439BC19B10D4A241AC4C59CD28F/iframe"
              allow="microphone;"
            ></iframe>
          </div>
        </section>
      </main>
    </>
  );
}

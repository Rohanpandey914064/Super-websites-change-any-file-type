'use client';

import { useState } from 'react';
import { useTheme } from '../app/layout';
import { Sun, Moon, HelpCircle, Globe, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { darkMode, setDarkMode } = useTheme();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark (Tesla Image 1 Style) */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 select-none shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <a href="#" className="flex flex-col select-none group">
              <span className="font-sans text-xs sm:text-sm font-bold tracking-[0.28em] uppercase text-zinc-900 dark:text-white leading-none">
                CONVERTFLOW
              </span>
              <span className="text-[9px] font-mono tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400 mt-0.5">
                Universal Engine
              </span>
            </a>
          </div>

          {/* Center Navigation Links (Tesla Minimal Style) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            {[
              { label: 'Converter', href: '#converter' },
              { label: 'Tabs & Formats', href: '#formats' }
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Help / Information Icon */}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Pipeline Specs"
              aria-label="Pipeline Specs"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.8} />
            </button>

            {/* Network / Engine Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              <Globe className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>BullMQ Online</span>
            </div>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />

            {/* Theme Toggle */}
            <button
              id="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info popover */}
      {showHelp && (
        <div className="absolute right-6 top-16 z-50 w-72 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#141518] p-4 text-xs shadow-2xl">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Zero Data Footprint
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            All files are transformed in isolated background workers and permanently erased within 30 minutes.
          </p>
          <button
            onClick={() => setShowHelp(false)}
            className="w-full rounded-[4px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-1.5 font-semibold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      )}
    </header>
  );
}

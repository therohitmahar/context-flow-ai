import React, { useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
  Search,
  Settings,
  Play,
  ChevronRight,
  Loader2,
  Clock,
  Undo2,
  Redo2,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const TopBar: React.FC = () => {
  const {
    activeProject,
    searchQuery,
    setSearchQuery,
    runFlow,
    isGenerating,
    autoSaveStatus,
    undo,
    redo,
    reset,
    past,
    future,
  } = useStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-white/[0.06] bg-[#0d0e14]/90 backdrop-blur-md z-50 relative">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="4" width="5" height="6" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="8" y="2" width="5" height="4" rx="1" fill="white" fillOpacity="0.6"/>
            <rect x="8" y="8" width="5" height="4" rx="1" fill="white" fillOpacity="0.6"/>
            <line x1="6" y1="7" x2="8" y2="4.5" stroke="white" strokeOpacity="0.7" strokeWidth="1"/>
            <line x1="6" y1="7" x2="8" y2="9.5" stroke="white" strokeOpacity="0.7" strokeWidth="1"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">Context Stacker</span>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-slate-400">
        <ChevronRight size={14} />
        <span className="text-slate-300 font-medium">{activeProject.name}</span>
      </div>

      {/* Auto-save pill */}
      <div className="flex items-center gap-1.5 ml-1">
        {autoSaveStatus === 'saved' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs font-medium text-emerald-400">Auto-Saved</span>
          </div>
        )}
        {autoSaveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Loader2 size={10} className="text-amber-400 animate-spin" />
            <span className="text-xs font-medium text-amber-400">Saving...</span>
          </div>
        )}
        {autoSaveStatus === 'unsaved' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
            <Clock size={10} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-400">Unsaved</span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Undo / Redo / Reset ────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title={`Undo${canUndo ? ` (${past.length})` : ''} — ⌘Z`}
          className={clsx(
            'w-7 h-7 rounded-md flex items-center justify-center transition-all',
            canUndo
              ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              : 'text-slate-700 cursor-not-allowed'
          )}
        >
          <Undo2 size={14} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          title={`Redo${canRedo ? ` (${future.length})` : ''} — ⌘⇧Z`}
          className={clsx(
            'w-7 h-7 rounded-md flex items-center justify-center transition-all',
            canRedo
              ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              : 'text-slate-700 cursor-not-allowed'
          )}
        >
          <Redo2 size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

        {/* Reset */}
        <button
          onClick={handleReset}
          title="Reset canvas to default"
          className={clsx(
            'flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium transition-all',
            showResetConfirm
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
          )}
        >
          <RotateCcw size={12} className={showResetConfirm ? 'animate-spin' : ''} />
          {showResetConfirm ? 'Confirm?' : 'Reset'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-44 h-8 pl-8 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
        />
      </div>

      {/* Settings */}
      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
        <Settings size={16} />
      </button>

      {/* Run Flow */}
      <button
        onClick={runFlow}
        disabled={isGenerating}
        className={clsx(
          'flex items-center gap-2 h-8 px-4 rounded-lg text-sm font-semibold transition-all',
          isGenerating
            ? 'bg-indigo-700/50 text-indigo-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-700/30 hover:shadow-indigo-600/40'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play size={13} fill="currentColor" />
            Run Flow
          </>
        )}
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow">
        AC
      </div>
    </header>
  );
};

export default TopBar;

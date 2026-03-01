import React, { useCallback, useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import {
  Search,
  Settings,
  Play,
  Loader2,
  Clock,
  Undo2,
  Redo2,
  RotateCcw,
  LogOut,
  User,
  Share2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import CreateTemplateModal from '../CreateTemplateModal/CreateTemplateModal';
import { AppIcon } from '../icons/AppIcon';

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
    user,
    updateProjectName,
  } = useStore();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="h-14 shrink-0 flex items-center gap-3 px-6 border-b border-[#2d3748] bg-[#111318] z-50 relative">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2">
        <div className="w-8 h-8 rounded-lg bg-[#135bec] flex items-center justify-center shadow-lg shadow-blue-600/30 text-white">
          <AppIcon size={14} />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Context Stacker</span>
      </div>

      {/* App Title & Version Status */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={activeProject?.name || 'Untitled Flow'}
          onChange={(e) => updateProjectName(e.target.value)}
          className="text-sm font-semibold text-white bg-transparent outline-none hover:bg-white/[0.05] focus:bg-white/[0.05] focus:ring-1 ring-indigo-500/50 rounded px-1.5 py-0.5 transition-all w-48 truncate"
          placeholder="Flow name..."
        />
        <div className="h-4 w-px bg-slate-700"></div>
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

      {/* Share Template */}
      <button
        onClick={() => setIsTemplateModalOpen(true)}
        className="flex items-center justify-center gap-2 h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold transition-all"
        title="Share your layout as a template"
      >
        <Share2 size={13} />
        <span className="hidden sm:inline">Share Template</span>
      </button>

      {/* Run Flow */}
      <button
        onClick={runFlow}
        disabled={isGenerating}
        className={clsx(
          'flex items-center gap-2 h-8 px-4 rounded-lg text-sm font-semibold transition-all mr-2',
          isGenerating
            ? 'bg-indigo-700/50 text-indigo-300 cursor-not-allowed'
            : 'bg-[#135bec] text-white hover:bg-blue-600 shadow-lg shadow-[#135bec]/20'
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

      {/* Auth UI */}
      {!user ? (
        <button
          onClick={handleLogin}
          className="h-8 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-colors"
        >
          Sign In
        </button>
      ) : (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shadow overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#135bec]/50"
          >
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={16} />
            )}
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a202c] border border-[#2d3748] rounded-xl shadow-xl overflow-hidden z-50 py-1">
              <div className="px-3 py-2 border-b border-[#2d3748] mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.email || 'Anonymous Session'}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}

      {isTemplateModalOpen && (
        <CreateTemplateModal onClose={() => setIsTemplateModalOpen(false)} />
      )}
    </header>
  );
};

export default TopBar;

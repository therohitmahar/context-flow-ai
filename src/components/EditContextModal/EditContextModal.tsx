import React, { useState, useEffect } from 'react';
import { X, FileText, Brain, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import type { ContextNodeData, ContentType } from '../../types';

const EditContextModal: React.FC = () => {
  const { modalState, closeModal, savedContexts, updateSavedContext, createSavedContext, addContextNode, updateNodeData, nodes } = useStore();
  
  // We use a partial draft that covers both node data and saved context data
  const [draft, setDraft] = useState<{ id?: string; title: string; content: string; instruction: string; contentType: ContentType }>({ 
    title: '', content: '', instruction: '', contentType: 'text' 
  });

  const formattedTitle = draft.title.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_|_$/g, '');
  
  const isDuplicateTitle = nodes.some((n) => 
    n.type === 'contextNode' &&
    n.id !== modalState.targetId && 
    (n.data as ContextNodeData).title === formattedTitle
  );

  const isValid = draft.title.trim().length > 0 && draft.content.trim().length > 0 && !isDuplicateTitle;

  useEffect(() => {
    if (modalState.isOpen) {
      if (modalState.mode === 'edit-saved' && modalState.targetId) {
        const ctx = savedContexts.find((c) => c.id === modalState.targetId);
        if (ctx) setDraft({ id: ctx.id, title: ctx.title, content: ctx.content, instruction: ctx.instruction, contentType: ctx.contentType });
      } else if (modalState.mode === 'edit-node' && modalState.targetId) {
        const node = nodes.find(n => n.id === modalState.targetId);
        if (node) {
          const d = node.data as ContextNodeData;
          setDraft({ id: node.id, title: d.title, content: d.content, instruction: d.instruction, contentType: d.contentType });
        }
      } else if (modalState.mode === 'add-node') {
        const defaultTitle = `block-${nodes.length + 1}`;
        setDraft({ title: defaultTitle, content: '', instruction: '', contentType: 'text' });
      }
    }
  }, [modalState, savedContexts, nodes]);

  if (!modalState.isOpen) return null;

  const handleSave = () => {
    if (!isValid) return;

    const cleanedDraft = { ...draft, title: formattedTitle || draft.title };

    if (modalState.mode === 'edit-saved' && draft.id) {
      updateSavedContext(draft.id, cleanedDraft);
    } else if (modalState.mode === 'add-node') {
      addContextNode(cleanedDraft);
      createSavedContext({
        title: cleanedDraft.title,
        subtitle: 'Custom Block',
        contentType: cleanedDraft.contentType,
        content: cleanedDraft.content,
        instruction: cleanedDraft.instruction,
      });
    } else if (modalState.mode === 'edit-node' && draft.id) {
      updateNodeData(draft.id, cleanedDraft);
    }
    closeModal();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div 
        className="w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-slate-700/50 bg-[#161b22] shadow-2xl overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-[#1c212b]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-1 uppercase">
                Context Label
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-400">@</span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={clsx(
                    "bg-transparent border-none p-0 text-xl font-bold focus:outline-none placeholder-slate-600 w-64",
                    isDuplicateTitle ? "text-red-400" : "text-white"
                  )}
                />
              </div>
              {isDuplicateTitle && (
                <p className="text-xs text-red-500 font-medium mt-1 ml-6 relative top-0.5">
                  A block with this name already exists.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={closeModal}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body columns */}
        <div className="flex flex-1 min-h-0 bg-[#0d1117]">
          
          {/* Main content (Left) */}
          <div className="flex-1 flex flex-col border-r border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-[#0d1117]/80">
              <div />
              <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 tracking-wider">
                PLAIN TEXT
              </div>
            </div>
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              className="flex-1 w-full bg-transparent border-none p-6 text-sm text-slate-300 placeholder-slate-600 focus:outline-none resize-none font-mono leading-relaxed"
              placeholder="Paste or type context content here..."
            />
          </div>

          {/* Logic (Right) */}
          <div className="w-[400px] flex flex-col bg-[#161b22]">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 text-[#a855f7] mb-4">
                <Brain size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  Extraction Logic
                </h3>
              </div>
              <textarea
                value={draft.instruction}
                onChange={(e) => setDraft({ ...draft, instruction: e.target.value })}
                className="w-full h-64 bg-transparent border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 resize-none transition-all"
                placeholder="Extract skills & experience from the text."
              />
            </div>
            
            <div className="mt-auto p-6 border-t border-slate-800/50 flex items-end justify-between">
              <div>
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Length</p>
                  <p className="text-xs text-slate-300">{draft.content.length} chars</p>
                </div>
              </div>
              <div>
                 <div className="mb-3 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Updated</p>
                  <p className="text-xs text-slate-300">Just now</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-[#161b22] border border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className={clsx(
                      "px-8 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                      isValid 
                        ? "text-white bg-blue-600 border border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:bg-blue-500" 
                        : "text-white/50 bg-blue-900/40 border border-blue-900/50 cursor-not-allowed"
                    )}
                  >
                    <Check size={16} strokeWidth={3} />
                    Done
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContextModal;

import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  X,
  Copy,
  RefreshCw,
  Edit3,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronDown,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const OutputPanel: React.FC = () => {
  const {
    generatedOutput,
    outputHistory,
    isGenerating,
    isOutputPanelOpen,
    setOutputPanelOpen,
    regenerate,
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    const text = isEditing ? editedText : generatedOutput?.text ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setEditedText(generatedOutput?.text ?? '');
    setIsEditing(true);
  };

  if (!isOutputPanelOpen) return null;

  return (
    <div
      className={clsx(
        'w-[420px] shrink-0 flex flex-col shadow-2xl z-40 h-full border-l border-white/[0.08] bg-[#0d0e14]',
        'transition-all duration-300 fade-in-up'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#0d0e14]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">Generated Output</h3>
            {generatedOutput && (
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                {generatedOutput.model}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOutputPanelOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 bg-[#0d0e14]">
        {isGenerating ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <Loader2 size={18} className="text-indigo-400 animate-spin" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-indigo-300">Generating Intelligence</span>
                <span className="text-[10px] text-indigo-400/60 uppercase tracking-widest font-semibold italic">Processing context stack...</span>
              </div>
            </div>
            {/* Skeleton lines */}
            <div className="space-y-3 px-1">
              {[100, 80, 95, 70, 88, 60, 75, 90, 65, 82].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded-full skeleton"
                  style={{ width: `${w}%`, opacity: 1 - (i * 0.08) }}
                />
              ))}
            </div>
          </div>
        ) : generatedOutput ? (
          <div className="space-y-6 fade-in-up">
            {/* Nodes used */}
            {generatedOutput.usedNodeTitles.length > 0 && (
              <div className="px-1">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-3">
                  Context Stacked
                </p>
                <div className="flex flex-wrap gap-2">
                  {generatedOutput.usedNodeTitles.map((title) => (
                    <span
                      key={title}
                      className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles size={10} className="text-indigo-400" />
                      @{title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Model & Output text */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Model:</span>
                <span className="text-[10px] font-bold text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                  {generatedOutput.model}
                </span>
              </div>

              {isEditing ? (
                <div className="relative group">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-80 bg-white/[0.03] border-2 border-indigo-500/30 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-indigo-500/50 transition-all resize-none scrollbar-thin shadow-inner shadow-black/50"
                    autoFocus
                  />
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 pointer-events-none">
                    Edit Mode
                  </div>
                </div>
              ) : (
                <div className="bg-[#101622] rounded-2xl border border-white/[0.05] p-6 shadow-2xl relative overflow-hidden">
                  {/* Subtle background glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full" />
                  
                  <div className="relative z-10 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {generatedOutput.text}
                  </div>

                  {/* Premium Finish Indicator */}
                  <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-medium text-slate-500 italic">
                        Context stacked and refined by AI
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500/30" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit confirm */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-900/10"
                >
                  <CheckCircle size={14} /> 
                  <span>CONFIRM EDITS</span>
                </button>
              </div>
            )}

            {/* Rating & Metadata */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">FEEDBACK</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLiked(true)}
                    className={clsx(
                      'p-2 rounded-lg flex items-center justify-center transition-all',
                      liked === true
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] border border-transparent'
                    )}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => setLiked(false)}
                    className={clsx(
                      'p-2 rounded-lg flex items-center justify-center transition-all',
                      liked === false
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] border border-transparent'
                    )}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">TIMESTAMP</span>
                <span className="text-xs font-medium text-slate-500">
                  {new Date(generatedOutput.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-center px-8 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center mb-6 relative group animate-float shadow-2xl">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles size={32} className="text-indigo-400 relative z-10" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-tight">Ready to Generate</h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
              Stacked context awaits. Trigger <span className="text-indigo-400 font-bold uppercase tracking-tighter">Run Flow</span> to witness the intelligence.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          </div>
        )}
      </div>

      {/* Footer actions */}
      {generatedOutput && !isGenerating && (
        <div className="border-t border-white/[0.08] p-6 bg-[#0a0d14]/80 backdrop-blur-md sticky bottom-0 z-20">
          {/* Version history */}
          {outputHistory.length > 1 && (
            <div className="mb-4">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] transition-all text-xs text-slate-400 group"
              >
                <Clock size={14} className="group-hover:text-indigo-400 transition-colors" />
                <span className="font-semibold uppercase tracking-widest">History</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px]">{outputHistory.length} versions</span>
                  {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </button>

              {historyOpen && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                  {outputHistory.slice(1).map((out, i) => (
                    <div
                      key={out.id}
                      className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-400 flex items-center gap-3 group/item hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/[0.05] flex items-center justify-center text-[10px] font-bold group-hover/item:bg-indigo-500/20 group-hover/item:text-indigo-400 transition-colors">
                        v{outputHistory.length - i - 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-300 group-hover/item:text-white transition-colors">Snapshot {outputHistory.length - i - 1}</span>
                        <span className="text-[10px] text-slate-600">
                          {new Date(out.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={regenerate}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              <RefreshCw size={14} /> 
              <span>Regenerate</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="w-12 h-12 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white rounded-xl transition-all active:scale-95"
                title="Edit Output"
              >
                <Edit3 size={18} />
              </button>

              <button
                onClick={handleCopy}
                className={clsx(
                  "w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-xl active:scale-95",
                  copied 
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-emerald-900/10"
                    : "bg-[#135bec] hover:bg-blue-600 text-white shadow-blue-900/30"
                )}
                title="Copy to Clipboard"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;


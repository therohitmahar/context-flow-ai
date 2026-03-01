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
        'w-[320px] shrink-0 flex flex-col border-l border-white/[0.06] bg-[#0f1018]',
        'transition-all duration-300 fade-in-up'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
          <Sparkles size={12} className="text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-white flex-1">Generated Output</span>

        {/* Dots */}
        <div className="flex gap-1.5">
          {['bg-red-500', 'bg-amber-500', 'bg-emerald-500'].map((c, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`} />
          ))}
        </div>

        <button
          onClick={() => setOutputPanelOpen(false)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all ml-1"
        >
          <X size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {isGenerating ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 size={14} className="text-indigo-400 animate-spin" />
              <span className="text-sm text-slate-400">Generating with AI...</span>
            </div>
            {/* Skeleton lines */}
            {[100, 80, 95, 70, 88, 60, 75].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded skeleton"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : generatedOutput ? (
          <div className="space-y-4 fade-in-up">
            {/* Nodes used */}
            {generatedOutput.usedNodeTitles.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-2">
                  Nodes Used
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedOutput.usedNodeTitles.map((title) => (
                    <span
                      key={title}
                      className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium"
                    >
                      @{title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Model badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600">Model:</span>
              <span className="text-[10px] font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                {generatedOutput.model}
              </span>
            </div>

            {/* Output text */}
            <div className="relative">
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-64 bg-white/[0.03] border border-indigo-500/30 rounded-xl p-3 text-sm text-slate-200 leading-relaxed focus:outline-none resize-none scrollbar-thin"
                  autoFocus
                />
              ) : (
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {generatedOutput.text}
                </div>
              )}
            </div>

            {/* Edit confirm */}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <CheckCircle size={12} /> Done editing
              </button>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600">Was this helpful?</span>
              <button
                onClick={() => setLiked(true)}
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                  liked === true
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]'
                )}
              >
                <ThumbsUp size={12} />
              </button>
              <button
                onClick={() => setLiked(false)}
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                  liked === false
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]'
                )}
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/[0.05] flex items-center justify-center mb-4">
              <Sparkles size={22} className="text-indigo-400" />
            </div>
            <p className="text-base font-semibold text-slate-300 mb-1">No output yet</p>
            <p className="text-sm text-slate-600">
              Connect your context nodes and click Run Flow to generate output.
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {generatedOutput && !isGenerating && (
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          {/* Version history */}
          {outputHistory.length > 1 && (
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all text-xs text-slate-400"
            >
              <Clock size={12} />
              <span>Version History ({outputHistory.length})</span>
              <div className="ml-auto">
                {historyOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
            </button>
          )}

          {historyOpen && (
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
              {outputHistory.slice(1).map((out, i) => (
                <div
                  key={out.id}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-slate-500 flex items-center gap-2"
                >
                  <Clock size={10} />
                  <span>v{outputHistory.length - i - 1}</span>
                  <span className="ml-auto">
                    {new Date(out.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <Edit3 size={12} /> Edit
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>

            <button
              onClick={regenerate}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-indigo-600/90 border border-indigo-500/30 text-xs text-white hover:bg-indigo-500 transition-all"
            >
              <RefreshCw size={12} /> Regen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;

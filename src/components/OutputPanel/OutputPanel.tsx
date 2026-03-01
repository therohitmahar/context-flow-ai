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
        'w-[380px] shrink-0 flex flex-col shadow-2xl z-40 h-full border-l border-[#2d3748] bg-[#1a202c]',
        'transition-all duration-300 fade-in-up'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#2d3748]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-white">
            <Sparkles size={14} />
          </div>
          <h3 className="font-bold text-white text-sm">Generated Output</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            <span className="flex h-2 w-2 rounded-full bg-purple-500" />
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <button
            onClick={() => setOutputPanelOpen(false)}
            className="w-6 h-6 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all ml-2"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 bg-[#111318]">
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
        <div className="border-t border-[#2d3748] p-4 bg-[#1a202c]">
          {/* Version history */}
          {outputHistory.length > 1 && (
            <div className="mb-3">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-xs text-slate-400"
              >
                <Clock size={12} />
                <span>Version History ({outputHistory.length})</span>
                <div className="ml-auto">
                  {historyOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </div>
              </button>

              {historyOpen && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                  {outputHistory.slice(1).map((out, i) => (
                    <div
                      key={out.id}
                      className="px-3 py-2 rounded-lg bg-[#111318] border border-[#2d3748] text-xs text-slate-400 flex items-center gap-2"
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
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={regenerate}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw size={16} /> Regenerate
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center justify-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              title="Edit Output"
            >
              <Edit3 size={16} />
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center py-2 px-3 bg-[#135bec] hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
              title="Copy to Clipboard"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position, useEdges } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import {
  Mic,
  ChevronDown,
  AlertTriangle,
  SquarePen,
  PlusCircle,
} from 'lucide-react';
import type { ComposerNodeData, ContextNodeData } from '../../../types';
import { MODELS } from '../../../types';
import { useStore } from '../../../store/useStore';
import { getMentionSuggestions, estimateTokens } from '../../../lib/mentions';

const ComposerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const composerData = data as ComposerNodeData;
  const { updateNodeData, nodes } = useStore();
  const edges = useEdges();

  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [cursorAtMention, setCursorAtMention] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const [localPrompt, setLocalPrompt] = useState(composerData.prompt);

  // Sync local prompt if external changes (like Undo/Redo) occur
  useEffect(() => {
    setLocalPrompt(composerData.prompt);
  }, [composerData.prompt]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Connected node IDs
  const connectedNodeIds = new Set(
    edges
      .filter((e) => e.target === id)
      .map((e) => e.source)
  );

  // All context node titles
  const contextNodes = nodes
    .filter((n) => n.type === 'contextNode')
    .map((n) => ({ id: n.id, title: (n.data as ContextNodeData).title }));

  const selectedModel = MODELS.find((m) => m.id === composerData.model) ?? MODELS[0];

  // Render prompt text with highlighted @mentions
  const renderHighlightedText = useCallback(
    (text: string) => {
      const parts: React.ReactNode[] = [];
      const regex = /@(\w+)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }

        const mentionLabel = match[1];
        const node = contextNodes.find(
          (n) => n.title.toLowerCase() === mentionLabel.toLowerCase()
        );
        const isConnected = node ? connectedNodeIds.has(node.id) : false;

        parts.push(
          <mark
            key={match.index}
            className={isConnected ? 'mention-valid' : 'mention-invalid'}
            title={
              isConnected
                ? `@${mentionLabel} is connected`
                : `@${mentionLabel} is not connected — drag an edge first`
            }
          >
            @{mentionLabel}
          </mark>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }

      return parts;
    },
    [contextNodes, connectedNodeIds]
  );

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      
      // Update local state IMMEDIATELY to prevent cursor jumping
      setLocalPrompt(value);

      const cursorPos = e.target.selectionStart ?? 0;

      // Check if we're typing an @mention
      const textBefore = value.slice(0, cursorPos);
      const mentionMatch = textBefore.match(/@(\w*)$/);

      if (mentionMatch) {
        setMentionQuery(mentionMatch[1]);
        setCursorAtMention(cursorPos - mentionMatch[0].length);
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
        setCursorAtMention(-1);
      }

      updateNodeData(id, {
        prompt: value,
        tokenCount: estimateTokens(value),
      });
    },
    [id, updateNodeData]
  );

  const insertMention = useCallback(
    (nodeTitle: string) => {
      const textarea = textareaRef.current;
      if (!textarea || cursorAtMention < 0) return;

      const prompt = localPrompt;
      // Start of the "@" character
      const before = prompt.slice(0, cursorAtMention);
      // End of the search query
      const after = prompt.slice(cursorAtMention + mentionQuery.length + 1);

      const newPrompt = before + `@${nodeTitle} ` + after;

      setLocalPrompt(newPrompt);
      updateNodeData(id, {
        prompt: newPrompt,
        tokenCount: estimateTokens(newPrompt),
      });

      setShowMentionDropdown(false);
      setCursorAtMention(-1);
      setMentionQuery('');

      // Restore focus to textarea after render
      setTimeout(() => {
        textarea.focus();
        const newCursor = cursorAtMention + nodeTitle.length + 2; // +1 for @, +1 for space
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    },
    [id, composerData.prompt, cursorAtMention, mentionQuery, updateNodeData]
  );

  const suggestions = getMentionSuggestions(mentionQuery, contextNodes);

  // Count unconnected @mentions
  const mentionLabels = [...localPrompt.matchAll(/@(\w+)/g)].map((m) => m[1]);
  const unconnectedMentions = mentionLabels.filter((label) => {
    const node = contextNodes.find(
      (n) => n.title.toLowerCase() === label.toLowerCase()
    );
    return node ? !connectedNodeIds.has(node.id) : true;
  });

  return (
    <div
      className={clsx(
        'w-[400px] bg-[#1a202c] rounded-xl shadow-2xl border-2 transition-all',
        selected
          ? 'border-[#135bec]'
          : 'border-[#135bec]/50'
      )}
    >
      {/* Input handles — multiple */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Handle
          key={i}
          type="target"
          position={Position.Left}
          id={`input-${i}`}
          style={{
            width: 12,
            height: 12,
            background: '#475569',
            border: '2px solid #1a202c',
            left: -6,
            top: `${20 + i * 12}%`,
          }}
        />
      ))}

      {/* Output handle */}
      {/* <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 12,
          height: 12,
          background: '#135bec',
          border: '2px solid #1a202c',
          right: -6,
          boxShadow: '0 0 8px rgba(19,91,236,0.8)',
        }}
      /> */}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d3748] bg-slate-800/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-[#135bec]">
            <SquarePen size={20} />
          </span>
          <h3 className="font-bold text-white">Prompt Composer</h3>
        </div>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModelDropdown((v) => !v);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-400 transition-all hover:bg-slate-600"
          >
            {selectedModel.label}
            <ChevronDown size={10} />
          </button>

          {showModelDropdown && (
            <div
              className="absolute right-0 top-7 z-50 w-40 rounded-xl border border-white/[0.08] bg-[#1a1d2e] shadow-2xl overflow-hidden"
              onMouseLeave={() => setShowModelDropdown(false)}
            >
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateNodeData(id, { model: m.id });
                    setShowModelDropdown(false);
                  }}
                  className={clsx(
                    'flex items-center gap-2 w-full px-3 py-2 text-xs transition-all',
                    composerData.model === m.id
                      ? 'bg-white/[0.06] text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: m.color }}
                  />
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Prompt textarea */}
        <div className="relative w-full h-40 bg-[#111318] rounded-lg p-3 text-sm text-slate-200 font-mono border border-[#2d3748] focus-within:ring-2 focus-within:ring-[#135bec]/50 focus-within:border-[#135bec] transition-all">
          {/* Ghost text highlight layer */}
          <div
            ref={highlightRef}
            className="absolute inset-0 m-3 text-sm leading-relaxed pointer-events-none z-0 whitespace-pre-wrap break-words overflow-hidden"
            style={{ color: '#94a3b8' }}
          >
            {localPrompt ? (
              renderHighlightedText(localPrompt)
            ) : (
              <span className="text-slate-600">
                Write your prompt here. Type "@" to reference a context block...
              </span>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={localPrompt}
            onChange={handlePromptChange}
            onScroll={handleScroll}
            onClick={(e) => e.stopPropagation()}
            className="nodrag nowheel w-full h-full bg-transparent text-sm font-mono leading-relaxed text-transparent caret-white focus:outline-none resize-none scrollbar-thin relative z-10"
            style={{ caretColor: '#fff' }}
          />

        {/* @mention dropdown */}
        {showMentionDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 top-full mt-2 w-48 rounded-xl border border-white/[0.08] bg-[#1a1d2e] shadow-2xl overflow-hidden">
            <div className="px-2 py-1 border-b border-white/[0.05]">
              <p className="text-[10px] text-slate-600 font-medium">Context Blocks</p>
            </div>
            {suggestions.map((n) => {
              const isConnected = connectedNodeIds.has(n.id);
              return (
                <button
                  key={n.id}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    insertMention(n.title);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-white/[0.06] transition-all"
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      isConnected ? 'bg-indigo-400' : 'bg-slate-600'
                    )}
                  />
                  <span className="text-slate-300 font-medium">@{n.title}</span>
                  {!isConnected && (
                    <span className="ml-auto text-[10px] text-amber-500">not linked</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between pb-1 px-1">
        <div className="flex gap-2 items-center">
          <button className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-[#135bec] transition-colors">
            <PlusCircle size={18} />
          </button>
          <button className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-[#135bec] transition-colors">
            <Mic size={18} />
          </button>

          {unconnectedMentions.length > 0 && (
            <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={12} className="text-amber-400" />
              <span className="text-[10px] font-medium text-amber-400">
                {unconnectedMentions.length} unlinked
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400">
          {composerData.tokenCount.toLocaleString()} tokens
        </div>
      </div>
    </div>
  </div>
  );
};

export default ComposerNode;

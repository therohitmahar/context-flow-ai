import React, { useState, useRef, useCallback } from 'react';
import { Handle, Position, useEdges } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import {
  Mic,
  Cpu,
  ChevronDown,
  AlertTriangle,
  Sparkles,
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

      const prompt = composerData.prompt;
      const before = prompt.slice(0, cursorAtMention);
      const after = prompt.slice(textarea.selectionStart ?? 0);
      const newPrompt = before + `@${nodeTitle}` + after;

      updateNodeData(id, {
        prompt: newPrompt,
        tokenCount: estimateTokens(newPrompt),
      });
      setShowMentionDropdown(false);
      setCursorAtMention(-1);
      setTimeout(() => {
        textarea.focus();
        const newCursor = cursorAtMention + nodeTitle.length + 1;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    },
    [id, composerData.prompt, cursorAtMention, updateNodeData]
  );

  const suggestions = getMentionSuggestions(mentionQuery, contextNodes);

  // Count unconnected @mentions
  const mentionLabels = [...composerData.prompt.matchAll(/@(\w+)/g)].map((m) => m[1]);
  const unconnectedMentions = mentionLabels.filter((label) => {
    const node = contextNodes.find(
      (n) => n.title.toLowerCase() === label.toLowerCase()
    );
    return node ? !connectedNodeIds.has(node.id) : true;
  });

  return (
    <div
      className={clsx(
        'w-[280px] rounded-2xl border shadow-2xl',
        'bg-[#141620]',
        selected
          ? 'border-purple-500/50'
          : 'border-white/[0.1] hover:border-white/[0.16]'
      )}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(168,85,247,0.3), 0 8px 40px rgba(168,85,247,0.15)'
          : '0 8px 40px rgba(0,0,0,0.4)',
      }}
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
            background: '#6366f1',
            border: '2px solid rgba(99,102,241,0.5)',
            left: -6,
            top: `${20 + i * 12}%`,
            boxShadow: '0 0 8px rgba(99,102,241,0.4)',
          }}
        />
      ))}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 12,
          height: 12,
          background: '#a855f7',
          border: '2px solid rgba(168,85,247,0.5)',
          right: -6,
          boxShadow: '0 0 8px rgba(168,85,247,0.4)',
        }}
      />

      {/* Top color bar */}
      <div className="h-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-transparent rounded-t-2xl" />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-white/[0.05]">
        <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
          <Sparkles size={12} className="text-purple-400" />
        </div>
        <span className="text-sm font-semibold text-white flex-1">Prompt Composer</span>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModelDropdown((v) => !v);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: selectedModel.color + '15',
              color: selectedModel.color,
              border: `1px solid ${selectedModel.color}30`,
            }}
          >
            <Cpu size={10} />
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

      {/* Prompt textarea */}
      <div className="relative px-3 py-2.5">
        {/* Overlay with highlighted text (visual only) */}
        <div
          className="absolute inset-0 mx-3 my-2.5 text-xs leading-relaxed text-transparent pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
          aria-hidden
        >
          {renderHighlightedText(composerData.prompt)}
        </div>

        <textarea
          ref={textareaRef}
          value={composerData.prompt}
          onChange={handlePromptChange}
          onClick={(e) => e.stopPropagation()}
          placeholder='Write your prompt here. Type "@" to reference a context block...'
          rows={6}
          className="w-full bg-transparent text-xs leading-relaxed text-transparent caret-white focus:outline-none resize-none scrollbar-thin relative z-10"
          style={{ caretColor: '#fff' }}
        />

        {/* Ghost text highlight layer */}
        <div
          className="absolute inset-0 mx-3 my-2.5 text-xs leading-relaxed pointer-events-none z-0 whitespace-pre-wrap break-words overflow-hidden"
          style={{ color: '#94a3b8' }}
        >
          {renderHighlightedText(composerData.prompt)}
        </div>

        {/* @mention dropdown */}
        {showMentionDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 left-3 bottom-full mb-1 w-48 rounded-xl border border-white/[0.08] bg-[#1a1d2e] shadow-2xl overflow-hidden">
            <div className="px-2 py-1 border-b border-white/[0.05]">
              <p className="text-[10px] text-slate-600 font-medium">Context Blocks</p>
            </div>
            {suggestions.map((n) => {
              const isConnected = connectedNodeIds.has(n.id);
              return (
                <button
                  key={n.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
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
      <div className="flex items-center justify-between px-3 pb-3 border-t border-white/[0.05] pt-2">
        <div className="flex items-center gap-1.5">
          {unconnectedMentions.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={10} className="text-amber-400" />
              <span className="text-[10px] text-amber-400">
                {unconnectedMentions.length} unlinked
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
            <Mic size={12} />
          </button>
          <div className="text-[10px] font-medium text-slate-600 tabular-nums">
            {composerData.tokenCount.toLocaleString()} tokens
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposerNode;

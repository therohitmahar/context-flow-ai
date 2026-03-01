import React, { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import {
  FileText,
  Link2,
  File,
  Zap,
  Brain,
  MoreHorizontal,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ContextNodeData, ContentType } from '../../../types';
import { useStore } from '../../../store/useStore';

const TYPE_CONFIG: Record<
  ContentType,
  { icon: React.ReactNode; color: string; borderColor: string; label: string }
> = {
  text: {
    icon: <FileText size={12} />,
    color: '#6366f1',
    borderColor: 'rgba(99,102,241,0.4)',
    label: 'Text',
  },
  url: {
    icon: <Link2 size={12} />,
    color: '#a78bfa',
    borderColor: 'rgba(167,139,250,0.4)',
    label: 'URL',
  },
  file: {
    icon: <File size={12} />,
    color: '#f59e0b',
    borderColor: 'rgba(245,158,11,0.4)',
    label: 'File',
  },
  api: {
    icon: <Zap size={12} />,
    color: '#10b981',
    borderColor: 'rgba(16,185,129,0.4)',
    label: 'API',
  },
  memory: {
    icon: <Brain size={12} />,
    color: '#06b6d4',
    borderColor: 'rgba(6,182,212,0.4)',
    label: 'Memory',
  },
};

// Toggle switch
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={clsx(
      'relative w-8 h-4 rounded-full transition-all duration-200 shrink-0',
      checked ? 'bg-indigo-500' : 'bg-white/10'
    )}
  >
    <span
      className={clsx(
        'absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 shadow',
        checked ? 'left-4 bg-white' : 'left-0.5 bg-slate-400'
      )}
    />
  </button>
);

const ContextNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as ContextNodeData;
  const { updateNodeData, removeNode, duplicateNode, setContextMenu } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const config = TYPE_CONFIG[nodeData.contentType] ?? TYPE_CONFIG.text;

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { title: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { content: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleInstructionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { instruction: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
    },
    [id, setContextMenu]
  );

  return (
    <div
      onContextMenu={handleContextMenu}
      className={clsx(
        'w-[220px] rounded-2xl border transition-all duration-200',
        'bg-[#141620] shadow-xl',
        nodeData.enabled ? '' : 'node-disabled',
        selected
          ? 'border-indigo-500/60 shadow-indigo-500/20'
          : 'border-white/[0.08] hover:border-white/[0.14]'
      )}
      style={{
        boxShadow: selected
          ? `0 0 0 1px ${config.color}40, 0 4px 24px ${config.color}15`
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top color bar */}
      <div
        className="h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${config.color}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        {/* Type icon */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: config.color + '20', color: config.color }}
        >
          {config.icon}
        </div>

        {/* @Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-0.5">
            <span style={{ color: config.color }} className="text-xs font-bold">@</span>
            <input
              value={nodeData.title}
              onChange={handleTitleChange}
              className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none min-w-0 truncate"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Toggle */}
        <Toggle
          checked={nodeData.enabled}
          onChange={() => updateNodeData(id, { enabled: !nodeData.enabled })}
        />

        {/* More menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
          >
            <MoreHorizontal size={13} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-6 z-50 w-36 rounded-xl border border-white/[0.08] bg-[#1a1d2e] shadow-2xl overflow-hidden"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => { duplicateNode(id); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all"
              >
                <Copy size={12} /> Duplicate
              </button>
              {!nodeData.isMemory && (
                <button
                  onClick={() => { removeNode(id); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/[0.08] hover:text-red-300 transition-all"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 transition-all"
        >
          {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {/* Content */}
          <textarea
            value={nodeData.content}
            onChange={handleContentChange}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add content here..."
            rows={3}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-white/[0.14] resize-none scrollbar-thin leading-relaxed"
          />

          {/* Instruction */}
          <div>
            <p className="text-[9px] font-semibold tracking-widest uppercase text-slate-600 mb-1">
              Instruction
            </p>
            <input
              value={nodeData.instruction}
              onChange={handleInstructionChange}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add instruction..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-slate-400 placeholder:text-slate-600 focus:outline-none focus:border-white/[0.14]"
            />
          </div>

          {/* Memory badge */}
          {nodeData.isMemory && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Brain size={10} className="text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-medium">Always Active • Cannot Delete</span>
            </div>
          )}
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 12,
          height: 12,
          background: config.color,
          border: '2px solid ' + config.color + '80',
          right: -6,
          boxShadow: `0 0 8px ${config.color}60`,
        }}
      />
    </div>
  );
};

export default ContextNode;

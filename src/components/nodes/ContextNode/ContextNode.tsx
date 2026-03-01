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
  Pencil,
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

// Removed Toggle since connection and prompt mentions will handle usage


const ContextNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as ContextNodeData;
  const { duplicateNode, removeNode, setContextMenu, openModal } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const config = TYPE_CONFIG[nodeData.contentType] ?? TYPE_CONFIG.text;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id });
    },
    [id, setContextMenu]
  );

  const nodeColor = nodeData.color || config.color;

  return (
    <div
      onContextMenu={handleContextMenu}
      className={clsx(
        'w-[260px] rounded-xl border transition-all duration-200 group',
        'bg-[#1a202c] shadow-xl',
        selected
          ? 'border-indigo-500/60 shadow-indigo-500/20'
          : 'border-[#2d3748] hover:border-[#4a5568]'
      )}
    >
      {/* Top color bar */}
      <div
        className="h-1.5 w-full rounded-t-xl transition-colors duration-300"
        style={{ background: nodeColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 max-w-[150px]">
          {/* Type icon */}
          <div style={{ color: nodeColor }} className="shrink-0 transition-colors duration-300">
            {config.icon}
          </div>

          {/* @Title */}
          <div className="flex items-center gap-0.5 min-w-0">
            <h4 style={{ color: config.color }} className="text-sm font-bold shrink-0">@</h4>
            <span className="text-sm font-bold text-white truncate">
              {nodeData.title}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center">
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal('edit-node', id);
            }}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
            title="Edit Context"
          >
            <Pencil size={11} />
          </button>

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
            className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Content */}
          {nodeData.content ? (
            <div className="w-full text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {nodeData.content}
            </div>
          ) : (
             <div className="text-xs text-slate-500 italic">No content. Click pen icon to edit.</div>
          )}

          {/* Instruction */}
          {nodeData.instruction && (
            <div className="bg-[#111318] rounded p-2 border border-[#2d3748]">
              <label className="text-[10px] uppercase font-bold text-[#a855f7] mb-1 block">
                Instruction
              </label>
              <div className="w-full text-xs text-slate-300 max-h-20 overflow-y-auto scrollbar-thin">
                {nodeData.instruction}
              </div>
            </div>
          )}

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
          border: '2px solid #1a202c',
          right: -6,
        }}
      />
    </div>
  );
};

export default ContextNode;

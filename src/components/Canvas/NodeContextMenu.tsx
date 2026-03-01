import React, { useEffect, useRef } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({ x, y, nodeId, onClose }) => {
  const { duplicateNode, removeNode, nodes } = useStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const node = nodes.find((n) => n.id === nodeId);
  const isMemory = (node?.data as { isMemory?: boolean })?.isMemory;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Clamp to viewport
  const menuWidth = 160;
  const menuHeight = 100;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] w-40 rounded-xl border border-white/[0.08] bg-[#1a1d2e]/95 backdrop-blur-md shadow-2xl overflow-hidden"
      style={{ left: clampedX, top: clampedY }}
    >
      <div className="px-3 py-1.5 border-b border-white/[0.05]">
        <p className="text-[10px] text-slate-600 font-medium truncate">
          Node Actions
        </p>
      </div>

      <button
        onClick={() => {
          duplicateNode(nodeId);
          onClose();
        }}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all"
      >
        <Copy size={12} className="text-slate-500" />
        Duplicate
      </button>

      {!isMemory && (
        <button
          onClick={() => {
            removeNode(nodeId);
            onClose();
          }}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/[0.08] hover:text-red-300 transition-all"
        >
          <Trash2 size={12} />
          Delete
        </button>
      )}
    </div>
  );
};

export default NodeContextMenu;

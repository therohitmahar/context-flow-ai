import React from 'react';
import { clsx } from 'clsx';
import {
  FileText,
  Link2,
  File,
  Zap,
  GripVertical,
  User,
  Volume2,
  Code2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ContentType } from '../../types';
import { SAVED_CONTEXTS } from '../../types';

interface LibraryButtonProps {
  label: string;
  icon: React.ReactNode;
  contentType: ContentType;
  color: string;
  onClick: () => void;
}

const LibraryButton: React.FC<LibraryButtonProps> = ({ label, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex flex-col items-center justify-center p-3 rounded-lg border transition-all group',
      'bg-[#1a202c] border-[#2d3748] hover:border-[#135bec]/50 hover:bg-[#135bec]/5'
    )}
  >
    <span style={{ color }} className="mb-1 group-hover:scale-110 transition-transform">
      {icon}
    </span>
    <span className="text-xs font-medium text-slate-300">
      {label}
    </span>
  </button>
);

const savedContextIcons: Record<string, React.ReactNode> = {
  'saved-resume': <FileText size={14} />,
  'saved-profile': <User size={14} />,
  'saved-tone': <Volume2 size={14} />,
  'saved-guidelines': <Code2 size={14} />,
};

const savedContextColors: Record<string, string> = {
  'saved-resume': '#3b82f6',
  'saved-profile': '#a855f7',
  'saved-tone': '#f59e0b',
  'saved-guidelines': '#22c55e',
};

const Sidebar: React.FC = () => {
  const { addContextNode, addSavedContext } = useStore();

  const libraryItems = [
    { label: 'Text', icon: <FileText size={18} />, type: 'text' as ContentType, color: '#135bec' },
    { label: 'URL', icon: <Link2 size={18} />, type: 'url' as ContentType, color: '#a855f7' },
    { label: 'File', icon: <File size={18} />, type: 'file' as ContentType, color: '#f59e0b' },
    { label: 'API', icon: <Zap size={18} />, type: 'api' as ContentType, color: '#22c55e' },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[#2d3748] bg-[#111318] z-10 overflow-hidden">
      {/* Library section */}
      <div className="p-4 border-b border-[#2d3748]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Library
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {libraryItems.map((item) => (
            <LibraryButton
              key={item.type}
              label={item.label}
              icon={item.icon}
              contentType={item.type}
              color={item.color}
              onClick={() => addContextNode(item.type)}
            />
          ))}
        </div>
      </div>

      {/* Saved Contexts */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Saved Contexts
        </h3>
        <div className="space-y-2">
          {SAVED_CONTEXTS.map((ctx) => {
            const ctxColor = savedContextColors[ctx.id] ?? '#6366f1';
            return (
              <button
                key={ctx.id}
                onClick={() => addSavedContext(ctx)}
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#1a202c] border border-[#2d3748] cursor-grab active:cursor-grabbing hover:border-[#135bec]/50 transition-colors shadow-sm text-left group"
                title={`Add "${ctx.title}" to canvas`}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                  style={{ background: ctxColor + '1a', color: ctxColor }}
                >
                  {savedContextIcons[ctx.id] ?? <FileText size={14} />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {ctx.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {ctx.subtitle}
                  </p>
                </div>

                {/* Drag handle */}
                <GripVertical
                  size={14}
                  className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage bar */}
      <div className="p-4 border-t border-[#2d3748] bg-[#111318]">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Storage Used</span>
          <span>45%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-[#135bec] w-[45%] rounded-full" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

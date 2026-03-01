import React from 'react';
import { clsx } from 'clsx';
import {
  FileText,
  Link2,
  File,
  Zap,
  GripVertical,
  Plus,
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
      'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all group hover:scale-[1.03] active:scale-[0.97]',
      'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.12]'
    )}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform"
      style={{ background: color + '20', color }}
    >
      {icon}
    </div>
    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
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
  'saved-resume': '#6366f1',
  'saved-profile': '#10b981',
  'saved-tone': '#f59e0b',
  'saved-guidelines': '#06b6d4',
};

const Sidebar: React.FC = () => {
  const { addContextNode, addSavedContext } = useStore();

  const libraryItems = [
    { label: 'Text', icon: <FileText size={16} />, type: 'text' as ContentType, color: '#6366f1' },
    { label: 'URL', icon: <Link2 size={16} />, type: 'url' as ContentType, color: '#a78bfa' },
    { label: 'File', icon: <File size={16} />, type: 'file' as ContentType, color: '#f59e0b' },
    { label: 'API', icon: <Zap size={16} />, type: 'api' as ContentType, color: '#10b981' },
  ];

  return (
    <aside className="w-[156px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0d0e14] overflow-hidden">
      {/* Library section */}
      <div className="p-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-2.5 px-0.5">
          Library
        </p>
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

      <div className="mx-3 border-t border-white/[0.05]" />

      {/* Saved Contexts */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-2.5 px-0.5">
          Saved Contexts
        </p>
        <div className="flex flex-col gap-1.5">
          {SAVED_CONTEXTS.map((ctx) => (
            <button
              key={ctx.id}
              onClick={() => addSavedContext(ctx)}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group text-left w-full"
              title={`Add "${ctx.title}" to canvas`}
            >
              {/* Drag handle */}
              <GripVertical
                size={12}
                className="text-slate-700 group-hover:text-slate-500 shrink-0 transition-colors"
              />

              {/* Icon */}
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: (savedContextColors[ctx.id] ?? '#6366f1') + '20',
                  color: savedContextColors[ctx.id] ?? '#6366f1',
                }}
              >
                {savedContextIcons[ctx.id] ?? <FileText size={12} />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 group-hover:text-white truncate transition-colors leading-tight">
                  {ctx.title}
                </p>
                <p className="text-[10px] text-slate-600 truncate leading-tight mt-0.5">
                  {ctx.subtitle}
                </p>
              </div>

              {/* Plus on hover */}
              <Plus
                size={12}
                className="text-slate-700 group-hover:text-indigo-400 shrink-0 transition-colors"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Storage bar */}
      <div className="p-3 border-t border-white/[0.05]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-600">Storage Used</span>
          <span className="text-[10px] font-medium text-slate-400">45%</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: '45%' }}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

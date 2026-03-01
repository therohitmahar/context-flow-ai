import React from 'react';
import {
  FileText,
  User,
  Volume2,
  Code2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef, useEffect } from 'react';

const savedContextIcons: Record<string, React.ReactNode> = {
  'saved-resume': <FileText size={14} />,
  'saved-profile': <User size={14} />,
  'saved-tone': <Volume2 size={14} />,
  'saved-guidelines': <Code2 size={14} />,
};



const Sidebar: React.FC = () => {
  const { addSavedContext, savedContexts, openModal, deleteSavedContext } = useStore();
  const [width, setWidth] = useState(256);
  const isResizing = useRef(false);

  const handleAddBlock = () => {
    openModal('add-node');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 600) newWidth = 600;
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto'; // Re-enable text selection
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection during drag
  };

  return (
    <aside 
      className="shrink-0 flex flex-col border-r border-[#2d3748] bg-[#111318] z-10 overflow-hidden relative"
      style={{ width }}
    >
      <div 
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#135bec]/30 transition-colors z-20 group-hover:block"
        onMouseDown={startResizing}
      />
      <div className="p-4 border-b border-[#2d3748]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Library
        </h3>
        <button
          onClick={handleAddBlock}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white">
            <span className="text-white text-xs leading-none">+</span>
          </div>
          Add New Block
        </button>
      </div>

      {/* Saved Contexts */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Saved Contexts
        </h3>
        <div className="space-y-2">
          {savedContexts.map((ctx) => {
            const ctxColor = ctx.color || '#6366f1';
            return (
              <div
                key={ctx.id}
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#1a202c] border border-[#2d3748] hover:border-[#135bec]/50 transition-colors shadow-sm text-left group"
              >
                {/* Clickable area to add to canvas */}
                <button
                  onClick={() => addSavedContext(ctx)}
                  className="flex-1 flex items-center gap-3 min-w-0"
                  title={`Add "${ctx.title}" to canvas`}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: ctxColor + '15', color: ctxColor }}
                  >
                    {savedContextIcons[ctx.id] ?? <FileText size={16} />}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-white truncate">
                      @{ctx.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Text Context
                    </p>
                  </div>
                </button>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 items-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('edit-saved', ctx.id);
                    }}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                    title="Edit Context"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSavedContext(ctx.id);
                    }}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Context"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage bar */}
      {/* <div className="p-4 border-t border-[#2d3748] bg-[#111318]">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Storage Used</span>
          <span>45%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-[#135bec] w-[45%] rounded-full" />
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar;

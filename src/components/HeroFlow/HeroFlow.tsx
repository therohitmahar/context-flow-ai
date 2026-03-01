import React from 'react';
import { ReactFlow, Handle, Position, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const InputNode = () => (
  <div className="w-64 bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg p-4">
    <div className="flex justify-between mb-3 border-b border-slate-700 pb-2">
      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Input Source</span>
      <span className="material-symbols-outlined text-slate-500 text-sm">settings</span>
    </div>
    <div className="space-y-2">
      <div className="h-2 w-1/3 bg-slate-700 rounded"></div>
      <div className="h-16 w-full bg-slate-800 rounded border border-slate-700 p-2 text-xs text-slate-500 font-mono">
        User uploaded specific marketing docs...
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="size-3 bg-blue-500 rounded-full border-2 border-[#1e293b] -right-1.5" />
  </div>
);

const BlenderNode = () => (
  <div className="w-64 bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg p-4">
    <Handle type="target" position={Position.Left} className="size-3 bg-blue-500 rounded-full border-2 border-[#1e293b] -left-1.5" />
    <div className="flex justify-between mb-3 border-b border-slate-700 pb-2">
      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Context Blender</span>
      <span className="material-symbols-outlined text-slate-500 text-sm">tune</span>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span className="material-symbols-outlined text-sm">add_link</span>
        <span>Combine Sources</span>
      </div>
      <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
    </div>
    <Handle type="source" position={Position.Right} className="size-3 bg-purple-500 rounded-full border-2 border-[#1e293b] -right-1.5" />
  </div>
);

const LLMNode = () => (
  <div className="w-64 bg-[#1e293b] rounded-xl border border-blue-500/50 shadow-lg shadow-blue-500/10 p-4">
    <Handle type="target" position={Position.Left} className="size-3 bg-purple-500 rounded-full border-2 border-[#1e293b] -left-1.5" />
    <div className="flex justify-between mb-3 border-b border-slate-700 pb-2">
      <span className="text-xs font-bold text-green-400 uppercase tracking-wider">LLM Generator</span>
      <span className="material-symbols-outlined text-slate-500 text-sm">smart_toy</span>
    </div>
    <div className="bg-black/30 rounded p-3 text-xs text-green-300 font-mono border border-green-900/30">
      Output generated successfully...
    </div>
  </div>
);

const nodeTypes = {
  inputNode: InputNode,
  blenderNode: BlenderNode,
  llmNode: LLMNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'inputNode', position: { x: 50, y: 50 }, data: {} },
  { id: '2', type: 'blenderNode', position: { x: 350, y: 150 }, data: {} },
  { id: '3', type: 'llmNode', position: { x: 700, y: 80 }, data: {} },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 }
  },
];

export const HeroFlow: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-[#0a0c10] absolute top-0 w-full z-10">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="size-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="size-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span>Flow: Content_Generator_v2</span>
        </div>
        <div className="flex gap-2">
          <div className="size-6 rounded bg-slate-800"></div>
          <div className="size-6 rounded bg-[#6366f1]/20"></div>
        </div>
      </div>
      <div className="absolute inset-0 pt-12">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          className="node-pattern bg-transparent"
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          preventScrolling={false}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { ReactFlow, Handle, Position, useNodesState, useEdgesState, Controls, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const colorMap: Record<string, { bg: string; text: string; }> = {
  orange: { bg: 'bg-orange-500', text: 'text-orange-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500' }
};

const ContextNode = ({ data }: { data: any }) => {
  const { bg, text } = colorMap[data.color] || colorMap.blue;
  return (
    <div className="w-48 bg-[#151921] rounded-lg border border-slate-700 shadow-xl">
      <div className={`h-1 w-full rounded-t-lg ${bg}`}></div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`material-symbols-outlined ${text} text-xs`}>{data.icon}</span>
          <span className="font-bold text-slate-100 text-xs">{data.title}</span>
        </div>
        <div className={`h-1.5 ${data.w1} bg-slate-800 rounded mb-1`}></div>
        <div className={`h-1.5 ${data.w2} bg-slate-800 rounded`}></div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className={`size-2 ${bg} border-[#151921] right-[-5px]`} 
      />
    </div>
  );
};

const ComposerNode = () => (
  <div className="w-64 bg-[#1e2330] rounded-xl border border-blue-500/50 shadow-2xl">
    <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-[#1e2330] rounded-t-xl">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-400 text-sm">edit_note</span>
        <span className="font-bold text-white text-sm">Composer</span>
      </div>
      <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
    </div>
    <div className="p-4 space-y-3">
      <div className="bg-[#151921] rounded border border-slate-700/50 p-3 font-mono text-[10px] text-slate-400 leading-relaxed">
        <p>Analyze <span className="text-orange-400 bg-orange-900/20 px-1 rounded">@Resume</span> against <span className="text-purple-400 bg-purple-900/20 px-1 rounded">@JD</span> requirements.</p>
      </div>
      <div className="flex justify-end">
        <div className="h-6 w-20 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold text-white">Generate</div>
      </div>
    </div>
    <Handle type="target" position={Position.Left} id="t1" className="top-[30%] size-2 bg-slate-600 border-[#1e2330] left-[-5px]" />
    <Handle type="target" position={Position.Left} id="t2" className="top-[50%] size-2 bg-slate-600 border-[#1e2330] left-[-5px]" />
    <Handle type="target" position={Position.Left} id="t3" className="top-[70%] size-2 bg-slate-600 border-[#1e2330] left-[-5px]" />
  </div>
);

const nodeTypes = {
  contextNode: ContextNode,
  composerNode: ComposerNode,
};

const initialNodes: Node[] = [
  { 
    id: '1', 
    type: 'contextNode', 
    position: { x: 50, y: 50 }, 
    data: { title: '@Resume', icon: 'description', color: 'orange', w1: 'w-3/4', w2: 'w-1/2' } 
  },
  { 
    id: '2', 
    type: 'contextNode', 
    position: { x: 20, y: 160 }, 
    data: { title: '@JD', icon: 'link', color: 'purple', w1: 'w-2/3', w2: 'w-full' } 
  },
  { 
    id: '3', 
    type: 'contextNode', 
    position: { x: 60, y: 280 }, 
    data: { title: '@Profile', icon: 'person', color: 'blue', w1: 'w-full', w2: 'w-1/2' } 
  },
  { 
    id: '4', 
    type: 'composerNode', 
    position: { x: 400, y: 120 }, 
    data: {} 
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-4', source: '1', target: '4', targetHandle: 't1', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 1.5, opacity: 0.6 } },
  { id: 'e2-4', source: '2', target: '4', targetHandle: 't2', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 1.5, opacity: 0.6 } },
  { id: 'e3-4', source: '3', target: '4', targetHandle: 't3', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 1.5, opacity: 0.6 } },
];

export const FeatureFlow: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="opacity-80 drop-shadow-md" />
      </ReactFlow>
    </div>
  );
};

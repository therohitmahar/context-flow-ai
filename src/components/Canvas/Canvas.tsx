import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import type { NodeChange, EdgeChange, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store/useStore';
import ContextNode from '../nodes/ContextNode/ContextNode';
import ComposerNode from '../nodes/ComposerNode/ComposerNode';
import NodeContextMenu from './NodeContextMenu';

const nodeTypes = {
  contextNode: ContextNode,
  composerNode: ComposerNode,
};

const Canvas: React.FC = () => {
  const {
    nodes,
    edges,
    searchQuery,
    onNodesChange,
    onEdgesChange,
    onConnect,
    contextMenu,
    setContextMenu,
  } = useStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Filter nodes by search query
  const filteredNodes = searchQuery
    ? nodes.map((n) => {
        const title = (n.data as { title?: string }).title ?? '';
        const matches = title.toLowerCase().includes(searchQuery.toLowerCase());
        return {
          ...n,
          style: matches
            ? { ...n.style }
            : { ...n.style, opacity: 0.25 },
        };
      })
    : nodes;

  const handlePaneClick = useCallback(() => {
    setContextMenu(null);
  }, [setContextMenu]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [setContextMenu]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 relative bg-[#0d0e14]">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange as (changes: NodeChange[]) => void}
        onEdgesChange={onEdgesChange as (changes: EdgeChange[]) => void}
        onConnect={onConnect as (connection: Connection) => void}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e2235"
        />

        {/* <Controls
          className="!bottom-4 !left-4"
          style={{
            background: 'rgba(20, 22, 32, 0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
          }}
        /> */}

        <MiniMap
          className="!bottom-4 !right-4"
          nodeColor={(node) => {
            if (node.type === 'composerNode') return '#7c3aed';
            const data = node.data as { contentType?: string };
            const colors: Record<string, string> = {
              text: '#6366f1',
              url: '#a78bfa',
              file: '#f59e0b',
              api: '#10b981',
              memory: '#06b6d4',
            };
            return colors[data.contentType ?? 'text'] ?? '#6366f1';
          }}
          style={{
            background: 'rgba(13, 14, 20, 0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-center">
            <div className="mt-32 text-center">
              <p className="text-slate-400 text-sm">
                Click a type in the Library to add your first context block.
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Right-click context menu */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Canvas;

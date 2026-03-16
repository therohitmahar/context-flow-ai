import React, { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useNodesInitialized,
  useReactFlow,
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
    viewport,
    setViewport,
    sessionId,
    currentTemplateId,
  } = useStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getViewport, setViewport: applyViewport } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasAppliedInitialViewportRef = useRef(false);

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

  useEffect(() => {
    hasAppliedInitialViewportRef.current = false;
  }, [sessionId, currentTemplateId]);

  useEffect(() => {
    if (!nodesInitialized || hasAppliedInitialViewportRef.current) return;

    if (viewport) {
      void applyViewport(viewport, { duration: 0 });
      hasAppliedInitialViewportRef.current = true;
      return;
    }

    let cancelled = false;
    const applyFullView = async () => {
      await fitView({ padding: 0.35, maxZoom: 0.8, duration: 0 });
      if (!cancelled) {
        setViewport(getViewport(), false);
        hasAppliedInitialViewportRef.current = true;
      }
    };

    void applyFullView();

    return () => {
      cancelled = true;
    };
  }, [
    applyViewport,
    currentTemplateId,
    fitView,
    getViewport,
    nodesInitialized,
    sessionId,
    setViewport,
    viewport,
  ]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 relative bg-[#0d1117]">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange as (changes: NodeChange[]) => void}
        onEdgesChange={onEdgesChange as (changes: EdgeChange[]) => void}
        onConnect={onConnect as (connection: Connection) => void}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onMoveEnd={(_, nextViewport) => setViewport(nextViewport)}
        nodeTypes={nodeTypes}
        fitView={false}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#4a5568', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={1}
          color="#2d3748"
        />

        <Controls
          className="!bottom-4 !left-4"
          style={{
            background: '#1a202c',
            border: '1px solid #2d3748',
            borderRadius: '8px',
          }}
        />

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
            background: '#0d1117',
            border: '1px solid #2d3748',
            borderRadius: '8px',
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

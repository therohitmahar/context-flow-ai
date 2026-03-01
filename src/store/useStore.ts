import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppNode,
  ContextNodeData,
  ComposerNodeData,
  GeneratedOutput,
  Project,
  ContentType,
  SavedContext,
  ContextMenu,
} from '../types';
import {
  loadFromStorage,
  saveToStorage,
  buildDefaultNodes,
  buildDefaultEdges,
  runFlowAction,
} from '../lib/localStorage';

interface HistoryEntry {
  nodes: AppNode[];
  edges: Edge[];
}

interface AppState {
  // Canvas state
  nodes: AppNode[];
  edges: Edge[];

  // Undo / Redo
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Project
  activeProject: Project;

  // Output
  generatedOutput: GeneratedOutput | null;
  outputHistory: GeneratedOutput[];
  isGenerating: boolean;

  // UI state
  searchQuery: string;
  isOutputPanelOpen: boolean;
  contextMenu: ContextMenu | null;
  autoSaveStatus: 'saved' | 'saving' | 'unsaved';

  // Actions — canvas
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Actions — nodes
  addContextNode: (contentType: ContentType, position?: { x: number; y: number }) => void;
  addSavedContext: (saved: SavedContext) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<ContextNodeData | ComposerNodeData>) => void;
  toggleNodeEnabled: (nodeId: string) => void;

  // Actions — flow
  runFlow: () => Promise<void>;
  regenerate: () => Promise<void>;

  // Actions — history
  undo: () => void;
  redo: () => void;
  reset: () => void;

  // Actions — UI
  setSearchQuery: (q: string) => void;
  setOutputPanelOpen: (open: boolean) => void;
  setContextMenu: (menu: ContextMenu | null) => void;
  updateProjectName: (name: string) => void;

  // Persistence
  save: () => void;
  load: () => void;
}

const defaultProject: Project = {
  id: 'default-project',
  name: 'Cover Letter Generator',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function randomOffset() {
  return {
    x: 350 + Math.random() * 200,
    y: 100 + Math.random() * 300,
  };
}

export const useStore = create<AppState>((set, get) => ({
  nodes: buildDefaultNodes(),
  edges: buildDefaultEdges(),
  past: [],
  future: [],
  activeProject: defaultProject,
  generatedOutput: null,
  outputHistory: [],
  isGenerating: false,
  searchQuery: '',
  isOutputPanelOpen: false,
  contextMenu: null,
  autoSaveStatus: 'saved',

  // ── Canvas ────────────────────────────────────────────────────────────────
  onNodesChange: (changes) => {
    // Only snapshot on drag-end or removal (not every position update)
    const hasDragEnd = changes.some((c) => c.type === 'position' && !(c as { dragging?: boolean }).dragging);
    const hasRemove = changes.some((c) => c.type === 'remove');
    if (hasDragEnd || hasRemove) {
      const { nodes, edges } = get();
      set((s) => ({ past: [...s.past, { nodes, edges }].slice(-50), future: [] }));
    }
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes) as AppNode[],
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  onEdgesChange: (changes) => {
    const hasRemove = changes.some((c) => c.type === 'remove');
    if (hasRemove) {
      const { nodes, edges } = get();
      set((s) => ({ past: [...s.past, { nodes, edges }].slice(-50), future: [] }));
    }
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges),
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    set((s) => ({ past: [...s.past, { nodes, edges }].slice(-50), future: [] }));
    set((s) => ({
      edges: addEdge(
        { ...connection, animated: true, id: `edge-${uuidv4()}` },
        s.edges
      ),
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  // ── Nodes ─────────────────────────────────────────────────────────────────
  addContextNode: (contentType, position) => {
    const id = `node-${uuidv4()}`;
    const titles: Record<ContentType, string> = {
      text: 'NewText',
      url: 'NewURL',
      file: 'NewFile',
      api: 'NewAPI',
      memory: 'Memory',
    };

    const newNode: AppNode = {
      id,
      type: 'contextNode',
      position: position ?? randomOffset(),
      data: {
        title: titles[contentType],
        contentType,
        content: '',
        instruction: '',
        enabled: true,
      },
    } as AppNode;

    const { nodes, edges } = get();
    set((s) => ({
      past: [...s.past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...s.nodes, newNode],
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  addSavedContext: (saved) => {
    const id = `node-${uuidv4()}`;
    const sanitizedTitle = saved.title.replace(/[^a-zA-Z0-9]/g, '');
    const newNode: AppNode = {
      id,
      type: 'contextNode',
      position: randomOffset(),
      data: {
        title: sanitizedTitle,
        contentType: saved.contentType,
        content: saved.content,
        instruction: saved.instruction,
        enabled: true,
      },
    } as AppNode;

    const { nodes, edges } = get();
    set((s) => ({
      past: [...s.past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...s.nodes, newNode],
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  removeNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if ((node?.data as ContextNodeData)?.isMemory) return;

    const { nodes, edges } = get();
    set((s) => ({
      past: [...s.past, { nodes, edges }].slice(-50),
      future: [],
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      contextMenu: null,
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newId = `node-${uuidv4()}`;
    const newNode: AppNode = {
      ...node,
      id: newId,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      data: { ...(node.data as Record<string, unknown>) },
    } as AppNode;

    const { nodes, edges } = get();
    set((s) => ({
      past: [...s.past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...s.nodes, newNode],
      contextMenu: null,
    }));
  },

  updateNodeData: (nodeId, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...(n.data as Record<string, unknown>), ...data } }
          : n
      ) as AppNode[],
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1200);
  },

  toggleNodeEnabled: (nodeId) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const d = n.data as ContextNodeData;
        return { ...n, data: { ...d, enabled: !d.enabled } } as AppNode;
      }),
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  // ── History ───────────────────────────────────────────────────────────────
  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [{ nodes, edges }, ...s.future].slice(0, 50),
      nodes: prev.nodes,
      edges: prev.edges,
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 500);
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((s) => ({
      future: s.future.slice(1),
      past: [...s.past, { nodes, edges }].slice(-50),
      nodes: next.nodes,
      edges: next.edges,
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 500);
  },

  reset: () => {
    const { nodes, edges } = get();
    set((s) => ({
      past: [...s.past, { nodes, edges }].slice(-50),
      future: [],
      nodes: buildDefaultNodes(),
      edges: buildDefaultEdges(),
      generatedOutput: null,
      isOutputPanelOpen: false,
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 500);
  },

  // ── Flow ──────────────────────────────────────────────────────────────────
  runFlow: async () => {
    const { nodes, edges } = get();
    set({ isGenerating: true, isOutputPanelOpen: true });
    try {
      const output = await runFlowAction(nodes, edges);
      set((s) => ({
        generatedOutput: output,
        outputHistory: [output, ...s.outputHistory].slice(0, 10),
        isGenerating: false,
        autoSaveStatus: 'unsaved',
      }));
      setTimeout(() => get().save(), 1000);
    } catch (err) {
      console.error('Run flow error:', err);
      set({ isGenerating: false });
    }
  },

  regenerate: async () => {
    await get().runFlow();
  },

  // ── UI ────────────────────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q }),
  setOutputPanelOpen: (open) => set({ isOutputPanelOpen: open }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  updateProjectName: (name) =>
    set((s) => ({
      activeProject: { ...s.activeProject, name, updatedAt: Date.now() },
    })),

  // ── Persistence ───────────────────────────────────────────────────────────
  save: () => {
    const { nodes, edges, activeProject, outputHistory } = get();
    set({ autoSaveStatus: 'saving' });
    saveToStorage({ nodes, edges, activeProject, outputHistory });
    set({ autoSaveStatus: 'saved' });
  },

  load: () => {
    const data = loadFromStorage();
    if (data) {
      set({
        nodes: data.nodes,
        edges: data.edges,
        activeProject: data.activeProject,
        outputHistory: data.outputHistory,
      });
    }
  },
}));

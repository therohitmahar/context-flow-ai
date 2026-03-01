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
import { supabase } from '../lib/supabase';
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
import { SAVED_CONTEXTS, NODE_COLORS } from '../types';
import {
  loadFromStorage,
  saveToStorage,
  buildDefaultNodes,
  buildDefaultEdges,
  runFlowAction,
} from '../lib/localStorage';

const viewedTemplates = new Set<string>();

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

  // Project & Contexts
  activeProject: Project;
  savedContexts: SavedContext[];

  // Output
  generatedOutput: GeneratedOutput | null;
  outputHistory: GeneratedOutput[];
  isGenerating: boolean;

  // UI state
  searchQuery: string;
  isOutputPanelOpen: boolean;
  contextMenu: ContextMenu | null;
  autoSaveStatus: 'saved' | 'saving' | 'unsaved';
  saveCount: number;
  sessionId: string;
  user: any | null;
  setUser: (u: any) => void;
  modalState: {
    isOpen: boolean;
    mode: 'add-node' | 'edit-node' | 'edit-saved';
    targetId: string | null;
  };

  // Flow / Template State
  currentTemplateId: string | null;
  isTemplateOwner: boolean;

  // Actions — canvas
  setNodes: (updater: (nodes: AppNode[]) => AppNode[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Actions — nodes
  addContextNode: (data: Partial<ContextNodeData> & { contentType: ContentType }, position?: { x: number; y: number }) => void;
  addSavedContext: (saved: SavedContext) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<ContextNodeData | ComposerNodeData>) => void;

  // Actions — saved contexts
  createSavedContext: (context: Omit<SavedContext, 'id'>) => void;
  updateSavedContext: (id: string, updates: Partial<SavedContext>) => void;
  deleteSavedContext: (id: string) => void;

  // Actions — Backend Sync
  syncToSupabase: () => Promise<void>;
  setSessionId: (id: string) => void;

  // Actions — flow
  runFlow: () => Promise<void>;
  regenerate: () => Promise<void>;

  // Undo / Redo / Reset
  undo: () => void;
  redo: () => void;
  reset: () => void;

  // Actions — UI
  setSearchQuery: (q: string) => void;
  setOutputPanelOpen: (open: boolean) => void;
  setContextMenu: (menu: ContextMenu | null) => void;
  openModal: (mode: 'add-node' | 'edit-node' | 'edit-saved', targetId?: string) => void;
  closeModal: () => void;
  updateProjectName: (name: string) => void;

  // Persistence
  save: () => void;
  load: () => void;
  saveAsTemplate: (name: string) => Promise<string | null>;
}

const defaultProject: Project = {
  id: 'default-project',
  name: 'Untitled Flow',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function randomOffset() {
  return {
    x: 350 + Math.random() * 200,
    y: 100 + Math.random() * 300,
  };
}

function getEmptyPosition(nodes: AppNode[]) {
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 160;
  const START_X = 350;
  const START_Y = 100;

  let x = START_X;
  let y = START_Y;

  let attempts = 0;
  while (attempts < 100) {
    const isOverlapping = nodes.some((node) => {
      const nx = node.position.x;
      const ny = node.position.y;
      return Math.abs(nx - x) < NODE_WIDTH && Math.abs(ny - y) < NODE_HEIGHT;
    });

    if (!isOverlapping) {
      return { x, y };
    }

    y += NODE_HEIGHT + 20;
    if (y > 800) {
      y = START_Y;
      x += NODE_WIDTH + 20;
    }
    attempts++;
  }

  return randomOffset(); // fallback
}

export const useStore = create<AppState>((set, get) => ({
  nodes: buildDefaultNodes(),
  edges: buildDefaultEdges(),
  past: [],
  future: [],
  activeProject: defaultProject,
  savedContexts: [...SAVED_CONTEXTS], // Initialize with defaults from types
  generatedOutput: null,
  outputHistory: [],
  isGenerating: false,
  searchQuery: '',
  isOutputPanelOpen: false,
  contextMenu: null,
  modalState: { isOpen: false, mode: 'add-node', targetId: null },
  autoSaveStatus: 'saved',
  saveCount: 0,
  sessionId: uuidv4(),
  user: null,

  setUser: (u) => set({ user: u }),
  setNodes: (updater) => set((s) => ({ nodes: updater(s.nodes) })),

  // ── Backend Sync ──────────────────────────────────────────────────────────
  setSessionId: (id) => set({ sessionId: id }),
  syncToSupabase: async () => {
    const { nodes, edges, activeProject, outputHistory, savedContexts, sessionId, user } = get();
    const state_data = { nodes, edges, activeProject, outputHistory, savedContexts };
    
    try {
      const { error } = await supabase
        .from('user_projects')
        .upsert(
          { 
            session_id: sessionId, 
            user_id: user?.id || null,
            state_data 
          }, 
          { onConflict: 'session_id' }
        );
        
      if (error) console.error('Supabase sync error:', error);
    } catch (err) {
      console.error('Failed to sync to Supabase', err);
    }
  },

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
  addContextNode: (data, position) => {
    const { nodes, edges } = get();
    const id = `node-${uuidv4()}`;
    const contextNodeCount = nodes.filter(n => n.type === 'contextNode').length;

    const newNode: AppNode = {
      id,
      type: 'contextNode',
      position: position ?? getEmptyPosition(nodes),
      data: {
        title: data.title || 'New Block Title',
        contentType: data.contentType || 'text',
        content: data.content || '',
        instruction: data.instruction || '',
        color: data.color || NODE_COLORS[contextNodeCount % NODE_COLORS.length],
      },
    } as AppNode;

    set((s) => ({
      past: [...s.past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...s.nodes, newNode],
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1000);
  },

  addSavedContext: (saved) => {
    const { nodes, edges } = get();
    const sanitizedTitle = saved.title.replace(/[^a-zA-Z0-9-]/g, '');
    
    // Prevent duplicate context from sidebar
    const isDuplicate = nodes.some(n => n.type === 'contextNode' && (n.data as ContextNodeData).title === sanitizedTitle);
    if (isDuplicate) return;

    const id = `node-${uuidv4()}`;
    const contextNodeCount = nodes.filter(n => n.type === 'contextNode').length;

    const newNode: AppNode = {
      id,
      type: 'contextNode',
      position: getEmptyPosition(nodes),
      data: {
        title: sanitizedTitle,
        contentType: saved.contentType,
        content: saved.content,
        instruction: saved.instruction,
        color: saved.color || NODE_COLORS[contextNodeCount % NODE_COLORS.length],
      },
    } as AppNode;

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
    set((s) => {
      let nextEdges = s.edges;
      const nodes = s.nodes.map((n) => {
        if (n.id === nodeId) {
          const newData = { ...(n.data as Record<string, unknown>), ...data };

          // Auto-sync edges if this is a ComposerNode and the prompt changed
          if (n.type === 'composerNode' && typeof newData.prompt === 'string') {
            const prompt = newData.prompt as string;
            // Parse all mentions, allowing hyphens
            const mentionLabels = [...prompt.matchAll(/@([\w-]+)/g)].map((m) => m[1].toLowerCase());
            
            // Find valid context nodes
            const contextNodes = s.nodes.filter(cn => cn.type === 'contextNode');
            const mentionedNodeIds = new Set(
              contextNodes
                .filter(cn => mentionLabels.includes((cn.data as ContextNodeData).title.toLowerCase()))
                .map(cn => cn.id)
            );

            // Keep all edges that DO NOT point to the composer
            const otherEdges = s.edges.filter(e => e.target !== nodeId);
            
            // Create new edges for all mentioned nodes
            const newEdges = Array.from(mentionedNodeIds).map(srcId => ({
              id: `edge-${srcId}-${nodeId}`,
              source: srcId,
              target: nodeId,
              animated: true,
            }));

            nextEdges = [...otherEdges, ...newEdges];
          }

          return { ...n, data: newData } as AppNode;
        }
        return n;
      });

      return {
        nodes,
        edges: nextEdges,
        autoSaveStatus: 'unsaved',
      };
    });
    setTimeout(() => get().save(), 1200);
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
  openModal: (mode, targetId) => set({ modalState: { isOpen: true, mode, targetId: targetId ?? null } }),
  closeModal: () => set((s) => ({ modalState: { ...s.modalState, isOpen: false } })),
  updateProjectName: (name) =>
    set((s) => ({
      activeProject: { ...s.activeProject, name, updatedAt: Date.now() },
    })),

  // ── Saved Contexts ────────────────────────────────────────────────────────
  createSavedContext: (context) => {
    const s = get();
    const newContext: SavedContext = {
      ...context,
      id: `saved-${Date.now()}`,
      color: context.color || NODE_COLORS[s.savedContexts.length % NODE_COLORS.length],
    };
    set((state) => ({
      savedContexts: [...state.savedContexts, newContext],
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1200);
  },

  updateSavedContext: (id, updates) => {
    set((s) => ({
      savedContexts: s.savedContexts.map((ctx) =>
        ctx.id === id ? { ...ctx, ...updates } : ctx
      ),
      autoSaveStatus: 'unsaved',
    }));
    setTimeout(() => get().save(), 1200);
  },

  deleteSavedContext: (id) => {
    set((s) => {
      const ctxToDelete = s.savedContexts.find(ctx => ctx.id === id);
      if (!ctxToDelete) return s;

      const titleToDelete = ctxToDelete.title.replace(/[^a-zA-Z0-9-]/g, '');
      const nodeToDelete = s.nodes.find(n => n.type === 'contextNode' && (n.data as ContextNodeData).title === titleToDelete);
      
      let nextNodes = s.nodes;
      let nextEdges = s.edges;
      
      if (nodeToDelete) {
         nextNodes = s.nodes.filter(n => n.id !== nodeToDelete.id);
         nextEdges = s.edges.filter(e => e.source !== nodeToDelete.id && e.target !== nodeToDelete.id);
      }

      return {
        past: [...s.past, { nodes: s.nodes, edges: s.edges }].slice(-50),
        future: [],
        savedContexts: s.savedContexts.filter((ctx) => ctx.id !== id),
        nodes: nextNodes,
        edges: nextEdges,
        autoSaveStatus: 'unsaved',
      };
    });
    setTimeout(() => get().save(), 1200);
  },

  // ── Persistence ───────────────────────────────────────────────────────────
  save: () => {
    const { nodes, edges, activeProject, outputHistory, savedContexts, saveCount, syncToSupabase, currentTemplateId, isTemplateOwner } = get();
    // Do not auto-save to someone else's template
    if (currentTemplateId && !isTemplateOwner) return;

    set({ autoSaveStatus: 'saving' });
    
    // 1. Save to LocalStorage immediately
    saveToStorage(
      { nodes, edges, activeProject, outputHistory, savedContexts },
      currentTemplateId || undefined
    );
    
    // Increment save count
    const nextSaveCount = saveCount + 1;
    set({ saveCount: nextSaveCount, autoSaveStatus: 'saved' });

    // 10:1 Sync Strategy
    if (nextSaveCount >= 10) {
      syncToSupabase();
      set({ saveCount: 0 });
    }
  },

  currentTemplateId: null,
  isTemplateOwner: true,

  saveAsTemplate: async (name: string) => {
    const { nodes, edges, activeProject, outputHistory, savedContexts, user } = get();
    const updatedProject = { ...activeProject, name, updatedAt: Date.now() };
    
    set({ activeProject: updatedProject });

    const state_data = { nodes, edges, activeProject: updatedProject, outputHistory, savedContexts };

    try {
      const { data, error } = await supabase
        .from('shared_templates')
        .insert({
          creator_id: user?.id || null,
          template_name: name,
          state_data
        })
        .select()
        .single();
      
      if (error) {
        console.error('Save template error', error);
        return null;
      }

      set({ 
        currentTemplateId: data.id, 
        isTemplateOwner: true,
        // When we save as a new template, we give this exact cluster a fresh local ID so it doesn't overwrite old local logs
        sessionId: uuidv4(),
      });
      return data.id;

    } catch (err) {
      console.error(err);
      return null;
    }
  },

  load: async (flowId?: string) => {
    if (flowId) {
      // Immediately bind the session to the new route ID so auto-saves and lookups isolate from previous routes.
      set({ sessionId: flowId, currentTemplateId: null, isTemplateOwner: true });
    }

    // Reset the canvas immediately so old nodes don't flash or permanently stick if network fails
    set({
      nodes: buildDefaultNodes(),
      edges: buildDefaultEdges(),
      activeProject: { ...defaultProject, name: 'Untitled Flow' },
      outputHistory: [],
      savedContexts: [...SAVED_CONTEXTS],
    });

    const { sessionId, user } = get();
    const localData = loadFromStorage(flowId);

    // 1. Try to load from shared_templates if a specific flowId is provided
    if (flowId) {
      try {
        const { data } = await supabase
          .from('shared_templates')
          .select('state_data, creator_id, template_name')
          .eq('id', flowId)
          .maybeSingle();

        if (data && data.state_data) {
          const cloudState = data.state_data as any;
          
          // Increment views asynchronously, only once per session per template
          if (!viewedTemplates.has(flowId)) {
            viewedTemplates.add(flowId);
            void supabase.rpc('increment_view_count', { template_id: flowId }).then(({ error: viewErr }) => {
              if (viewErr) console.warn("Failed to increment view", viewErr);
            });
          }

          set({
            nodes: cloudState.nodes || buildDefaultNodes(),
            edges: cloudState.edges || buildDefaultEdges(),
            activeProject: {
              ...(cloudState.activeProject || defaultProject),
              name: data.template_name || cloudState.activeProject?.name || defaultProject.name,
            },
            outputHistory: cloudState.outputHistory || [],
            savedContexts: cloudState.savedContexts ?? [...SAVED_CONTEXTS],
            currentTemplateId: flowId,
            isTemplateOwner: user ? user.id === data.creator_id : false, // anonymous users don't own templates they didn't just create
          });
          return;
        }
      } catch (err) {
        console.warn('Could not load template from supabase', err);
      }
    }
    
    // 2. Fallback: Attempt Supabase Fetch for the anonymous sync session
    try {
      const { data, error: userProjError } = await supabase
        .from('user_projects')
        .select('state_data, updated_at')
        .eq('session_id', sessionId)
        .maybeSingle();
        
      if (userProjError) {
        console.error('Supabase fetch error:', userProjError);
      }
        
      if (data && data.state_data) {
        // We could compare updated_at with localData's last save time, but for simplicity we'll just trust cloud state if found for this session.
        const cloudState = data.state_data as any;
        set({
          nodes: cloudState.nodes || buildDefaultNodes(),
          edges: cloudState.edges || buildDefaultEdges(),
          activeProject: cloudState.activeProject || defaultProject,
          outputHistory: cloudState.outputHistory || [],
          savedContexts: cloudState.savedContexts ?? [...SAVED_CONTEXTS],
        });
        return;
      }
    } catch (err) {
      console.warn('Could not load from supabase, falling back to local', err);
    }
    
    // 3. Absolute Fallback: LocalStorage
    if (localData) {
      set({
        nodes: localData.nodes,
        edges: localData.edges,
        activeProject: localData.activeProject,
        outputHistory: localData.outputHistory,
        savedContexts: localData.savedContexts ?? [...SAVED_CONTEXTS],
      });
    }
  },
}));

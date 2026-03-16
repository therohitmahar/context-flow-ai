import type { Edge } from '@xyflow/react';
import type { AppNode, ContextNodeData, ComposerNodeData, GeneratedOutput, Project, AIPayload, MentionRef, SavedContext, FlowViewport } from '../types';
import { generateOutput } from './geminiAI';
import { parseMentions } from './mentions';

export interface PersistedState {
  nodes: AppNode[];
  edges: Edge[];
  activeProject: Project;
  outputHistory: GeneratedOutput[];
  savedContexts?: SavedContext[];
  viewport?: FlowViewport | null;
}

const STORAGE_KEY = 'context-stacker-state';

export function loadFromStorage(flowId?: string): PersistedState | null {
  try {
    const key = flowId ? `${STORAGE_KEY}-${flowId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function saveToStorage(state: PersistedState, flowId?: string): void {
  try {
    const key = flowId ? `${STORAGE_KEY}-${flowId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    console.warn('Could not save to localStorage');
  }
}

export function buildDefaultNodes(): AppNode[] {
  return [
    {
      id: 'node-composer',
      type: 'composerNode' as const,
      position: { x: 460, y: 220 },
      data: {
        model: 'gemini-3-flash-preview',
        prompt: '',
        mentionRefs: [] as MentionRef[],
        tokenCount: 0,
      },
    } as AppNode,
  ];
}

export function buildDefaultEdges(): Edge[] {
  return [];
}

export function buildRunPayload(nodes: AppNode[], edges: Edge[]): AIPayload {
  const composer = nodes.find((n) => n.type === 'composerNode');
  if (!composer) throw new Error('No composer node found');

  const composerData = composer.data as ComposerNodeData;
  const connectedIds = new Set(
    edges.filter((e) => e.target === composer.id).map((e) => e.source)
  );

  const allNodeNames = nodes
    .filter((n) => n.type === 'contextNode')
    .map((n) => ({ id: n.id, title: (n.data as ContextNodeData).title }));

  parseMentions(composerData.prompt, allNodeNames);

  const contextNodes = nodes.filter(
    (n) =>
      n.type === 'contextNode' &&
      connectedIds.has(n.id)
  );

  const memoryNodes = nodes.filter(
    (n) =>
      n.type === 'contextNode' &&
      (n.data as ContextNodeData).isMemory
  );

  return {
    systemMemory: memoryNodes.map((n) => n.data as ContextNodeData),
    contexts: contextNodes.map((n) => ({
      title: (n.data as ContextNodeData).title,
      content: (n.data as ContextNodeData).content,
      instruction: (n.data as ContextNodeData).instruction,
    })),
    instructions: composerData.prompt,
    model: composerData.model,
    connections: edges,
  };
}

export async function runFlowAction(nodes: AppNode[], edges: Edge[]): Promise<GeneratedOutput> {
  const payload = buildRunPayload(nodes, edges);
  const text = await generateOutput(payload);

  const composer = nodes.find((n) => n.type === 'composerNode');
  const connectedIds = new Set(
    edges
      .filter((e) => composer && e.target === composer.id)
      .map((e) => e.source)
  );

  const usedNodes = nodes.filter(
    (n) =>
      n.type === 'contextNode' &&
      connectedIds.has(n.id)
  );

  return {
    id: `output-${Date.now()}`,
    text,
    usedNodeIds: usedNodes.map((n) => n.id),
    usedNodeTitles: usedNodes.map((n) => (n.data as ContextNodeData).title),
    timestamp: Date.now(),
    model: payload.model,
  };
}

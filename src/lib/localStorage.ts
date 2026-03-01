import type { Edge } from '@xyflow/react';
import type { AppNode, ContextNodeData, ComposerNodeData, GeneratedOutput, Project, AIPayload, MentionRef } from '../types';
import { generateOutput } from './geminiAI';
import { parseMentions } from './mentions';

export interface PersistedState {
  nodes: AppNode[];
  edges: Edge[];
  activeProject: Project;
  outputHistory: GeneratedOutput[];
}

const STORAGE_KEY = 'context-stacker-state';

export function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function saveToStorage(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Could not save to localStorage');
  }
}

function makeContextNode(
  id: string,
  position: { x: number; y: number },
  data: ContextNodeData
): AppNode {
  return { id, type: 'contextNode' as const, position, data } as AppNode;
}

export function buildDefaultNodes(): AppNode[] {
  return [
    makeContextNode('node-resume', { x: 80, y: 80 }, {
      title: 'Resume',
      contentType: 'file',
      content: 'Senior Developer resume with 5 years experience in React, Node.js, and TypeScript. Led teams of 4–6 engineers. Reduced load times by 40% at PreviousCo.',
      instruction: 'Extract skills & experience',
      enabled: true,
    }),
    makeContextNode('node-jobdesc', { x: 80, y: 280 }, {
      title: 'JobDescription',
      contentType: 'url',
      content: 'https://company.com/careers/senior-frontend-engineer — Senior Frontend Engineer at TechCorp. Requirements: React, TypeScript, 4+ years experience, strong design sensibility.',
      instruction: 'Identify key requirements',
      enabled: true,
    }),
    makeContextNode('node-personalnotes', { x: 80, y: 480 }, {
      title: 'PersonalNotes',
      contentType: 'text',
      content: 'Remember to mention the side project about AI visualizers. Demonstrate passion for developer tooling.',
      instruction: 'Add specific personal details',
      enabled: false,
    }),
    makeContextNode('node-userprofile', { x: 80, y: 680 }, {
      title: 'UserProfile',
      contentType: 'memory',
      content: 'Name: Alex Chen. Senior Frontend Developer. 5 years experience. Prefer remote roles. Key strengths: React performance, design systems, mentorship.',
      instruction: 'Use for personalization throughout',
      enabled: true,
      isMemory: true,
    }),
    {
      id: 'node-composer',
      type: 'composerNode' as const,
      position: { x: 460, y: 220 },
      data: {
        model: 'gemini-2.5-flash',
        prompt: 'Write a professional cover letter using @Resume and focus on skills required in @JobDescription.\n\nEnsure the tone is enthusiastic but professional.',
        mentionRefs: [] as MentionRef[],
        tokenCount: 284,
      },
    } as AppNode,
  ];
}

export function buildDefaultEdges(): Edge[] {
  return [
    {
      id: 'edge-resume-composer',
      source: 'node-resume',
      target: 'node-composer',
      sourceHandle: 'output',
      targetHandle: 'input-0',
      animated: true,
    },
    {
      id: 'edge-jobdesc-composer',
      source: 'node-jobdesc',
      target: 'node-composer',
      sourceHandle: 'output',
      targetHandle: 'input-1',
      animated: true,
    },
  ];
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
      connectedIds.has(n.id) &&
      (n.data as ContextNodeData).enabled
  );

  const memoryNodes = nodes.filter(
    (n) =>
      n.type === 'contextNode' &&
      (n.data as ContextNodeData).isMemory &&
      (n.data as ContextNodeData).enabled
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
      connectedIds.has(n.id) &&
      (n.data as ContextNodeData).enabled
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

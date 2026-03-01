import type { Node, Edge } from '@xyflow/react';

// Node type identifiers
export type NodeType = 'contextNode' | 'composerNode';
export type ContentType = 'text' | 'url' | 'file' | 'api' | 'memory';

// @Mention reference inside composer text
export interface MentionRef {
  nodeId: string;
  label: string;
  start: number;
  end: number;
  isConnected: boolean;
}

// Data carried by a Context Node
export interface ContextNodeData extends Record<string, unknown> {
  title: string;
  contentType: ContentType;
  content: string;
  instruction: string;
  enabled: boolean;
  isMemory?: boolean;
}

// Data carried by the Composer Node
export interface ComposerNodeData extends Record<string, unknown> {
  model: string;
  prompt: string;
  mentionRefs: MentionRef[];
  tokenCount: number;
}

// Typed React Flow node wrappers
export type ContextFlowNode = Node<ContextNodeData, 'contextNode'>;
export type ComposerFlowNode = Node<ComposerNodeData, 'composerNode'>;
export type AppNode = ContextFlowNode | ComposerFlowNode;

// Generated output
export interface GeneratedOutput {
  id: string;
  text: string;
  usedNodeIds: string[];
  usedNodeTitles: string[];
  timestamp: number;
  model: string;
}

// AI payload structure
export interface AIPayload {
  systemMemory: ContextNodeData[];
  contexts: { title: string; content: string; instruction: string }[];
  instructions: string;
  model: string;
  connections: Edge[];
}

// Project metadata
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// Saved context template (sidebar)
export interface SavedContext {
  id: string;
  title: string;
  subtitle: string;
  contentType: ContentType;
  content: string;
  instruction: string;
}

// Context menu state
export interface ContextMenu {
  x: number;
  y: number;
  nodeId: string;
}

export const MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', color: '#4285f4' },
] as const;

export const SAVED_CONTEXTS: SavedContext[] = [
  {
    id: 'saved-resume',
    title: 'My Resume 2023',
    subtitle: 'PDF • 2 pages',
    contentType: 'file',
    content: 'Senior Frontend Developer with 5 years of experience in React, Node.js, and TypeScript. Proficient in building scalable web applications, performance optimization, and leading cross-functional teams. Previous experience at TechCorp and PreviousCo.',
    instruction: 'Extract relevant skills and experience for the job description',
  },
  {
    id: 'saved-profile',
    title: 'User Profile',
    subtitle: 'Core Values',
    contentType: 'memory',
    content: 'Name: Alex Chen. Role: Senior Frontend Developer. Experience: 5 years. Tone preference: Professional but approachable. Key skills: React, TypeScript, Node.js, AWS. Looking for remote-friendly senior roles.',
    instruction: 'Use for personalization and context throughout all outputs',
  },
  {
    id: 'saved-tone',
    title: 'Tone: Professional',
    subtitle: 'System Prompt',
    contentType: 'text',
    content: 'Always maintain a professional, confident, and concise tone. Avoid filler phrases. Use active voice. Be direct while remaining warm and approachable. Avoid clichés like "I am passionate about".',
    instruction: 'Apply tone guidelines to all generated content',
  },
  {
    id: 'saved-guidelines',
    title: 'React Guidelines',
    subtitle: 'Tech Stack',
    contentType: 'text',
    content: 'Project uses React 18, TypeScript strict mode, Tailwind CSS, Zustand for state, React Query for data fetching. Follow hooks-first patterns. Components should be under 200 lines. Co-locate tests with components.',
    instruction: 'Ensure all code suggestions follow these guidelines',
  },
];

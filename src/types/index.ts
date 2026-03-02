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
  isMemory?: boolean;
  isDraft?: boolean;
  color?: string;
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
  color?: string;
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

export const NODE_COLORS = [
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#0ea5e9', // sky-500
  '#ef4444', // red-500
  '#14b8a6', // teal-500
];

export const SAVED_CONTEXTS: SavedContext[] = [
  {
    id: 'ctx-expert-dev',
    title: 'Expert Developer',
    subtitle: 'Senior software engineer persona',
    contentType: 'text',
    content: 'You are a Senior Full-Stack Engineer with 15+ years of experience. Your code is clean, performant, and follows SOLID principles.',
    instruction: 'Adopt this persona to ensure high-quality code generation and architectural advice.',
    color: '#3b82f6',
  },
  {
    id: 'ctx-json-format',
    title: 'JSON Formatter',
    subtitle: 'Strict structured output',
    contentType: 'text',
    content: 'Return ONLY valid JSON. No preamble, no markdown blocks, no trailing text.',
    instruction: 'Use this whenever you need to parse the AI output programmatically.',
    color: '#10b981',
  },
  {
    id: 'ctx-cot-logic',
    title: 'Chain of Thought',
    subtitle: 'Step-by-step reasoning',
    contentType: 'text',
    content: 'Think step-by-step. Break down complex problems into smaller, logical components before providing the final answer.',
    instruction: 'Inject this to improve reasoning accuracy for complex tasks.',
    color: '#8b5cf6',
  },
  {
    id: 'ctx-code-quality',
    title: 'Code Standards',
    subtitle: 'Linting & best practices',
    contentType: 'text',
    content: 'Ensure all code includes proper TypeScript types, is well-documented, and handles potential edge cases or errors.',
    instruction: 'Standard quality gate for all generated code blocks.',
    color: '#ec4899',
  },
  {
    id: 'ctx-creative-writer',
    title: 'Creative Writer',
    subtitle: 'Engaging & vivid prose',
    contentType: 'text',
    content: 'You are an award-winning copywriter. Your tone is engaging, your vocabulary is rich, and your metaphors are striking.',
    instruction: 'Perfect for marketing copy, blog posts, or creative storytelling.',
    color: '#f59e0b',
  },
];

import type { MentionRef } from '../types';

interface NodeRef {
  id: string;
  title: string;
}

export function parseMentions(text: string, nodes: NodeRef[]): MentionRef[] {
  const refs: MentionRef[] = [];
  const regex = /@(\w+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const mentionLabel = match[1];
    const node = nodes.find(
      (n) => n.title.toLowerCase() === mentionLabel.toLowerCase()
    );

    refs.push({
      nodeId: node?.id ?? '',
      label: mentionLabel,
      start: match.index,
      end: match.index + match[0].length,
      isConnected: false,
    });
  }

  return refs;
}

export function validateMentions(
  refs: MentionRef[],
  connectedNodeIds: Set<string>,
  allNodes: NodeRef[]
): MentionRef[] {
  return refs.map((ref) => {
    const node = allNodes.find(
      (n) => n.title.toLowerCase() === ref.label.toLowerCase()
    );
    return {
      ...ref,
      nodeId: node?.id ?? '',
      isConnected: node ? connectedNodeIds.has(node.id) : false,
    };
  });
}

export function extractMentionLabels(text: string): string[] {
  const regex = /@(\w+)/g;
  const labels = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    labels.add(match[1]);
  }
  return Array.from(labels);
}

export function getMentionSuggestions(query: string, nodes: NodeRef[]): NodeRef[] {
  const lower = query.toLowerCase();
  return nodes.filter((n) => n.title.toLowerCase().startsWith(lower));
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

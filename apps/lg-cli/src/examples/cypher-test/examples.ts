
export type SupportedFeature = {
  name: string;
  description: string;
  queries: string[][];
}

export const MATCH_NODES_FEATURES: SupportedFeature[] = [
  {
    name: 'Match varible a for nodes with with label A',
    description:
      'Most basic query showing how to match nodes with a specific label.',
    queries: [['MATCH (n:A)', 'RETURN n']],
  },
  {
    name: 'Match variable a for nodes with label A and variable b for nodes with label B',
    description:
      'To match nodes with multiple labels, use a comma separator or two match statements',
    queries: [
      ['MATCH (a:A), (b:B)', 'RETURN a, b'],
      ['MATCH (a:A)', 'MATCH (b:B)', 'RETURN a, b'],
    ],
  },
  {
    name: 'Match varible a for nodes with labels A and B',
    description:
      'Multiple labels with colon separator (e.g., :A:B) require nodes to have ALL specified labels (AND semantics). Only nodes with both A and B labels will match.',
    queries: [['MATCH (a:A:B)', 'RETURN a']],
  },
  {
    name: 'Match varible a for nodes with label A or B',
    description:
      'Multiple labels with pipe separator (e.g., :A|B) match nodes with ANY of the specified labels (OR semantics). Nodes with either A or B (or both) will match.',
    queries: [['MATCH (a:A|B)', 'RETURN a']],
  },
];

import {describe, expect, it} from 'vitest';
import {findEdge, removeEdge, removeEdgesForNode} from './edgeOperations';

const edges = [
  {id: 'e1', source: 'n1', target: 'n2'},
  {id: 'e2', source: 'n2', target: 'n3'},
  {id: 'e3', source: 'n3', target: 'n1'},
];

describe('removeEdge', () => {
  it('drops only the named edge', () => {
    expect(removeEdge(edges, 'e2').map((e) => e.id)).toEqual(['e1', 'e3']);
  });

  it('is a no-op when the id is absent', () => {
    expect(removeEdge(edges, 'zzz')).toHaveLength(3);
  });

  it('does not mutate the input', () => {
    removeEdge(edges, 'e1');
    expect(edges).toHaveLength(3);
  });
});

describe('removeEdgesForNode', () => {
  it('drops edges where the node is the source', () => {
    expect(removeEdgesForNode(edges, 'n2').map((e) => e.id)).toEqual(['e3']);
  });

  it('drops edges at either end, leaving unrelated edges', () => {
    expect(removeEdgesForNode(edges, 'n1').map((e) => e.id)).toEqual(['e2']);
  });

  it('is a no-op for a node with no edges', () => {
    expect(removeEdgesForNode(edges, 'orphan')).toHaveLength(3);
  });
});

describe('findEdge', () => {
  it('returns the matching edge', () => {
    expect(findEdge(edges, 'e2').source).toBe('n2');
  });

  it('returns undefined when absent', () => {
    expect(findEdge(edges, 'zzz')).toBeUndefined();
  });
});

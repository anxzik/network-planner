import {describe, expect, it} from 'vitest';
import {
  applySelection,
  connectPorts,
  disconnectPorts,
  removeNode,
  toTopologyDevices,
  updateNodeData,
  updatePortConfig,
} from './nodeOperations';

// A node carrying two ports, the shape updatePortConfig expects.
function nodeWithPorts(id, ports) {
  return {
    id,
    position: {x: 0, y: 0},
    data: {label: id, ports, device: {name: 'Switch', type: 'switch'}},
  };
}

function port(id, overrides = {}) {
  return {id, label: id, portIndex: 0, assignedVlans: [], connectedTo: null, ...overrides};
}

describe('updateNodeData', () => {
  it('merges updates into the matching node', () => {
    const nodes = [{id: 'a', data: {label: 'A', ipv4: '10.0.0.1'}}];
    const next = updateNodeData(nodes, 'a', {ipv4: '10.0.0.2'});
    expect(next[0].data).toEqual({label: 'A', ipv4: '10.0.0.2'});
  });

  it('leaves other nodes alone', () => {
    const nodes = [{id: 'a', data: {}}, {id: 'b', data: {label: 'B'}}];
    const next = updateNodeData(nodes, 'a', {label: 'A'});
    expect(next[1]).toBe(nodes[1]);
  });

  it('does not mutate the input', () => {
    const nodes = [{id: 'a', data: {label: 'A'}}];
    updateNodeData(nodes, 'a', {label: 'changed'});
    expect(nodes[0].data.label).toBe('A');
  });

  it('is a no-op when the id is absent', () => {
    const nodes = [{id: 'a', data: {}}];
    expect(updateNodeData(nodes, 'missing', {x: 1})).toEqual(nodes);
  });
});

describe('removeNode', () => {
  it('drops only the named node', () => {
    const nodes = [{id: 'a'}, {id: 'b'}];
    expect(removeNode(nodes, 'a')).toEqual([{id: 'b'}]);
  });

  it('is a no-op when the id is absent', () => {
    const nodes = [{id: 'a'}];
    expect(removeNode(nodes, 'zzz')).toEqual(nodes);
  });
});

describe('applySelection', () => {
  it('marks exactly one node selected', () => {
    const nodes = [{id: 'a', data: {}}, {id: 'b', data: {}}];
    const next = applySelection(nodes, 'b');
    expect(next.map((n) => n.data.isSelected)).toEqual([false, true]);
  });

  it('clears every selection when given null', () => {
    const nodes = [{id: 'a', data: {isSelected: true}}, {id: 'b', data: {}}];
    const next = applySelection(nodes, null);
    expect(next.every((n) => n.data.isSelected === false)).toBe(true);
  });

  it('preserves other node data', () => {
    const nodes = [{id: 'a', data: {label: 'keep'}}];
    expect(applySelection(nodes, 'a')[0].data.label).toBe('keep');
  });
});

describe('updatePortConfig', () => {
  it('merges updates into the matching port', () => {
    const nodes = [nodeWithPorts('n1', [port('p1'), port('p2')])];
    const next = updatePortConfig(nodes, 'n1', 'p1', {mode: 'trunk'});
    expect(next[0].data.ports[0].mode).toBe('trunk');
    expect(next[0].data.ports[1].mode).toBeUndefined();
  });

  it('recomputes participatingVlans from all ports', () => {
    const nodes = [nodeWithPorts('n1', [port('p1', {assignedVlans: [10]}), port('p2', {assignedVlans: [20]})])];
    const next = updatePortConfig(nodes, 'n1', 'p1', {assignedVlans: [30, 10]});
    expect(next[0].data.participatingVlans).toEqual([10, 20, 30]);
  });

  it('drops a VLAN from participatingVlans once no port carries it', () => {
    const nodes = [nodeWithPorts('n1', [port('p1', {assignedVlans: [99]})])];
    const next = updatePortConfig(nodes, 'n1', 'p1', {assignedVlans: []});
    expect(next[0].data.participatingVlans).toEqual([]);
  });

  it('leaves other nodes untouched by reference', () => {
    const other = nodeWithPorts('n2', [port('p1')]);
    const nodes = [nodeWithPorts('n1', [port('p1')]), other];
    expect(updatePortConfig(nodes, 'n1', 'p1', {mode: 'access'})[1]).toBe(other);
  });

  it('does not mutate the input ports', () => {
    const nodes = [nodeWithPorts('n1', [port('p1', {mode: 'access'})])];
    updatePortConfig(nodes, 'n1', 'p1', {mode: 'trunk'});
    expect(nodes[0].data.ports[0].mode).toBe('access');
  });
});

describe('connectPorts', () => {
  it('records the connection on both ends', () => {
    const nodes = [nodeWithPorts('n1', [port('p1')]), nodeWithPorts('n2', [port('p2')])];
    const next = connectPorts(nodes, 'n1', 'p1', 'n2', 'p2');
    expect(next[0].data.ports[0].connectedTo).toBe('p2');
    expect(next[1].data.ports[0].connectedTo).toBe('p1');
  });
});

describe('disconnectPorts', () => {
  const edge = {source: 'n1', target: 'n2', sourcePort: {portId: 'p1'}, targetPort: {portId: 'p2'}};

  it('clears the connection on both ends', () => {
    const nodes = [
      nodeWithPorts('n1', [port('p1', {connectedTo: 'p2'})]),
      nodeWithPorts('n2', [port('p2', {connectedTo: 'p1'})]),
    ];
    const next = disconnectPorts(nodes, edge);
    expect(next[0].data.ports[0].connectedTo).toBeNull();
    expect(next[1].data.ports[0].connectedTo).toBeNull();
  });

  it('ignores an edge with no port information', () => {
    const nodes = [nodeWithPorts('n1', [port('p1')])];
    expect(disconnectPorts(nodes, {source: 'n1', target: 'n2'})).toBe(nodes);
  });

  it('survives an edge naming a node that no longer exists', () => {
    const nodes = [nodeWithPorts('n1', [port('p1', {connectedTo: 'p2'})])];
    const next = disconnectPorts(nodes, edge);
    expect(next[0].data.ports[0].connectedTo).toBeNull();
  });
});

describe('toTopologyDevices', () => {
  it('counts ports and connected ports', () => {
    const nodes = [nodeWithPorts('n1', [port('p1', {connectedTo: 'x'}), port('p2')])];
    const [row] = toTopologyDevices(nodes);
    expect(row.portCount).toBe(2);
    expect(row.connectedPorts).toBe(1);
  });

  it('falls back to the device name when there is no label', () => {
    const nodes = [{id: 'n1', data: {device: {name: 'Router'}}, position: {x: 0, y: 0}}];
    expect(toTopologyDevices(nodes)[0].name).toBe('Router');
  });

  it('defaults viewType to physical', () => {
    const nodes = [{id: 'n1', data: {device: {}}, position: {x: 0, y: 0}}];
    expect(toTopologyDevices(nodes)[0].viewType).toBe('physical');
  });

  it('reports zero ports when the node has none', () => {
    const nodes = [{id: 'n1', data: {}, position: {x: 0, y: 0}}];
    const [row] = toTopologyDevices(nodes);
    expect(row.portCount).toBe(0);
    expect(row.connectedPorts).toBe(0);
  });
});

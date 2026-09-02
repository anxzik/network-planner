import {describe, expect, it} from 'vitest';
import {createDeviceNode, createEdge, createPortEdge} from './nodeFactory';

const device = {
  name: 'Catalyst 2960',
  manufacturer: 'Cisco',
  specifications: {ports: {ethernet: {count: 2}}},
};

const port = (overrides = {}) => ({
  id: 'port-node1-0',
  portIndex: 0,
  label: 'Fa0/0',
  mode: 'access',
  assignedVlans: [1],
  nativeVlan: null,
  ...overrides,
});

describe('createDeviceNode', () => {
  it('creates a ReactFlow node with a unique id', () => {
    const node = createDeviceNode(device, {x: 10, y: 20});
    expect(node.id).toMatch(/^node-\d+-[a-z0-9]+$/);
    expect(node.type).toBe('deviceNode');
  });

  it('produces distinct ids for successive calls', () => {
    const ids = new Set(Array.from({length: 50}, () => createDeviceNode(device, {x: 0, y: 0}).id));
    expect(ids.size).toBe(50);
  });

  it('uses the given position', () => {
    expect(createDeviceNode(device, {x: 10, y: 20}).position).toEqual({x: 10, y: 20});
  });

  it('defaults the position to the origin', () => {
    expect(createDeviceNode(device, null).position).toEqual({x: 0, y: 0});
    expect(createDeviceNode(device, undefined).position).toEqual({x: 0, y: 0});
  });

  it('labels the node after the device by default', () => {
    expect(createDeviceNode(device, {x: 0, y: 0}).data.label).toBe('Catalyst 2960');
  });

  it('honours an explicit label', () => {
    expect(createDeviceNode(device, {x: 0, y: 0}, 'Core Switch').data.label).toBe('Core Switch');
  });

  it('falls back to the device name for an empty label', () => {
    expect(createDeviceNode(device, {x: 0, y: 0}, '').data.label).toBe('Catalyst 2960');
  });

  it('keeps a reference to the catalogue device', () => {
    expect(createDeviceNode(device, {x: 0, y: 0}).data.device).toBe(device);
  });

  it('generates the device ports, keyed to the new node id', () => {
    const node = createDeviceNode(device, {x: 0, y: 0});
    expect(node.data.ports).toHaveLength(2);
    expect(node.data.ports.every((p) => p.nodeId === node.id)).toBe(true);
    expect(node.data.ports.map((p) => p.label)).toEqual(['Fa0/0', 'Fa0/1']);
  });

  it('gives a device with no port specification an empty port list', () => {
    expect(createDeviceNode({name: 'Cloud'}, {x: 0, y: 0}).data.ports).toEqual([]);
  });

  it('starts IP configuration blank', () => {
    const {data} = createDeviceNode(device, {x: 0, y: 0});
    for (const field of ['ipv4', 'subnet', 'ipv6', 'gateway', 'dns1', 'dns2', 'fqdn', 'notes']) {
      expect(data[field], field).toBe('');
    }
  });

  it('starts cloud metadata blank', () => {
    const {data} = createDeviceNode(device, {x: 0, y: 0});
    for (const field of ['provider', 'region', 'instanceType', 'cloudAssetLink', 'connectionPathway', 'vmHost']) {
      expect(data[field], field).toBe('');
    }
  });

  it('defaults to management VLAN 1 with no participating VLANs', () => {
    const {data} = createDeviceNode(device, {x: 0, y: 0});
    expect(data.managementVlan).toBe(1);
    expect(data.participatingVlans).toEqual([]);
  });

  it('is draggable, selectable and connectable, and starts unselected', () => {
    const node = createDeviceNode(device, {x: 0, y: 0});
    expect(node.draggable).toBe(true);
    expect(node.selectable).toBe(true);
    expect(node.connectable).toBe(true);
    expect(node.data.isSelected).toBe(false);
  });
});

describe('createEdge', () => {
  it('derives a deterministic id from its endpoints', () => {
    expect(createEdge('n1', 'n2').id).toBe('edge-n1-n2');
  });

  it('records source and target', () => {
    const edge = createEdge('n1', 'n2');
    expect(edge.source).toBe('n1');
    expect(edge.target).toBe('n2');
  });

  it('is a plain unanimated edge', () => {
    const edge = createEdge('n1', 'n2');
    expect(edge.type).toBe('default');
    expect(edge.animated).toBe(false);
    expect(edge.style).toEqual({stroke: '#b1b1b7', strokeWidth: 2});
  });

  it('is directional — swapping endpoints yields a different id', () => {
    expect(createEdge('n1', 'n2').id).not.toBe(createEdge('n2', 'n1').id);
  });

  it('carries no port or VLAN information', () => {
    const edge = createEdge('n1', 'n2');
    expect(edge.sourcePort).toBeUndefined();
    expect(edge.vlanTransport).toBeUndefined();
  });
});

describe('createPortEdge', () => {
  it('derives its id from the two port ids, not the node ids', () => {
    const edge = createPortEdge('n1', 'n2', port({id: 'pA'}), port({id: 'pB'}));
    expect(edge.id).toBe('edge-pA-pB');
  });

  it('records both endpoints at node and port level', () => {
    const edge = createPortEdge(
      'n1',
      'n2',
      port({id: 'pA', portIndex: 0, label: 'Fa0/0'}),
      port({id: 'pB', portIndex: 3, label: 'Gi0/3'}),
    );
    expect(edge.source).toBe('n1');
    expect(edge.target).toBe('n2');
    expect(edge.sourcePort).toEqual({portId: 'pA', portIndex: 0, portLabel: 'Fa0/0'});
    expect(edge.targetPort).toEqual({portId: 'pB', portIndex: 3, portLabel: 'Gi0/3'});
  });

  it('labels the edge with both port labels', () => {
    const edge = createPortEdge('n1', 'n2', port({label: 'Fa0/0'}), port({label: 'Gi0/3'}));
    expect(edge.label).toBe('Fa0/0 ↔ Gi0/3');
  });

  it('honours an explicit VLAN transport', () => {
    const transport = {mode: 'trunk', vlans: [10, 20], nativeVlan: 10};
    expect(createPortEdge('n1', 'n2', port(), port(), transport).vlanTransport).toBe(transport);
  });

  it('infers access transport when neither port is a trunk', () => {
    const edge = createPortEdge('n1', 'n2', port({assignedVlans: [10]}), port({assignedVlans: [10]}));
    expect(edge.vlanTransport).toEqual({mode: 'access', vlans: [10], nativeVlan: null});
  });

  it('infers trunk transport when either port is a trunk', () => {
    expect(
      createPortEdge('n1', 'n2', port({mode: 'trunk', assignedVlans: [10]}), port()).vlanTransport.mode,
    ).toBe('trunk');
    expect(
      createPortEdge('n1', 'n2', port(), port({mode: 'trunk', assignedVlans: [10]})).vlanTransport.mode,
    ).toBe('trunk');
  });

  it('takes the inferred VLAN list from the source port alone, without intersecting', () => {
    // Unlike determineVlanTransport in portFactory, this inline fallback does not
    // compute the common VLANs — it copies the source port's list verbatim.
    const edge = createPortEdge(
      'n1',
      'n2',
      port({mode: 'trunk', assignedVlans: [10, 20, 30]}),
      port({mode: 'trunk', assignedVlans: [30]}),
    );
    expect(edge.vlanTransport.vlans).toEqual([10, 20, 30]);
  });

  it('takes the native VLAN from the source port only when the source is a trunk', () => {
    expect(
      createPortEdge('n1', 'n2', port({mode: 'trunk', nativeVlan: 10}), port()).vlanTransport.nativeVlan,
    ).toBe(10);
    expect(
      createPortEdge('n1', 'n2', port({mode: 'access'}), port({mode: 'trunk', nativeVlan: 10}))
        .vlanTransport.nativeVlan,
    ).toBeNull();
  });

  it('is a plain unanimated edge, like createEdge', () => {
    const edge = createPortEdge('n1', 'n2', port(), port());
    expect(edge.type).toBe('default');
    expect(edge.animated).toBe(false);
    expect(edge.style).toEqual({stroke: '#b1b1b7', strokeWidth: 2});
  });
});

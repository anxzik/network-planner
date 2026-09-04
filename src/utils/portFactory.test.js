import {describe, expect, it} from 'vitest';
import {
  determineVlanTransport,
  generatePortsForDevice,
  getNodeVlans,
  getPortById,
  validatePortConnection,
} from './portFactory';

const device = (manufacturer, ports) => ({
  name: 'Test Device',
  manufacturer,
  specifications: ports ? {ports} : {},
});

const port = (overrides = {}) => ({
  id: 'port-node1-0',
  label: 'Port 1',
  mode: 'access',
  assignedVlans: [1],
  nativeVlan: null,
  connectedTo: null,
  enabled: true,
  speed: '1Gbps',
  ...overrides,
});

describe('generatePortsForDevice', () => {
  it('returns no ports when the device has no port specification', () => {
    expect(generatePortsForDevice(device('Generic', null), 'node1')).toEqual([]);
    expect(generatePortsForDevice({name: 'bare'}, 'node1')).toEqual([]);
  });

  it('skips port types with no count', () => {
    const ports = generatePortsForDevice(
      device('Generic', {ethernet: {count: 0}, sfp: {count: 2}}),
      'node1',
    );
    expect(ports).toHaveLength(2);
    expect(ports.every((p) => p.portType === 'sfp')).toBe(true);
  });

  it('generates one port per count, with ids keyed to the node', () => {
    const ports = generatePortsForDevice(device('Generic', {ethernet: {count: 3}}), 'node1');
    expect(ports.map((p) => p.id)).toEqual([
      'port-node1-0',
      'port-node1-1',
      'port-node1-2',
    ]);
    expect(ports.every((p) => p.nodeId === 'node1')).toBe(true);
  });

  it('numbers ports continuously across port types, not per type', () => {
    const ports = generatePortsForDevice(
      device('Generic', {ethernet: {count: 2}, sfp: {count: 2}}),
      'node1',
    );
    expect(ports.map((p) => p.portIndex)).toEqual([0, 1, 2, 3]);
    expect(ports.map((p) => p.portType)).toEqual(['ethernet', 'ethernet', 'sfp', 'sfp']);
  });

  it('emits port types in a fixed order regardless of specification order', () => {
    const ports = generatePortsForDevice(
      device('Generic', {sfp: {count: 1}, ethernet: {count: 1}}),
      'node1',
    );
    expect(ports.map((p) => p.portType)).toEqual(['ethernet', 'sfp']);
  });

  it('ignores module slots, which are not connectable ports', () => {
    const ports = generatePortsForDevice(
      device('Generic', {slots: {count: 4}, ethernet: {count: 1}}),
      'node1',
    );
    expect(ports).toHaveLength(1);
  });

  it('carries speed and PoE through from the specification', () => {
    const [p] = generatePortsForDevice(
      device('Generic', {ethernet: {count: 1, speed: '10Gbps', poe: true}}),
      'node1',
    );
    expect(p.speed).toBe('10Gbps');
    expect(p.poe).toBe(true);
  });

  it('defaults speed to 1Gbps and PoE to false', () => {
    const [p] = generatePortsForDevice(device('Generic', {ethernet: {count: 1}}), 'node1');
    expect(p.speed).toBe('1Gbps');
    expect(p.poe).toBe(false);
  });

  it('starts every port in access mode on VLAN 1, enabled and unconnected', () => {
    const [p] = generatePortsForDevice(device('Generic', {ethernet: {count: 1}}), 'node1');
    expect(p.mode).toBe('access');
    expect(p.assignedVlans).toEqual([1]);
    expect(p.nativeVlan).toBeNull();
    expect(p.connectedTo).toBeNull();
    expect(p.enabled).toBe(true);
    expect(p.description).toBe('');
  });
});

describe('generatePortsForDevice — vendor port labels', () => {
  const labels = (manufacturer, ports) =>
    generatePortsForDevice(device(manufacturer, ports), 'n').map((p) => p.label);

  it('labels generic ports 1-indexed by type', () => {
    expect(labels('Generic', {ethernet: {count: 2}})).toEqual(['Port 1', 'Port 2']);
    expect(labels('Generic', {sfpPlus: {count: 1}})).toEqual(['SFP+ 1']);
    expect(labels('Generic', {qsfpdd: {count: 1}})).toEqual(['QSFP-DD 1']);
  });

  it('labels Cisco ports 0-indexed with a slot prefix', () => {
    expect(labels('Cisco', {ethernet: {count: 2}})).toEqual(['Fa0/0', 'Fa0/1']);
    expect(labels('Cisco', {sfpPlus: {count: 1}})).toEqual(['Te0/0']);
  });

  it('switches Cisco ethernet from Fa to Gi at port 8', () => {
    const result = labels('Cisco', {ethernet: {count: 10}});
    expect(result[7]).toBe('Fa0/7');
    expect(result[8]).toBe('Gi0/8');
  });

  it('numbers a later port type from the running index, not from zero', () => {
    // Labels use the global port index, so the first SFP on a device with two
    // ethernet ports is numbered 2 rather than 0.
    expect(labels('Cisco', {ethernet: {count: 2}, sfp: {count: 1}})).toEqual([
      'Fa0/0',
      'Fa0/1',
      'Gi0/2',
    ]);
    expect(labels('Generic', {ethernet: {count: 2}, sfp: {count: 1}})).toEqual([
      'Port 1',
      'Port 2',
      'SFP 3',
    ]);
  });

  it('keeps the Cisco Fa/Gi threshold stable, since ethernet always starts at index 0', () => {
    // ethernet is emitted first, so no other port type can shift its numbering.
    expect(labels('Cisco', {ethernet: {count: 1}, sfp: {count: 8}})[0]).toBe('Fa0/0');
  });

  it('labels Ubiquiti ports 0-indexed and lowercase', () => {
    expect(labels('Ubiquiti', {ethernet: {count: 2}})).toEqual(['eth0', 'eth1']);
    expect(labels('Ubiquiti', {sfpPlus: {count: 1}})).toEqual(['sfp+0']);
  });

  it('labels Dell ports with a stack/slot path', () => {
    expect(labels('Dell', {ethernet: {count: 1}})).toEqual(['GigabitEthernet 1/0/0']);
    expect(labels('Dell', {sfpPlus: {count: 1}})).toEqual(['TenGigabitEthernet 1/0/0']);
  });

  it('matches the manufacturer case-insensitively', () => {
    expect(labels('CISCO', {ethernet: {count: 1}})).toEqual(['Fa0/0']);
    expect(labels('cisco', {ethernet: {count: 1}})).toEqual(['Fa0/0']);
  });

  it('falls back to generic labelling for an unknown manufacturer', () => {
    expect(labels('Juniper', {ethernet: {count: 1}})).toEqual(['Port 1']);
  });

  it('falls back to generic labelling when the manufacturer is absent', () => {
    const ports = generatePortsForDevice(
      {name: 'x', specifications: {ports: {ethernet: {count: 1}}}},
      'n',
    );
    expect(ports[0].label).toEqual('Port 1');
  });

  it('falls back to a Port prefix for a type the vendor map does not cover', () => {
    expect(labels('Cisco', {coax: {count: 1}})).toEqual(['Port0/0']);
    expect(labels('Ubiquiti', {coax: {count: 1}})).toEqual(['port0']);
  });
});

describe('getPortById', () => {
  const node = {data: {ports: [port({id: 'p1'}), port({id: 'p2'})]}};

  it('finds a port on the node', () => {
    expect(getPortById(node, 'p2').id).toBe('p2');
  });

  it('returns null when the port is absent', () => {
    expect(getPortById(node, 'nope')).toBeNull();
  });

  it('returns null when the node has no ports', () => {
    expect(getPortById({data: {}}, 'p1')).toBeNull();
    expect(getPortById({}, 'p1')).toBeNull();
  });
});

describe('getNodeVlans', () => {
  it('collects VLANs across all ports, de-duplicated and sorted', () => {
    const node = {
      data: {
        ports: [
          port({assignedVlans: [30, 10]}),
          port({assignedVlans: [10, 20]}),
        ],
      },
    };
    expect(getNodeVlans(node)).toEqual([10, 20, 30]);
  });

  it('returns an empty array when the node has no ports', () => {
    expect(getNodeVlans({data: {}})).toEqual([]);
    expect(getNodeVlans({})).toEqual([]);
  });

  it('sorts numerically rather than lexicographically', () => {
    const node = {data: {ports: [port({assignedVlans: [100, 20, 3]})]}};
    expect(getNodeVlans(node)).toEqual([3, 20, 100]);
  });
});

describe('validatePortConnection', () => {
  it('accepts two free access ports in the same VLAN', () => {
    expect(validatePortConnection(port(), port())).toEqual({valid: true, warning: null});
  });

  it('rejects a source port that is already connected', () => {
    const result = validatePortConnection(port({connectedTo: 'other', label: 'Port 1'}), port());
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Source port Port 1 is already connected');
  });

  it('rejects a target port that is already connected', () => {
    const result = validatePortConnection(port(), port({connectedTo: 'other', label: 'Port 2'}));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Target port Port 2 is already connected');
  });

  it('rejects a disabled port at either end', () => {
    expect(validatePortConnection(port({enabled: false}), port()).error).toMatch(/Source port .* is disabled/);
    expect(validatePortConnection(port(), port({enabled: false})).error).toMatch(/Target port .* is disabled/);
  });

  it('rejects two access ports in different VLANs', () => {
    const result = validatePortConnection(
      port({assignedVlans: [10], label: 'A'}),
      port({assignedVlans: [20], label: 'B'}),
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe('VLAN mismatch: A is in VLAN 10, B is in VLAN 20');
  });

  it('accepts a trunk pair sharing at least one VLAN', () => {
    const result = validatePortConnection(
      port({mode: 'trunk', assignedVlans: [10, 20]}),
      port({mode: 'trunk', assignedVlans: [20, 30]}),
    );
    expect(result.valid).toBe(true);
  });

  it('rejects a trunk pair with no VLAN in common', () => {
    const result = validatePortConnection(
      port({mode: 'trunk', assignedVlans: [10], label: 'A'}),
      port({mode: 'trunk', assignedVlans: [20], label: 'B'}),
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No common VLANs between A and B');
  });

  it('warns without blocking on a speed mismatch', () => {
    const result = validatePortConnection(port({speed: '1Gbps'}), port({speed: '10Gbps'}));
    expect(result.valid).toBe(true);
    expect(result.warning).toMatch(/Speed mismatch/);
    expect(result.warning).toMatch(/Link will operate at slower speed/);
  });

  it('checks availability before VLAN compatibility', () => {
    const result = validatePortConnection(
      port({connectedTo: 'x', assignedVlans: [10]}),
      port({assignedVlans: [20]}),
    );
    expect(result.error).toMatch(/already connected/);
  });

  it('compares only the first VLAN when both ports are in access mode', () => {
    // Access ports carry one VLAN in practice; only assignedVlans[0] is consulted.
    const result = validatePortConnection(
      port({assignedVlans: [10, 99]}),
      port({assignedVlans: [10, 77]}),
    );
    expect(result.valid).toBe(true);
  });

  it('treats an undefined connectedTo as connected, because the check is against null', () => {
    // Ports built by generatePortsForDevice always set connectedTo: null, so this
    // only bites hand-rolled or deserialised port objects.
    const bare = {...port()};
    delete bare.connectedTo;
    expect(validatePortConnection(bare, port()).valid).toBe(false);
  });
});

describe('determineVlanTransport', () => {
  it('reports access transport for two access ports', () => {
    expect(determineVlanTransport(port({assignedVlans: [10]}), port({assignedVlans: [10]}))).toEqual({
      mode: 'access',
      vlans: [10],
      nativeVlan: null,
    });
  });

  it('reports trunk transport carrying the common VLANs', () => {
    expect(
      determineVlanTransport(
        port({mode: 'trunk', assignedVlans: [10, 20, 30], nativeVlan: 10}),
        port({mode: 'trunk', assignedVlans: [20, 30, 40]}),
      ),
    ).toEqual({mode: 'trunk', vlans: [20, 30], nativeVlan: 10});
  });

  it('prefers the source native VLAN', () => {
    const result = determineVlanTransport(
      port({mode: 'trunk', assignedVlans: [10, 20], nativeVlan: 20}),
      port({mode: 'trunk', assignedVlans: [10, 20], nativeVlan: 10}),
    );
    expect(result.nativeVlan).toBe(20);
  });

  it('falls back to the target native VLAN when the source has none', () => {
    const result = determineVlanTransport(
      port({mode: 'access', assignedVlans: [10, 20]}),
      port({mode: 'trunk', assignedVlans: [10, 20], nativeVlan: 10}),
    );
    expect(result.nativeVlan).toBe(10);
  });

  it('falls back to the lowest common VLAN when neither declares a native', () => {
    const result = determineVlanTransport(
      port({mode: 'trunk', assignedVlans: [30, 20]}),
      port({mode: 'trunk', assignedVlans: [20, 30]}),
    );
    expect(result.nativeVlan).toBe(20);
  });

  it('leaves the native VLAN null when a trunk pair shares nothing', () => {
    expect(
      determineVlanTransport(
        port({mode: 'trunk', assignedVlans: [10]}),
        port({mode: 'trunk', assignedVlans: [20]}),
      ),
    ).toEqual({mode: 'trunk', vlans: [], nativeVlan: null});
  });

  it('reports trunk transport when only one end is a trunk', () => {
    expect(
      determineVlanTransport(
        port({mode: 'access', assignedVlans: [10]}),
        port({mode: 'trunk', assignedVlans: [10, 20]}),
      ).mode,
    ).toBe('trunk');
  });
});

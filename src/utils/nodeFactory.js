// Utility functions for creating ReactFlow nodes
import {generatePortsForDevice} from './portFactory';

// Generate unique node ID
export function generateNodeId() {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a device node for ReactFlow
export function createDeviceNode(device, position, label = null) {
  const nodeId = generateNodeId();

  // Generate ports for this device
  const ports = generatePortsForDevice(device, nodeId);

  return {
    id: nodeId,
    type: 'deviceNode',
    position: position || { x: 0, y: 0 },
    data: {
      device: device, // Full device object from catalog
      label: label || device.name, // User-editable name
      isSelected: false,
      // IP Configuration fields
      ipv4: '',
      subnet: '',
      ipv6: '',
      gateway: '',
      dns1: '',
      dns2: '',
      fqdn: '',
      notes: '',
      // Port-level tracking
      ports: ports,
      // VLAN membership
      managementVlan: 1,           // Management VLAN for device itself
      participatingVlans: [],       // Calculated from ports

      // Cloud/Logical device fields
      provider: '',                 // AWS, Azure, GCP, Oracle Cloud, Vultr, On-Premise
      region: '',                   // e.g., us-east-1, eastus, etc.
      instanceType: '',             // e.g., t3.medium, Standard_D2s_v3, etc.
      cloudAssetLink: '',           // Console URL, ARN, or resource ID
      connectionPathway: '',        // VPN, Direct Connect, Peering, Public Internet
      vmHost: '',                   // Parent hypervisor node ID (for linking VMs to hypervisors)
    },
    // ReactFlow node properties
    draggable: true,
    selectable: true,
    connectable: true,
  };
}

// Update node data
export function updateNodeData(node, updates) {
  return {
    ...node,
    data: {
      ...node.data,
      ...updates
    }
  };
}

// Create default edge (simple, no port info)
export function createEdge(source, target) {
  return {
    id: `edge-${source}-${target}`,
    source,
    target,
    type: 'default',
    animated: false,
    style: { stroke: '#b1b1b7', strokeWidth: 2 }
  };
}

// Create enhanced edge with port information
export function createPortEdge(sourceNodeId, targetNodeId, sourcePort, targetPort, vlanTransport = null) {
  const edgeId = `edge-${sourcePort.id}-${targetPort.id}`;

  return {
    id: edgeId,
    source: sourceNodeId,
    target: targetNodeId,

    // NEW: Port-level connection data
    sourcePort: {
      portId: sourcePort.id,
      portIndex: sourcePort.portIndex,
      portLabel: sourcePort.label
    },
    targetPort: {
      portId: targetPort.id,
      portIndex: targetPort.portIndex,
      portLabel: targetPort.label
    },

    // NEW: VLAN information
    vlanTransport: vlanTransport || {
      mode: sourcePort.mode === 'trunk' || targetPort.mode === 'trunk' ? 'trunk' : 'access',
      vlans: sourcePort.assignedVlans,
      nativeVlan: sourcePort.mode === 'trunk' ? sourcePort.nativeVlan : null
    },

    // ReactFlow edge properties
    type: 'default',
    animated: false,
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    label: `${sourcePort.label} ↔ ${targetPort.label}`,
  };
}

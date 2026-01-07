// Utility functions for creating ReactFlow nodes

// Generate unique node ID
export function generateNodeId() {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a device node for ReactFlow
export function createDeviceNode(device, position, label = null) {
  const nodeId = generateNodeId();

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
      notes: ''
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

// Create default edge
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

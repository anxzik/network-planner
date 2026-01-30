// Port generation and management utilities for network devices

/**
 * Generate unique port ID
 * @param {string} nodeId - Parent node ID
 * @param {number} portIndex - Port index
 * @returns {string} Unique port ID
 */
export function generatePortId(nodeId, portIndex) {
  return `port-${nodeId}-${portIndex}`;
}

/**
 * Generate vendor-specific port label
 * @param {object} device - Device object from catalog
 * @param {string} portType - Port type (ethernet, sfp, sfpPlus, etc.)
 * @param {number} portNumber - Port number (0-indexed)
 * @returns {string} Formatted port label
 */
export function generatePortLabel(device, portType, portNumber) {
  const manufacturer = device.manufacturer?.toLowerCase() || 'generic';

  // Cisco-style labeling
  if (manufacturer === 'cisco') {
    const typeLabels = {
      ethernet: portNumber < 8 ? 'Fa' : 'Gi',  // FastEthernet for first 8, then GigabitEthernet
      ethernet10g: 'Te',
      ethernet25g: 'TwentyFiveGigE',
      sfp: 'Gi',
      sfpPlus: 'Te',              // TenGigabitEthernet
      sfp28: 'TwentyFiveGigE',
      sfp56: 'FiftyGigE',
      qsfp: 'FortyGigE',
      qsfpPlus: 'FortyGigE',
      qsfp28: 'HundredGigE',
      qsfpdd: 'FourHundredGigE'
    };
    const prefix = typeLabels[portType] || 'Port';
    return `${prefix}0/${portNumber}`;
  }

  // Ubiquiti-style labeling
  if (manufacturer === 'ubiquiti') {
    const typeLabels = {
      ethernet: 'eth',
      sfp: 'sfp',
      sfpPlus: 'sfp+',
      sfp28: 'sfp28'
    };
    const prefix = typeLabels[portType] || 'port';
    return `${prefix}${portNumber}`;
  }

  // Dell-style labeling
  if (manufacturer === 'dell') {
    const typeLabels = {
      ethernet: 'GigabitEthernet',
      sfp: 'GigabitEthernet',
      sfpPlus: 'TenGigabitEthernet',
      qsfp28: 'HundredGigE'
    };
    const prefix = typeLabels[portType] || 'Port';
    return `${prefix} 1/0/${portNumber}`;
  }

  // Generic labeling
  const typeLabels = {
    ethernet: 'Port',
    ethernet10g: '10G',
    ethernet25g: '2.5G',
    sfp: 'SFP',
    sfpPlus: 'SFP+',
    sfp28: 'SFP28',
    sfp56: 'SFP56',
    qsfp: 'QSFP',
    qsfpPlus: 'QSFP+',
    qsfp28: 'QSFP28',
    qsfpdd: 'QSFP-DD',
    fiber: 'Fiber',
    coax: 'Coax',
    rj11: 'RJ11',
    wan: 'WAN'
  };

  const prefix = typeLabels[portType] || 'Port';
  return `${prefix} ${portNumber + 1}`;
}

/**
 * Create a port object
 * @param {string} nodeId - Parent node ID
 * @param {number} portIndex - Port index (0-based)
 * @param {string} portType - Port type
 * @param {string} speed - Port speed
 * @param {object} device - Device object
 * @param {object} options - Additional port options (poe, etc.)
 * @returns {object} Port object
 */
export function createPort(nodeId, portIndex, portType, speed, device, options = {}) {
  return {
    id: generatePortId(nodeId, portIndex),
    nodeId,
    portIndex,
    portType,
    speed: speed || '1Gbps',
    poe: options.poe || false,

    // Port configuration
    mode: 'access',              // 'access' or 'trunk'
    assignedVlans: [1],          // Default VLAN 1
    nativeVlan: null,            // For trunk ports only

    // Connection tracking
    connectedTo: null,           // Port ID when connected

    // State
    enabled: true,
    label: generatePortLabel(device, portType, portIndex),
    description: ''
  };
}

/**
 * Generate all ports for a device based on its specifications
 * @param {object} device - Device object from catalog
 * @param {string} nodeId - Node ID
 * @returns {Array} Array of port objects
 */
export function generatePortsForDevice(device, nodeId) {
  const ports = [];
  const specs = device.specifications?.ports;

  if (!specs) {
    return ports;  // No ports for this device
  }

  let portIndex = 0;

  // Iterate through each port type in device specifications
  const portTypes = [
    'ethernet', 'ethernet10g', 'ethernet25g',  // Copper ports
    'sfp', 'sfpPlus', 'sfp28', 'sfp56',         // SFP variants
    'qsfp', 'qsfpPlus', 'qsfp28', 'qsfpdd',     // QSFP variants
    'fiber', 'coax', 'rj11', 'wan'              // Other port types
    // Note: 'slots' are module slots, not connectable ports
  ];

  portTypes.forEach(portType => {
    const portConfig = specs[portType];
    if (!portConfig || !portConfig.count) {
      return;  // Skip if this port type doesn't exist or has no count
    }

    const count = portConfig.count;
    const speed = portConfig.speed || '1Gbps';
    const poe = portConfig.poe || false;

    // Generate individual port objects
    for (let i = 0; i < count; i++) {
      ports.push(createPort(
        nodeId,
        portIndex,
        portType,
        speed,
        device,
        { poe }
      ));
      portIndex++;
    }
  });

  return ports;
}

/**
 * Get available (unconnected) ports from a node
 * @param {object} node - Node object
 * @returns {Array} Array of available port objects
 */
export function getAvailablePorts(node) {
  if (!node.data?.ports) {
    return [];
  }

  return node.data.ports.filter(port =>
    port.enabled && port.connectedTo === null
  );
}

/**
 * Get port by ID from a node
 * @param {object} node - Node object
 * @param {string} portId - Port ID to find
 * @returns {object|null} Port object or null if not found
 */
export function getPortById(node, portId) {
  if (!node.data?.ports) {
    return null;
  }

  return node.data.ports.find(port => port.id === portId) || null;
}

/**
 * Get port by index from a node
 * @param {object} node - Node object
 * @param {number} portIndex - Port index to find
 * @returns {object|null} Port object or null if not found
 */
export function getPortByIndex(node, portIndex) {
  if (!node.data?.ports) {
    return null;
  }

  return node.data.ports.find(port => port.portIndex === portIndex) || null;
}

/**
 * Update port configuration
 * @param {object} port - Port object to update
 * @param {object} updates - Properties to update
 * @returns {object} Updated port object
 */
export function updatePortConfig(port, updates) {
  return {
    ...port,
    ...updates
  };
}

/**
 * Get all ports of a specific type from a node
 * @param {object} node - Node object
 * @param {string} portType - Port type to filter
 * @returns {Array} Array of ports matching the type
 */
export function getPortsByType(node, portType) {
  if (!node.data?.ports) {
    return [];
  }

  return node.data.ports.filter(port => port.portType === portType);
}

/**
 * Get connected ports from a node
 * @param {object} node - Node object
 * @returns {Array} Array of connected port objects
 */
export function getConnectedPorts(node) {
  if (!node.data?.ports) {
    return [];
  }

  return node.data.ports.filter(port => port.connectedTo !== null);
}

/**
 * Get ports assigned to a specific VLAN
 * @param {object} node - Node object
 * @param {number} vlanId - VLAN ID
 * @returns {Array} Array of ports in the VLAN
 */
export function getPortsInVlan(node, vlanId) {
  if (!node.data?.ports) {
    return [];
  }

  return node.data.ports.filter(port =>
    port.assignedVlans.includes(vlanId)
  );
}

/**
 * Get all VLANs that a node participates in
 * @param {object} node - Node object
 * @returns {Array} Array of unique VLAN IDs
 */
export function getNodeVlans(node) {
  if (!node.data?.ports) {
    return [];
  }

  const vlans = new Set();
  node.data.ports.forEach(port => {
    port.assignedVlans.forEach(vlanId => vlans.add(vlanId));
  });

  return Array.from(vlans).sort((a, b) => a - b);
}

/**
 * Check if a port can be connected (available and enabled)
 * @param {object} port - Port object
 * @returns {boolean} True if port can be connected
 */
export function canConnectPort(port) {
  return port.enabled && port.connectedTo === null;
}

/**
 * Validate port connection compatibility
 * @param {object} sourcePort - Source port object
 * @param {object} targetPort - Target port object
 * @returns {object} Validation result { valid, error, warning }
 */
export function validatePortConnection(sourcePort, targetPort) {
  // Check if ports are available
  if (sourcePort.connectedTo !== null) {
    return {
      valid: false,
      error: `Source port ${sourcePort.label} is already connected`
    };
  }

  if (targetPort.connectedTo !== null) {
    return {
      valid: false,
      error: `Target port ${targetPort.label} is already connected`
    };
  }

  // Check if ports are enabled
  if (!sourcePort.enabled) {
    return {
      valid: false,
      error: `Source port ${sourcePort.label} is disabled`
    };
  }

  if (!targetPort.enabled) {
    return {
      valid: false,
      error: `Target port ${targetPort.label} is disabled`
    };
  }

  // VLAN compatibility check
  if (sourcePort.mode === 'access' && targetPort.mode === 'access') {
    // Both access mode - must be in same VLAN
    if (sourcePort.assignedVlans[0] !== targetPort.assignedVlans[0]) {
      return {
        valid: false,
        error: `VLAN mismatch: ${sourcePort.label} is in VLAN ${sourcePort.assignedVlans[0]}, ${targetPort.label} is in VLAN ${targetPort.assignedVlans[0]}`
      };
    }
  }

  if (sourcePort.mode === 'trunk' || targetPort.mode === 'trunk') {
    // At least one trunk - check for common VLANs
    const commonVlans = sourcePort.assignedVlans.filter(vlan =>
      targetPort.assignedVlans.includes(vlan)
    );

    if (commonVlans.length === 0) {
      return {
        valid: false,
        error: `No common VLANs between ${sourcePort.label} and ${targetPort.label}`
      };
    }
  }

  // Speed mismatch warning (non-blocking)
  let warning = null;
  if (sourcePort.speed !== targetPort.speed) {
    warning = `Speed mismatch: ${sourcePort.label} (${sourcePort.speed}) connected to ${targetPort.label} (${targetPort.speed}). Link will operate at slower speed.`;
  }

  return {
    valid: true,
    warning
  };
}

/**
 * Determine VLAN transport mode for a connection
 * @param {object} sourcePort - Source port object
 * @param {object} targetPort - Target port object
 * @returns {object} Transport info { mode, vlans, nativeVlan }
 */
export function determineVlanTransport(sourcePort, targetPort) {
  // If both ports are in access mode
  if (sourcePort.mode === 'access' && targetPort.mode === 'access') {
    return {
      mode: 'access',
      vlans: [sourcePort.assignedVlans[0]],
      nativeVlan: null
    };
  }

  // If either port is in trunk mode
  const commonVlans = sourcePort.assignedVlans.filter(vlan =>
    targetPort.assignedVlans.includes(vlan)
  );

  // Determine native VLAN for trunk
  let nativeVlan = null;
  if (sourcePort.mode === 'trunk' && sourcePort.nativeVlan) {
    nativeVlan = sourcePort.nativeVlan;
  } else if (targetPort.mode === 'trunk' && targetPort.nativeVlan) {
    nativeVlan = targetPort.nativeVlan;
  } else if (commonVlans.length > 0) {
    nativeVlan = Math.min(...commonVlans);  // Use lowest common VLAN as native
  }

  return {
    mode: 'trunk',
    vlans: commonVlans,
    nativeVlan
  };
}

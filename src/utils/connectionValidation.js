/**
 * Connection Validation Utilities
 * Validates IPv4 addressing conventions when connecting devices
 */

import {calculateNetworkAddress, isIPInSubnet, isValidIPv4, isValidSubnetMask,} from './ipValidation';

/**
 * Check if two nodes can be connected based on IPv4 addressing conventions
 * @param {object} sourceNode - Source node data
 * @param {object} targetNode - Target node data
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateConnection(sourceNode, targetNode) {
  const sourceData = sourceNode.data;
  const targetData = targetNode.data;

  // Check if both nodes have IP addresses configured
  const sourceHasIP = sourceData.ipv4 && sourceData.ipv4.trim() !== '';
  const targetHasIP = targetData.ipv4 && targetData.ipv4.trim() !== '';

  // If neither has IP, allow connection but warn
  if (!sourceHasIP && !targetHasIP) {
    return {
      valid: true,
      warning: 'Neither device has an IP address configured. Configure IPs to enforce routing rules.',
    };
  }

  // If only one has IP, allow but warn
  if (!sourceHasIP || !targetHasIP) {
    const missingNode = !sourceHasIP ? sourceData.label : targetData.label;
    return {
      valid: true,
      warning: `"${missingNode}" does not have an IP address configured. Configure IP to enforce routing rules.`,
    };
  }

  // Both have IPs - validate they are valid
  if (!isValidIPv4(sourceData.ipv4)) {
    return {
      valid: false,
      error: `Source device "${sourceData.label}" has an invalid IPv4 address: ${sourceData.ipv4}`,
    };
  }

  if (!isValidIPv4(targetData.ipv4)) {
    return {
      valid: false,
      error: `Target device "${targetData.label}" has an invalid IPv4 address: ${targetData.ipv4}`,
    };
  }

  // Check for duplicate IPs
  if (sourceData.ipv4 === targetData.ipv4) {
    return {
      valid: false,
      error: `Both devices have the same IP address (${sourceData.ipv4}). Each device must have a unique IP.`,
    };
  }

  // Check subnet masks
  const sourceHasSubnet = sourceData.subnet && sourceData.subnet.trim() !== '';
  const targetHasSubnet = targetData.subnet && targetData.subnet.trim() !== '';

  if (!sourceHasSubnet && !targetHasSubnet) {
    return {
      valid: true,
      warning: 'Neither device has a subnet mask configured. Configure subnets to validate same-network connectivity.',
    };
  }

  if (!sourceHasSubnet || !targetHasSubnet) {
    const missingNode = !sourceHasSubnet ? sourceData.label : targetData.label;
    return {
      valid: true,
      warning: `"${missingNode}" does not have a subnet mask configured. Configure subnet to validate network connectivity.`,
    };
  }

  // Validate subnet masks
  if (!isValidSubnetMask(sourceData.subnet)) {
    return {
      valid: false,
      error: `Source device "${sourceData.label}" has an invalid subnet mask: ${sourceData.subnet}`,
    };
  }

  if (!isValidSubnetMask(targetData.subnet)) {
    return {
      valid: false,
      error: `Target device "${targetData.label}" has an invalid subnet mask: ${targetData.subnet}`,
    };
  }

  // Calculate network addresses
  const sourceNetwork = calculateNetworkAddress(sourceData.ipv4, sourceData.subnet);
  const targetNetwork = calculateNetworkAddress(targetData.ipv4, targetData.subnet);

  // Check if they're in the same subnet
  const sourceInTargetSubnet = isIPInSubnet(sourceData.ipv4, targetNetwork, targetData.subnet);
  const targetInSourceSubnet = isIPInSubnet(targetData.ipv4, sourceNetwork, sourceData.subnet);

  // For direct connection, devices should be in the same subnet
  if (sourceNetwork !== targetNetwork || !sourceInTargetSubnet || !targetInSourceSubnet) {
    // Check if either device is a router/gateway that can bridge networks
    const sourceIsRouter = isRoutingDevice(sourceData.device);
    const targetIsRouter = isRoutingDevice(targetData.device);

    if (!sourceIsRouter && !targetIsRouter) {
      return {
        valid: false,
        error: `Devices are in different subnets (${sourceNetwork} vs ${targetNetwork}). Direct connections require devices to be in the same subnet, or use a router/gateway to bridge networks.`,
      };
    }

    // Allow connection if at least one is a router
    return {
      valid: true,
      warning: `Devices are in different subnets. Connection allowed because ${sourceIsRouter ? sourceData.label : targetData.label} is a routing device.`,
    };
  }

  // All checks passed
  return {
    valid: true,
    error: null,
  };
}

/**
 * Check if a device can perform routing (bridge networks)
 * @param {object} device - Device object
 * @returns {boolean} True if device can route
 */
function isRoutingDevice(device) {
  if (!device) return false;

  const routerTypes = [
    'router',
    'firewall',
    'layer3-switch',
    'l3-switch',
    'gateway',
    'core-switch',
  ];

  const deviceType = (device.type || '').toLowerCase();
  const deviceName = (device.name || '').toLowerCase();
  const deviceCategory = (device.category || '').toLowerCase();

  return routerTypes.some(
    (type) =>
      deviceType.includes(type) ||
      deviceName.includes(type) ||
      deviceCategory.includes(type)
  );
}

/**
 * Check if a node already has an IP address
 * @param {object} nodeData - Node data
 * @returns {boolean} True if node has IP configured
 */
export function hasIPConfigured(nodeData) {
  return nodeData.ipv4 && nodeData.ipv4.trim() !== '';
}

/**
 * Check if all connected nodes to a given node are in compatible subnets
 * @param {object} node - Current node
 * @param {array} allNodes - All nodes in the network
 * @param {array} edges - All edges in the network
 * @returns {object} { valid: boolean, errors: array }
 */
export function validateNodeConnections(node, allNodes, edges) {
  const errors = [];
  const warnings = [];

  // Find all edges connected to this node
  const connectedEdges = edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id
  );

  // Validate each connection
  for (const edge of connectedEdges) {
    const otherNodeId = edge.source === node.id ? edge.target : edge.source;
    const otherNode = allNodes.find((n) => n.id === otherNodeId);

    if (otherNode) {
      const validation = validateConnection(node, otherNode);
      if (!validation.valid) {
        errors.push(validation.error);
      } else if (validation.warning) {
        warnings.push(validation.warning);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
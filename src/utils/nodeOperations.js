// Pure transforms over the nodes array.
//
// Each function takes the current nodes and returns the next nodes, leaving the
// input untouched. Keeping them free of React means they can be exercised
// directly from tests rather than by mounting a provider.

import {getNodeVlans} from './portFactory';

// Merge updates into one node's data.
export function updateNodeData(nodes, nodeId, updates) {
  return nodes.map((node) =>
    node.id === nodeId
      ? {...node, data: {...node.data, ...updates}}
      : node
  );
}

// Drop a node.
export function removeNode(nodes, nodeId) {
  return nodes.filter((node) => node.id !== nodeId);
}

// Mark one node selected and every other node not, or clear the selection
// entirely when nodeId is null.
export function applySelection(nodes, nodeId) {
  return nodes.map((node) => ({
    ...node,
    data: {...node.data, isSelected: node.id === nodeId},
  }));
}

// Merge updates into one port, recomputing which VLANs the node participates
// in, since that is derived from the ports.
export function updatePortConfig(nodes, nodeId, portId, updates) {
  return nodes.map((node) => {
    if (node.id !== nodeId) return node;

    const updatedPorts = node.data.ports.map((port) =>
      port.id === portId ? {...port, ...updates} : port
    );

    const participatingVlans = getNodeVlans({
      ...node,
      data: {...node.data, ports: updatedPorts},
    });

    return {
      ...node,
      data: {...node.data, ports: updatedPorts, participatingVlans},
    };
  });
}

// Record a connection between two ports on two nodes.
export function connectPorts(nodes, sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
  const withSource = updatePortConfig(nodes, sourceNodeId, sourcePortId, {
    connectedTo: targetPortId,
  });
  return updatePortConfig(withSource, targetNodeId, targetPortId, {
    connectedTo: sourcePortId,
  });
}

// Clear the connection recorded on both ends of an edge. Edges without port
// information leave the nodes untouched.
export function disconnectPorts(nodes, edge) {
  if (!edge?.sourcePort || !edge?.targetPort) return nodes;

  let next = nodes;
  if (next.some((node) => node.id === edge.source)) {
    next = updatePortConfig(next, edge.source, edge.sourcePort.portId, {connectedTo: null});
  }
  if (next.some((node) => node.id === edge.target)) {
    next = updatePortConfig(next, edge.target, edge.targetPort.portId, {connectedTo: null});
  }
  return next;
}

// Flatten nodes into the row shape the topology list renders.
export function toTopologyDevices(nodes) {
  return nodes.map((node) => ({
    id: node.id,
    name: node.data.label || node.data.device?.name,
    type: node.data.device?.type,
    category: node.data.device?.category,
    viewType: node.data.device?.viewType || 'physical',
    manufacturer: node.data.device?.manufacturer,
    model: node.data.device?.model,
    // IP Configuration
    ipv4: node.data.ipv4,
    subnet: node.data.subnet,
    ipv6: node.data.ipv6,
    gateway: node.data.gateway,
    dns1: node.data.dns1,
    dns2: node.data.dns2,
    fqdn: node.data.fqdn,
    // Cloud/Logical fields
    provider: node.data.provider,
    region: node.data.region,
    instanceType: node.data.instanceType,
    cloudAssetLink: node.data.cloudAssetLink,
    connectionPathway: node.data.connectionPathway,
    vmHost: node.data.vmHost,
    // Port info
    portCount: node.data.ports?.length || 0,
    connectedPorts: node.data.ports?.filter((p) => p.connectedTo)?.length || 0,
    // Metadata
    notes: node.data.notes,
    position: node.position,
  }));
}

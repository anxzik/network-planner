import {createContext, useCallback, useContext, useState} from 'react';
import {useEdgesState, useNodesState} from 'reactflow';
import {createDeviceNode, createEdge, createPortEdge} from '../utils/nodeFactory';
import {getDefaultVlan} from '../utils/vlanFactory';
import {determineVlanTransport, getNodeVlans, getPortById} from '../utils/portFactory';

// Create the context
const NetworkContext = createContext(null);

// Provider component
export function NetworkProvider({ children }) {
  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Selection state
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);

  // Network objects state (for list view)
  const [networkObjects, setNetworkObjects] = useState([]);

  // Connection validation state
  const [connectionError, setConnectionError] = useState(null);
  const [connectionWarning, setConnectionWarning] = useState(null);

  // View mode state (physical or logical)
  const [viewMode, setViewMode] = useState('physical'); // 'physical' or 'logical'

  // NEW: VLAN state management
  const [vlans, setVlans] = useState([getDefaultVlan()]); // Start with default VLAN 1

  // NEW: Port selector modal state
  const [portSelectorOpen, setPortSelectorOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // Add a new device node to the canvas
  const addNode = useCallback((deviceData, position, label = null) => {
    const newNode = createDeviceNode(deviceData, position, label);
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [setNodes]);

  // Update an existing node
  const updateNode = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates
              }
            }
          : node
      )
    );
  }, [setNodes]);

  // Delete a node
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Also remove edges connected to this node
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  // Handle edge connection with validation
  const onConnect = useCallback((connection) => {
    // Find source and target nodes
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    if (!sourceNode || !targetNode) {
      setConnectionError('Cannot connect: nodes not found');
      setTimeout(() => setConnectionError(null), 5000);
      return;
    }

    // NEW: Open port selector modal instead of directly creating connection
    setPendingConnection({
      sourceNode,
      targetNode,
      connection
    });
    setPortSelectorOpen(true);
  }, [nodes]);

  // Add a new edge
  const addEdgeManual = useCallback((sourceId, targetId) => {
    const newEdge = createEdge(sourceId, targetId);
    setEdges((eds) => [...eds, newEdge]);
    return newEdge;
  }, [setEdges]);

  // Port configuration operations (defined early for use in deleteEdge)
  const updatePortConfig = useCallback((nodeId, portId, updates) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== nodeId) return node;

        const updatedPorts = node.data.ports.map((port) =>
          port.id === portId ? { ...port, ...updates } : port
        );

        // Recalculate participating VLANs
        const tempNode = { ...node, data: { ...node.data, ports: updatedPorts } };
        const participatingVlans = getNodeVlans(tempNode);

        return {
          ...node,
          data: {
            ...node.data,
            ports: updatedPorts,
            participatingVlans
          }
        };
      })
    );
  }, [setNodes]);

  // Delete an edge
  const deleteEdge = useCallback((edgeId) => {
    // Find the edge to get port information
    const edge = edges.find((e) => e.id === edgeId);

    if (edge && edge.sourcePort && edge.targetPort) {
      // Update port connection status to null on both nodes
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (sourceNode) {
        updatePortConfig(sourceNode.id, edge.sourcePort.portId, {
          connectedTo: null
        });
      }

      if (targetNode) {
        updatePortConfig(targetNode.id, edge.targetPort.portId, {
          connectedTo: null
        });
      }
    }

    // Remove the edge
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [edges, nodes, setEdges, updatePortConfig]);

  // Select a node
  const selectNode = useCallback((nodeId) => {
    setSelectedNode(nodeId);
    // Update node data to reflect selection
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === nodeId
        }
      }))
    );
  }, [setNodes]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: false
        }
      }))
    );
  }, [setNodes]);

  // Clear entire canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedDeviceType(null);
  }, [setNodes, setEdges]);

  // Delete selected node (keyboard shortcut helper)
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      deleteNode(selectedNode);
    }
  }, [selectedNode, deleteNode]);

  // Network Objects Management
  // Add a new network object
  const addNetworkObject = useCallback((networkObject) => {
    setNetworkObjects((objs) => [...objs, networkObject]);
  }, []);

  // Update an existing network object
  const updateNetworkObject = useCallback((objectId, updates) => {
    setNetworkObjects((objs) =>
      objs.map((obj) =>
        obj.id === objectId
          ? { ...obj, ...updates, updatedAt: new Date().toISOString() }
          : obj
      )
    );
  }, []);

  // Delete a network object
  const deleteNetworkObject = useCallback((objectId) => {
    setNetworkObjects((objs) => objs.filter((obj) => obj.id !== objectId));
  }, []);

  // Get network object by ID
  const getNetworkObjectById = useCallback(
    (objectId) => {
      return networkObjects.find((obj) => obj.id === objectId);
    },
    [networkObjects]
  );

  // Clear connection messages
  const clearConnectionMessages = useCallback(() => {
    setConnectionError(null);
    setConnectionWarning(null);
  }, []);

  // NEW: VLAN CRUD operations
  const addVlan = useCallback((vlanConfig) => {
    setVlans((prevVlans) => [...prevVlans, vlanConfig]);
    return vlanConfig;
  }, []);

  const updateVlan = useCallback((vlanId, updates) => {
    setVlans((prevVlans) =>
      prevVlans.map((vlan) =>
        vlan.id === vlanId
          ? { ...vlan, ...updates, updatedAt: new Date().toISOString() }
          : vlan
      )
    );
  }, []);

  const deleteVlan = useCallback((vlanId) => {
    setVlans((prevVlans) => prevVlans.filter((vlan) => vlan.id !== vlanId));
  }, []);

  const getVlanById = useCallback((vlanId) => {
    return vlans.find((vlan) => vlan.id === vlanId);
  }, [vlans]);

  const getVlanByVlanId = useCallback((vlanId) => {
    return vlans.find((vlan) => vlan.vlanId === vlanId);
  }, [vlans]);

  const assignPortToVlan = useCallback((nodeId, portId, vlanIds, mode = 'access') => {
    updatePortConfig(nodeId, portId, {
      assignedVlans: vlanIds,
      mode: mode
    });
  }, [updatePortConfig]);

  const setPortMode = useCallback((nodeId, portId, mode) => {
    updatePortConfig(nodeId, portId, { mode });
  }, [updatePortConfig]);

  const setTrunkAllowedVlans = useCallback((nodeId, portId, vlanIds) => {
    updatePortConfig(nodeId, portId, {
      mode: 'trunk',
      assignedVlans: vlanIds
    });
  }, [updatePortConfig]);

  const setNativeVlan = useCallback((nodeId, portId, vlanId) => {
    updatePortConfig(nodeId, portId, {
      nativeVlan: vlanId
    });
  }, [updatePortConfig]);

  // NEW: Handle port selection confirmation from modal
  const handlePortConnectionConfirm = useCallback((sourcePort, targetPort) => {
    if (!pendingConnection) return;

    const { sourceNode, targetNode } = pendingConnection;

    // Determine VLAN transport for this connection
    const vlanTransport = determineVlanTransport(sourcePort, targetPort);

    // Create enhanced edge with port information
    const newEdge = createPortEdge(
      sourceNode.id,
      targetNode.id,
      sourcePort,
      targetPort,
      vlanTransport
    );

    // Update port connection status on both nodes
    updatePortConfig(sourceNode.id, sourcePort.id, {
      connectedTo: targetPort.id
    });
    updatePortConfig(targetNode.id, targetPort.id, {
      connectedTo: sourcePort.id
    });

    // Add the edge
    setEdges((eds) => [...eds, newEdge]);

    // Clear pending connection
    setPendingConnection(null);
    setPortSelectorOpen(false);

    // Show success message (optional)
    setConnectionWarning(`Connected ${sourcePort.label} to ${targetPort.label}`);
    setTimeout(() => setConnectionWarning(null), 3000);
  }, [pendingConnection, updatePortConfig, setEdges]);

  // NEW: Handle port selector modal close
  const handlePortSelectorClose = useCallback(() => {
    setPendingConnection(null);
    setPortSelectorOpen(false);
  }, []);

  // Context value
  const value = {
    // State
    nodes,
    edges,
    selectedNode,
    selectedDeviceType,
    networkObjects,
    connectionError,
    connectionWarning,
    viewMode,
    vlans,  // NEW
    portSelectorOpen,  // NEW
    pendingConnection,  // NEW

    // ReactFlow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,

    // Node actions
    addNode,
    updateNode,
    deleteNode,
    deleteSelectedNode,

    // Edge actions
    addEdge: addEdgeManual,
    deleteEdge,

    // Selection actions
    selectNode,
    clearSelection,
    setSelectedDeviceType,

    // Canvas actions
    clearCanvas,
    clearConnectionMessages,

    // View mode actions
    setViewMode,

    // Network Object actions
    addNetworkObject,
    updateNetworkObject,
    deleteNetworkObject,
    getNetworkObjectById,

    // NEW: VLAN actions
    addVlan,
    updateVlan,
    deleteVlan,
    getVlanById,
    getVlanByVlanId,

    // NEW: Port-VLAN actions
    updatePortConfig,
    assignPortToVlan,
    setPortMode,
    setTrunkAllowedVlans,
    setNativeVlan,

    // NEW: Port selector actions
    handlePortConnectionConfirm,
    handlePortSelectorClose,

    // Utility getters
    getNodeById: (nodeId) => nodes.find((n) => n.id === nodeId),
    getEdgeById: (edgeId) => edges.find((e) => e.id === edgeId),
    getNodeCount: () => nodes.length,
    getEdgeCount: () => edges.length,
    getPortById: (nodeId, portId) => {
      const node = nodes.find((n) => n.id === nodeId);
      return node ? getPortById(node, portId) : null;
    },
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

// Custom hook to use the network context
// eslint-disable-next-line react-refresh/only-export-components
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

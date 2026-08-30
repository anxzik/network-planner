import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useEdgesState, useNodesState} from 'reactflow';
import {createDeviceNode, createEdge, createPortEdge} from '../utils/nodeFactory';
import {getDefaultVlan} from '../utils/vlanFactory';
import {determineVlanTransport, getPortById} from '../utils/portFactory';
import {debounce, exportAll, importAll, loadData, saveData} from '../utils/storage';
import {
  applySelection,
  connectPorts,
  disconnectPorts,
  removeNode,
  toTopologyDevices,
  updateNodeData,
  updatePortConfig as applyPortConfig,
} from '../utils/nodeOperations';
import {findEdge, removeEdge, removeEdgesForNode} from '../utils/edgeOperations';
import {addItem, findById, removeItem, updateItem} from '../utils/collection';

// Create the context
const NetworkContext = createContext(null);

// Provider component
export function NetworkProvider({ children }) {
  // ReactFlow state management
  // Initialize from storage
  const initialNodes = loadData('nodes', []);
  const initialEdges = loadData('edges', []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Selection state
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);

  // Network objects state (for list view)
  const [networkObjects, setNetworkObjects] = useState(() => loadData('networkObjects', []));

  // Connection validation state
  const [connectionError, setConnectionError] = useState(null);
  const [connectionWarning, setConnectionWarning] = useState(null);

  // View mode state (physical or logical)
  const [viewMode, setViewMode] = useState(() => loadData('viewMode', 'physical'));

  // VLAN state management
  const [vlans, setVlans] = useState(() => loadData('vlans', [getDefaultVlan()]));

  // Port selector modal state
  const [portSelectorOpen, setPortSelectorOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // Persistors (debounced)
  const persistNodes = useMemo(() => debounce((value) => saveData('nodes', value), 300), []);
  const persistEdges = useMemo(() => debounce((value) => saveData('edges', value), 300), []);
  const persistObjects = useMemo(() => debounce((value) => saveData('networkObjects', value), 300), []);
  const persistVlans = useMemo(() => debounce((value) => saveData('vlans', value), 300), []);
  const persistViewMode = useMemo(() => debounce((value) => saveData('viewMode', value), 300), []);

  useEffect(() => { persistNodes(nodes); }, [nodes, persistNodes]);
  useEffect(() => { persistEdges(edges); }, [edges, persistEdges]);
  useEffect(() => { persistObjects(networkObjects); }, [networkObjects, persistObjects]);
  useEffect(() => { persistVlans(vlans); }, [vlans, persistVlans]);
  useEffect(() => { persistViewMode(viewMode); }, [viewMode, persistViewMode]);

  // Add a new device node to the canvas
  const addNode = useCallback((deviceData, position, label = null) => {
    const newNode = createDeviceNode(deviceData, position, label);
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [setNodes]);

  // Update an existing node
  const updateNode = useCallback((nodeId, updates) => {
    setNodes((nds) => updateNodeData(nds, nodeId, updates));
  }, [setNodes]);

  // Delete a node
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => removeNode(nds, nodeId));
    // Also remove edges connected to this node
    setEdges((eds) => removeEdgesForNode(eds, nodeId));
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
    setNodes((nds) => applyPortConfig(nds, nodeId, portId, updates));
  }, [setNodes]);

  // Delete an edge
  const deleteEdge = useCallback((edgeId) => {
    const edge = findEdge(edges, edgeId);

    // Clear the connection recorded on the ports at both ends
    if (edge) {
      setNodes((nds) => disconnectPorts(nds, edge));
    }

    setEdges((eds) => removeEdge(eds, edgeId));
  }, [edges, setNodes, setEdges]);

  // Select a node
  const selectNode = useCallback((nodeId) => {
    setSelectedNode(nodeId);
    // Update node data to reflect selection
    setNodes((nds) => applySelection(nds, nodeId));
  }, [setNodes]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setNodes((nds) => applySelection(nds, null));
  }, [setNodes]);

  // Clear entire canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedDeviceType(null);
    // also persist cleared state
    saveData('nodes', []);
    saveData('edges', []);
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
    setNetworkObjects((objs) => addItem(objs, networkObject));
  }, []);

  // Update an existing network object
  const updateNetworkObject = useCallback((objectId, updates) => {
    setNetworkObjects((objs) => updateItem(objs, objectId, updates));
  }, []);

  // Delete a network object
  const deleteNetworkObject = useCallback((objectId) => {
    setNetworkObjects((objs) => removeItem(objs, objectId));
  }, []);

  // Get network object by ID
  const getNetworkObjectById = useCallback(
    (objectId) => findById(networkObjects, objectId),
    [networkObjects]
  );

  // Clear connection messages
  const clearConnectionMessages = useCallback(() => {
    setConnectionError(null);
    setConnectionWarning(null);
  }, []);

  // NEW: VLAN CRUD operations
  const addVlan = useCallback((vlanConfig) => {
    setVlans((prevVlans) => addItem(prevVlans, vlanConfig));
    return vlanConfig;
  }, []);

  const updateVlan = useCallback((vlanId, updates) => {
    setVlans((prevVlans) => updateItem(prevVlans, vlanId, updates));
  }, []);

  const deleteVlan = useCallback((vlanId) => {
    setVlans((prevVlans) => removeItem(prevVlans, vlanId));
  }, []);

  const getVlanById = useCallback((vlanId) => findById(vlans, vlanId), [vlans]);

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
    setNodes((nds) =>
      connectPorts(nds, sourceNode.id, sourcePort.id, targetNode.id, targetPort.id)
    );

    // Add the edge
    setEdges((eds) => [...eds, newEdge]);

    // Clear pending connection
    setPendingConnection(null);
    setPortSelectorOpen(false);

    // Show success message (optional)
    setConnectionWarning(`Connected ${sourcePort.label} to ${targetPort.label}`);
    setTimeout(() => setConnectionWarning(null), 3000);
  }, [pendingConnection, setNodes, setEdges]);

  // NEW: Handle port selector modal close
  const handlePortSelectorClose = useCallback(() => {
    setPendingConnection(null);
    setPortSelectorOpen(false);
  }, []);

  // Derived state: auto-populated topology devices list
  const topologyDevices = useMemo(() => toTopologyDevices(nodes), [nodes]);

  // Project export/import helpers
  const exportProject = useCallback(() => {
    // Return entire namespaced snapshot
    return exportAll();
  }, []);

  const importProject = useCallback((snapshot) => {
    importAll(snapshot);
    // Reload from imported snapshot
    setNodes(loadData('nodes', []));
    setEdges(loadData('edges', []));
    setVlans(loadData('vlans', [getDefaultVlan()]));
    setNetworkObjects(loadData('networkObjects', []));
    setViewMode(loadData('viewMode', 'physical'));
    }, [setNodes, setEdges]);

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
    vlans,
    portSelectorOpen,
    pendingConnection,
    topologyDevices, // Derived state from nodes

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

    // Persistence helpers
    exportProject,
    importProject,

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

import {createContext, useCallback, useContext, useState} from 'react';
import {addEdge as reactFlowAddEdge, useEdgesState, useNodesState} from 'reactflow';
import {createDeviceNode, createEdge} from '../utils/nodeFactory';

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

  // Handle edge connection
  const onConnect = useCallback((connection) => {
    setEdges((eds) => reactFlowAddEdge(connection, eds));
  }, [setEdges]);

  // Add a new edge
  const addEdgeManual = useCallback((sourceId, targetId) => {
    const newEdge = createEdge(sourceId, targetId);
    setEdges((eds) => [...eds, newEdge]);
    return newEdge;
  }, [setEdges]);

  // Delete an edge
  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

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

  // Context value
  const value = {
    // State
    nodes,
    edges,
    selectedNode,
    selectedDeviceType,

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

    // Utility getters
    getNodeById: (nodeId) => nodes.find((n) => n.id === nodeId),
    getEdgeById: (edgeId) => edges.find((e) => e.id === edgeId),
    getNodeCount: () => nodes.length,
    getEdgeCount: () => edges.length,
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

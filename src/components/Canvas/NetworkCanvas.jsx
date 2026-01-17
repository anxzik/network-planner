import {useCallback, useRef} from 'react';
import ReactFlow, {Background, BackgroundVariant, Controls, MiniMap, ReactFlowProvider, useReactFlow,} from 'reactflow';
import 'reactflow/dist/style.css';
import {useNetwork} from '../../context/NetworkContext';
import {useSettings} from '../../context/SettingsContext';
import {nodeTypes} from '../nodes';
import ConnectionNotification from './ConnectionNotification';
import NodeConfigPanel from '../NodeConfig/NodeConfigPanel';
import PortSelectorModal from '../PortSelector/PortSelectorModal';

function NetworkCanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    clearSelection,
    portSelectorOpen,
    pendingConnection,
    handlePortConnectionConfirm,
    handlePortSelectorClose,
  } = useNetwork();

  const { settings } = useSettings();
  const { ui, canvas } = settings;

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  // Get background variant from settings
  const getBackgroundVariant = () => {
    switch (ui.backgroundStyle) {
      case 'lines':
        return BackgroundVariant.Lines;
      case 'cross':
        return BackgroundVariant.Cross;
      case 'dots':
      default:
        return BackgroundVariant.Dots;
    }
  };

  // Handle drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // Get the device data from the drag event
      const deviceData = event.dataTransfer.getData('application/reactflow');

      if (!deviceData) {
        return;
      }

      const device = JSON.parse(deviceData);

      // Calculate the position where the device was dropped
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Add the device node to the canvas
      addNode(device, position);
    },
    [screenToFlowPosition, addNode]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {/* Connection Error/Warning Notifications */}
      <ConnectionNotification />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={ui.snapToGrid}
        snapGrid={[ui.gridSize, ui.gridSize]}
        defaultViewport={{ x: 0, y: 0, zoom: ui.defaultZoom }}
        minZoom={canvas.minZoom}
        maxZoom={canvas.maxZoom}
        panOnDrag={canvas.panOnDrag}
        nodesDraggable={canvas.nodesDraggable}
        nodesConnectable={canvas.nodesConnectable}
        elementsSelectable={canvas.elementsSelectable}
        attributionPosition="bottom-right"
      >
        {/* Background with configurable pattern */}
        {ui.showGrid && ui.backgroundStyle !== 'none' && (
          <Background
            variant={getBackgroundVariant()}
            gap={ui.gridSize}
            size={1}
            color="#d1d5db"
          />
        )}

        {/* Controls for zoom, fit view, etc. */}
        <Controls
          showInteractive={false}
          className="bg-white border border-gray-300 rounded-lg shadow-lg"
        />

        {/* Mini map for navigation */}
        {ui.showMinimap && (
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => node.data?.device?.color || '#6B7280'}
            className="bg-white border border-gray-300 rounded-lg shadow-lg"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}
      </ReactFlow>

      {/* Node Configuration Panel */}
      <NodeConfigPanel />

      {/* Port Selector Modal */}
      <PortSelectorModal
        isOpen={portSelectorOpen}
        onClose={handlePortSelectorClose}
        sourceNode={pendingConnection?.sourceNode}
        targetNode={pendingConnection?.targetNode}
        onConfirm={handlePortConnectionConfirm}
      />
    </div>
  );
}

// Wrapper component with ReactFlowProvider
function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <NetworkCanvasInner />
    </ReactFlowProvider>
  );
}

export default NetworkCanvas;

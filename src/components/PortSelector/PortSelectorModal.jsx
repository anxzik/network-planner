import {useEffect, useState} from 'react';
import {X} from 'lucide-react';
import PortPanel from './PortPanel';
import PortConnectionSummary from './PortConnectionSummary';
import {validatePortConnection} from '../../utils/portFactory';

function PortSelectorModal({ isOpen, onClose, sourceNode, targetNode, onConfirm }) {
  const [selectedSourcePort, setSelectedSourcePort] = useState(null);
  const [selectedTargetPort, setSelectedTargetPort] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSourcePort(null);
      setSelectedTargetPort(null);
      setValidationResult(null);
    }
  }, [isOpen]);

  // Validate connection when both ports are selected
  useEffect(() => {
    if (selectedSourcePort && selectedTargetPort) {
      const result = validatePortConnection(selectedSourcePort, selectedTargetPort);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [selectedSourcePort, selectedTargetPort]);

  const handleConfirm = () => {
    if (selectedSourcePort && selectedTargetPort && validationResult?.valid) {
      onConfirm(selectedSourcePort, selectedTargetPort);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedSourcePort(null);
    setSelectedTargetPort(null);
    setValidationResult(null);
    onClose();
  };

  if (!isOpen || !sourceNode || !targetNode) {
    return null;
  }

  const canConnect = selectedSourcePort && selectedTargetPort && validationResult?.valid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Select Ports to Connect
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose one port from each device to create the connection
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Two-column port selection */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Source Device Ports */}
            <PortPanel
              node={sourceNode}
              title="Source Device"
              selectedPort={selectedSourcePort}
              onSelectPort={setSelectedSourcePort}
              highlightAvailable={true}
            />

            {/* Target Device Ports */}
            <PortPanel
              node={targetNode}
              title="Target Device"
              selectedPort={selectedTargetPort}
              onSelectPort={setSelectedTargetPort}
              highlightAvailable={true}
            />
          </div>

          {/* Connection Summary */}
          {(selectedSourcePort || selectedTargetPort) && (
            <PortConnectionSummary
              sourcePort={selectedSourcePort}
              targetPort={selectedTargetPort}
              validationResult={validationResult}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConnect}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              canConnect
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Connect Ports
          </button>
        </div>
      </div>
    </div>
  );
}

export default PortSelectorModal;

import {AlertTriangle, ArrowRight, CheckCircle, XCircle} from 'lucide-react';
import {formatVlanList} from '../../utils/vlanFactory';

function PortConnectionSummary({ sourcePort, targetPort, validationResult }) {
  // If neither port is selected, don't show anything
  if (!sourcePort && !targetPort) {
    return null;
  }

  const renderPortInfo = (port, label) => {
    if (!port) {
      return (
        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">No port selected</div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white border-2 border-blue-200 rounded-lg p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900 mb-3">
          {port.label}
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900">{port.portType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Speed:</span>
            <span className="font-medium text-gray-900">{port.speed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Mode:</span>
            <span className={`font-medium ${port.mode === 'trunk' ? 'text-purple-600' : 'text-gray-900'}`}>
              {port.mode}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">VLANs:</span>
            <span className="font-medium text-blue-600">
              {formatVlanList(port.assignedVlans)}
            </span>
          </div>
          {port.mode === 'trunk' && port.nativeVlan && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Native VLAN:</span>
              <span className="font-medium text-gray-900">{port.nativeVlan}</span>
            </div>
          )}
          {port.poe && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">PoE:</span>
              <span className="font-medium text-green-600">Supported</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderValidationStatus = () => {
    if (!sourcePort || !targetPort) {
      return (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle size={18} className="text-gray-400" />
            Select ports on both sides to validate connection
          </div>
        </div>
      );
    }

    if (!validationResult) {
      return null;
    }

    if (validationResult.valid) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="font-semibold text-green-900 mb-1">
                Connection Valid
              </div>
              <div className="text-sm text-green-700">
                These ports can be connected. The connection will operate in{' '}
                <span className="font-medium">
                  {sourcePort.mode === 'trunk' || targetPort.mode === 'trunk' ? 'trunk' : 'access'}
                </span>{' '}
                mode.
              </div>
              {validationResult.warning && (
                <div className="mt-2 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{validationResult.warning}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-1">
                Connection Invalid
              </div>
              <div className="text-sm text-red-700">
                {validationResult.error}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Connection Preview
      </h3>

      {/* Port comparison */}
      <div className="flex items-center gap-4 mb-4">
        {renderPortInfo(sourcePort, 'Source Port')}

        <div className="flex-shrink-0">
          <ArrowRight size={32} className="text-gray-400" />
        </div>

        {renderPortInfo(targetPort, 'Target Port')}
      </div>

      {/* Validation status */}
      {renderValidationStatus()}
    </div>
  );
}

export default PortConnectionSummary;

import {useState} from 'react';
import {Cable, Network, Search, Wifi} from 'lucide-react';
import {formatVlanList} from '../../utils/vlanFactory';

function PortPanel({ node, title, selectedPort, onSelectPort, highlightAvailable = false }) {
  const [filterText, setFilterText] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const ports = node?.data?.ports || [];

  // Filter ports based on search and availability
  const filteredPorts = ports.filter(port => {
    const matchesSearch = !filterText ||
      port.label.toLowerCase().includes(filterText.toLowerCase()) ||
      port.description.toLowerCase().includes(filterText.toLowerCase());

    const matchesAvailability = !showOnlyAvailable || port.connectedTo === null;

    return matchesSearch && matchesAvailability;
  });

  // Get port icon based on type
  const getPortIcon = (portType) => {
    switch (portType) {
      case 'ethernet':
        return <Network size={14} />;
      case 'sfp':
      case 'sfpPlus':
      case 'sfp28':
        return <Cable size={14} />;
      case 'qsfp28':
      case 'qsfpPlus':
        return <Cable size={16} />;
      case 'wireless':
        return <Wifi size={14} />;
      default:
        return <Network size={14} />;
    }
  };

  // Get port status color and label
  const getPortStatus = (port) => {
    if (!port.enabled) {
      return {
        color: 'bg-gray-400',
        borderColor: 'border-gray-400',
        label: 'Disabled',
        textColor: 'text-gray-700'
      };
    }
    if (port.connectedTo) {
      return {
        color: 'bg-red-500',
        borderColor: 'border-red-500',
        label: 'In Use',
        textColor: 'text-red-700'
      };
    }
    return {
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      label: 'Available',
      textColor: 'text-green-700'
    };
  };

  const handlePortClick = (port) => {
    // Only allow selecting available and enabled ports
    if (port.enabled && port.connectedTo === null) {
      onSelectPort(port);
    }
  };

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <div className="text-xs text-gray-500">
            {node.data.label} ({node.data.device.model})
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search ports..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Available only
          </label>
        </div>
      </div>

      {/* Port list */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredPorts.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            {ports.length === 0 ? 'No ports available' : 'No ports match filters'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredPorts.map((port) => {
              const status = getPortStatus(port);
              const isSelected = selectedPort?.id === port.id;
              const isSelectable = port.enabled && port.connectedTo === null;

              return (
                <div
                  key={port.id}
                  onClick={() => handlePortClick(port)}
                  className={`
                    p-2.5 rounded-md border-2 transition-all cursor-pointer
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isSelectable
                        ? `${status.borderColor} bg-white hover:bg-gray-50`
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {/* Port header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`${status.color} p-1 rounded`}>
                        {getPortIcon(port.portType)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {port.label}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${status.textColor}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Port details */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-600 ml-7">
                    <div>
                      <span className="text-gray-500">Type:</span> {port.portType}
                    </div>
                    <div>
                      <span className="text-gray-500">Speed:</span> {port.speed}
                    </div>
                    <div>
                      <span className="text-gray-500">Mode:</span>{' '}
                      <span className={port.mode === 'trunk' ? 'text-purple-600 font-medium' : ''}>
                        {port.mode}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">VLAN:</span>{' '}
                      {formatVlanList(port.assignedVlans)}
                    </div>
                    {port.mode === 'trunk' && port.nativeVlan && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Native:</span> {port.nativeVlan}
                      </div>
                    )}
                    {port.poe && (
                      <div className="col-span-2 text-green-600 font-medium">
                        PoE Supported
                      </div>
                    )}
                  </div>

                  {/* Port description */}
                  {port.description && (
                    <div className="mt-1.5 text-xs text-gray-500 italic ml-7">
                      {port.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Total ports: <span className="font-semibold">{ports.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{ports.filter(p => p.enabled && !p.connectedTo).length} available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{ports.filter(p => p.connectedTo).length} in use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortPanel;

import {useState} from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {formatVlanList} from '../../utils/vlanFactory';
import {useNetwork} from '../../context/NetworkContext';
import {useSettings} from '../../context/SettingsContext';

function PortConfigRow({ node, port, onUpdate }) {
  const { vlans } = useNetwork();
  const { currentTheme } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    mode: port.mode,
    assignedVlans: port.assignedVlans,
    nativeVlan: port.nativeVlan,
    description: port.description,
    enabled: port.enabled
  });

  const handleModeChange = (newMode) => {
    const updates = { mode: newMode };

    // When switching to access mode, keep only first VLAN
    if (newMode === 'access' && port.assignedVlans.length > 1) {
      updates.assignedVlans = [port.assignedVlans[0]];
      updates.nativeVlan = null;
    }

    onUpdate(port.id, updates);
  };

  const handleVlanChange = (vlanIds) => {
    onUpdate(port.id, { assignedVlans: vlanIds });
  };

  const handleNativeVlanChange = (vlanId) => {
    onUpdate(port.id, { nativeVlan: vlanId });
  };

  const handleToggleEnabled = () => {
    onUpdate(port.id, { enabled: !port.enabled });
  };

  const handleDescriptionChange = (description) => {
    onUpdate(port.id, { description });
  };

  const getStatusColor = () => {
    if (!port.enabled) return '#9CA3AF'; // gray
    if (port.connectedTo) return '#EF4444'; // red
    return '#10B981'; // green
  };

  const getStatusText = () => {
    if (!port.enabled) return 'Disabled';
    if (port.connectedTo) return 'Connected';
    return 'Available';
  };

  return (
    <div
      className="border-b"
      style={{ borderColor: currentTheme.border }}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 hover:bg-opacity-50 cursor-pointer transition-colors"
        style={{
          backgroundColor: isExpanded ? currentTheme.background : 'transparent'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse */}
        <button
          className="p-0.5"
          style={{ color: currentTheme.textSecondary }}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Status Indicator */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: getStatusColor() }}
        />

        {/* Port Label */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: currentTheme.text }}>
            {port.label}
          </div>
          <div className="text-xs" style={{ color: currentTheme.textSecondary }}>
            {port.portType} • {port.speed}
          </div>
        </div>

        {/* Mode Badge */}
        <div
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: port.mode === 'trunk' ? '#A78BFA20' : currentTheme.border,
            color: port.mode === 'trunk' ? '#8B5CF6' : currentTheme.textSecondary
          }}
        >
          {port.mode}
        </div>

        {/* VLAN Display */}
        <div className="text-xs font-mono" style={{ color: currentTheme.text }}>
          {formatVlanList(port.assignedVlans)}
        </div>

        {/* Status */}
        <div
          className="text-xs font-medium w-20 text-right"
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          className="px-3 py-3 space-y-3 border-t"
          style={{
            backgroundColor: currentTheme.background,
            borderColor: currentTheme.border
          }}
        >
          {/* Port Mode */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.text }}>
              Port Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleModeChange('access');
                }}
                disabled={port.connectedTo !== null}
                className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: port.mode === 'access' ? currentTheme.primary : currentTheme.border,
                  color: port.mode === 'access' ? '#FFFFFF' : currentTheme.text
                }}
              >
                Access
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleModeChange('trunk');
                }}
                disabled={port.connectedTo !== null}
                className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: port.mode === 'trunk' ? '#8B5CF6' : currentTheme.border,
                  color: port.mode === 'trunk' ? '#FFFFFF' : currentTheme.text
                }}
              >
                Trunk
              </button>
            </div>
            {port.connectedTo && (
              <div className="text-xs mt-1" style={{ color: '#F59E0B' }}>
                Disconnect port to change mode
              </div>
            )}
          </div>

          {/* VLAN Assignment */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.text }}>
              {port.mode === 'access' ? 'VLAN' : 'Allowed VLANs'}
            </label>
            {port.mode === 'access' ? (
              // Single VLAN selector for access mode
              <select
                value={port.assignedVlans[0] || 1}
                onChange={(e) => {
                  e.stopPropagation();
                  handleVlanChange([parseInt(e.target.value)]);
                }}
                disabled={port.connectedTo !== null}
                className="w-full px-2.5 py-1.5 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: currentTheme.surface,
                  color: currentTheme.text,
                  borderColor: currentTheme.border
                }}
              >
                {vlans.map(vlan => (
                  <option key={vlan.id} value={vlan.vlanId}>
                    VLAN {vlan.vlanId} - {vlan.name}
                  </option>
                ))}
              </select>
            ) : (
              // Multi-select for trunk mode
              <div
                className="border rounded p-2 max-h-32 overflow-y-auto space-y-1"
                style={{ borderColor: currentTheme.border }}
                onClick={(e) => e.stopPropagation()}
              >
                {vlans.map(vlan => (
                  <label
                    key={vlan.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-opacity-50 px-1 py-0.5 rounded"
                    style={{ color: currentTheme.text }}
                  >
                    <input
                      type="checkbox"
                      checked={port.assignedVlans.includes(vlan.vlanId)}
                      onChange={(e) => {
                        const newVlans = e.target.checked
                          ? [...port.assignedVlans, vlan.vlanId].sort((a, b) => a - b)
                          : port.assignedVlans.filter(v => v !== vlan.vlanId);

                        if (newVlans.length > 0) {
                          handleVlanChange(newVlans);
                        }
                      }}
                      disabled={port.connectedTo !== null}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span>VLAN {vlan.vlanId} - {vlan.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Native VLAN (trunk only) */}
          {port.mode === 'trunk' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.text }}>
                Native VLAN (untagged)
              </label>
              <select
                value={port.nativeVlan || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  handleNativeVlanChange(e.target.value ? parseInt(e.target.value) : null);
                }}
                disabled={port.connectedTo !== null}
                className="w-full px-2.5 py-1.5 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: currentTheme.surface,
                  color: currentTheme.text,
                  borderColor: currentTheme.border
                }}
              >
                <option value="">None</option>
                {vlans
                  .filter(vlan => port.assignedVlans.includes(vlan.vlanId))
                  .map(vlan => (
                    <option key={vlan.id} value={vlan.vlanId}>
                      VLAN {vlan.vlanId} - {vlan.name}
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.text }}>
              Description
            </label>
            <input
              type="text"
              value={port.description}
              onChange={(e) => {
                e.stopPropagation();
                handleDescriptionChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2.5 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: currentTheme.surface,
                color: currentTheme.text,
                borderColor: currentTheme.border
              }}
              placeholder="e.g., Uplink to Core Switch"
            />
          </div>

          {/* Enable/Disable Port */}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: currentTheme.border }}>
            <span className="text-xs font-medium" style={{ color: currentTheme.text }}>
              Port Enabled
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleEnabled();
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                port.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  port.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* PoE Info */}
          {port.poe && (
            <div
              className="text-xs px-2 py-1.5 rounded"
              style={{
                backgroundColor: '#10B98120',
                color: '#10B981'
              }}
            >
              ⚡ PoE Supported
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PortConfigRow;

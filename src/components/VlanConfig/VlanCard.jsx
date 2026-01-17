import {ChevronRight, Edit2, Network, Trash2} from 'lucide-react';
import {useNetwork} from '../../context/NetworkContext';
import {isDefaultVlan, isReservedVlan} from '../../utils/vlanFactory';

function VlanCard({ vlan, onEdit, onDelete }) {
  const { nodes } = useNetwork();

  // Calculate VLAN membership
  const getVlanMembership = () => {
    const devicesInVlan = new Set();
    let portCount = 0;
    let accessPorts = 0;
    let trunkPorts = 0;

    nodes.forEach(node => {
      const ports = node.data?.ports || [];
      const portsInThisVlan = ports.filter(port =>
        port.assignedVlans.includes(vlan.vlanId)
      );

      if (portsInThisVlan.length > 0) {
        devicesInVlan.add(node.id);
        portCount += portsInThisVlan.length;

        portsInThisVlan.forEach(port => {
          if (port.mode === 'access') accessPorts++;
          else trunkPorts++;
        });
      }
    });

    return {
      deviceCount: devicesInVlan.size,
      portCount,
      accessPorts,
      trunkPorts,
      devices: Array.from(devicesInVlan).map(id =>
        nodes.find(n => n.id === id)
      )
    };
  };

  const membership = getVlanMembership();
  const isDefault = isDefaultVlan(vlan);
  const isReserved = isReservedVlan(vlan.vlanId);

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Color indicator */}
          <div
            className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0 border-2 border-white shadow-sm"
            style={{ backgroundColor: vlan.color }}
          />

          {/* VLAN Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900">
                VLAN {vlan.vlanId}
              </h3>
              {isDefault && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  Default
                </span>
              )}
              {isReserved && !isDefault && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                  Reserved
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {vlan.name}
            </div>
            {vlan.description && (
              <div className="text-xs text-gray-500 line-clamp-2">
                {vlan.description}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(vlan)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit VLAN"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(vlan)}
            disabled={isDefault}
            className={`p-1.5 rounded transition-colors ${
              isDefault
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
            title={isDefault ? 'Cannot delete default VLAN' : 'Delete VLAN'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subnet Info */}
      {vlan.subnet && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-medium text-blue-900 mb-1">Subnet Configuration</div>
          <div className="space-y-0.5 text-blue-700">
            <div>
              Network: <span className="font-mono font-semibold">{vlan.subnet.network}/{vlan.subnet.cidr}</span>
            </div>
            <div>
              Mask: <span className="font-mono">{vlan.subnet.mask}</span>
            </div>
            {vlan.subnet.gateway && (
              <div>
                Gateway: <span className="font-mono">{vlan.subnet.gateway}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Membership Stats */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <Network size={14} />
            <span>{membership.deviceCount} device{membership.deviceCount !== 1 ? 's' : ''}</span>
          </div>
          <div>
            {membership.portCount} port{membership.portCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Port breakdown */}
        {membership.portCount > 0 && (
          <div className="flex items-center gap-3 text-xs">
            {membership.accessPorts > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{membership.accessPorts} access</span>
              </div>
            )}
            {membership.trunkPorts > 0 && (
              <div className="flex items-center gap-1 text-purple-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>{membership.trunkPorts} trunk</span>
              </div>
            )}
          </div>
        )}

        {/* Device list (if any) */}
        {membership.deviceCount > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
              <ChevronRight size={12} className="inline" />
              View devices
            </summary>
            <div className="mt-2 space-y-1 pl-3">
              {membership.devices.map(device => (
                <div key={device.id} className="text-xs text-gray-700">
                  • {device.data.label}
                  <span className="text-gray-500 ml-1">
                    ({device.data.ports?.filter(p => p.assignedVlans.includes(vlan.vlanId)).length} port{device.data.ports?.filter(p => p.assignedVlans.includes(vlan.vlanId)).length !== 1 ? 's' : ''})
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Empty state */}
        {membership.portCount === 0 && (
          <div className="text-xs text-gray-400 italic">
            No ports assigned
          </div>
        )}
      </div>
    </div>
  );
}

export default VlanCard;

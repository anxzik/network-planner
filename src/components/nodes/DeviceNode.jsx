import {Handle, Position} from 'reactflow';
import {getDeviceIcon} from '../../utils/deviceHelpers';
import {svgToDataUri} from '../../utils/svgDataUri';
import {useNetwork} from '../../context/NetworkContext';
import {useLibrary} from '../../context/LibraryContext';

function DeviceNode({ data, selected }) {
  const { device, label, isSelected, ipv4, subnet } = data;
  const { viewMode } = useNetwork();
  const { symbolById } = useLibrary();
  // FR-015 resolution order: an imported symbol assigned to this type draws
  // as an inert image; otherwise the built-in mapping, whose own fallback is
  // the recognisable default box.
  const importedSymbol = symbolById(device.icon);
  // An imported symbol that cannot be encoded draws as the built-in icon rather
  // than taking the canvas down with it.
  const importedUri = importedSymbol ? svgToDataUri(importedSymbol.content) : null;
  const IconComponent = getDeviceIcon(device.icon);

  return (
    <div
      className={`
        device-node
        bg-white rounded-lg border-2 p-3
        shadow-lg hover:shadow-xl transition-all duration-200
        ${selected || isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
        min-w-[100px] max-w-[120px]
      `}
      style={{
        borderColor: device.color,
      }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Device Content */}
      <div className="flex flex-col items-center gap-2">
        {/* Device Icon */}
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: `${device.color}20`,
          }}
        >
          {importedUri ? (
          <img
            alt=""
            src={importedUri}
            style={{ width: 24, height: 24 }}
          />
        ) : (
          /* eslint-disable-next-line react-hooks/static-components -- the
             icon component is a lookup from a fixed map, the file's
             long-standing pattern; my branch insertion had orphaned the
             original directive two elements up */
          <IconComponent
            size={32}
            style={{ color: device.color }}
            strokeWidth={1.5}
          />
        )}
        </div>

        {/* Device Label */}
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-800 truncate max-w-[90px]">
            {label}
          </div>
          <div className="text-[10px] text-gray-500 truncate max-w-[90px]">
            {device.model}
          </div>
        </div>

        {/* IP Information (Logical View Only) */}
        {viewMode === 'logical' && (
          <div className="text-center w-full border-t border-gray-200 pt-1.5 mt-0.5">
            {ipv4 ? (
              <>
                <div className="text-[10px] font-mono font-medium text-blue-600">
                  {ipv4}
                </div>
                {subnet && (
                  <div className="text-[9px] font-mono text-gray-500">
                    {subnet}
                  </div>
                )}
              </>
            ) : (
              <div className="text-[9px] text-gray-400 italic">
                No IP configured
              </div>
            )}
          </div>
        )}

        {/* Device Type Badge (Physical View Only) */}
        {viewMode === 'physical' && (
          <div
            className="text-[9px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${device.color}15`,
              color: device.color,
            }}
          >
            {device.category}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceNode;

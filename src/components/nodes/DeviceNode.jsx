import {Handle, Position} from 'reactflow';
import {getDeviceIcon} from '../../utils/deviceHelpers';

function DeviceNode({ data, selected }) {
  const { device, label, isSelected } = data;
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
          {/* eslint-disable-next-line react-hooks/static-components */}
          <IconComponent
            size={32}
            style={{ color: device.color }}
            strokeWidth={1.5}
          />
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

        {/* Device Type Badge */}
        <div
          className="text-[9px] font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${device.color}15`,
            color: device.color,
          }}
        >
          {device.category}
        </div>
      </div>
    </div>
  );
}

export default DeviceNode;

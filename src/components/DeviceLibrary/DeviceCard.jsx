import {getDeviceIcon} from '../../utils/deviceHelpers';
import {useNetwork} from '../../context/NetworkContext';

function DeviceCard({ device }) {
  const { setSelectedDeviceType } = useNetwork();
  const IconComponent = getDeviceIcon(device.icon);

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(device));
    event.dataTransfer.effectAllowed = 'move';
    setSelectedDeviceType(device);
  };

  const onDragEnd = () => {
    setSelectedDeviceType(null);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="
        bg-white rounded border p-2
        hover:shadow-sm hover:scale-[1.01]
        transition-all duration-200 cursor-grab
        active:cursor-grabbing active:scale-95
      "
      style={{
        borderColor: `${device.color}40`,
      }}
    >
      <div className="flex items-center gap-2">
        {/* Device Icon */}
        <div
          className="p-1 rounded flex-shrink-0"
          style={{
            backgroundColor: `${device.color}15`,
          }}
        >
          {/* eslint-disable-next-line react-hooks/static-components */}
          <IconComponent
            size={16}
            style={{ color: device.color }}
            strokeWidth={1.5}
          />
        </div>

        {/* Device Info */}
        <div className="flex-1 min-w-0">
          {/* Device Name */}
          <div className="text-[11px] font-semibold text-gray-800 truncate leading-tight">
            {device.name}
          </div>

          {/* Device Type Badge */}
          <span
            className="text-[9px] font-medium px-1 py-0.5 rounded inline-block mt-0.5"
            style={{
              backgroundColor: `${device.color}10`,
              color: device.color,
            }}
          >
            {device.type}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DeviceCard;

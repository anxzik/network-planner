import {useState} from 'react';
import {ChevronDown, ChevronRight} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import DeviceCard from './DeviceCard';

function DeviceCategory({ categoryInfo, devices }) {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(settings.deviceLibrary.expandedByDefault);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-2">
      {/* Category Header */}
      <button
        onClick={toggleExpanded}
        className="
          w-full flex items-center justify-between
          px-2 py-1 rounded
          hover:bg-gray-50 transition-colors
          group
        "
      >
        <div className="flex items-center gap-1.5">
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronDown size={14} className="text-gray-500" />
          ) : (
            <ChevronRight size={14} className="text-gray-500" />
          )}

          {/* Color Indicator */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: categoryInfo.color }}
          />

          {/* Category Name */}
          <span className="text-xs font-semibold text-gray-800">
            {categoryInfo.name}
          </span>

          {/* Device Count Badge */}
          <span className="text-[10px] text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 rounded">
            {devices.length}
          </span>
        </div>
      </button>

      {/* Device List */}
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}

export default DeviceCategory;

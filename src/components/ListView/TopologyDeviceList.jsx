import {useMemo, useState} from 'react';
import {Cloud, Cpu, ExternalLink, Search, Server} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';

function TopologyDeviceList() {
  const { currentTheme } = useSettings();
  const { topologyDevices, selectNode } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterViewType, setFilterViewType] = useState('all'); // 'all', 'physical', 'logical'

  // Filter devices based on search query and view type
  const filteredDevices = useMemo(() => {
    return topologyDevices.filter((device) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        device.name?.toLowerCase().includes(query) ||
        device.ipv4?.toLowerCase().includes(query) ||
        device.category?.toLowerCase().includes(query) ||
        device.provider?.toLowerCase().includes(query);

      const matchesViewType =
        filterViewType === 'all' ||
        device.viewType === filterViewType;

      return matchesSearch && matchesViewType;
    });
  }, [topologyDevices, searchQuery, filterViewType]);

  // Group devices by category
  const groupedDevices = useMemo(() => {
    const groups = {};
    filteredDevices.forEach((device) => {
      const category = device.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(device);
    });
    return groups;
  }, [filteredDevices]);

  const handleDeviceClick = (deviceId) => {
    selectNode(deviceId);
  };

  const getCategoryIcon = (category) => {
    if (['Hypervisors', 'VirtualInfra'].includes(category)) {
      return <Cloud size={14} style={{ color: currentTheme.primary }} />;
    }
    if (category === 'Endpoints') {
      return <Server size={14} style={{ color: currentTheme.primary }} />;
    }
    return <Cpu size={14} style={{ color: currentTheme.primary }} />;
  };

  const physicalCount = topologyDevices.filter(d => d.viewType === 'physical').length;
  const logicalCount = topologyDevices.filter(d => d.viewType === 'logical').length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: currentTheme.border }}
      >
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: currentTheme.textSecondary }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices..."
              className="pl-9 pr-3 py-2 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
                width: '200px',
              }}
            />
          </div>

          {/* View Type Filter */}
          <div
            className="flex rounded-md p-0.5"
            style={{ backgroundColor: currentTheme.border }}
          >
            <button
              onClick={() => setFilterViewType('all')}
              className="px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: filterViewType === 'all' ? currentTheme.surface : 'transparent',
                color: filterViewType === 'all' ? currentTheme.primary : currentTheme.textSecondary,
              }}
            >
              All ({topologyDevices.length})
            </button>
            <button
              onClick={() => setFilterViewType('physical')}
              className="px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: filterViewType === 'physical' ? currentTheme.surface : 'transparent',
                color: filterViewType === 'physical' ? currentTheme.primary : currentTheme.textSecondary,
              }}
            >
              Physical ({physicalCount})
            </button>
            <button
              onClick={() => setFilterViewType('logical')}
              className="px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: filterViewType === 'logical' ? currentTheme.surface : 'transparent',
                color: filterViewType === 'logical' ? currentTheme.primary : currentTheme.textSecondary,
              }}
            >
              Logical ({logicalCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
            Auto-synced from canvas
          </span>
        </div>
      </div>

      {/* Device List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Cpu size={48} style={{ color: currentTheme.border }} className="mb-3" />
            <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.text }}>
              {searchQuery ? 'No devices found' : 'No devices on canvas'}
            </h3>
            <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Add devices to the topology canvas to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDevices).map(([category, devices]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-2 px-2">
                  {getCategoryIcon(category)}
                  <span className="text-sm font-semibold" style={{ color: currentTheme.text }}>
                    {category}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: currentTheme.border,
                      color: currentTheme.textSecondary,
                    }}
                  >
                    {devices.length}
                  </span>
                </div>

                {/* Devices */}
                <div className="space-y-2">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      onClick={() => handleDeviceClick(device.id)}
                      className="p-3 rounded-lg border cursor-pointer transition-all"
                      style={{
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = currentTheme.primary;
                        e.currentTarget.style.backgroundColor = currentTheme.primary + '10';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = currentTheme.border;
                        e.currentTarget.style.backgroundColor = currentTheme.surface;
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm" style={{ color: currentTheme.text }}>
                              {device.name}
                            </span>
                            {device.viewType === 'logical' && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: '#EC4899' + '20',
                                  color: '#EC4899',
                                }}
                              >
                                Logical
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: currentTheme.textSecondary }}>
                            {device.manufacturer} {device.model}
                          </div>
                        </div>
                        <div className="text-right">
                          {device.ipv4 && (
                            <div className="font-mono text-sm" style={{ color: currentTheme.text }}>
                              {device.ipv4}
                            </div>
                          )}
                          {device.subnet && (
                            <div className="font-mono text-xs" style={{ color: currentTheme.textSecondary }}>
                              /{device.subnet}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional info for logical devices */}
                      {device.viewType === 'logical' && (device.provider || device.region) && (
                        <div
                          className="mt-2 pt-2 border-t flex items-center gap-3 text-xs"
                          style={{ borderColor: currentTheme.border }}
                        >
                          {device.provider && (
                            <span style={{ color: currentTheme.textSecondary }}>
                              Provider: <span style={{ color: currentTheme.text }}>{device.provider}</span>
                            </span>
                          )}
                          {device.region && (
                            <span style={{ color: currentTheme.textSecondary }}>
                              Region: <span style={{ color: currentTheme.text }}>{device.region}</span>
                            </span>
                          )}
                          {device.cloudAssetLink && (
                            <a
                              href={device.cloudAssetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1"
                              style={{ color: currentTheme.primary }}
                            >
                              <ExternalLink size={12} />
                              Open
                            </a>
                          )}
                        </div>
                      )}

                      {/* Port info for physical devices */}
                      {device.viewType === 'physical' && device.portCount > 0 && (
                        <div
                          className="mt-2 pt-2 border-t text-xs"
                          style={{ borderColor: currentTheme.border, color: currentTheme.textSecondary }}
                        >
                          Ports: {device.connectedPorts}/{device.portCount} connected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopologyDeviceList;

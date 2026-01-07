import {deviceCategories, devices, getDevicesByCategory} from '../../data/devices';
import {useSettings} from '../../context/SettingsContext';
import DeviceCategory from './DeviceCategory';
import {Package} from 'lucide-react';

function DeviceLibrary() {
  const { settings, currentTheme } = useSettings();
  const { visibleCategories } = settings.deviceLibrary;

  // Filter categories based on settings
  const categories = Object.keys(deviceCategories).filter(
    (categoryKey) => visibleCategories[categoryKey]
  );

  // Count visible devices
  const visibleDeviceCount = categories.reduce((count, categoryKey) => {
    return count + getDevicesByCategory(categoryKey).length;
  }, 0);

  return (
    <div
      className="w-60 h-full border-r flex flex-col"
      style={{
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.border
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 border-b"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border
        }}
      >
        <div className="flex items-center gap-1.5">
          <Package size={16} style={{ color: currentTheme.primary }} />
          <h2
            className="text-sm font-bold"
            style={{ color: currentTheme.text }}
          >
            Device Library
          </h2>
        </div>
      </div>

      {/* Device Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {categories.length > 0 ? (
          categories.map((categoryKey) => {
            const categoryDevices = getDevicesByCategory(categoryKey);
            const categoryInfo = deviceCategories[categoryKey];

            return (
              <DeviceCategory
                key={categoryKey}
                categoryInfo={categoryInfo}
                devices={categoryDevices}
              />
            );
          })
        ) : (
          <div
            className="text-center py-8"
            style={{ color: currentTheme.textSecondary }}
          >
            <p className="text-sm">No categories selected</p>
            <p className="text-xs mt-2">Enable categories in settings</p>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div
        className="px-3 py-1.5 border-t"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border
        }}
      >
        <div
          className="text-[10px] text-center"
          style={{ color: currentTheme.textSecondary }}
        >
          <span className="font-semibold">{visibleDeviceCount}</span> of{' '}
          <span className="font-semibold">{devices.length}</span> visible
        </div>
      </div>
    </div>
  );
}

export default DeviceLibrary;

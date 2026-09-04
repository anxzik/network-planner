import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';
import DeviceCategory from './DeviceCategory';
import {Package} from 'lucide-react';

function DeviceLibrary() {
  const { settings, currentTheme } = useSettings();
  const { viewMode } = useNetwork();
  const { visibleCategories } = settings.deviceLibrary;

  // Filter categories based on settings
  // The palette draws from the live catalogue: types a person adds appear
  // here immediately, and plane membership replaces the old viewType split.
  const { types, categories: categoryRows } = useLibrary();
  // DeviceCategory renders `name`, and the catalogue's human label is `label`.
  // Falling back to the id keeps a category with no label visible rather than
  // nameless.
  const deviceCategories = Object.fromEntries(
    categoryRows.map((c) => [c.id, { ...c, name: c.label || c.id }]));
  const byCategoryAndPlane = (categoryKey, plane) =>
    types.filter((t) => t.category === categoryKey && t.planes.includes(plane));
  const categories = Object.keys(deviceCategories).filter(
    (categoryKey) => visibleCategories[categoryKey]
  );

  // Count visible devices based on current view mode
  const visibleDeviceCount = categories.reduce((count, categoryKey) => {
    return count + byCategoryAndPlane(categoryKey, viewMode).length;
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
            // Filter devices by current view mode (physical/logical)
            const categoryDevices = byCategoryAndPlane(categoryKey, viewMode);
            const categoryInfo = deviceCategories[categoryKey];

            // Skip empty categories
            if (categoryDevices.length === 0) return null;

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
          <span className="font-semibold">{types.length}</span> visible
        </div>
      </div>
    </div>
  );
}

export default DeviceLibrary;

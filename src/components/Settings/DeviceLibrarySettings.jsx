import {useSettings} from '../../context/SettingsContext';
import {deviceCategories} from '../../data/devices';

function DeviceLibrarySettings() {
  const { settings, updateSetting, updateNestedSetting } = useSettings();
  const { deviceLibrary } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Device Library Options
        </h3>

        {/* Visible Categories */}
        <div className="mb-6">
          <label className="font-medium text-gray-700 block mb-3">Visible Categories</label>
          <p className="text-sm text-gray-500 mb-3">Choose which device categories to display in the library</p>

          <div className="space-y-2">
            {Object.keys(deviceCategories).map(categoryKey => {
              const category = deviceCategories[categoryKey];
              return (
                <div
                  key={categoryKey}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <span className="font-medium text-gray-700">{category.label}</span>
                      <p className="text-xs text-gray-500">{category.name}</p>
                    </div>
                  </div>

                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={deviceLibrary.visibleCategories[categoryKey]}
                      onChange={(e) =>
                        updateNestedSetting('deviceLibrary', 'visibleCategories', categoryKey, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sort By */}
        <div className="py-3 border-b border-gray-200">
          <label className="font-medium text-gray-700 block mb-2">Sort Devices By</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'category', label: 'Category' },
              { value: 'name', label: 'Name' },
              { value: 'type', label: 'Type' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => updateSetting('deviceLibrary', 'sortBy', option.value)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-colors
                  ${deviceLibrary.sortBy === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded by Default */}
        <div className="flex items-center justify-between py-3">
          <div>
            <label className="font-medium text-gray-700">Expand Categories by Default</label>
            <p className="text-sm text-gray-500">Show all devices when opening the library</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={deviceLibrary.expandedByDefault}
              onChange={(e) => updateSetting('deviceLibrary', 'expandedByDefault', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default DeviceLibrarySettings;

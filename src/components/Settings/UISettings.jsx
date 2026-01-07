import {themes, useSettings} from '../../context/SettingsContext';

function UISettings() {
  const { settings, updateSetting } = useSettings();
  const { ui } = settings;

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Theme
        </h3>

        <p className="text-sm text-gray-600 mb-3">Choose a color palette for the application</p>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(themes).map(([themeKey, theme]) => (
            <button
              key={themeKey}
              onClick={() => updateSetting('ui', 'theme', themeKey)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                ${ui.theme === themeKey
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                }
              `}
            >
              {/* Color Preview Swatches */}
              <div className="flex gap-1">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                />
              </div>

              {/* Theme Name */}
              <div className="flex-1 text-left">
                <span className="font-medium text-gray-800">{theme.name}</span>
              </div>

              {/* Selected Indicator */}
              {ui.theme === themeKey && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Display Settings
        </h3>

        {/* Show Grid */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Show Grid</label>
            <p className="text-sm text-gray-500">Display background grid on canvas</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={ui.showGrid}
              onChange={(e) => updateSetting('ui', 'showGrid', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Snap to Grid */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Snap to Grid</label>
            <p className="text-sm text-gray-500">Align devices to grid when moving</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={ui.snapToGrid}
              onChange={(e) => updateSetting('ui', 'snapToGrid', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Grid Size */}
        <div className="py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700">Grid Size</label>
            <span className="text-sm text-gray-600 font-mono">{ui.gridSize}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="5"
            value={ui.gridSize}
            onChange={(e) => updateSetting('ui', 'gridSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10px</span>
            <span>30px</span>
          </div>
        </div>

        {/* Show Minimap */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Show Minimap</label>
            <p className="text-sm text-gray-500">Display minimap for navigation</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={ui.showMinimap}
              onChange={(e) => updateSetting('ui', 'showMinimap', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Background Style */}
        <div className="py-3 border-b border-gray-200">
          <label className="font-medium text-gray-700 block mb-2">Background Style</label>
          <div className="grid grid-cols-2 gap-2">
            {['dots', 'lines', 'cross', 'none'].map(style => (
              <button
                key={style}
                onClick={() => updateSetting('ui', 'backgroundStyle', style)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-colors capitalize
                  ${ui.backgroundStyle === style
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Default Zoom */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700">Default Zoom</label>
            <span className="text-sm text-gray-600 font-mono">{Math.round(ui.defaultZoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="1.5"
            step="0.25"
            value={ui.defaultZoom}
            onChange={(e) => updateSetting('ui', 'defaultZoom', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>25%</span>
            <span>150%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UISettings;

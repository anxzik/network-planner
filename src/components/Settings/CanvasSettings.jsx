import {useSettings} from '../../context/SettingsContext';

function CanvasSettings() {
  const { settings, updateSetting } = useSettings();
  const { canvas } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Canvas Behavior
        </h3>

        {/* Pan on Drag */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Pan on Drag</label>
            <p className="text-sm text-gray-500">Drag canvas to pan the view</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={canvas.panOnDrag}
              onChange={(e) => updateSetting('canvas', 'panOnDrag', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Nodes Draggable */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Nodes Draggable</label>
            <p className="text-sm text-gray-500">Allow devices to be moved on canvas</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={canvas.nodesDraggable}
              onChange={(e) => updateSetting('canvas', 'nodesDraggable', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Nodes Connectable */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Nodes Connectable</label>
            <p className="text-sm text-gray-500">Allow creating connections between devices</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={canvas.nodesConnectable}
              onChange={(e) => updateSetting('canvas', 'nodesConnectable', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Elements Selectable */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <label className="font-medium text-gray-700">Elements Selectable</label>
            <p className="text-sm text-gray-500">Allow selecting devices and connections</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={canvas.elementsSelectable}
              onChange={(e) => updateSetting('canvas', 'elementsSelectable', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Min Zoom */}
        <div className="py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700">Minimum Zoom</label>
            <span className="text-sm text-gray-600 font-mono">{Math.round(canvas.minZoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={canvas.minZoom}
            onChange={(e) => updateSetting('canvas', 'minZoom', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Max Zoom */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700">Maximum Zoom</label>
            <span className="text-sm text-gray-600 font-mono">{Math.round(canvas.maxZoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            step="0.5"
            value={canvas.maxZoom}
            onChange={(e) => updateSetting('canvas', 'maxZoom', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100%</span>
            <span>400%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CanvasSettings;

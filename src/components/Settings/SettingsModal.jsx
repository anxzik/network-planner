import {useState} from 'react';
import {Layout, Monitor, Package, RotateCcw, X} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import UISettings from './UISettings';
import DeviceLibrarySettings from './DeviceLibrarySettings';
import CanvasSettings from './CanvasSettings';

function SettingsModal() {
  const { isSettingsOpen, closeSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('ui');

  if (!isSettingsOpen) return null;

  const tabs = [
    { id: 'ui', label: 'UI Settings', icon: Monitor },
    { id: 'devices', label: 'Device Library', icon: Package },
    { id: 'canvas', label: 'Canvas', icon: Layout },
  ];

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Settings</h2>
          <button
            onClick={closeSettings}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-36 bg-gray-50 border-r border-gray-200 p-2">
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                      transition-colors text-left
                      ${activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon size={14} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'ui' && <UISettings />}
            {activeTab === 'devices' && <DeviceLibrarySettings />}
            {activeTab === 'canvas' && <CanvasSettings />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            <span className="text-xs font-medium">Reset All Settings</span>
          </button>

          <button
            onClick={closeSettings}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

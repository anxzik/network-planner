import {useState} from 'react';
import {Calculator, Cpu, GitBranch, List, Network, Settings, Share2} from 'lucide-react';
import DeviceLibrary from './components/DeviceLibrary/DeviceLibrary';
import NetworkCanvas from './components/Canvas/NetworkCanvas';
import SettingsModal from './components/Settings/SettingsModal';
import ListView from './components/ListView/ListView';
import SubnetCalculator from './components/SubnetCalculator/SubnetCalculator';
import {useNetwork} from './context/NetworkContext';
import {useSettings} from './context/SettingsContext';

function App() {
  const { getNodeCount, getEdgeCount, viewMode, setViewMode } = useNetwork();
  const { openSettings, currentTheme } = useSettings();
  const [activeView, setActiveView] = useState('topology'); // 'topology', 'list', or 'calculator'

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: currentTheme.background }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border
        }}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Network size={20} className="text-white" />
              </div>
              <div>
                <h1
                  className="text-lg font-bold leading-tight"
                  style={{ color: currentTheme.text }}
                >
                  Network Planner
                </h1>
              </div>
            </div>

            {/* View Toggle Tabs */}
            <div
              className="flex rounded-lg p-0.5 gap-0.5"
              style={{ backgroundColor: currentTheme.border }}
            >
              <button
                onClick={() => setActiveView('topology')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeView === 'topology' ? currentTheme.surface : 'transparent',
                  color: activeView === 'topology' ? currentTheme.primary : currentTheme.textSecondary,
                }}
              >
                <Share2 size={14} />
                Topology
              </button>
              <button
                onClick={() => setActiveView('list')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeView === 'list' ? currentTheme.surface : 'transparent',
                  color: activeView === 'list' ? currentTheme.primary : currentTheme.textSecondary,
                }}
              >
                <List size={14} />
                List
              </button>
              <button
                onClick={() => setActiveView('calculator')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeView === 'calculator' ? currentTheme.surface : 'transparent',
                  color: activeView === 'calculator' ? currentTheme.primary : currentTheme.textSecondary,
                }}
              >
                <Calculator size={14} />
                Calculator
              </button>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center gap-4">
            {/* Physical/Logical Toggle (only show in topology view) */}
            {activeView === 'topology' && (
              <div
                className="flex rounded-lg p-0.5 gap-0.5"
                style={{ backgroundColor: currentTheme.border }}
              >
                <button
                  onClick={() => setViewMode('physical')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{
                    backgroundColor: viewMode === 'physical' ? currentTheme.surface : 'transparent',
                    color: viewMode === 'physical' ? currentTheme.primary : currentTheme.textSecondary,
                  }}
                  title="Physical View - Shows physical network connections"
                >
                  <Cpu size={13} />
                  Physical
                </button>
                <button
                  onClick={() => setViewMode('logical')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{
                    backgroundColor: viewMode === 'logical' ? currentTheme.surface : 'transparent',
                    color: viewMode === 'logical' ? currentTheme.primary : currentTheme.textSecondary,
                  }}
                  title="Logical View - Shows logical network topology with IP addressing"
                >
                  <GitBranch size={13} />
                  Logical
                </button>
              </div>
            )}

            <div className="text-center">
              <div
                className="text-lg font-bold leading-tight"
                style={{ color: currentTheme.text }}
              >
                {getNodeCount()}
              </div>
              <div
                className="text-[10px] leading-tight"
                style={{ color: currentTheme.textSecondary }}
              >
                Devices
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-bold leading-tight"
                style={{ color: currentTheme.text }}
              >
                {getEdgeCount()}
              </div>
              <div
                className="text-[10px] leading-tight"
                style={{ color: currentTheme.textSecondary }}
              >
                Connections
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={openSettings}
              className="p-1.5 rounded transition-colors"
              style={{
                color: currentTheme.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentTheme.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {activeView === 'topology' ? (
          <>
            {/* Device Library Sidebar */}
            <DeviceLibrary />

            {/* Network Canvas */}
            <div className="flex-1 relative">
              <NetworkCanvas />
            </div>
          </>
        ) : activeView === 'list' ? (
          /* List View */
          <div className="flex-1 relative">
            <ListView />
          </div>
        ) : (
          /* Calculator View */
          <div className="flex-1 relative overflow-y-auto">
            <SubnetCalculator />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}

export default App;

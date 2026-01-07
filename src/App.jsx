import React, { useState } from 'react';
import { Network, Settings, LogOut } from 'lucide-react';
import DeviceLibrary from './components/DeviceLibrary/DeviceLibrary';
import NetworkCanvas from './components/Canvas/NetworkCanvas';
import SettingsModal from './components/Settings/SettingsModal';
import { useNetwork } from './context/NetworkContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

const Dashboard = () => {
  const { getNodeCount, getEdgeCount } = useNetwork();
  const { openSettings, currentTheme } = useSettings();
  const { logout, user } = useAuth();

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

          {/* Stats and Actions */}
          <div className="flex items-center gap-4">
             <div className="text-sm font-medium" style={{ color: currentTheme.text }}>
                Welcome, {user?.username}
            </div>
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
            
            {/* Logout Button */}
             <button
              onClick={logout}
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
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Device Library Sidebar */}
        <DeviceLibrary />

        {/* Network Canvas */}
        <div className="flex-1 relative">
          <NetworkCanvas />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return isLogin ? (
      <Login onSwitch={() => setIsLogin(false)} />
    ) : (
      <Register onSwitch={() => setIsLogin(true)} />
    );
  }

  return <Dashboard />;
}

export default App;
import {createContext, useContext, useEffect, useState} from 'react';
import {exportAll, loadData, saveData} from '../utils/storage';

// Theme color palettes
// eslint-disable-next-line react-refresh/only-export-components
export const themes = {
  professional: {
    name: 'Professional',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    background: '#f3f4f6',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  dark: {
    name: 'Dark Mode',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0891b2',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    background: '#ecfeff',
    surface: '#ffffff',
    text: '#164e63',
    textSecondary: '#0e7490',
    border: '#a5f3fc',
  },
  forest: {
    name: 'Forest',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#064e3b',
    textSecondary: '#047857',
    border: '#bbf7d0',
  },
  sunset: {
    name: 'Sunset',
    primary: '#dc2626',
    secondary: '#f97316',
    accent: '#fb923c',
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#7c2d12',
    textSecondary: '#ea580c',
    border: '#fed7aa',
  },
};

// Default settings
const defaultSettings = {
  // UI Settings
  ui: {
    showGrid: true,
    snapToGrid: true,
    gridSize: 15,
    showMinimap: true,
    backgroundStyle: 'dots', // 'dots', 'lines', 'cross', 'none'
    defaultZoom: 0.75,
    theme: 'professional', // 'professional', 'dark', 'ocean', 'forest', 'sunset'
  },

  // Device Library Settings
  deviceLibrary: {
    visibleCategories: {
      Generic: true,
      GenericLogical: true,
      Cisco: true,
      Ubiquiti: true,
      PaloAlto: true,
      Dell: true,
      SOHO: true,
      Enterprise: true,
      SDN: true,
      Cloud: true,
    },
    sortBy: 'category', // 'category', 'name', 'type'
    expandedByDefault: true,
  },

  // Canvas Settings
  canvas: {
    panOnDrag: true,
    nodesDraggable: true,
    nodesConnectable: true,
    elementsSelectable: true,
    minZoom: 0.2,
    maxZoom: 2,
  },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    // Load settings from storage on init
    const saved = loadData('settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...saved };
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save settings to storage whenever they change
  useEffect(() => {
    saveData('settings', settings);
  }, [settings]);

  // Update a specific setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  // Update nested setting (e.g., visibleCategories.SOHO)
  const updateNestedSetting = (category, parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [childKey]: value,
        },
      },
    }));
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
    // no need to manually clear; next effect will overwrite
  };

  // Reset specific category
  const resetCategory = (category) => {
    setSettings(prev => ({
      ...prev,
      [category]: defaultSettings[category],
    }));
  };

  // Get current theme colors
  const currentTheme = themes[settings.ui.theme] || themes.professional;

  const value = {
    settings,
    updateSetting,
    updateNestedSetting,
    resetSettings,
    resetCategory,
    isSettingsOpen,
    setIsSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    currentTheme,
    // Optional: export settings only
    exportSettings: () => exportAll()?.settings ?? null,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// The Hardware tab shell (T012). Browsing, search and the editor arrive with
// US1 and US4; this shell proves the catalogue reaches the renderer through
// the bridge, which is Phase 2's checkpoint.
import {HardDrive} from 'lucide-react';
import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';

function HardwareTab() {
  const { types, categories, status, error } = useLibrary();
  const { currentTheme } = useSettings();

  const countByCategory = types.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto p-6" style={{ color: currentTheme.text }}>
      <div className="flex items-center gap-2 mb-4">
        <HardDrive size={20} style={{ color: currentTheme.primary }} />
        <h2 className="text-lg font-semibold">Hardware Library</h2>
        <span className="text-sm" style={{ color: currentTheme.textSecondary }}>
          {status === 'ready' && `${types.length} appliance types`}
          {status === 'loading' && 'Loading the catalogue…'}
          {status === 'unavailable' && 'The catalogue is not available here.'}
          {status === 'error' && (error?.message || 'The catalogue could not be read.')}
        </span>
      </div>

      {status === 'ready' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border p-3"
              style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.surface }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: c.color || currentTheme.primary }}
                />
                <span className="font-medium text-sm">{c.label}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: currentTheme.textSecondary }}>
                {countByCategory[c.id] || 0} types
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HardwareTab;

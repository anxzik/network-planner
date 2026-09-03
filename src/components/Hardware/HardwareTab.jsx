// The Hardware tab (T012, extended by US1): browse the catalogue, select a
// type, edit it, or create a new one. Thin: state here is which type is open.
import {useState} from 'react';
import {HardDrive, Plus} from 'lucide-react';
import ApplianceEditor from './ApplianceEditor';
import ApplianceGrid from './ApplianceGrid';
import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';

function HardwareTab() {
  const { types, status, error } = useLibrary();
  const { currentTheme } = useSettings();
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);

  const selected = types.find((t) => t.id === selectedId) || null;
  const editorOpen = creating || selected !== null;

  return (
    <div className="flex flex-1 overflow-hidden" style={{ color: currentTheme.text }}>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive size={18} style={{ color: currentTheme.primary }} />
          <h2 className="text-base font-semibold">Hardware Library</h2>
          <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
            {status === 'ready' && `${types.length} appliance types`}
            {status === 'loading' && 'Loading the catalogue…'}
            {status === 'unavailable' && 'The catalogue is not available here.'}
            {status === 'error' && (error?.message || 'The catalogue could not be read.')}
          </span>
          <button
            onClick={() => { setSelectedId(null); setCreating(true); }}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-white"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Plus size={14} /> New
          </button>
        </div>

        {status === 'ready' && (
          <ApplianceGrid
            types={types}
            selectedId={selectedId}
            onSelect={(id) => { setCreating(false); setSelectedId(id); }}
          />
        )}
      </div>

      {editorOpen && (
        <ApplianceEditor
          key={creating ? 'new' : selected.id}
          type={creating ? null : selected}
          onDone={(id) => { setCreating(false); setSelectedId(id); }}
        />
      )}
    </div>
  );
}

export default HardwareTab;

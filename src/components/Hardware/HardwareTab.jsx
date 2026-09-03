// The Hardware tab (T012, extended by US1): browse the catalogue, select a
// type, edit it, or create a new one. Thin: state here is which type is open.
import {useState} from 'react';
import {Download, HardDrive, Plus, Upload} from 'lucide-react';
import ApplianceEditor from './ApplianceEditor';
import ApplianceGrid from './ApplianceGrid';
import CategoryRail from './CategoryRail';
import ImportReportPanel from './ImportReportPanel';
import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';

function HardwareTab() {
  const { types, status, error, exportLibrary, previewImport, filters, setFilters } = useLibrary();
  const { currentTheme } = useSettings();
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState(null);

  const startImport = async () => {
    const result = await previewImport();
    if (result.ok) setPreview(result.value);
    else if (result.error.code !== 'CANCELLED') setNotice(result.error.message);
  };

  const doExport = async () => {
    const result = await exportLibrary();
    if (result.ok) setNotice(`Exported ${result.value.types} types to ${result.value.fileName}.`);
    else if (result.error.code !== 'CANCELLED') setNotice(result.error.message);
  };

  const selected = types.find((t) => t.id === selectedId) || null;
  const editorOpen = creating || selected !== null;

  return (
    <div className="flex flex-1 overflow-hidden" style={{ color: currentTheme.text }}>
      <CategoryRail />
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
          <input
            type="search"
            placeholder="Search model or manufacturer"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            className="w-64 rounded border px-2 py-1.5 text-sm"
            style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background, color: currentTheme.text }}
          />
          <button onClick={startImport}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded text-sm border"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
            <Upload size={14} /> Import
          </button>
          <button onClick={doExport}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm border"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => { setSelectedId(null); setCreating(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-white"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Plus size={14} /> New
          </button>
        </div>

        {notice && (
          <div className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>{notice}</div>
        )}
        {status === 'ready' && (
          <ApplianceGrid
            types={types}
            selectedId={selectedId}
            onSelect={(id) => { setCreating(false); setSelectedId(id); }}
          />
        )}
      </div>

      {preview && (
        <ImportReportPanel preview={preview} onClose={() => setPreview(null)} />
      )}

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

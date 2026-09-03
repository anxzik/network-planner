// The category rail (T042): unfiltered tallies from SQL, the plane filter, and
// the person's own hardware, so one glance answers where things are.
import {KNOWN_PLANES} from '../../utils/applianceValidation';
import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';

function Row({ label, count, active, onClick }) {
  const { currentTheme } = useSettings();
  return (
    <button onClick={onClick}
      className="flex w-full items-center justify-between rounded px-2 py-1 text-xs"
      style={{
        color: active ? currentTheme.primary : currentTheme.textSecondary,
        backgroundColor: active ? currentTheme.background : 'transparent',
      }}>
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </button>
  );
}

function CategoryRail() {
  const { categories, counts, filters, setFilters } = useLibrary();
  const { currentTheme } = useSettings();
  const total = Object.values(counts.byCategory).reduce((a, b) => a + b, 0);

  const toggle = (patch) => setFilters({ ...filters, ...patch });

  return (
    <div className="w-52 shrink-0 overflow-y-auto border-r p-2"
      style={{ borderColor: currentTheme.border }}>
      <div className="text-[10px] font-semibold uppercase tracking-wide px-2 mb-1"
        style={{ color: currentTheme.textSecondary }}>Categories</div>
      <Row label="All hardware" count={total}
        active={!filters.category && !filters.origin}
        onClick={() => toggle({ category: undefined, origin: undefined })} />
      {categories.map((c) => (
        <Row key={c.id} label={c.label} count={counts.byCategory[c.id] || 0}
          active={filters.category === c.id}
          onClick={() => toggle({ category: filters.category === c.id ? undefined : c.id })} />
      ))}
      <Row label="My hardware" count={counts.local}
        active={filters.origin === 'local'}
        onClick={() => toggle({ origin: filters.origin === 'local' ? undefined : 'local' })} />

      <div className="text-[10px] font-semibold uppercase tracking-wide px-2 mt-3 mb-1"
        style={{ color: currentTheme.textSecondary }}>Planes</div>
      {KNOWN_PLANES.map((plane) => (
        <Row key={plane} label={plane[0].toUpperCase() + plane.slice(1)}
          active={filters.plane === plane}
          onClick={() => toggle({ plane: filters.plane === plane ? undefined : plane })} />
      ))}
    </div>
  );
}

export default CategoryRail;

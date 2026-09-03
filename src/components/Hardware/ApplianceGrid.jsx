// Appliance cards (T020). Origin, edited and approved states are visible per
// FR-018; selection drives the editor.
import {useSettings} from '../../context/SettingsContext';

function Badge({ children, color }) {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
      style={{ color, borderColor: color }}>
      {children}
    </span>
  );
}

function ApplianceGrid({ types, selectedId, onSelect }) {
  const { currentTheme } = useSettings();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className="text-left rounded-lg border p-3 transition-all"
          style={{
            borderColor: selectedId === t.id ? currentTheme.primary : currentTheme.border,
            backgroundColor: currentTheme.surface,
            borderWidth: selectedId === t.id ? 2 : 1,
          }}
        >
          <div className="font-medium text-sm" style={{ color: currentTheme.text }}>
            {t.name}
          </div>
          <div className="text-xs" style={{ color: currentTheme.textSecondary }}>
            {t.manufacturer} · {t.model}
          </div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {t.origin === 'local' && <Badge color={currentTheme.primary}>added by you</Badge>}
            {t.editedFromShipped && <Badge color={currentTheme.primary}>edited by you</Badge>}
            {t.approved && <Badge color={currentTheme.textSecondary}>approved</Badge>}
          </div>
        </button>
      ))}
    </div>
  );
}

export default ApplianceGrid;

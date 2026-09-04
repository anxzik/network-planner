// One place for the things the application has to tell a person about the plan
// they just opened or tried to save: a newer format it will never write back to
// (FR-021), a file it could not read at all (FR-022), a save that failed with
// its previous content intact and its partial kept (FR-008), and a plan brought
// forward from an older format with the original kept beside it (FR-020).
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function PlanNotice() {
  const { notice, readOnly, notUnderstood, clearNotice, saveAs } = usePlan();
  const { currentTheme } = useSettings();

  if (!notice) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[520px] rounded-lg border p-3 shadow-lg"
      role="status"
      style={{ backgroundColor: currentTheme.surface, borderColor: '#9a6b2f', color: currentTheme.text }}>

      <p className="text-sm mb-1">{notice}</p>

      {notUnderstood?.length > 0 && (
        <p className="text-xs mb-2" style={{ color: '#9a6b2f' }}>
          Not shown, because this version does not understand it:{' '}
          {notUnderstood.join(', ')}.
        </p>
      )}

      {readOnly && (
        <p className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>
          This file is never written to. Save As keeps an editable copy — but
          only of what this version could read, so the original stays the only
          complete version and is worth keeping.
        </p>
      )}

      <div className="flex gap-2">
        {readOnly && (
          <button type="button"
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: '#2563eb', color: '#fff' }}
            onClick={saveAs}>
            Save a readable copy…
          </button>
        )}
        <button type="button"
          className="px-3 py-1.5 rounded text-sm border"
          style={{ borderColor: currentTheme.border, color: currentTheme.text }}
          onClick={clearNotice}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default PlanNotice;

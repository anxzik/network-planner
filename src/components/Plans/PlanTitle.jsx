// Which plan is open and whether it has unsaved changes (FR-005, SC-004). Shown
// in the chrome beside the application name, per wireframe 01, and pushed to
// the window title — Electron takes the window's title from the document's, so
// this needs no bridge call of its own.
import {useEffect} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function PlanTitle() {
  const { name, dirty, readOnly, source } = usePlan();
  const { currentTheme } = useSettings();

  const displayName = source === 'untitled' ? 'Untitled plan' : name;

  useEffect(() => {
    // The marker comes first so it survives truncation in a taskbar.
    document.title = `${dirty ? '* ' : ''}${displayName}${readOnly ? ' (read-only)' : ''} — Network Planner`;
  }, [displayName, dirty, readOnly]);

  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="text-sm font-medium truncate" style={{ color: currentTheme.text }}>
        {displayName}
        {dirty && <span aria-hidden="true"> *</span>}
      </span>
      <span className="text-xs whitespace-nowrap" style={{ color: currentTheme.textSecondary }}>
        {readOnly ? 'read-only' : dirty ? 'unsaved changes' : 'saved'}
      </span>
    </div>
  );
}

export default PlanTitle;

// The File menu (FR-001 to FR-004) and the recent list beneath it. Every action
// that would replace the canvas goes through `guard`, so the save-first prompt
// stands in front of it when there is unsaved work (FR-006).
import {useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';
import RecentsPanel from './RecentsPanel';

function PlanMenu() {
  const { newPlan, openDialog, save, saveAs, guard, readOnly, available } = usePlan();
  const { currentTheme } = useSettings();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action) => {
    setOpen(false);
    const result = await action();
    // CANCELLED is an ordinary outcome and says nothing worth interrupting for.
    if (result && result.ok === false && result.error.code !== 'CANCELLED') {
      setMessage(result.error.message);
    }
  };

  const item = 'w-full text-left px-3 py-1.5 text-sm hover:opacity-80 disabled:opacity-40';

  return (
    <div className="relative">
      <button type="button"
        className="px-3 py-1.5 text-sm rounded"
        style={{ color: currentTheme.text }}
        onClick={() => setOpen((wasOpen) => !wasOpen)}>
        File
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-40 mt-1 w-64 rounded-lg border py-1 shadow-lg"
            style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

            <button type="button" className={item} disabled={!available}
              onClick={() => run(() => guard(newPlan))}>New</button>
            <button type="button" className={item} disabled={!available}
              onClick={() => run(() => guard(openDialog))}>Open…</button>
            <button type="button" className={item} disabled={!available || readOnly}
              title={readOnly ? 'This plan is read-only. Use Save As.' : undefined}
              onClick={() => run(save)}>Save</button>
            <button type="button" className={item} disabled={!available}
              onClick={() => run(saveAs)}>Save As…</button>

            <div className="mt-1 border-t pt-1" style={{ borderColor: currentTheme.border }}>
              <p className="px-3 py-1 text-xs font-semibold"
                style={{ color: currentTheme.textSecondary }}>Recent plans</p>
              <div onClick={() => setOpen(false)}>
                <RecentsPanel />
              </div>
            </div>
          </div>
        </>
      )}

      {message && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded border px-3 py-2 text-xs"
          style={{ backgroundColor: currentTheme.surface, borderColor: '#b91c1c', color: currentTheme.text }}>
          {message}
          <button type="button" className="ml-2 underline" onClick={() => setMessage(null)}>dismiss</button>
        </div>
      )}
    </div>
  );
}

export default PlanMenu;

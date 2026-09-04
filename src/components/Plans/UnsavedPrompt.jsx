// The save-first prompt (FR-006). Exactly three outcomes, and Escape is a
// fourth way to reach one of them rather than a fourth answer: it discards,
// because a person who read the prompt and pressed Escape has answered it
// (FR-006, folded 2026-09-03). Closing the dialog or clicking away means
// Cancel — those are reachable by accident in a way a keypress is not.
import {useEffect} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function UnsavedPrompt() {
  const { pending, name, resolvePending } = usePlan();
  const { currentTheme } = useSettings();

  useEffect(() => {
    if (!pending) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        void resolvePending('discard');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, resolvePending]);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={() => resolvePending('cancel')}>
      <div className="w-[420px] rounded-lg border p-4"
        role="dialog" aria-modal="true" aria-labelledby="unsaved-title"
        onClick={(event) => event.stopPropagation()}
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

        <h3 id="unsaved-title" className="font-semibold text-sm mb-1">
          Save changes to {name}?
        </h3>
        <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
          Continuing will close this plan. Discarded work is kept and offered back
          next time, so this is not the last chance to keep it.
        </p>

        <div className="flex gap-2">
          <button type="button" autoFocus
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: '#2563eb', color: '#fff' }}
            onClick={() => resolvePending('save')}>
            Save
          </button>
          <button type="button"
            className="px-3 py-1.5 rounded text-sm border"
            style={{ borderColor: currentTheme.border, color: '#b91c1c' }}
            onClick={() => resolvePending('discard')}>
            Discard
          </button>
          <button type="button"
            className="px-3 py-1.5 rounded text-sm border"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}
            onClick={() => resolvePending('cancel')}>
            Cancel
          </button>
          <span className="ml-auto self-center text-xs" style={{ color: currentTheme.textSecondary }}>
            Esc discards
          </span>
        </div>
      </div>
    </div>
  );
}

export default UnsavedPrompt;

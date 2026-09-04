// The copies the application is keeping for the open plan (FR-024). Each one
// says what it holds and offers to be cleared; clearing is offered once a copy
// is redundant and never happens on its own. Nothing accumulates: each kind
// occupies one slot that a repeat occurrence replaces.
import {useEffect, useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function PreservedArtifactsPanel({ onClose }) {
  const { listPreserved, clearPreserved } = usePlan();
  const { currentTheme } = useSettings();
  const [preserved, setPreserved] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listPreserved().then((result) => {
      if (!cancelled && result.ok) setPreserved(result.value.preserved);
    });
    return () => { cancelled = true; };
  }, [listPreserved]);

  const clear = async (kind) => {
    await clearPreserved(kind);
    const result = await listPreserved();
    if (result.ok) setPreserved(result.value.preserved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-[520px] rounded-lg border p-4"
        role="dialog" aria-modal="true" aria-labelledby="preserved-title"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

        <h3 id="preserved-title" className="font-semibold text-sm mb-2">Copies kept for this plan</h3>

        {preserved === null && <p className="text-xs">Looking…</p>}

        {preserved && preserved.length === 0 && (
          <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
            Nothing is being kept for this plan.
          </p>
        )}

        {preserved?.map((item) => (
          <div key={item.kind} className="rounded border px-2 py-2 mb-2"
            style={{ borderColor: currentTheme.border }}>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>
              {item.description}
            </p>
            <div className="flex items-center gap-2">
              <button type="button"
                className="px-2 py-1 rounded text-xs border"
                style={{
                  borderColor: currentTheme.border,
                  color: item.redundant ? '#fff' : currentTheme.text,
                  backgroundColor: item.redundant ? '#2563eb' : 'transparent',
                }}
                onClick={() => clear(item.kind)}>
                Clear
              </button>
              {item.redundant && (
                <span className="text-xs" style={{ color: '#15803d' }}>safe to clear</span>
              )}
            </div>
          </div>
        ))}

        <p className="text-xs mb-3" style={{ color: '#9a6b2f' }}>
          A repeat occurrence replaces its slot, so nothing piles up. Nothing here
          is removed unless you ask.
        </p>

        <button type="button" className="px-3 py-1.5 rounded text-sm border"
          style={{ borderColor: currentTheme.border, color: currentTheme.text }}
          onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default PreservedArtifactsPanel;

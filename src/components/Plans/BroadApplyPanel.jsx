// Carrying one corrected definition to the other plans that were built on the
// old one (FR-018). Two stages, and the person decides between them: which
// plans would change, then which of those actually should. Plans the
// application cannot reach are named with the reason, never guessed at.
import {useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function BroadApplyPanel({ typeId, typeName, onClose }) {
  const { broadApplyPreview, broadApply } = usePlan();
  const { currentTheme } = useSettings();
  const [preview, setPreview] = useState(null);
  const [chosen, setChosen] = useState([]);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    const result = await broadApplyPreview(typeId);
    if (result.ok) {
      setPreview(result.value);
      // Nothing is pre-selected: applying to every plan must be a thing the
      // person chose, not the default they failed to notice.
      setChosen([]);
    } else setMessage(result.error.message);
  };

  const apply = async () => {
    const result = await broadApply(typeId, chosen);
    if (result.ok) setResults(result.value.results);
    else setMessage(result.error.message);
  };

  const toggle = (id) => setChosen((was) =>
    was.includes(id) ? was.filter((x) => x !== id) : [...was, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-[520px] max-h-[80vh] overflow-y-auto rounded-lg border p-4"
        role="dialog" aria-modal="true" aria-labelledby="broad-title"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

        <h3 id="broad-title" className="font-semibold text-sm mb-2">
          Apply the corrected {typeName} to other plans
        </h3>

        {message && (
          <p className="rounded border px-2 py-1.5 mb-3 text-xs"
            style={{ borderColor: '#b91c1c' }}>{message}</p>
        )}

        {!preview && !results && (
          <>
            <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
              Only plans you have opened before can be reached. Nothing is
              changed until you choose.
            </p>
            <button type="button"
              className="px-3 py-1.5 rounded text-sm font-medium"
              style={{ backgroundColor: '#2563eb', color: '#fff' }}
              onClick={load}>
              Show which plans would change
            </button>
          </>
        )}

        {preview && !results && (
          <>
            {preview.reachable.length === 0 ? (
              <p className="text-xs mb-3">No other plan you have opened is built on the old definition.</p>
            ) : (
              <ul className="text-sm mb-3">
                {preview.reachable.map((plan) => (
                  <li key={plan.id} className="flex items-center gap-2 py-1">
                    <input type="checkbox" id={`plan-${plan.id}`}
                      checked={chosen.includes(plan.id)} onChange={() => toggle(plan.id)} />
                    <label htmlFor={`plan-${plan.id}`} className="truncate">{plan.name}</label>
                  </li>
                ))}
              </ul>
            )}

            {preview.unreachable.length > 0 && (
              <div className="rounded border px-2 py-2 mb-3 text-xs" style={{ borderColor: currentTheme.border }}>
                <p className="font-semibold mb-1" style={{ color: '#9a6b2f' }}>Could not be reached</p>
                {preview.unreachable.map((plan) => (
                  <p key={plan.name} style={{ color: currentTheme.textSecondary }}>
                    {plan.name} — {plan.reason}
                  </p>
                ))}
              </div>
            )}

            <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
              A copy of each plan is kept beside it before it is changed.
            </p>

            <div className="flex gap-2">
              <button type="button" disabled={chosen.length === 0}
                className="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
                style={{ backgroundColor: '#2563eb', color: '#fff' }}
                onClick={apply}>
                Apply to {chosen.length} plan{chosen.length === 1 ? '' : 's'}
              </button>
              <button type="button" className="px-3 py-1.5 rounded text-sm border"
                style={{ borderColor: currentTheme.border, color: currentTheme.text }}
                onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {results && (
          <>
            <ul className="text-sm mb-3">
              {results.map((result) => (
                <li key={result.name} className="py-1">
                  <span style={{ color: result.ok ? '#15803d' : '#b91c1c' }}>
                    {result.ok ? 'updated' : 'unchanged'}
                  </span>{' '}
                  {result.name}
                  {result.reason && (
                    <span style={{ color: currentTheme.textSecondary }}> — {result.reason}</span>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" className="px-3 py-1.5 rounded text-sm border"
              style={{ borderColor: currentTheme.border, color: currentTheme.text }}
              onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

export default BroadApplyPanel;

// Keeping the equipment a plan brought with it (FR-025), per wireframe 03. This
// appears *after* the plan has opened and rendered — it is an offer, never a
// precondition. A type your catalogue already has is shown as skipped rather
// than overwritten, and the plan itself is unchanged whichever way you answer.
import {useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function AdoptTypesPanel() {
  const { adoptOffer, adopt, dismissAdoptOffer, name } = usePlan();
  const { currentTheme } = useSettings();
  const [chosen, setChosen] = useState([]);
  const [message, setMessage] = useState(null);

  if (!adoptOffer || adoptOffer.offered.length === 0) return null;

  const toggle = (typeId) => setChosen((was) =>
    was.includes(typeId) ? was.filter((x) => x !== typeId) : [...was, typeId]);

  const run = async () => {
    const result = await adopt(chosen);
    if (result.ok === false) setMessage(result.error.message);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[420px] rounded-lg border p-3 shadow-lg"
      role="dialog" aria-labelledby="adopt-title"
      style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

      <h3 id="adopt-title" className="font-semibold text-sm mb-1">
        Keep these types in your catalogue?
      </h3>
      <p className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>
        {name} already renders them. Adopting only adds them to your library.
      </p>

      <ul className="text-sm mb-2">
        {adoptOffer.offered.map((item) => (
          <li key={item.typeId} className="flex items-center gap-2 py-1">
            <input type="checkbox" id={`adopt-${item.typeId}`}
              checked={chosen.includes(item.typeId)} onChange={() => toggle(item.typeId)} />
            <label htmlFor={`adopt-${item.typeId}`} className="truncate">
              {item.name}
              <span className="text-xs ml-1" style={{ color: currentTheme.textSecondary }}>
                {item.definition.manufacturer} {item.definition.model}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {adoptOffer.skipped.length > 0 && (
        <p className="text-xs mb-2" style={{ color: '#9a6b2f' }}>
          Already in your catalogue, so left alone: {adoptOffer.skipped.map((s) => s.name).join(', ')}
        </p>
      )}

      {message && (
        <p className="rounded border px-2 py-1.5 mb-2 text-xs" style={{ borderColor: '#b91c1c' }}>{message}</p>
      )}

      <div className="flex gap-2">
        <button type="button" disabled={chosen.length === 0}
          className="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: '#2563eb', color: '#fff' }}
          onClick={run}>
          Adopt {chosen.length || ''} type{chosen.length === 1 ? '' : 's'}
        </button>
        <button type="button" className="px-3 py-1.5 rounded text-sm border"
          style={{ borderColor: currentTheme.border, color: currentTheme.text }}
          onClick={dismissAdoptOffer}>
          Not now
        </button>
      </div>
      <p className="text-xs mt-2" style={{ color: currentTheme.textSecondary }}>
        Either way, the plan is unchanged.
      </p>
    </div>
  );
}

export default AdoptTypesPanel;

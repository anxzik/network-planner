// When a plan's recorded definition and the catalogue's copy disagree (FR-016,
// FR-017). The panel's job is to make clear *which one is shown* — the plan's,
// always, until the person says otherwise — and to offer the other. Declining
// changes nothing and is remembered against the version refused, so a later
// correction asks again.
import {useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

const FIELD_NAMES = {
  name: 'name', manufacturer: 'manufacturer', model: 'model',
  category: 'category', description: 'description', planes: 'planes',
  icon: 'icon', color: 'colour', specifications: 'ports and specifications',
};

function DivergencePanel() {
  const { divergences, acceptUpdate, declineOffer } = usePlan();
  const { currentTheme } = useSettings();
  const [index, setIndex] = useState(0);

  if (divergences.length === 0) return null;
  const item = divergences[Math.min(index, divergences.length - 1)];
  if (!item) return null;

  const answer = (action) => {
    action(item.typeId, item.current);
    setIndex(0);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[420px] rounded-lg border p-3 shadow-lg"
      role="dialog" aria-labelledby="divergence-title"
      style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

      <h3 id="divergence-title" className="font-semibold text-sm mb-1">
        The library has a newer definition
      </h3>
      <p className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>
        This plan places <strong>{item.planCopy.name}</strong> and is showing the
        copy it was built with. The library&apos;s version differs in{' '}
        {item.changed.map((f) => FIELD_NAMES[f] ?? f).join(', ')}.
      </p>

      <div className="rounded border text-xs mb-3" style={{ borderColor: currentTheme.border }}>
        <div className="px-2 py-1.5 border-b" style={{ borderColor: currentTheme.border }}>
          <span className="font-semibold">Shown now (this plan): </span>
          {item.planCopy.name} · {item.planCopy.model}
        </div>
        <div className="px-2 py-1.5">
          <span className="font-semibold">In the library: </span>
          {item.current.name} · {item.current.model}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button"
          className="px-3 py-1.5 rounded text-sm font-medium"
          style={{ backgroundColor: '#2563eb', color: '#fff' }}
          onClick={() => answer(acceptUpdate)}>
          Update this plan
        </button>
        <button type="button"
          className="px-3 py-1.5 rounded text-sm border"
          style={{ borderColor: currentTheme.border, color: currentTheme.text }}
          onClick={() => answer(declineOffer)}>
          Keep the plan&apos;s copy
        </button>
        {divergences.length > 1 && (
          <span className="ml-auto text-xs" style={{ color: currentTheme.textSecondary }}>
            {index + 1} of {divergences.length}
          </span>
        )}
      </div>
    </div>
  );
}

export default DivergencePanel;

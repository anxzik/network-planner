// Recently opened plans (FR-007). An entry whose file has gone is shown with
// what happened and an offer to remove it — never dropped on the application's
// initiative, because a list that quietly shortens itself is a list a person
// cannot trust.
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function RecentsPanel() {
  const { recents, openRecent, removeRecent, guard } = usePlan();
  const { currentTheme } = useSettings();

  if (recents.length === 0) {
    return (
      <p className="text-xs px-2 py-1.5" style={{ color: currentTheme.textSecondary }}>
        No recent plans yet.
      </p>
    );
  }

  return (
    <ul className="text-sm">
      {recents.map((entry) => (
        <li key={entry.id} className="flex items-center gap-2 px-2 py-1.5">
          {entry.exists ? (
            <button type="button"
              className="flex-1 text-left truncate hover:underline"
              style={{ color: currentTheme.text }}
              onClick={() => guard(() => openRecent(entry.id))}>
              {entry.name}
            </button>
          ) : (
            <>
              <span className="flex-1 truncate" style={{ color: currentTheme.textSecondary }}>
                {entry.name}
              </span>
              <span className="text-xs whitespace-nowrap" style={{ color: '#9a6b2f' }}>
                missing
              </span>
              <button type="button"
                className="text-xs underline whitespace-nowrap"
                style={{ color: '#9a6b2f' }}
                onClick={() => removeRecent(entry.id)}>
                remove?
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default RecentsPanel;

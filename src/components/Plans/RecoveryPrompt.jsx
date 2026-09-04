// The on-start offer of work left behind (FR-009, FR-006a). Two answers, and
// neither is silent: restoring brings the work back, declining is the only
// thing that clears the slot. Work reaches here from a crash or from a
// deliberate discard, and the wording says which.
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

function RecoveryPrompt() {
  const { recovery, restoreRecovery, declineRecovery } = usePlan();
  const { currentTheme } = useSettings();

  if (!recovery) return null;

  const fromDiscard = recovery.reason === 'discarded';

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[360px] rounded-lg border p-3 shadow-lg"
      role="status"
      style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

      <h3 className="font-semibold text-sm mb-1">
        {fromDiscard ? 'Work you set aside' : 'Recovered unsaved work'}
      </h3>
      <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
        {fromDiscard
          ? 'You discarded these changes rather than saving them. They were kept.'
          : 'Changes from your last session were kept.'}
        {recovery.name ? ` They came from ${recovery.name}.` : ' They were never saved to a file.'}
      </p>

      <div className="flex gap-2">
        <button type="button"
          className="px-3 py-1.5 rounded text-sm font-medium"
          style={{ backgroundColor: '#2563eb', color: '#fff' }}
          onClick={restoreRecovery}>
          Restore
        </button>
        <button type="button"
          className="px-3 py-1.5 rounded text-sm border"
          style={{ borderColor: currentTheme.border, color: currentTheme.text }}
          onClick={declineRecovery}>
          Discard for good
        </button>
      </div>
    </div>
  );
}

export default RecoveryPrompt;

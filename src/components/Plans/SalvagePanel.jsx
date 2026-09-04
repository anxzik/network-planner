// What could be read out of damaged storage, for the person to accept or
// decline (FR-012). The promise this panel has to keep visible is that the
// original is never touched — not on accept, not on decline, not on failure.
import {useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';

const LABELS = {
  nodes: 'devices',
  edges: 'connections',
  vlans: 'VLANs',
  networkObjects: 'manual entries',
  scratchpad_notes: 'scratchpad notes',
  scratchpad_calculations: 'saved calculations',
};

const name = (key) => LABELS[key] ?? key;

function SalvagePanel() {
  const { migration, migrate, dismissMigration } = usePlan();
  const { currentTheme } = useSettings();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (!migration) return null;
  const hopeless = migration.offer === 'unreadable';

  const run = async () => {
    setBusy(true);
    const result = await migrate();
    setBusy(false);
    if (result.ok === false && result.error.code !== 'CANCELLED') setMessage(result.error.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-[480px] rounded-lg border p-4"
        role="dialog" aria-modal="true" aria-labelledby="salvage-title"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

        <h3 id="salvage-title" className="font-semibold text-sm mb-2">
          {hopeless ? 'Your old data could not be read' : 'Some of your old data could be recovered'}
        </h3>

        <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
          {migration.message}
        </p>

        {!hopeless && (
          <div className="rounded border px-2 py-2 mb-3 text-xs"
            style={{ borderColor: currentTheme.border }}>
            <p className="mb-1">
              <strong>Recovered:</strong> {migration.recovered.map(name).join(', ') || 'nothing'}
            </p>
            {migration.lost.length > 0 && (
              <p style={{ color: '#9a6b2f' }}>
                <strong>Could not be read:</strong> {migration.lost.map(name).join(', ')}
              </p>
            )}
            <p className="mt-1" style={{ color: currentTheme.textSecondary }}>
              {migration.preview.appliances} device{migration.preview.appliances === 1 ? '' : 's'},{' '}
              {migration.preview.connections} connection{migration.preview.connections === 1 ? '' : 's'},{' '}
              {migration.preview.vlans} VLAN{migration.preview.vlans === 1 ? '' : 's'}
            </p>
          </div>
        )}

        <p className="text-xs mb-3" style={{ color: '#9a6b2f' }}>
          Your original data is kept exactly as it is, whichever you choose.
          Nothing here overwrites it.
        </p>

        {message && (
          <p className="rounded border px-2 py-1.5 mb-3 text-xs"
            style={{ borderColor: '#b91c1c', color: currentTheme.text }}>{message}</p>
        )}

        <div className="flex gap-2">
          {!hopeless && (
            <button type="button" disabled={busy}
              className="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#2563eb', color: '#fff' }}
              onClick={run}>
              {busy ? 'Saving…' : 'Keep what was recovered…'}
            </button>
          )}
          <button type="button" disabled={busy}
            className="px-3 py-1.5 rounded text-sm border disabled:opacity-50"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}
            onClick={dismissMigration}>
            {hopeless ? 'Continue' : 'Not now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalvagePanel;

// The one-time offer to move an existing topology into a file (FR-010, FR-011).
// Offered, never performed silently: a person who came here with work already
// on the canvas must choose to move it, and the original stays where it is
// either way. Damaged storage goes to SalvagePanel instead.
import {useState} from 'react';
import {usePlan} from '../../context/PlanContext';
import {useSettings} from '../../context/SettingsContext';
import SalvagePanel from './SalvagePanel';

function summarise(preview) {
  const parts = [];
  if (preview.appliances) parts.push(`${preview.appliances} device${preview.appliances === 1 ? '' : 's'}`);
  if (preview.connections) parts.push(`${preview.connections} connection${preview.connections === 1 ? '' : 's'}`);
  if (preview.vlans) parts.push(`${preview.vlans} VLAN${preview.vlans === 1 ? '' : 's'}`);
  if (preview.networkObjects) parts.push(`${preview.networkObjects} manual entr${preview.networkObjects === 1 ? 'y' : 'ies'}`);
  if (preview.notes) parts.push('scratchpad notes');
  return parts.join(', ');
}

function MigrationPanel() {
  const { migration, migrate, dismissMigration } = usePlan();
  const { currentTheme } = useSettings();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (!migration) return null;
  if (migration.offer === 'salvageable' || migration.offer === 'unreadable') {
    return <SalvagePanel />;
  }

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
        role="dialog" aria-modal="true" aria-labelledby="migration-title"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

        <h3 id="migration-title" className="font-semibold text-sm mb-2">
          Your existing plan can become a file
        </h3>
        <p className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>
          This version keeps plans as files you name and own. Your current
          topology ({summarise(migration.preview)}) is ready to move.
        </p>
        <p className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
          The original stays preserved until you choose to clear it. Nothing is
          removed by moving it.
        </p>

        {message && (
          <p className="rounded border px-2 py-1.5 mb-3 text-xs"
            style={{ borderColor: '#b91c1c', color: currentTheme.text }}>{message}</p>
        )}

        <div className="flex gap-2">
          <button type="button" disabled={busy}
            className="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#2563eb', color: '#fff' }}
            onClick={run}>
            {busy ? 'Saving…' : 'Save as a file…'}
          </button>
          <button type="button" disabled={busy}
            className="px-3 py-1.5 rounded text-sm border disabled:opacity-50"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}
            onClick={dismissMigration}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default MigrationPanel;

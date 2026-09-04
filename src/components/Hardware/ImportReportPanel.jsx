// The import flow's two visible stages (T030, T031): collisions decided before
// anything is written (FR-009), then the report of what was applied and what
// was skipped, with a reason for each (FR-011). The unrecognised-version
// warning from FR-013 is shown in both stages and never blocks.
import {useState} from 'react';
import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';

const CHOICES = [
  ['keepBoth', 'Keep both'],
  ['replace', 'Replace'],
  ['skip', 'Skip'],
];

function ImportReportPanel({ preview, onClose }) {
  const { importLibrary } = useLibrary();
  const { currentTheme } = useSettings();
  const [resolutions, setResolutions] = useState(() =>
    Object.fromEntries(preview.collisions.map((c) => [c.incoming.id, 'keepBoth'])));
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState(null);

  const apply = async () => {
    const result = await importLibrary({
      entries: preview.entries,
      resolutions,
      unreadable: preview.unreadable,
    });
    if (result.ok) setReport(result.value);
    else setMessage(result.error.message);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-[540px] max-h-[80vh] overflow-y-auto rounded-lg border p-4"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}>

        <h3 className="font-semibold text-sm mb-2">
          {report ? 'Import finished' : 'Before importing'}
        </h3>

        {preview.formatWarning && (
          <div className="rounded border px-2 py-1.5 mb-3 text-xs"
            style={{ borderColor: '#8a5a0c', color: '#8a5a0c' }}>
            {preview.formatWarning}
          </div>
        )}

        {!report && (
          <>
            <div className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
              {preview.entries.length} readable entries.
              {preview.collisions.length > 0 &&
                ` ${preview.collisions.length} collide with types you already have - decide each before anything changes.`}
            </div>

            {preview.collisions.map((c) => (
              <div key={c.incoming.id} className="border rounded p-2 mb-2"
                style={{ borderColor: currentTheme.border }}>
                <div className="text-sm font-medium">{c.incoming.name}</div>
                <div className="text-xs mb-1.5" style={{ color: currentTheme.textSecondary }}>
                  yours: {c.existing.manufacturer} {c.existing.model} · theirs: {c.incoming.manufacturer} {c.incoming.model}
                </div>
                <div className="flex gap-1.5">
                  {CHOICES.map(([value, label]) => (
                    <button key={value}
                      onClick={() => setResolutions((r) => ({ ...r, [c.incoming.id]: value }))}
                      className="text-xs px-2 py-1 rounded-full border"
                      style={{
                        borderColor: resolutions[c.incoming.id] === value ? currentTheme.primary : currentTheme.border,
                        color: resolutions[c.incoming.id] === value ? currentTheme.primary : currentTheme.textSecondary,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {preview.unreadable.length > 0 && (
              <div className="text-xs mb-2" style={{ color: currentTheme.textSecondary }}>
                {preview.unreadable.length} entries could not be read and will be listed in the report.
              </div>
            )}
            {message && <div className="text-xs mb-2" style={{ color: '#b03030' }}>{message}</div>}

            <div className="flex gap-2 mt-3">
              <button onClick={apply}
                className="px-3 py-1.5 rounded text-sm font-medium text-white"
                style={{ backgroundColor: currentTheme.primary }}>
                Apply import
              </button>
              <button onClick={onClose}
                className="px-3 py-1.5 rounded text-sm border"
                style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
                Cancel
              </button>
            </div>
          </>
        )}

        {report && (
          <>
            <div className="text-sm mb-2">
              Added {report.report.added} · Replaced {report.report.replaced} · Skipped {report.report.skipped}
            </div>
            {report.skipped.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-medium mb-1">Why each entry was skipped</div>
                <ul className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  {report.skipped.map((s, i) => (
                    <li key={i}>{s.id}: {s.reason}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={onClose}
              className="px-3 py-1.5 rounded text-sm font-medium text-white"
              style={{ backgroundColor: currentTheme.primary }}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ImportReportPanel;

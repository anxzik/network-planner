// The appliance type editor (T019, T021, T022). Thin by design: every decision
// it appears to make is made by validateApplianceType in src/utils/, run again
// by the main process before anything is written. State never syncs from props
// through an effect (the pattern commit 9966aef removed from this codebase);
// the parent keys this component by the type being edited, so switching types
// remounts it with fresh initial state.
import {useState} from 'react';
import {KNOWN_PLANES, KNOWN_PORT_KINDS, PORT_LIMIT, validateApplianceType} from '../../utils/applianceValidation';
import {useLibrary} from '../../context/LibraryContext';
import {useSettings} from '../../context/SettingsContext';

const EMPTY = {
  name: '', manufacturer: '', model: '', category: 'Generic',
  description: '', planes: ['physical'], specifications: { ports: {} },
};

const draftFrom = (type) => (type ? {
  name: type.name, manufacturer: type.manufacturer, model: type.model,
  category: type.category, description: type.description,
  planes: [...type.planes], specifications: JSON.parse(JSON.stringify(type.specifications || { ports: {} })),
} : { ...EMPTY, specifications: { ports: {} } });

function ApplianceEditor({ type, onDone }) {
  const { createType, updateType, removeType, restoreShipped, markApproved, categories } = useLibrary();
  const { currentTheme } = useSettings();
  const [draft, setDraft] = useState(() => draftFrom(type));
  const [confirmPortless, setConfirmPortless] = useState(false);
  const [message, setMessage] = useState(null);

  const verdict = validateApplianceType({ ...draft, confirmedNoPorts: confirmPortless });
  const ports = draft.specifications.ports || {};

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setPort = (kind, count) => setDraft((d) => {
    const next = { ...d.specifications.ports };
    if (count === '' || Number(count) === 0) delete next[kind];
    else next[kind] = { ...(next[kind] || { speed: '1Gbps' }), count: Number(count) };
    return { ...d, specifications: { ...d.specifications, ports: next } };
  });

  const save = async () => {
    const payload = { ...draft, confirmedNoPorts: confirmPortless };
    const result = type ? await updateType(type.id, payload) : await createType(payload);
    if (result.ok) onDone(result.value.id);
    else setMessage(result.error.message);
  };

  const remove = async () => {
    const result = await removeType(type.id);
    if (result.ok) onDone(null);
    else setMessage(result.error.message);
  };

  const field = (label, name, props = {}) => (
    <label className="block text-xs mb-2">
      <span style={{ color: currentTheme.textSecondary }}>{label}</span>
      <input
        value={draft[name]}
        onChange={(e) => setField(name, e.target.value)}
        className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
        style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background, color: currentTheme.text }}
        {...props}
      />
    </label>
  );

  return (
    <div className="w-96 shrink-0 border-l overflow-y-auto p-4"
      style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{type ? type.name : 'New appliance type'}</h3>
        {type?.editedFromShipped && (
          <button onClick={async () => { const r = await restoreShipped(type.id); if (r.ok) onDone(type.id); }}
            className="text-xs underline" style={{ color: currentTheme.primary }}>
            Restore shipped definition
          </button>
        )}
      </div>

      {field('Name', 'name')}
      {field('Manufacturer', 'manufacturer')}
      {field('Model', 'model')}
      <label className="block text-xs mb-2">
        <span style={{ color: currentTheme.textSecondary }}>Category</span>
        <select value={draft.category} onChange={(e) => setField('category', e.target.value)}
          className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
          style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background, color: currentTheme.text }}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      <div className="text-xs mb-1" style={{ color: currentTheme.textSecondary }}>Planes</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {KNOWN_PLANES.map((plane) => {
          const on = draft.planes.includes(plane);
          return (
            <button key={plane}
              onClick={() => setField('planes', on ? draft.planes.filter((p) => p !== plane) : [...draft.planes, plane])}
              className="text-xs px-2 py-1 rounded-full border capitalize"
              style={{
                borderColor: on ? currentTheme.primary : currentTheme.border,
                color: on ? currentTheme.primary : currentTheme.textSecondary,
              }}>
              {plane}
            </button>
          );
        })}
      </div>

      <div className="text-xs mb-1" style={{ color: currentTheme.textSecondary }}>
        Port layout <span>(limit {PORT_LIMIT} per type)</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 mb-2">
        {KNOWN_PORT_KINDS.filter((k) => k !== 'slots').map((kind) => (
          <label key={kind} className="flex items-center justify-between text-xs py-0.5">
            <span style={{ color: currentTheme.textSecondary }}>{kind}</span>
            <input type="number" min="0" value={ports[kind]?.count ?? ''}
              onChange={(e) => setPort(kind, e.target.value)}
              className="w-16 rounded border px-1 py-0.5 text-right text-xs"
              style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.background, color: currentTheme.text }} />
          </label>
        ))}
      </div>

      {verdict.portless && !confirmPortless && (
        <div className="rounded border p-2 mb-2 text-xs"
          style={{ borderColor: currentTheme.primary, color: currentTheme.text }}>
          This type has no ports and will not be connectable until ports are added.
          <label className="flex items-center gap-1.5 mt-1">
            <input type="checkbox" checked={confirmPortless}
              onChange={(e) => setConfirmPortless(e.target.checked)} />
            Save it anyway
          </label>
        </div>
      )}

      {!verdict.valid && !verdict.errors.every((e) => e.code === 'NO_PORTS_CONFIRM') && (
        <ul className="text-xs mb-2" style={{ color: '#b03030' }}>
          {verdict.errors.filter((e) => e.code !== 'NO_PORTS_CONFIRM').map((e, i) => <li key={i}>{e.message}</li>)}
        </ul>
      )}
      {message && <div className="text-xs mb-2" style={{ color: '#b03030' }}>{message}</div>}

      <div className="flex gap-2 mt-2">
        <button onClick={save} disabled={!verdict.valid}
          className="px-3 py-1.5 rounded text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: currentTheme.primary }}>
          {type ? 'Save changes' : 'Create type'}
        </button>
        {type && (
          <button onClick={() => markApproved(type.id, !type.approved)}
            className="px-3 py-1.5 rounded text-sm border"
            style={{ borderColor: currentTheme.border, color: currentTheme.text }}>
            {type.approved ? 'Remove approval' : 'Mark as approved'}
          </button>
        )}
        {type?.origin === 'local' && (
          <button onClick={remove}
            className="px-3 py-1.5 rounded text-sm border"
            style={{ borderColor: currentTheme.border, color: currentTheme.textSecondary }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ApplianceEditor;

// Lightweight client-side storage utility for persistence
// Provides a small abstraction over localStorage with namespacing and versioning

const NAMESPACE = 'networkPlanner';
const SCHEMA_VERSION = 1;

function getRoot() {
  try {
    const raw = localStorage.getItem(NAMESPACE);
    if (!raw) return { __version: SCHEMA_VERSION };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { __version: SCHEMA_VERSION };
    // If version missing, set it
    if (!parsed.__version) parsed.__version = SCHEMA_VERSION;
    return parsed;
  } catch (e) {
    console.error('storage.getRoot parse error', e);
    return { __version: SCHEMA_VERSION };
  }
}

function setRoot(obj) {
  try {
    const next = { __version: SCHEMA_VERSION, ...obj };
    localStorage.setItem(NAMESPACE, JSON.stringify(next));
  } catch (e) {
    console.error('storage.setRoot stringify error', e);
  }
}

export function saveData(key, value) {
  const root = getRoot();
  root[key] = value;
  setRoot(root);
}

export function loadData(key, fallback = null) {
  const root = getRoot();
  return Object.prototype.hasOwnProperty.call(root, key) ? root[key] : fallback;
}

export function clearData(key) {
  const root = getRoot();
  if (Object.prototype.hasOwnProperty.call(root, key)) {
    delete root[key];
    setRoot(root);
  }
}

export function exportAll() {
  return getRoot();
}

export function importAll(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  setRoot(obj);
}

// Debounce helper to avoid frequent writes
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

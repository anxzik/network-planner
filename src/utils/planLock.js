// Whether an advisory lock sidecar still speaks for a live reader (R6). Pure:
// the caller establishes whether the pid is alive and what time it is; this
// module decides what that means. A lock that is stale must never keep a person
// out of their own plan, so every uncertainty resolves towards ignoring it.

export const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

/**
 * @param {string} text
 * @returns {{pid:number, hostname:string, openedAt:string}|null}
 */
export function readLockSidecar(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  if (typeof parsed.pid !== 'number' || !Number.isInteger(parsed.pid)) return null;
  if (typeof parsed.openedAt !== 'string') return null;
  return {
    pid: parsed.pid,
    hostname: typeof parsed.hostname === 'string' ? parsed.hostname : '',
    openedAt: parsed.openedAt,
  };
}

/**
 * @param {{pid:number, hostname:string, openedAt:string}|null} lock
 * @param {{pidAlive?:boolean, now?:number, sameHost?:boolean, staleAfterMs?:number}} [context]
 * @returns {boolean}
 */
export function lockIsStale(lock, { pidAlive, now, sameHost = true, staleAfterMs = STALE_AFTER_MS } = {}) {
  // An unreadable sidecar tells us nothing, so it holds nobody out.
  if (!lock) return true;
  // A lock written on another machine says nothing about this one's processes,
  // and a cloud-synced folder will deliver plenty of those.
  if (!sameHost) return true;
  if (pidAlive === false) return true;
  const openedAt = Date.parse(lock.openedAt);
  if (Number.isNaN(openedAt)) return true;
  if (typeof now === 'number' && now - openedAt > staleAfterMs) return true;
  return false;
}

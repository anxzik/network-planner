import {describe, expect, it} from 'vitest';
import {lockIsStale, readLockSidecar, STALE_AFTER_MS} from './planLock';

const lock = (extra = {}) => ({ pid: 4242, hostname: 'workshop', openedAt: '2026-09-03T12:00:00Z', ...extra });
const at = (iso) => Date.parse(iso);

describe('readLockSidecar', () => {
  it('reads a well-formed sidecar', () => {
    expect(readLockSidecar(JSON.stringify(lock()))).toEqual(lock());
  });

  it('returns nothing for content it cannot read, so a damaged lock holds nobody out', () => {
    expect(readLockSidecar('not json')).toBeNull();
    expect(readLockSidecar('[]')).toBeNull();
    expect(readLockSidecar('null')).toBeNull();
    expect(readLockSidecar(JSON.stringify({ pid: 'abc', openedAt: 'x' }))).toBeNull();
    expect(readLockSidecar(JSON.stringify({ pid: 1.5, openedAt: 'x' }))).toBeNull();
    expect(readLockSidecar(JSON.stringify({ pid: 1 }))).toBeNull();
  });

  it('tolerates a missing hostname rather than rejecting the lock', () => {
    expect(readLockSidecar(JSON.stringify({ pid: 7, openedAt: 'x' })).hostname).toBe('');
  });
});

describe('lockIsStale', () => {
  it('holds when the writing process is alive, on this host, and recent', () => {
    expect(lockIsStale(lock(), { pidAlive: true, now: at('2026-09-03T12:05:00Z') })).toBe(false);
  });

  it('is stale when the writing process is gone', () => {
    expect(lockIsStale(lock(), { pidAlive: false, now: at('2026-09-03T12:05:00Z') })).toBe(true);
  });

  it('is stale when it came from another machine, since its pid means nothing here', () => {
    expect(lockIsStale(lock(), { pidAlive: true, sameHost: false, now: at('2026-09-03T12:05:00Z') })).toBe(true);
  });

  it('is stale once it has outlived the threshold, even with a live pid', () => {
    const now = at('2026-09-03T12:00:00Z') + STALE_AFTER_MS + 1;
    expect(lockIsStale(lock(), { pidAlive: true, now })).toBe(true);
  });

  it('still holds exactly at the threshold', () => {
    const now = at('2026-09-03T12:00:00Z') + STALE_AFTER_MS;
    expect(lockIsStale(lock(), { pidAlive: true, now })).toBe(false);
  });

  it('is stale when there is no lock to read', () => {
    expect(lockIsStale(null, { pidAlive: true, now: Date.now() })).toBe(true);
  });

  it('is stale when the lock carries a time that cannot be read', () => {
    expect(lockIsStale(lock({ openedAt: 'whenever' }), { pidAlive: true, now: Date.now() })).toBe(true);
  });

  it('resolves an unknown pid state towards holding, so a live reader is not evicted', () => {
    expect(lockIsStale(lock(), { now: at('2026-09-03T12:05:00Z') })).toBe(false);
  });
});

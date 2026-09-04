// Plan files on disk. This module executes decisions; it does not make them.
// Slot naming and retention come from src/utils/preservedArtifacts.js, lock
// staleness from src/utils/planLock.js, and format classification from
// src/utils/planFile.js. What lives here is the part that must touch the
// filesystem: the atomic write, the preserved partial, and the lock sidecar.
import { closeSync, fsyncSync, openSync, writeSync } from 'node:fs';
import { hostname } from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { claimOccupiedSlot, slotName } from '../utils/preservedArtifacts.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { lockIsStale, readLockSidecar } from '../utils/planLock.js';

export interface SaveOk {
  ok: true;
  path: string;
}

export interface SaveFailed {
  ok: false;
  /** The plan file's previous content is untouched; this names what was kept. */
  partialName: string | null;
  message: string;
}

export interface LockState {
  held: boolean;
  /** Set when another live reader holds the plan, so the caller opens read-only. */
  by?: { pid: number; hostname: string; openedAt: string };
}

const encoder = new TextEncoder();

function preservedPath(target: string, kind: string, options: Record<string, unknown> = {}): string {
  return path.join(path.dirname(target), slotName(path.basename(target), kind, options));
}

// Write, flush to the platter, then rename over the target. Rename within one
// directory is atomic on every filesystem the packaging targets use, so the
// plan file is either its old content or its new one and never a half-written
// mixture (R1). Writing in place is exactly how a disk-full failure corrupts.
export async function savePlan(target: string, text: string): Promise<SaveOk | SaveFailed> {
  const directory = path.dirname(target);
  const temporary = path.join(directory, `.${path.basename(target)}.writing-${process.pid}`);

  let handle: number | null = null;
  try {
    handle = openSync(temporary, 'w');
    writeSync(handle, encoder.encode(text));
    // Without the flush the rename can land before the bytes do, and a power
    // loss leaves a whole-looking file with nothing in it.
    fsyncSync(handle);
    closeSync(handle);
    handle = null;
    await fs.rename(temporary, target);
    return { ok: true, path: target };
  } catch (error) {
    if (handle !== null) {
      try { closeSync(handle); } catch { /* the failure being reported is the one that matters */ }
    }
    const partialName = await keepPartial(temporary, target);
    return {
      ok: false,
      partialName,
      message: partialName
        ? `The plan could not be saved. Its previous content is unchanged, and what was ` +
          `being written was kept as ${partialName}.`
        : `The plan could not be saved. Its previous content is unchanged. ` +
          `${(error as Error).message}`,
    };
  }
}

// The interrupted write is the person's newest content, so it is preserved
// rather than deleted (FR-008) — into one slot that a later failure replaces,
// never a growing pile of timestamped files (FR-024).
async function keepPartial(temporary: string, target: string): Promise<string | null> {
  try {
    await fs.access(temporary);
  } catch {
    return null; // Nothing was written; there is no partial to keep.
  }
  const destination = preservedPath(target, 'partial');
  try {
    if (claimOccupiedSlot('partial') === 'leave') {
      try {
        await fs.access(destination);
        await fs.rm(temporary, { force: true });
        return path.basename(destination);
      } catch { /* the slot is free; fall through and take it */ }
    }
    await fs.rename(temporary, destination);
    return path.basename(destination);
  } catch {
    // Even the preserving failed. Leave the temporary exactly where it is
    // rather than removing the only copy of that content.
    return path.basename(temporary);
  }
}

export async function readPlan(target: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  try {
    return { ok: true, text: await fs.readFile(target, 'utf8') };
  } catch (error) {
    return { ok: false, message: `The plan could not be opened. ${(error as Error).message}` };
  }
}

// Copy a plan aside before it is changed, into the slot for that kind. An
// occupied slot is honoured per the kind's rule: an upgrade original is left
// alone, because the copy already there is the older and truer one.
export async function preserveCopy(
  target: string,
  kind: 'upgradeOriginal' | 'preapplyOriginal',
  options: Record<string, unknown> = {},
): Promise<{ kept: boolean; name: string }> {
  const destination = preservedPath(target, kind, options);
  if (claimOccupiedSlot(kind) === 'leave') {
    try {
      await fs.access(destination);
      return { kept: false, name: path.basename(destination) };
    } catch { /* the slot is free */ }
  }
  await fs.copyFile(target, destination);
  return { kept: true, name: path.basename(destination) };
}

function lockPath(target: string): string {
  return `${target}.lock`;
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM means the process exists but belongs to someone else.
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

// Advisory only (R6). A lock never prevents opening a plan — it decides whether
// this window may write to it. Every uncertainty resolves towards taking the
// lock, so a stale sidecar cannot keep a person out of their own work.
export async function takeLock(target: string): Promise<LockState> {
  const sidecar = lockPath(target);
  try {
    const existing = readLockSidecar(await fs.readFile(sidecar, 'utf8'));
    const stale = lockIsStale(existing, {
      pidAlive: existing ? processIsAlive(existing.pid) : false,
      sameHost: existing ? existing.hostname === hostname() : false,
      now: Date.now(),
    });
    if (!stale && existing) return { held: false, by: existing };
  } catch { /* no sidecar, or unreadable: both mean nobody holds this plan */ }

  try {
    await fs.writeFile(
      sidecar,
      JSON.stringify({ pid: process.pid, hostname: hostname(), openedAt: new Date().toISOString() }),
      'utf8',
    );
    return { held: true };
  } catch {
    // A read-only folder means no lock can be taken. That is not a reason to
    // refuse the plan; it only means this window cannot claim it.
    return { held: true };
  }
}

export async function releaseLock(target: string): Promise<void> {
  const sidecar = lockPath(target);
  try {
    const existing = readLockSidecar(await fs.readFile(sidecar, 'utf8'));
    // Only ever remove our own lock; another window's is not ours to clear.
    if (existing && existing.pid === process.pid && existing.hostname === hostname()) {
      await fs.rm(sidecar, { force: true });
    }
  } catch { /* nothing to release */ }
}

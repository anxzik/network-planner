// The application's own memory: where a person's plans are, and what they had
// not saved (R3, FR-007, FR-009). Small JSON files beside the catalogue
// database in the per-user data directory — deliberately not tables in it. The
// catalogue is a long-lived asset; these are disposable machine-local state a
// person may clear without losing anything, and coupling them to a database
// schema would put migration ceremony around throwaway data.
//
// This module executes: it reads and writes. Which entries survive a prune and
// how the list is ordered are decisions, and live in src/utils/recentsPrune.js.
import fs from 'node:fs/promises';
import path from 'node:path';

export interface RecentEntry {
  path: string;
  name: string;
  lastOpened: string;
}

export interface RecoverySlot {
  /** The plan document, in the shape planFile.js serialises. */
  document: Record<string, unknown>;
  /** Where it came from, or null when the work was never saved anywhere. */
  sourcePath: string | null;
  capturedAt: string;
  /** Why it is here: a crash took it, or the person set it aside (FR-006a). */
  reason: 'crash' | 'discarded';
}

const RECENTS_FILE = 'recents.json';
const RECOVERY_FILE = 'recovery-slot.json';

export class PlanState {
  private readonly directory: string;

  constructor(directory: string) {
    this.directory = directory;
  }

  private file(name: string): string {
    return path.join(this.directory, name);
  }

  // A missing or damaged state file is not an error worth surfacing: this is
  // convenience state, and losing it costs the person nothing they made. It
  // reads as empty and is rewritten on the next change.
  private async readJson<T>(name: string, fallback: T): Promise<T> {
    try {
      const parsed: unknown = JSON.parse(await fs.readFile(this.file(name), 'utf8'));
      return (parsed ?? fallback) as T;
    } catch {
      return fallback;
    }
  }

  private async writeJson(name: string, value: unknown): Promise<void> {
    // Written through a temp and renamed, for the same reason plan files are:
    // a half-written recents list would read as damaged on next start and the
    // person would silently lose their list of where things are.
    const target = this.file(name);
    const temporary = `${target}.writing-${process.pid}`;
    try {
      await fs.mkdir(this.directory, { recursive: true });
      await fs.writeFile(temporary, JSON.stringify(value, null, 1), 'utf8');
      await fs.rename(temporary, target);
    } catch {
      await fs.rm(temporary, { force: true }).catch(() => {});
    }
  }

  async readRecents(): Promise<RecentEntry[]> {
    const raw = await this.readJson<unknown>(RECENTS_FILE, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (entry): entry is RecentEntry =>
        typeof entry === 'object' && entry !== null &&
        typeof (entry as RecentEntry).path === 'string' &&
        typeof (entry as RecentEntry).name === 'string',
    );
  }

  async writeRecents(entries: RecentEntry[]): Promise<void> {
    await this.writeJson(RECENTS_FILE, entries);
  }

  async readRecoverySlot(): Promise<RecoverySlot | null> {
    const raw = await this.readJson<unknown>(RECOVERY_FILE, null);
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
    const slot = raw as Partial<RecoverySlot>;
    if (typeof slot.document !== 'object' || slot.document === null) return null;
    return {
      document: slot.document as Record<string, unknown>,
      sourcePath: typeof slot.sourcePath === 'string' ? slot.sourcePath : null,
      capturedAt: typeof slot.capturedAt === 'string' ? slot.capturedAt : new Date().toISOString(),
      reason: slot.reason === 'discarded' ? 'discarded' : 'crash',
    };
  }

  async writeRecoverySlot(slot: RecoverySlot): Promise<void> {
    await this.writeJson(RECOVERY_FILE, slot);
  }

  // Cleared by a successful save, or by the person declining the restore offer
  // — never by a discard, which is what keeps Escape safe (FR-006a).
  async clearRecoverySlot(): Promise<void> {
    await fs.rm(this.file(RECOVERY_FILE), { force: true }).catch(() => {});
  }
}

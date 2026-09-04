import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';

// The bridge and the main process must name exactly the same set of channels.
// A method exposed with no handler behind it resolves to nothing, and the
// renderer cannot tell that apart from a handler that returned nothing — so the
// surface grows on both sides together or not at all.
const read = (file) => readFileSync(path.join(import.meta.dirname, '..', file), 'utf8');
const channels = (source, pattern) => [...source.matchAll(pattern)].map((m) => m[1]).sort();

describe('plans bridge and main process agree', () => {
  const preload = read('preload.ts');
  // Handlers live in more than one file: ipc.ts owns the plan's own lifecycle,
  // definitionHandlers.ts owns what a plan records about its types. Every file
  // that registers plans:* channels has to be listed here, which is why this
  // test failed the moment those handlers were split out.
  const main = ['plans/ipc.ts', 'plans/definitionHandlers.ts'].map(read).join('\n');

  const exposed = channels(preload, /invoke\('plans:(\w+)'/g);
  const handled = channels(main, /handle\('plans:(\w+)'/g);

  it('exposes no method the main process does not handle', () => {
    expect(exposed.filter((c) => !handled.includes(c))).toEqual([]);
  });

  it('handles no channel the bridge does not expose', () => {
    expect(handled.filter((c) => !exposed.includes(c))).toEqual([]);
  });

  it('has a surface at all, so a broken regex cannot pass this silently', () => {
    expect(exposed.length).toBeGreaterThan(0);
  });
});

describe('library bridge and main process agree', () => {
  const exposed = channels(read('preload.ts'), /invoke\('library:(\w+)'/g);
  const handled = channels(read('library/ipc.ts'), /handle\('library:(\w+)'/g);

  it('matches exactly, as it has since the library shipped', () => {
    expect(exposed).toEqual(handled);
  });
});

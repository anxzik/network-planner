import {describe, expect, it} from 'vitest';
import {svgToDataUri} from './svgDataUri';

const decode = (uri) => new TextDecoder().decode(
  Uint8Array.from(atob(uri.replace('data:image/svg+xml;base64,', '')), (c) => c.charCodeAt(0)),
);

describe('svgToDataUri', () => {
  it('encodes plain markup', () => {
    const svg = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
    expect(decode(svgToDataUri(svg))).toBe(svg);
  });

  it('round-trips characters outside Latin-1, which btoa alone cannot take', () => {
    const svg = '<svg><title>Röuter — ünicode ✓ 日本語</title></svg>';
    expect(decode(svgToDataUri(svg))).toBe(svg);
  });

  it('handles emoji, which are surrogate pairs', () => {
    const svg = '<svg><title>📡 antenna</title></svg>';
    expect(decode(svgToDataUri(svg))).toBe(svg);
  });

  it('returns nothing for a lone surrogate rather than throwing', () => {
    // The case that used to crash the canvas: unescape/btoa throws here.
    const broken = `<svg><title>${String.fromCharCode(0xd800)}</title></svg>`;
    expect(() => svgToDataUri(broken)).not.toThrow();
    expect(typeof svgToDataUri(broken)).toBe('string');
  });

  it('handles content larger than the argument limit', () => {
    const big = `<svg>${'<path d="M0 0"/>'.repeat(5000)}</svg>`;
    expect(decode(svgToDataUri(big))).toBe(big);
  });

  it('returns nothing for content there is none of', () => {
    expect(svgToDataUri('')).toBeNull();
    expect(svgToDataUri(null)).toBeNull();
    expect(svgToDataUri(undefined)).toBeNull();
    expect(svgToDataUri(42)).toBeNull();
  });
});

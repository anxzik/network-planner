import {describe, expect, it} from 'vitest';
import {SYMBOL_MAX_BYTES, validateSymbolSvg} from './symbolValidation';

const svg = (inner = '<rect width="10" height="10"/>') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${inner}</svg>`;

describe('validateSymbolSvg: well-formed symbols (FR-014)', () => {
  it('accepts a plain vector symbol', () => {
    expect(validateSymbolSvg(svg())).toEqual({ valid: true, errors: [] });
  });

  it('accepts an xml declaration before the root', () => {
    expect(validateSymbolSvg(`<?xml version="1.0"?>\n${svg()}`).valid).toBe(true);
  });

  it('rejects non-string input', () => {
    expect(validateSymbolSvg(null).valid).toBe(false);
    expect(validateSymbolSvg(42).valid).toBe(false);
  });

  it('rejects content whose root is not svg', () => {
    const result = validateSymbolSvg('<div>not a symbol</div>');
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/not an svg/i);
  });

  it('rejects an unterminated document', () => {
    expect(validateSymbolSvg('<svg viewBox="0 0 1 1"><rect').valid).toBe(false);
  });
});

describe('validateSymbolSvg: size (edge case, CHK032)', () => {
  it('accepts content at the limit and rejects one byte over, naming the limit', () => {
    const filler = 'a'.repeat(SYMBOL_MAX_BYTES - svg('<!---->').length);
    const atLimit = svg(`<!--${filler.slice(4)}-->`);
    expect(validateSymbolSvg(atLimit).valid).toBe(true);
    const over = validateSymbolSvg(svg(`<!--${'a'.repeat(SYMBOL_MAX_BYTES)}-->`));
    expect(over.valid).toBe(false);
    expect(over.errors[0].message).toContain(String(SYMBOL_MAX_BYTES));
  });
});

describe('validateSymbolSvg: imported markup is untrusted (CHK031)', () => {
  it.each([
    ['a script element', svg('<script>alert(1)</script>')],
    ['an event handler', svg('<rect onload="alert(1)"/>')],
    ['a foreignObject', svg('<foreignObject><body/></foreignObject>')],
    ['an external image reference', svg('<image href="https://evil.example/x.png"/>')],
    ['an external use reference', svg('<use href="https://evil.example/x.svg#icon"/>')],
    ['a javascript url', svg('<a href="javascript:alert(1)"><rect/></a>')],
  ])('rejects %s', (_label, content) => {
    const result = validateSymbolSvg(content);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('UNSAFE_CONTENT');
  });

  it('still allows internal references, which legitimate symbols use', () => {
    const internal = svg('<defs><circle id="dot" r="2"/></defs><use href="#dot"/>');
    expect(validateSymbolSvg(internal).valid).toBe(true);
  });

  it('allows embedded raster data uris, which exported drawings often carry', () => {
    const withData = svg('<image href="data:image/png;base64,iVBORw0KGgo="/>');
    expect(validateSymbolSvg(withData).valid).toBe(true);
  });
});

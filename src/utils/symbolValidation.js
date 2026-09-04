// Validation for imported symbols (FR-014). An imported symbol is markup
// supplied from outside the application that the canvas will draw, so this is
// a security boundary as much as a format check: readiness item CHK031 asked
// whether symbol content was constrained anywhere, and this is the answer.
// Pure string analysis; no DOM is involved, so it runs identically in the
// renderer, the main process, and the tests.

export const SYMBOL_MAX_BYTES = 64 * 1024;

// Anything that could execute, escape the vector sandbox, or reach the
// network. Rendering happens through an <img> data URI, which already inerts
// scripts, but the content is rejected at import rather than trusted to a
// second line of defence.
const UNSAFE_PATTERNS = [
  { pattern: /<\s*script\b/i, what: 'a script element' },
  { pattern: /\son[a-z]+\s*=/i, what: 'an event handler attribute' },
  { pattern: /<\s*foreignObject\b/i, what: 'a foreignObject element' },
  { pattern: /\b(?:href|src)\s*=\s*["'](?!#|data:image\/)/i, what: 'an external reference' },
  { pattern: /javascript\s*:/i, what: 'a javascript: url' },
];

export function validateSymbolSvg(content) {
  const errors = [];

  if (typeof content !== 'string' || content.trim() === '') {
    return { valid: false, errors: [{ code: 'NOT_SVG', message: 'The symbol is not an SVG document.' }] };
  }

  if (content.length > SYMBOL_MAX_BYTES) {
    errors.push({
      code: 'TOO_LARGE',
      message: `The symbol is ${content.length} bytes; the limit is ${SYMBOL_MAX_BYTES}.`,
    });
  }

  const body = content.replace(/^\s*<\?xml[^>]*\?>\s*/i, '').trim();
  if (!/^<svg\b/i.test(body) || !/<\/svg\s*>\s*$/i.test(body)) {
    errors.push({ code: 'NOT_SVG', message: 'The content is not an SVG document with a single svg root.' });
  }

  for (const { pattern, what } of UNSAFE_PATTERNS) {
    if (pattern.test(body)) {
      errors.push({ code: 'UNSAFE_CONTENT', message: `The symbol contains ${what}, which imported symbols may not carry.` });
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

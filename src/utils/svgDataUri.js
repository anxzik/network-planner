// Turning an imported SVG into something an <img> can draw. Pure: text in, a
// data URI or null out.
//
// The obvious route — btoa(unescape(encodeURIComponent(text))) — leans on
// unescape(), which is deprecated, and throws on malformed surrogate pairs.
// Imported symbol content comes from files people were handed, so malformed
// input is an ordinary Tuesday rather than an exotic case, and a throw here
// takes the whole canvas render down with it.

export function svgToDataUri(content) {
  if (typeof content !== 'string' || content === '') return null;
  try {
    const bytes = new TextEncoder().encode(content);
    let binary = '';
    // Chunked: spreading a large byte array into String.fromCharCode blows the
    // argument limit on symbols of any size.
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return `data:image/svg+xml;base64,${btoa(binary)}`;
  } catch {
    // Unencodable content is not worth a blank canvas: the caller falls back
    // to the built-in icon, which is what a type without a symbol already uses.
    return null;
  }
}

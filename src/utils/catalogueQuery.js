// Query shaping for the catalogue (FR-017, FR-026). Pure: filters in, a WHERE
// clause and its parameters out. The store binds them, so filtering happens in
// SQL rather than by loading the whole catalogue - which is the property task
// validation confirmed FR-026 exists to protect.
import {KNOWN_PLANES} from './applianceValidation';

const escapeLike = (text) => text.replace(/[\\%_]/g, (ch) => `\\${ch}`);

export function buildTypeQuery(filters = {}) {
  const clauses = [];
  const params = [];

  const search = typeof filters.search === 'string' ? filters.search.trim() : '';
  if (search !== '') {
    const term = `%${escapeLike(search)}%`;
    clauses.push(
      "(name LIKE ? ESCAPE '\\' OR manufacturer LIKE ? ESCAPE '\\' OR model LIKE ? ESCAPE '\\')",
    );
    params.push(term, term, term);
  }

  if (filters.category) {
    clauses.push('category = ?');
    params.push(filters.category);
  }

  if (filters.plane) {
    if (!KNOWN_PLANES.includes(filters.plane)) {
      throw new Error(`${filters.plane} is not a plane this application knows.`);
    }
    // planes is a JSON array in text form; membership is a quoted-name match.
    clauses.push('planes LIKE ?');
    params.push(`%"${filters.plane}"%`);
  }

  if (filters.origin) {
    clauses.push('origin = ?');
    params.push(filters.origin);
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

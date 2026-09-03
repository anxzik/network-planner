// Validation for appliance type drafts (FR-001, FR-019, FR-020, FR-024).
// Pure: takes a draft, returns a verdict. Both the renderer and the main
// process run this, so the rules cannot drift between them.

export const KNOWN_PLANES = ['physical', 'logical', 'cloud', 'rf', 'alarm'];

// The sixteen kinds portFactory generates plus usb, which the shipped
// catalogue contains (endpoint-rpizero) even though generation ignores it.
// See the finding recorded in shippedTypes.test.js.
export const KNOWN_PORT_KINDS = [
  'ethernet', 'ethernet10g', 'ethernet25g',
  'sfp', 'sfpPlus', 'sfp28', 'sfp56',
  'qsfp', 'qsfpPlus', 'qsfp28', 'qsfpdd',
  'fiber', 'coax', 'rj11', 'wan', 'slots',
  'usb',
];

// FR-024 requires a stated limit. The spec quantifies none, so this constant
// is where the number lives; the wireframes already show 512 and readiness
// item CHK011 records that the figure originated there, not in a requirement.
export const PORT_LIMIT = 512;

const REQUIRED_FIELDS = ['name', 'manufacturer', 'model', 'category'];

export function validateApplianceType(draft) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    const value = draft[field];
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push({ field, code: 'REQUIRED', message: `A ${field} is required.` });
    }
  }

  const planes = draft.planes;
  if (!Array.isArray(planes) || planes.length === 0) {
    errors.push({
      field: 'planes', code: 'REQUIRED',
      message: 'An appliance type must belong to at least one plane.',
    });
  } else {
    for (const plane of planes) {
      if (!KNOWN_PLANES.includes(plane)) {
        errors.push({
          field: 'planes', code: 'UNKNOWN_PLANE',
          message: `${plane} is not a plane this application knows.`,
        });
      }
    }
  }

  const ports = draft.specifications?.ports ?? {};
  let connectable = 0;
  for (const [kind, group] of Object.entries(ports)) {
    if (!KNOWN_PORT_KINDS.includes(kind)) {
      errors.push({
        field: 'ports', code: 'UNKNOWN_PORT_KIND',
        message: `${kind} is not a port kind this application knows.`,
      });
      continue;
    }
    const count = group?.count;
    if (!Number.isInteger(count) || count < 0) {
      errors.push({
        field: 'ports', code: 'BAD_COUNT',
        message: `The ${kind} count must be a whole number of ports.`,
      });
      continue;
    }
    if (kind !== 'slots') connectable += count;
  }

  if (connectable > PORT_LIMIT) {
    errors.push({
      field: 'ports', code: 'PORT_LIMIT_EXCEEDED',
      message: `That layout would generate ${connectable} ports; the limit is ${PORT_LIMIT} per type.`,
    });
  }

  const portless = connectable === 0 &&
    !errors.some((e) => e.code === 'BAD_COUNT' || e.code === 'UNKNOWN_PORT_KIND');
  if (portless && draft.confirmedNoPorts !== true) {
    errors.push({
      field: 'ports', code: 'NO_PORTS_CONFIRM',
      message: 'This type has no ports and will not be connectable until ports are added. Confirm to save it anyway.',
    });
  }

  return { valid: errors.length === 0, errors, portless };
}

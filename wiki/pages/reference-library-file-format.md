---
type: reference
updated: 2026-09-02
sources: [S001]
---

# Library interchange format

Appliance types move between machines as JSON, carrying a `formatVersion` field
at the top level (S001).

The version sits at the top so it can be read before parsing the rest, which
lets an unrecognised version be warned about while still importing what is
readable (S001).

JSON was chosen partly because the existing catalogue already stores each
record as a plain object, so moving it is a transcription rather than a
redesign (S001). See [[concept-appliance-type]].

## Rejected

- **YAML**: a dependency for no gain over JSON (S001).
- **A zip bundle with symbols as separate files**: deferred, because symbols
  are vector text and embed in JSON without trouble (S001).

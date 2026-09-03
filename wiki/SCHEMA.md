# Wiki Schema

Rules for this wiki. Commands read this file and its rules override their
defaults.

## Page types

| Type | Holds | Example |
|---|---|---|
| `concept` | A domain idea and how this project uses it | What a plane is |
| `decision` | A choice made, its reason, and what was rejected | Why the catalogue is a database |
| `component` | How a part actually works, when a source proves it | The port generator |
| `reference` | Verified external facts | What the runtime bundles |
| `howto` | A procedure someone will repeat | Adding an appliance type |

## Page format

```
---
type: concept | decision | component | reference | howto
updated: YYYY-MM-DD
sources: [S001, S002]
---

# Title

Prose. Every claim carries a source citation like (S001).
Links to related pages use [[page-name]].
```

## Rules

- Every synthesized claim carries a source id. No uncited claims.
- A page over 600 words is split, and both halves link to each other.
- A page unreachable from any other page is an orphan. Cross-link on create.
- Contradictions are kept visible under a conflict marker, never resolved by
  deleting one side:
  `> ⚠ conflict: S002 says X; S007 says Y`
- Sources are immutable. Ingest never edits the file it read.

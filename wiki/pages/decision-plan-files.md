---
type: decision
updated: 2026-09-03
sources: [S004, S005]
---

# Plan files: format, atomicity, and travelling declines

Plans are versioned JSON documents with `formatVersion` first, inheriting the
read-version-before-trusting-anything discipline the library interchange format
established rather than reinventing it (S004). See
[[reference-library-file-format]].

**Saves are atomic by construction**: write a temporary file in the same
directory, flush, rename over the target. A failure leaves the target untouched
and the temporary becomes a visible, named partial rather than being discarded
(S004). Writing in place is exactly how a disk-full failure corrupts, and no
dependency is needed to avoid it (S004).

**Declined update offers travel inside the plan file**, keyed by the catalogue
version that was declined, so a decline survives the file moving machines and a
newer correction re-offers (S004). A decline is a fact about the plan, not
about the machine it was made on.

**Auxiliary state is deliberately not in the catalogue database**: recents and
the crash-recovery slot are throwaway JSON in the per-user directory, because
they have a different lifecycle and owner than the long-lived catalogue, and
schema ceremony around disposable state buys nothing (S004). See
[[decision-catalogue-database]].

**Read-only for newer formats is enforced in the main process** as a save
refusal, not only in interface state, so no renderer defect can write back to a
file the application only partly understood (S004, S005).

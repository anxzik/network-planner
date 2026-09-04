---
type: concept
updated: 2026-09-02
sources: [S002]
---

# Appliance type and placed appliance

An **appliance type** is a kind of hardware that can be placed: its identity,
its category, the planes it belongs to, its port layout, and its symbol (S002).

A **placed appliance** is one instance of a type positioned in a plan. The
distinction matters because anything belonging to a specific unit, a serial
number or an asset tag, belongs to the placed appliance and not to the type
(S002).

## Port layout

A type's ports are grouped by kind, each group carrying a count, a speed, and
whether it supplies power over Ethernet (S002). Sixteen port kinds are
supported, matching what the existing port generator already reads (S002).

Module slots are not connectable ports and are excluded from port generation,
which is existing behaviour that has to be preserved (S002).

## Why the shipped set matters

The application ships 131 appliance types across 19 categories (S002). Carrying
them across unchanged is the first task of any work that moves the catalogue,
because every later verification assumes they are present and correct (S002).

# PACER Atrium — Claude Code Build Reference

**Project:** pacer_atrium (JPG Ventures LLC)
**Stack:** React + Vite, Tailwind CSS, Firebase v10 (Auth + Firestore)
**Dev branch:** claude/pacer-repo-structure-kezmm0

---

## Locked Language — Do Not Alter

These phrases are institutional doctrine. Do not rewrite, paraphrase, or "improve" them.

- **"Show me one job."** — FleetFlow harvest call. Exact phrase. No variants.
- **"Written · Locked · Ready to Test"** — FleetFlow Doctrine v1 status label.
- **"Infrastructure is declared once. Behavior is inherited everywhere."** — PACER Campus Rule #001.
- **"Archivist Hall"** — mixed case. Not ARCHIVIST HALL, not Archie Hall, not Archive Hall.
- **"K.E.L."** — Knowledge Execution Layer. Not CLAW (prior name, retired May 30, 2026).
- **"ARCHIVIST"** — memory layer. Not JARVIS (prior name, retired May 30, 2026).
- **"A successful system is not measured by what it creates. A successful system is measured by what arrives."** — Constitutional Principle #2, The Last Inch Principle.
- **"Nothing important should be lost in the hallway."** — closing line of The Last Inch Principle. Do not rewrite.
- **The five duties of The Last Inch Principle** (exact names, no paraphrasing): Identify the Path · Clear the Obstruction · Protect the Cargo · Document the Journey · Deliver the Outcome.

---

## PACER Campus Rule #001

**Infrastructure is declared once. Behavior is inherited everywhere.**

### Three-Layer Architecture

| Layer | Owns | Rule |
|-------|------|------|
| Campus Infrastructure | pacer-theme.js, auth, nav, shared state, design tokens | Declares reality |
| Buildings (Rooms) | Atrium, Archivist Hall, Business Center, Theater, colleges | Inherits — does not reinvent |
| Standalone Artifacts | FleetFlow Doctrine HTML, exported docs, printable manifestos | May carry inline theme — expected to survive disconnected from campus |

### Theme Rule
- Campus rooms: `<script src="/pacer-theme.js"></script>` only
- Standalone artifacts: inline `PACERTheme` script only
- Never load both on the same page
- A room that defines its own theme engine has admitted a raccoon to the server closet

---

## FleetFlow Acquisition Loop (Locked)

```
Content → Conversation → One Job → Trust → Pilot → Subscription
```

The subscription is the result of trust, not the beginning of it.

---

## Architecture Overview

### Firestore Collections (per user: `users/{uid}/...`)
- `observations` — ordered by timestamp desc
- `muse_works` — ordered by createdAt desc
- `kel_reviews` — ordered by createdAt desc
- `institution_events` — ordered by createdAt desc
- `graduates` — ordered by sequence asc
- `kel_decisions` — ordered by decidedAt desc

### Builder Readiness Gate
- Three states: `locked` → `pending` → `approved`
- Derived via `useMemo` from Firestore `kel_reviews` — NOT from local state
- KEL approval only. No count-based or Settings-based unlock.

### Graduate Creation Rule
- `createGraduate()` in `src/lib/db.js` — always emits `graduate_added` institution event
- No other path creates graduates

### PACER Object Lifecycle (Six States — Canonized)
Observed → Shaping → Structured → Premiere Ready → Opening Night → Published Memory
No state may be skipped. No new states without a canonization decision.

---

## Named Systems (Do Not Rename)

| Name | Role | Notes |
|------|------|-------|
| FleetFlow | Operations product | Revenue-generating, deployed |
| PACER | Governing architecture | Campus |
| ARCHIVIST | Memory layer | Formerly JARVIS — rename completed May 30, 2026 |
| KODEX | Governance layer | Ops lane |
| OpsCore | Operations layer | |
| K.E.L. | Knowledge Execution Layer | Formerly CLAW — rename completed May 30, 2026 |

Prior names (JARVIS, CLAW) were never used in any patent or trademark filing. Do not reintroduce them.

---

## What Claude Code Should Not Do

- Rewrite doctrine text
- Alter "Show me one job"
- Add PACER architecture language to FleetFlow-facing materials
- Create a second theme engine in any campus room
- Merge inline and external theme scripts into one "universal" version
- Rename any system listed in the Named Systems table
- Improve the raccoon metaphor

# PACER Atrium — Claude Code Build Reference

**Project:** pacer_atrium (JPG Ventures LLC)
**Stack:** React + Vite, Tailwind CSS, Firebase v10 (Auth + Firestore)
**Dev branch:** claude/pacer-repo-structure-kezmm0

---

## PACER Mission

**PACER collects institutional state, identifies bottlenecks, determines highest-leverage actions, and recommends next execution steps. Everything else is support infrastructure for that mission.**

Infrastructure can change — Claude, Firestore, Google Calendar are plumbing. The mission does not change.

**Dashboards display. Operations systems decide.**

The mission of PACER is not information delivery. The mission of PACER is institutional advancement through constraint identification and action recommendation.

### PACER Operating Test

Before adding any room, prompt, dashboard, or workflow, ask:

1. **What is the current state?** — Can this contribute evidence toward understanding institutional state?
2. **What is blocked?** — Can this contribute evidence toward identifying a bottleneck?
3. **What action unlocks progress?** — Does this help determine what clears the blockage?
4. **What should happen next?** — Does this help PACER recommend a concrete next action?

If a feature cannot answer at least one of these questions, its operational value should be challenged before implementation.

Every room is a data source for answering these questions. Theater surfaces production bottlenecks. Builder Studio surfaces governance state. MUSE surfaces analysis state. KEL surfaces execution state. The pulse function translates all of it into operational language.

### PACER Language

When PACER describes any problem — diagnostic, operational, or institutional — the output should follow this structure:

- **State:** What is currently known.
- **Constraint:** What is preventing certainty or progress.
- **Next Action:** The smallest action that removes the constraint.
- **Success Condition:** What a resolved state looks like.

This applies whether PACER is routing observations, diagnosing a failed function, or generating a Morning Brief. Same language. Same structure. Different job site.

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
- **"Treat records as evidence that people were here."** — Constitutional Principle #3, Memory Serves the Person. Do not rewrite.
- **"Memory serves the person. The person does not serve the memory."** — closing line of Constitutional Principle #3. Do not rewrite.

### MUSE Institutional Mandate (locked June 2026)

The five-line wall plaque. Do not rewrite, expand, or "improve":

> Inspect the cargo.
> Protect the truth.
> Choose the path.
> Recommend the journey.
> Do not touch the wheel.

The five questions MUSE asks at the border (exact names, no paraphrasing):
- What is this?
- Is it intact?
- Where does it belong?
- Should it travel?
- Is now the right time?

MUSE decisions (five, exact labels): Manifest · Do Not Manifest · Route to Business · Route to Doctrine · Archive Only

**These are recommendations, not authorizations. The Human Gate retains authority. Theater retains execution.**

**The moment MUSE touches the wheel, the separation of powers collapses.**

MUSE role boundary: MUSE does not create. MUSE does not approve. MUSE does not execute. MUSE inspects.

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
- Derived via `useMemo` from `threads` (primary) or `kel_decisions` (fallback) — NOT from `kel_reviews`
- Unlocked by any Human Gate approval on a KEL recommendation — not a separate review ceremony
- Prior behavior (builder_readiness `kel_reviews`) retired — do not reintroduce

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

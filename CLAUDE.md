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

### PACER Institutions

PACER does not have features. It has institutions.

Features are things software has. Institutions are things organizations depend on. Organizations do not replace institutions every six months because a shinier dashboard appeared.

| Institution | Is Not | Is |
|-------------|--------|----|
| Contracts Room | Document feature | Contract Institution |
| ARCHIVIST | Memory store | Historical Institution |
| MUSE | Brainstorming tool | Creative Institution |
| VERA | Analytics layer | Analytical Institution |
| K.E.L. | Automation engine | Execution Institution |
| Human Gate | Approval flow | Authority Institution |
| Wednesday | Chat interface | Communication Institution |
| FleetFlow | Integration | Operations Institution |
| OpsCore | Dashboard | Operations Observation Institution |

When naming, scoping, or describing any component of PACER, ask: is this a feature or an institution? If it is a feature, it describes what the software does. If it is an institution, it describes what the organization depends on. Build accordingly.

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

## PACER Foundational Protocols

These are constitutional rules. Not code. Not UI. Not agents. Every room, workflow, and future feature must respect them.

**The constitution does not constrain intelligence. It constrains authority.**

Intelligence — reasoning, exploration, summarization, critique — does not require authorization. Execution does. Authority begins only when knowledge crosses into operation. Each agent holds jurisdiction over exactly one domain. No single agent possesses the authority to complete the entire chain from evidence to execution. This is not a limitation; it is the separation of powers that makes mistakes detectable and outcomes auditable.

### Human Gate Protocol

No consequential action without human authorization.

PACER recommends. Humans decide. Systems execute after approval. This sequence is inviolable.

### Institutional Intake Protocol

Every artifact entering PACER follows five stages:

1. **Evidence** — Preserve the original exactly as received. The original is never altered.
2. **Interpretation** — PACER may analyze, summarize, classify, and extract information. All extracted information is proposed, not confirmed.
3. **Verification** — Human Gate confirms or corrects the interpretation before it becomes institutional fact.
4. **Institutionalization** — Approved knowledge becomes institutional memory.
5. **Operational Distribution** — Approved information is delivered to FleetFlow or other connected systems.

Three invariants hold across every stage:
- PACER never overwrites an original document.
- PACER never silently changes operational systems.
- Every extraction, verification, and transfer leaves an auditable record.

Evidence, interpretation, and operational data are never the same thing. They are three separate states separated by human authorization.

**Evidence doesn't evolve. Institutional understanding does.**

PACER preserves what arrived and improves how the institution comprehends it. These are separate activities and must remain so.

### Wednesday Protocol

Wednesday is PACER's conversational interface protocol, not an agent. Wednesday introduces the work of the institutional agents but does not replace or duplicate their responsibilities.

**Every PACER session follows the institutional learning cycle:**

**Orientation → Situational Awareness → Historical Context → Recommendation → Human Gate → Execution → Reflection**

- **Orientation** — Establish who the user is, their role, and their current mission.
- **Situational Awareness** — Surface what is happening: signals, alerts, deadlines, operational health.
- **Historical Context** — Recall what is relevant: prior decisions, unfinished work, institutional memory.
- **Recommendation** — Offer a course of action supported by evidence. Not orders.
- **Human Gate** — Wait for authorization. Nothing consequential proceeds without it.
- **Execution** — Act only on what has been approved.
- **Reflection** — Record what was learned. Update institutional memory.

**Every room must answer three questions before expecting user action:**

1. What is this?
2. Why does it exist?
3. What should I do next?

**Wednesday exists to reduce uncertainty before increasing capability.**

She does not begin by asking people to do something. She first orients. Purpose before action. Context before request.

**Protocol is constitutional. Voice is empirical.**

The architecture above is canonized. Do not alter the seven-stage cycle, the three-question framework, or the reducing-uncertainty principle. These are design rules, not implementation notes.

The following are held until after the first external session:
- Exact greetings and opening lines
- Conversational tone and pacing
- Whether Wednesday speaks in two sentences or five
- Whether she offers choices or simply orients
- Whether she remembers where the user left off
- Humor, personality, and all example scripts

Wednesday is not code yet. These elements will be shaped by what real users reveal — not by what we predict they need.

**Wednesday's position in the stack:**

| Layer | Role |
|-------|------|
| PACER Speech Module | Ears and mouth — voice input and voice output |
| Wednesday Protocol | Conversation grammar — governs how sessions unfold |
| PACER Orchestrator | Routes requests to agents; assembles and sequences responses |
| Agents (ARCHIVIST, MUSE, VERA, K.E.L., OpsCore) | Specialized reasoning — each stays in its lane |

Wednesday sits between the user and the agents' work. Wednesday governs the sequence. The Orchestrator decides which agents participate and assembles what they return. The agents reason. Wednesday does not assemble. Wednesday does not reason.

**Wednesday never owns knowledge. Wednesday reveals institutional knowledge at the appropriate time.**

Wednesday is not a memory store or a reasoning engine. She is the protocol that makes PACER's capabilities understandable to humans. She knows when to introduce information, not what to believe.

If a user asks PACER why it presents information in a particular order, the answer is: "I follow the Wednesday Protocol."

### Constitutional Review

Every significant feature, room, workflow, and agent must answer six questions before it is considered constitutionally complete. This is not a code review. It is a constitutional review.

**Evidence** — What is the original source of truth?
If the answer is "the AI generated it," this is interpretation, not evidence. Interpretation requires verification before it becomes institutional fact.

**Understanding** — How does Wednesday reduce uncertainty before asking for action?
If the room immediately asks the user to act without orientation, Wednesday has been bypassed. The three-question framework (What is this? Why does it exist? What should I do next?) must be answerable within the first 30 seconds.

**Authority** — What event crosses the Human Gate?
If operational state changes without an authorization event, the architecture has been violated. Every consequential action must have a Human Gate crossing on record.

**Jurisdiction** — Which agent owns this responsibility?
If two agents can both legitimately perform the same task, the design needs refinement. Overlapping jurisdiction is a constitutional defect, not a feature.

**Auditability** — Can someone reconstruct this decision six months from now?
If not, the workflow is not constitutionally complete. Evidence, interpretation, verification, and authorization must all leave a record.

**Evolution** — What is allowed to improve, and what must remain invariant?
Name both explicitly before shipping. Capabilities may evolve. Constitutional invariants may not. The distinction between the two is what separates a system that can improve from one that drifts.

---



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

## PACER Governance Rule — Lifecycle Authority

Operational lifecycle and Creative lifecycle are separate systems. Do not merge them.

**Operational lifecycle** tracks custody, routing, publication state, and institutional ownership.
Observation → Approved → Packaged → Production → Published → Archived
Implementation: `src/lib/pipelineStage.js` (canonical mapping) + `src/components/PipelinePill.jsx` (canonical display). Answers: **"Where is this artifact?"**

**Creative lifecycle** tracks maturity, refinement, narrative development, and readiness — this is the canonized PACER Object Lifecycle above (Observed → Shaping → Structured → Premiere Ready → Opening Night → Published Memory). Answers: **"How developed is this artifact?"**

These questions must remain independent. A field answering both becomes a field that answers neither.

All new artifact types must:
1. Map to the shared operational lifecycle through `pipelineStage.js`.
2. Use `PipelinePill.jsx` for operational state display.
3. Never create room-specific status badges.
4. Never redefine operational stages locally.
5. Preserve doctrine-defined creative lifecycle systems where they already exist.

---

## Canonical Entity Resolution (Constitutional Subsystem)

**Status: Locked. No implementation may proceed until this section is read and the pre-implementation stress test is complete.**

> "PACER may suggest identity. Only an auditable resolution may establish it."

### Constitutional Objects

Three objects. Three distinct jurisdictions. They must never be merged into one.

**CanonicalEntity** — the legal or real-world subject. Represents the entity, not any document's language.
```
entityId
entityType
canonicalName
identifiers[]
attributes[]
status
createdFromResolutionId
```

**EntityMention** — exactly what appeared in a source. Immutable after creation. Never normalized away.
```
mentionId
displayedText       // exactly as it appeared in the document — never altered
normalizedText      // lowercase/cleaned form for matching — separate field
sourceInstitution
sourceType
sourceId
sourceFieldIds[]
documentLocation
extractedAttributes[]
```

**IdentityAssertion** — the claim that a mention refers to a canonical entity.
```
assertionId
canonicalEntityId
mentionId
assertionType
confidence
reasoning
evidence[]
status              // proposed | verified | rejected | deferred
proposedBy
verifiedBy
verifiedAt
supersedesAssertionId
```

**RelationshipAssertion** — a sourced claim that two canonical entities are related.
```
relationshipId
subjectEntityId
predicate
objectEntityId
sourceLineage[]
classification      // see required values below
confidence
validFrom
validTo
status
reasoning
verification
```

Relationship `classification` values — required, not collapsible into a single category:
- `documented_fact`
- `party_allegation`
- `disputed_assertion`
- `pacer_inference`
- `contradiction`
- `unknown`

The graph must never render these as visually identical lines.

### Eight Governing Rules

1. **Source mentions are immutable.** PACER may interpret them, but never replace or normalize away the original language. A document that says "JPG Ventures" must always remain a document that says "JPG Ventures."

2. **Extraction is not identity.** Finding two similar names does not establish that they refer to the same entity. No extraction pipeline may produce an IdentityAssertion.

3. **Automated matching produces proposals only.** PACER may rank candidates using names, addresses, officers, registration numbers, dates, roles, and document context. It cannot silently merge them.

4. **Every merge requires a recorded assertion.** The record must show who approved it, when, why, and what evidence was considered. No assertion without an authorizer.

5. **"Not the same entity" is a durable finding.** Rejected matches must be preserved as IdentityAssertion records with `status: 'rejected'`. PACER may not re-propose a rejected match without new evidence. Deleting rejection records is a constitutional violation.

6. **A merge must be reversible without destroying history.** If later evidence shows two entities were incorrectly merged, PACER splits the active representation while retaining the original assertion and issuing a superseding correction. The original decision is never erased.

7. **Confidence and verification are different dimensions.** A machine can be 98% confident and still unverified. A human can verify an identity while documenting residual uncertainty. These are not the same thing. UI must not imply otherwise.

8. **Relationships attach to assertions and sources — not merely nodes.** Every rendered graph edge must be reconstructable from one or more sourced relationship assertions. An edge that cannot be reconstructed must not be rendered.

### Five Human Gate Decisions

Before any resolution is presented for approval, the interface must answer four questions:
- What two or more mentions might be the same?
- Why does PACER think they match?
- What evidence supports or weakens the match?
- What changes downstream if the merge is approved?

The five available resolution decisions:

| Decision | Produces | PACER may re-propose? |
|----------|----------|-----------------------|
| **Same entity** | IdentityAssertion (verified) | — |
| **Different entities** | IdentityAssertion (rejected) — durable | Only with new evidence |
| **Related, but not identical** | RelationshipAssertion; no merge | Subject to review |
| **Insufficient evidence** | IdentityAssertion (deferred) | Yes, when new sources arrive |
| **Defer pending another source** | No assertion recorded | Yes, when specified condition is met |

"Related, but not identical" is a first-class finding. A parent company and subsidiary, a person and their sole proprietorship, or two similarly named entities in different jurisdictions must not be collapsed because their records overlap.

### Durable Findings

All four finding states are permanent and queryable. None may be silently discarded.

- **Positive** — `IdentityAssertion.status = 'verified'`; canonical entity absorbs the mention
- **Negative** — `IdentityAssertion.status = 'rejected'`; never deleted; blocks re-proposal without new evidence
- **Deferred** — `IdentityAssertion.status = 'deferred'`; awaiting additional sources
- **Unresolved** — `EntityMention` with no associated `IdentityAssertion`; a valid permanent state, not an error

### Supersession and Reversible Splitting

When a prior merge is found to be incorrect:
1. The original IdentityAssertion is **not deleted**. `status` → `superseded`.
2. A new IdentityAssertion records the correction with `supersedesAssertionId` pointing to the prior record.
3. If the canonical entity must split, both resulting entities carry the history of the merge and the correction.
4. All downstream RelationshipAssertions that depended on the merged identity are flagged for human review.

The audit record must always be able to answer: what did PACER believe, when did it change, and why?

### Visual Graph Contract

The graph is a projection of current verified assertion state — not a database of truth.

Every rendered edge must expose on demand:
- The exact relationship claim
- Its classification and verification state
- The documents and fields that support it
- The identity decisions used to resolve both endpoints
- Conflicting evidence
- Full revision history

Clicking any node or edge must reconstruct the complete source and identity lineage. An edge that cannot be reconstructed must not be rendered.

### Wednesday's Constitutional Language in This Subsystem

Wednesday may speak PACER's understanding. She cannot establish identity, silently merge entities, or convert an inference into verified fact.

Required language patterns, by assertion state:

| State | Wednesday must say |
|-------|-------------------|
| Proposal | "PACER proposes these may be the same entity." |
| Verified | "A human verified this identity on [date]." |
| Rejected | "This proposed match was rejected as different entities." |
| Deferred / Insufficient | "The available evidence remains insufficient." |
| Relationship | "This relationship is [documented / alleged / disputed / inferred]." |

Voice, UI, automation, and confidence scores cannot expand authority. A 98% machine confidence displayed prominently in the UI is still a proposal. Wednesday's enthusiasm for a match does not change its constitutional status.

> Wednesday may speak PACER's understanding. Evidence establishes the proposal. The Human Gate establishes authority. The audit record preserves the truth of how that authority was reached.

### Pre-Implementation Stress Test (Required)

Before any Firestore schema is designed for entity resolution, conduct a formal investigation of the existing commitment-lineage architecture against these five questions:

1. Can a single record aggregate evidence from **multiple sourceIds**?
2. Can PACER record **negative evidence** ("this document ruled this out") as a durable finding?
3. Is **supersession** — overriding a prior assertion while preserving full history — supported?
4. Can **entity splits** be represented without losing the original merge record?
5. Can **unresolved mentions** — mentions with no IdentityAssertion — be represented as a valid permanent state, not a gap?

The legitimate output of this investigation is: **Which constitutional capabilities can be inherited from the existing commitment-lineage architecture, and which require a dedicated entity-resolution foundation?**

No Firestore schema. No UI. No new collection. Not until the stress test produces a documented answer.

---

## FleetFlow Teaching Bridge (Constitutional Subsystem)

**Status: Locked. No implementation may proceed until this section is read.**

> "FleetFlow supplies lived operational evidence. PACER proposes lessons from it. The Human Gate determines what becomes institutional knowledge. Wednesday gives that verified knowledge a voice."

### The Problem This Solves

FleetFlow is where real-world operational knowledge is produced: what happened during a job, what was promised versus delivered, photos and documents and timestamps, delays and damages and disputes, what the field crew observed, what management verified, how the matter was ultimately resolved. Twenty years of moving industry experience lives there — and eventually the experience of every participating company and crew.

PACER can learn from that evidence. But learning from operational records is not the same as reading them. Private job files belong to the company and crew that created them. Customer data belongs to the customer. The fact that useful patterns exist in operational history does not authorize their unrestricted use as AI training material.

The teaching bridge governs how operational knowledge becomes institutional intelligence — without turning anybody's private job file into uncontrolled data.

### Governing Flowchart

```
FleetFlow operations
        ↓
Approved teaching record
        ↓
Privacy and permission gate
        ↓
Immutable source lineage
        ↓
PACER proposed understanding
        ↓
Human verification (Human Gate)
        ↓
PACER institutional knowledge
        ↓
Wednesday explains it
```

No step may be skipped. Each arrow represents a governed transition, not a data pipe.

### What FleetFlow Operational Records Contain

The following categories exist in FleetFlow operational data. Each requires distinct handling at the privacy gate:

- **Job facts** — dates, addresses, services performed, items moved. Generally safe for pattern learning when company-identifying information is removed.
- **Promises and delivery records** — contracts, estimates, signed authorizations, delivery receipts. Contain PII and should be stripped before learning.
- **Photos and documents** — field evidence. May contain faces, license plates, private property. Require explicit authorization for any PACER use.
- **Messages and communications** — between crew, management, and customers. Highest sensitivity. May not enter PACER without per-record authorization.
- **Delay and damage records** — operational facts with legal implications. May represent allegations, not verified outcomes. Must be classified accordingly.
- **Dispute records** — contain allegations from multiple parties. PACER must record the classification (allegation, finding, settlement) — never collapse these into a single "truth."
- **Payment and responsibility records** — contain PII and financial data. Strip before any PACER use.
- **Resolution records** — how a matter was ultimately resolved. Most valuable for pattern learning; still requires source lineage and authorization.

### Teaching Record Schema

Every record crossing the bridge must carry:

```
teachingRecordId
sourceInstitution           // always 'fleetflow'
sourceCompanyId             // FleetFlow tenant — never overridden or inferred
sourceJobId                 // exact FleetFlow job reference
sourceFields[]              // exact field names used — immutable after creation
authorizedBy                // who approved this record for PACER use
authorizedAt
privacyGateResult           // 'cleared' | 'requires_redaction' | 'blocked'
redactedFields[]            // fields removed or anonymized before PACER sees it
contentClassification       // 'observation' | 'allegation' | 'decision' | 'verified_outcome'
lessonProposed              // PACER's extracted proposed understanding — not yet knowledge
lessonVerifiedBy            // null until Human Gate acts
lessonVerifiedAt
lessonStatus                // 'proposed' | 'verified' | 'rejected' | 'deferred'
supersededById              // if a later record corrects this one
auditTrail[]                // append-only; every transition recorded
```

`contentClassification` is mandatory and non-collapsible. An allegation must never be stored as a verified outcome. A settlement must never be stored as a factual finding. PACER proposes the classification; the Human Gate confirms it.

### Four Invariants

These hold across every teaching record, without exception:

1. **FleetFlow operational records are never altered by PACER.** The bridge is read-only toward FleetFlow. No write, no feedback loop, no update from PACER back to the source record.

2. **The connection is one-way by default.** FleetFlow data may enter PACER only through an explicitly approved teaching record. PACER knowledge does not flow into FleetFlow.

3. **The connection is tenant-isolated.** A teaching record from Company A cannot contribute to PACER knowledge that influences Company B. Each company's operational evidence stays within that company's institutional boundary.

4. **The connection is reversible.** A teaching record may be revoked. When revoked, the proposed lesson is archived, not deleted. Any institutional knowledge derived from it is flagged for Human Gate review. PACER does not silently retain what was revoked.

### Privacy Gate Requirements

Before any operational content crosses the bridge, the privacy gate must answer five questions:

1. **Who owns this data?** — Customer data, employee data, and company data have different owners. All three require separate authorization.
2. **What consent exists?** — Is use of this record covered by terms of service, explicit consent, or contractual authorization?
3. **What must be removed?** — PII, financial identifiers, contact information, and faces in images must be identified and documented before any teaching record is created.
4. **What is the classification?** — Is this record an observation, an allegation, a decision, or a verified outcome? The answer determines what PACER is permitted to learn.
5. **What is PACER permitted to learn?** — The authorized lesson must be stated before the record crosses. PACER may not extract lessons beyond what the authorization covers.

Failure to answer any of these five questions means the record does not cross. The privacy gate is not a warning screen. It is a hard stop.

### Wednesday's Role in This Subsystem

Wednesday may explain what PACER has learned from FleetFlow experience. She may not describe which company or job produced the lesson, and she may not imply that a proposed lesson is verified institutional knowledge before the Human Gate has acted.

Required language patterns for this subsystem:

| State | Wednesday must say |
|-------|-------------------|
| Proposed lesson | "PACER proposes a pattern from operational experience." |
| Verified lesson | "This has been verified as institutional knowledge." |
| Rejected lesson | "This proposed pattern was rejected and is not institutional knowledge." |
| Revoked record | "The source record for this lesson has been revoked and is under review." |
| Privacy blocked | "This record requires additional authorization before PACER may learn from it." |

Wednesday may not name the source company, source job, crew members, or customers in any description of a teaching record or derived lesson — regardless of whether that information is technically accessible.

### Pre-Implementation Requirements

Before any Firestore schema, UI, or FleetFlow API connection is designed for the teaching bridge, conduct a formal review of three questions:

1. **Authorization model** — What is the exact mechanism by which a FleetFlow company authorizes a teaching record? Who within the company may grant authorization? Is authorization per-record, per-job, or per-category?
2. **Tenant isolation** — How does the schema enforce that Company A's teaching records cannot influence Company B's PACER knowledge, even when both companies are PACER users?
3. **Revocation propagation** — When a teaching record is revoked, what is the exact sequence of state changes? Which downstream records must be flagged? Who is notified?

No Firestore schema. No UI. No FleetFlow API call. Not until these three questions are formally answered.

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

## AI Provider Rule

PACER is the system.

PACER's agents (MUSE, VERA, K.E.L., ARCHIVIST, and future institutional roles) are the resident-facing identities of the platform.

External AI providers are infrastructure dependencies, not system identities.

Claude, OpenAI, Gemini, or any future model may provide intelligence, reasoning, generation, classification, or analysis services, but they do not represent themselves directly to the resident.

The resident interacts with PACER.

PACER may use external intelligence providers. External intelligence providers are not PACER.

System prompts, agent prompts, user-facing copy, recommendations, observations, reviews, and doctrine outputs should always present through the institutional identity of the responsible PACER agent.

**Correct:**
- "K.E.L. recommends…"
- "VERA observed…"
- "MUSE suggests…"
- "ARCHIVIST recorded…"

**Incorrect:**
- "Claude recommends…"
- "Anthropic suggests…"
- "Gemini believes…"

AI providers are replaceable infrastructure.

Institutional memory, doctrine, observations, evidence, commands, reviews, and governance belong to PACER.

**Rule:** PACER may use an intelligence provider, but the intelligence provider is not PACER.

---

## What Claude Code Should Not Do

- Rewrite doctrine text
- Alter "Show me one job"
- Add PACER architecture language to FleetFlow-facing materials
- Create a second theme engine in any campus room
- Merge inline and external theme scripts into one "universal" version
- Rename any system listed in the Named Systems table
- Improve the raccoon metaphor
- Create a room-specific status badge instead of using `PipelinePill.jsx`
- Redefine operational lifecycle stages locally, or merge operational and creative lifecycle into one field

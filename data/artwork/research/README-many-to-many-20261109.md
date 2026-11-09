# Ad Orientem Sacred Art — owner-decision many-to-many reconciliation

**Status:** Research-only editorial crosswalk, 9 November 2026. **Not for import, display, release, licensing, deployment or assignment replacement.**

## Why this exists

Claude's 640-target map is predominantly one principal artwork and one alternative per destination. It does not preserve the owner's original multiple accepted options, contextual reuses, placement-specific approvals, or scope restrictions. This batch reconstructs those relationships **without changing the approved current artwork**.

### Source layers

| Layer | Records | Meaning |
| --- | ---: | --- |
| Prayer-slot historical current paintings | 248 | Current editorial primary, not automatic release |
| Prayer-slot owner-accepted alternatives | 507 | Approved as an option for a specific slot/scope; NOT auto-display |
| Earlier contextual reuses | 84 | Prior relationship evidence; no new date/slot approval |
| Original owner *keep* references | 11 | Preserve earlier kept relationship |
| Known misrouted option notes | 2 | Evidence only, never treat as HERO-03 approval |
| October subject selections | 101 | Approved subject links, not automatic Calendar/Prayer assignments |
| Historical 2026 date selections | 53 | Date-specific selection evidence, subject to later owner overrides |
| Claude v3 recommended primary relationships | 443 | Uncertified suggestions/preservation overlay |
| Claude v3 research alternative relationships | 140 | Uncertified alternatives |
| **Relationship records** | **1,589** | Multiple artworks/destination and multiple destinations/artwork |

Other context: 640 distinct Claude targets (365 Calendar, 275 Prayer); 267 master Prayer slots; 235 historical subjects, of which 134 remained research-only; 103 rejected original artwork IDs from the 15 October blocklist.

The authoritative files are the historical 267-slot Prayer master in `main`, historical 2026 date selections in `main`, the 12 October subject ledger and 15 October rejected-original ledger on `platform/885-sacred-art-candidates`, and the uploaded editorial-only Claude v3 mapping. Their references and exact blob SHAs are preserved in the index.

### Read the index first

`data/artwork/research-sacred-art-many-to-many-editorial-20261109.v1.json` points to five readable shards:

1. `data/artwork/research/m2m-prayer-852-20261109.v1.json`
2. `data/artwork/research/m2m-calendar-subject-154-20261109.v1.json`
3. `data/artwork/research/m2m-claude-583-20261109.v1.json`
4. `data/artwork/research/m2m-destinations-640-20261109.v1.json`
5. `data/artwork/research/m2m-qa-evidence-20261109.v1.json`

Every edge has an independent ID, target namespace/ID, artwork reference (or a documented missing ID), relationship type, authority, scope or rationale, display-priority boundary, photo-release boundary, and provenance pointer. The same physical artwork can recur; aliases have **not** been merged without exact-object proof.

## Blocking conflicts and relevance audit

- **Four protected Prayer placements refer to one globally rejected original**: Albert Bouts, *The Annunciation*, Cleveland 1942.635, object ID `cma-122338`, score **2** in the effective 15 October blocklist. Placements: `STG-pray.angelus-04`, `-05`, `-06`, `STG-pray.rosary-02`. The 1 November slot master nevertheless retains/accepts this work. Hold the exact artwork pending a narrow chronological owner-decision check: do NOT silently rescind either decision.
- **114 new Claude proposals have not been independently iconographically certified**, regardless of Claude's confidence label. The *actual depicted episode*, not title keywords, must establish direct-scene claims. For example, paralytic healing at Bethesda versus Capernaum, Jericho versus John 9 blind healing, and feeding-miracle pericopes need identification.
- **46 protected Claude selections still lack a canonical artwork ID**; preserve the selected work and identity proof.
- **23 title/attribution discrepancies** exist between the 267-slot master and Claude. Many are likely display-name changes (including Station numbers, institutional artist formatting), not proof of a changed physical artwork. Reconcile by accession or exact image before treating these as replacement decisions.
- **Five Prado-associated photographic sources** remain held under the user's sourcing policy; the painting/placement decision and reproduction rights are distinct.
- **Two historical Prayer scope/editorial holds** remain binding.
- **170 Calendar targets remain unmatched** by the selected-pool rule; none should be filled with unrelated saint portraits or simply because another date has the same Gospel.

An earlier automatic audit found 101 Claude Prayer primary recommendations also among the original slot-accepted options. That is concordance of owner-option scope, **not** independent scene/rights or new display authorization.

### Required next editorial verification

1. Reconcile exact canonical physical work identities and approval chronology, prioritising the single Bouts rejection conflict, protected ID gaps, and scope holds.
2. Review each of Claude's 114 new primary proposals against the original painting description, primary catalogue page, depicted persons and events, actual 1962 Proper/Gospel context, and owner's prior ratings. Classify as direct iconography, liturgical subject, Scripture correspondence, theological/typological option, or unsupported.
3. Keep *all* accepted options in the relational index. Assign display priority separately, never force a single-choice gallery relation or automatic rotation. Rosary mystery art remains fixed throughout a decade; fixed Prayer covers remain fixed.
4. Check photography source, licence, attribution, exact bytes and mobile crop **after** art relevance decisions. A public-domain artwork is not automatically a cleared photographic edition.
5. Export an import manifest only from relationships with explicit assignment authority, clear scope, actual-object verification, eligible photograph, and phone QA. **None of these new proposals have that complete gate here.**

No `src/` change, runtime import, publication workflow, Vercel change, merge or deployment is part of this draft.

Check the shards with:

```bash
node tests/sacred-art-many-to-many-research.test.mjs
```

## 9 November source-backed scene adjudication — batch 1

The first targeted verification is in `data/artwork/research/m2m-scene-adjudication-batch1-20261109.v1.json` and is linked from the index. Of ten Calendar relations inspected against published institutional/object records:

- **Five** are documented as a **different Gospel episode** than the date's reading. Ricci *Christ Healing the Blind Man* on 15 and 17 February, and Le Sueur's same-title work on 16 February, depict **John 9** rather than Luke 18 (Jericho). Van Dyck's *Healing of the Paralytic* on 27 September and 1 October depicts **Bethesda, John 5** rather than Matthew 9 (Capernaum).
- **Two** have the **correct Gospel episode supported by catalogue records, but still lack exact photo release gates**: Van Dyck at Bethesda on 27 February (John 5), Le Sueur's blind-from-birth scene on 18 March (John 9). Le Sueur is supported by an object-catalogued engraving **after** the original, so the precise painting object still needs independent confirmation.
- **Three** remain qualified: Aivazovsky's 1888 water-walking scene (Peter detail unverified), Perugino's Ascension painting for the 13 May Vigil (feast anticipation, not the actual John 17:1–11 Gospel), and de Crayer's Lille miraculous catch (museum documents the general scene, not which Gospel account).

**Source/rights caveat:** the National Galleries of Scotland official photograph of Ricci is supplied under a personal/non-commercial use agreement, not a blanket commercial app licence; the Louvre/Lille photographic credits and Commons mirrors must not be read as independent photo-release permission. No image was fetched or released in this PR.

**Historical warning:** the exact rejected Bouts Cleveland object `cma-122338` is still preserved as a later Prayer-slot selection; this conflict is held, not resolved by an assumption that every later import was a deliberate owner's override.

The original 1,589 relationship edges and 507 accepted options remain unchanged. Adjudication is a **separate evidence layer**, not an automatic mutation of the source selections.

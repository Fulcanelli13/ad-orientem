# Prayer Library — acquisition freeze and release reconciliation (10 November 2026)

The goal is **coverage of agreed traditional Catholic prayer use cases**, not an encyclopaedia of every source encountered. **No new prayer acquisitions** without a missing, owner-required work and duplicate/edition checks. This report is a proposed triage, **not approval to release**, and changes no canonical prayer bodies.

Machine-readable complete crosswalk:
[`data/pray/prayer-coverage-freeze-reconciliation-20261110.v1.json`](../../data/pray/prayer-coverage-freeze-reconciliation-20261110.v1.json).

Controlling issue: [#2831](https://github.com/Fulcanelli13/ad-orientem/issues/2831).

## Inventory baseline — different counts, not additive

| Scope | Coverage | What the figure means |
|---|---:|---|
| Canonical Prayer corpus | 48 records | English text present 48/48 (100%); French 47/48 (97.9%); Latin 47/48 (97.9%). Presence is **not** line-by-line translation certification |
| Canonical source URL | 46/48 (95.8%) | Missing on `mass_confiteor` and `adoration_lord_i_am_not_worthy` |
| Original novena programmes | 16 | 72 unique day-body English digital anchors reviewed; **0** original print editions independently certified |
| Historical acquisition master | 97 candidate records | As-of-2026-10-29 status overlay; **not** 97 newly published prayers |
| Ownership foundation | 94 heterogeneous records | Includes canonical records, original novenas, variants, hymns, Communion prayers, etc.; **not** additional independent prayers |
| Staged draft PRs | 9 | All open drafts, none merged; all touch `package.json` and `src/pray/presentation-runtime.js` |
| Proposed acquisition units in drafts | 23 | 14 matched to existing 97-master IDs (60.9%); 9 absent (39.1%); Includes two novena recensions of one devotion |
| Red booklet pointers | 19 records | 11 Communion, 1 Suscipe, 4 historic private prayers, 3 English short-variant comparisons. These overlap other owners and do **not** constitute complete booklet coverage |
| Global unique published prayer texts | **Unknown** | Cannot add work, variant, programme, pointer or draft counts |

## Historic 97-master release snapshot (29 October, not today's certification)

| Status | Rows |
|---|---:|
| Live source-scoped | 5 |
| Released post-B22 | 5 |
| Owned, exact edition not certified | 25 |
| Intent-only, not exact text | 21 |
| Routed to another module | 5 |
| Held: source/rights or variant | 13 |
| Editorially deferred | 19 |
| Excluded | 4 |
| **Total** | **97** |

A historical work's former status is not upgraded merely because a 10 November draft contains a data file or tests. Source text fidelity, translations, exact wording, and working reader still require separate checks. **No owner approval** is inferred from the master: its historical `approved_by_user` values were all false.

## Provisional disposition of 23 staged units

Recommendations require the owner's scope decision before implementation. Neither KEEP nor REVISE authorises merging. DEFER means preserve the draft and findings for now, not delete.

### Keep candidate (requires owner sign-off) — 2

| PR | Proposed unit | Acquisition ID | Basis |
|---|---|---|---|
| [#2815](https://github.com/Fulcanelli13/ad-orientem/pull/2815) | Prayer before Meditation, Study or Spiritual Reading | AO-AQ-078 | P0 ADD; acquisition resolves a historically blocked high-priority work; source/edition/French still need review |
| [#2817](https://github.com/Fulcanelli13/ad-orientem/pull/2817) | August Queen of Heaven / Auguste Reine des cieux | AO-AQ-012 | P1 ALTERNATIVE but specifically published by ICKSP; compare exact ICKSP variant rather than conflate with Cestac wording |

### Check necessity, source fidelity or recension — 9

| PR | Proposed unit | Acquisition ID | Basis |
|---|---|---|---|
| [#2815](https://github.com/Fulcanelli13/ad-orientem/pull/2815) | Prayer after Meditation | Outside 97 master | unregistered but natural companion to P0 before-meditation prayer; check distinct need |
| [#2815](https://github.com/Fulcanelli13/ad-orientem/pull/2815) | Our Lady of Good Studies invocation | AO-AQ-083 | P2 ALTERNATIVE; extremely short invocation, assess value separately |
| [#2815](https://github.com/Fulcanelli13/ad-orientem/pull/2815) | St Thomas Aquinas Prayer before Study | Outside 97 master | unregistered study-work; verify exact Lasance edition and whether it is already available elsewhere |
| [#2821](https://github.com/Fulcanelli13/ad-orientem/pull/2821) | Memorare to the Infant Jesus of Prague | AO-AQ-021 | P2 ALTERNATIVE; ICKSP relevance but check source rights and exact edition |
| [#2821](https://github.com/Fulcanelli13/ad-orientem/pull/2821) | St John Eudes Prayer to the Infant Jesus | AO-AQ-023 | P3 DEFER; ICKSP-published form but lower original priority and attribution claims require care |
| [#2822](https://github.com/Fulcanelli13/ad-orientem/pull/2822) | Short Litany of the Infant Jesus of Prague | AO-AQ-019 | P2 ADD_LATER; draft is editorial reconstruction, not an exact historical/source transcription |
| [#2822](https://github.com/Fulcanelli13/ad-orientem/pull/2822) | Long Litany of the Infant Jesus of Prague | AO-AQ-020 | P2 ALTERNATIVE; distinguish recension; draft editorial reconstruction needs source-fidelity decision |
| [#2823](https://github.com/Fulcanelli13/ad-orientem/pull/2823) | Infant Jesus of Prague nine-day novena, first recension | AO-AQ-017 | P2 ALTERNATIVE; version of one devotional programme, not separately counted as a novel work; editorial day texts |
| [#2823](https://github.com/Fulcanelli13/ad-orientem/pull/2823) | Infant Jesus of Prague nine-day novena, second recension | AO-AQ-018 | P3 DEFER; another version of same programme; drafted daily texts editorial, hymn rubric differs |

### Defer unless a concrete gap is established — 12

| PR | Proposed unit | Acquisition ID | Basis |
|---|---|---|---|
| [#2812](https://github.com/Fulcanelli13/ad-orientem/pull/2812) | Chaplet of Acts of Love (Raccolta 1857 §10) | AO-AQ-037 | P2 ADD_LATER; no established essential/ICKSP/red-booklet gap |
| [#2812](https://github.com/Fulcanelli13/ad-orientem/pull/2812) | Prayers and Petitions (Raccolta 1857 §11) | AO-AQ-038 | P2 ALTERNATIVE; source existence alone is not sufficient |
| [#2812](https://github.com/Fulcanelli13/ad-orientem/pull/2812) | Pietate tua (Raccolta 1857 §12) | AO-AQ-039 | P3 DEFER; original master did not prioritise publication |
| [#2817](https://github.com/Fulcanelli13/ad-orientem/pull/2817) | Ask Only for My Spirit / Ne me demande que mon esprit | Outside 97 master | off-master Cestac congregation text; not shown necessary for ICKSP specified baseline |
| [#2817](https://github.com/Fulcanelli13/ad-orientem/pull/2817) | Thanksgiving to Our Lady / Prière d'action de grâce | Outside 97 master | off-master Cestac text; optional addition, not evidence of required gap |
| [#2817](https://github.com/Fulcanelli13/ad-orientem/pull/2817) | Offering to the Virgin Mary / Prière d'offrande | Outside 97 master | off-master Cestac text; optional addition, not evidence of required gap |
| [#2824](https://github.com/Fulcanelli13/ad-orientem/pull/2824) | St Philomena historical litany (1848) | AO-AQ-032 | P3 DEFER; historic variant not exact ICKSP litany used today; check if actually requested |
| [#2824](https://github.com/Fulcanelli13/ad-orientem/pull/2824) | St Philomena historical novena prayer (1863) | AO-AQ-033 | P3 DEFER; historic witness not exact ICKSP novena; already original defer |
| [#2825](https://github.com/Fulcanelli13/ad-orientem/pull/2825) | St Raphael historical 1904 prayer | Outside 97 master | off-master; existing good-death/angel prayers already have other owners; optional nine-day arrangement is not independent work |
| [#2825](https://github.com/Fulcanelli13/ad-orientem/pull/2825) | St Gabriel historical 1904 prayer | Outside 97 master | off-master; source exists but necessity unestablished |
| [#2829](https://github.com/Fulcanelli13/ad-orientem/pull/2829) | Beati mortui (Raccolta 1910 §428) | Outside 97 master | off-master; Good Death/Dying Companion already exists; different text does not alone establish missing use case |
| [#2829](https://github.com/Fulcanelli13/ad-orientem/pull/2829) | Nos, Jesu, Maria et Joseph bone (§435) | Outside 97 master | off-master; existing Jesus/Mary/Joseph death aspirations serve related use case, not claimed exact-text duplicate |

## Immediate blockers and required next action

1. **Core, not acquisition:** Resolve the one canonical French gap (`marian_consecration_immaculate_heart`) and determine whether a sourced Latin form is appropriate. Do not fabricate Latin simply for 48/48.
2. **Core provenance:** Add or justify source URLs for `mass_confiteor` and `adoration_lord_i_am_not_worthy`. Fix source labels separately from text.
3. **ICKSP/ICRSP actual denominator:** Assemble the precise list of owner-required works from the Institute collections, distinguish reader availability from text ownership, and assess the source-text/rights limitation of editorial rewrites in #2822/#2823.
4. **Red booklet actual denominator:** Compare each required booklet prayer by *work identity*, not simply by 19 existing pointers; preserve legitimate variants and existing Mass/Confession/Communion owners.
5. **Merge discipline:** Do **not** merge nine drafts directly. All edit the same large runtime and package file; select approved units first and integrate to one reviewed head, with source-owner and reader tests.
6. **Closure metrics:** Publish scope-specific denominators and exact numerators for accessible, full, correct-language works. Treat optional/excluded records as intentional choices, not missing prayers. No arbitrary expansion target.
7. **Release:** Only retained source-faithful, legally usable texts with bilingual reader acceptance, passing current-head CI, and user approval may ship via **GitHub Actions/GitHub Pages only**. No Vercel.

## What is *not* claimed

- No global published count, because the inventory lanes have different units and overlap.
- No complete print-original certification, nor a newly verified original-language edition for all entries.
- No complete ICKSP or red-booklet coverage percentage until their owner-defined denominators are reconciled.
- No approval of previously deferred P2/P3 or off-master items.
- No new prayer acquisition or deployment caused by this read-only audit.

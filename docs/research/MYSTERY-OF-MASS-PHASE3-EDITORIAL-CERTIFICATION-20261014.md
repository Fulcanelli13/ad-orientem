# Mystery of the Mass — Phase 3: Editorial and source certification

**14 October 2026 · PR #1193 (draft; research-only) · No live reader changes.**

## Outcome of the first certification batch

The bilingual teaching manuscript now contains **48 individually indexed explanatory topics** (20 retained polished Mass–Bible subjects + 24 section-level explanations + four supplemental topics) under **the same 39 unique source-first Mass owners**. The *eight existing formation lessons* also have **16 source-linked explanatory paragraphs** in both English and French.

**The number 48 is unrelated to the desired 48-card LIVE reader layout.** The source-first 39-unit map is an editorial index; the 48 exposition topics do not alter the established reader architecture, cards or cue registries.

All 48 topics have both languages, source hyperlinks, and explicit conditionality metadata. This is **first-pass source/role coverage, not publication certification**. The [per-item ledger](../../data/learn/research/mystery-mass-phase3-48-unit-editorial-certification-ledger-20261014.v1.json) shows the evidence, source-type caveats, conditionality and blockers for every explanation.

| Verified mechanical gate | Result |
|---|---:|
| English/French explanatory topics present | **48/48** |
| Existing canonical source-first owners covered | **39/39** |
| Explanation bodies source-linked in both languages | **48/48** |
| English/French lesson-level paragraphs | **16/16** across eight lessons |
| Source-to-claim independent primary-document approval | **Not complete** |
| Independent native-French doctrinal/style approval | **Not complete** |
| Approved new user-facing topics | **0/48** |
| New runtime Guide/cue updates | **0** |

### Original-source corrections actually completed

1. **St Joseph in the Canon:** The French translation of the Sacred Congregation of Rites decree [*Novis hisce temporibus*, 13 November 1962](https://www.icrsp.org/Pages/mois-saint-joseph.php?groupe=magistere&nom=decret) was read and checked: the insertion takes effect **8 December 1962**, and applies also when a **special Communicantes** is prescribed. The [new explanatory draft](../../data/learn/research/mystery-mass-24-bilingual-gap-manuscript-20261014.v1.json) now links this text and represents the special-case scope explicitly. This certifies the published French-language decree witness, **not an independently inspected Vatican printed Latin original**.
2. **Requiem Agnus Dei:** Under the relevant 1962 Requiem rubrics, `miserere nobis` becomes `dona eis requiem`, the final invocation `dona eis requiem sempiternam`, and the ordinary breast strokes are omitted. The selected bilingual `MB23` now records these facts explicitly, cites [a published 1962 rubric transcription](https://1962ordo.today/1962-rubrics/), and has a structural conditionality flag.
3. **Requiem peace prayer:** The priest's `Domine Iesu Christe, qui dixisti Apostolis tuis` and the kiss of peace are omitted at the Mass of the Dead. The selected `N05` states this in French and English and has a guard against displaying the standard prayer unconditionally. It is **not** a new public Pax instruction for Missa Cantata.
4. **Confiteor before faithful Communion:** The second Confiteor was not prescribed in the 1962 Ordinary at Communion. Historical/local use must be distinguished from normative requirements. The faithful preparation copy now explicitly states that distinction; the original printed page and local-use implications remain a form-specific review item.
5. **Other 1962 branches:** New explanatory metadata records conditional Psalm 42, seasonal Gloria/Credo, Proper readings/Gradual/Preface, incensation at Offertory, minister roles, consecration/elevation separation, optional Communion of the faithful, distinct dismissal formulas, omitted final blessings and Last Gospel exceptions. **Metadata alone does not implement these branching rules in the application.**

### Four previously underrepresented subtopics recovered

The existing 39-section count obscured four points needing their own *subsection* inside an owner already covered by another explanatory paragraph:

| Original MB research | Canonical owner | Added draft subject |
|---|---|---|
| `MB03` | `AO.CARD.001` | Confiteor and the publican's humility (Luke 18:13) |
| `MB12` | `AO.CARD.013` | Benedictus and Christ's entry into Jerusalem (Matthew 21:9) |
| `N02` | `AO.CARD.010` | Mixing water and wine, 2 Peter 1:4 and Cyprian |
| `MB20` | `AO.CANON.09` | Hebrews 7 and the priesthood of Melchisedech |

These are [four bilingual supporting topics](../../data/learn/research/mystery-mass-four-additional-subtopic-drafts-20261014.v1.json), **not duplicate canonical explanations**. An intro section may illuminate both the `Introibo` and Confiteor; a `Sanctus · Benedictus` section may explain two distinct biblical episodes, and the `Supra quae` segment retains its unified Abel/Abraham/Melchisedech theological owner.

### Where the source certification actually stands

The first manuscript version linked [the translated Ritus servandus](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/) extensively. It is useful for ceremonial and prescribed-action claims, but **not enough on its own to prove every theological or historical sentence**. All **24 new gap explanations** now label this as a **translated rubrical witness**, not a verified source of each phrase of the Latin Canon, a patristic quotation or an ecclesial doctrine.

The editorial ledger distinguishes:

- **P0**: 20 explanations needing urgent form, sacramental or disputed-source verification, including the Canon, Communion and conclusion;
- **P1**: 12 explanations needing correct Propers, Scripture associations, actor or chant synchronization;
- **P2**: 16 further substantive source/edition inspections.

The remaining sources are not to be certified in a single blanket step. For publication, each **selected paragraph** needs an appropriate direct original witness: actual 1962 Latin source for liturgical text, Scripture source with known versification for biblical claims, ecclesiastical doctrinal text for dogmatic teaching, and actual Guéranger/Lanslots passages for historical interpretations. Original scans should be visually collated where needed, but **a 404-page exhaustive Lanslots edition remains out of scope**.

## Outstanding release gates (all still blocking)

| Gate | Required completion |
|---|---|
| **R1 Source precision** | Approve each selected paragraph against a claim-specific primary source, not just a general rubrics link |
| **R2 1962 form compatibility** | Test selected Mass/season/Proper, Requiem, incense, ministers, public/private cues and faithful Communion branching |
| **R3 French/editorial** | Independently review doctrine and idiom for the English/French explanation in each selected subsection and lesson |
| **R4 Printed source witness** | Check selected original Roman Missal/prior-source pages and edition-specific Psalm/Bible numbering |
| **R5 Historical dedup** | Compare selected high-value claims against older Guéranger FRG01–30 and the 422-entry historical corpus |
| **R6 Product integration** | Reuse `learn.mass` and existing Guide owner; do **not** install another Mass reader or change the LIVE 48-card product |
| **R7 Production acceptance** | Full mobile/browser source links, typography, native French, conditional content, tests, merge and Vercel verification |

**[Read-only CI gate](../../tests/mystery-mass-phase3-editorial-evidence.mjs):** verifies all 48 bilingual topics, 39 unique section owners, four non-duplicative subtopics, Requiem and Joseph exceptions, seven blocking release gates and **no publication authorization**.

### Next substantive action

Work through **P0 high-risk claims first**, grouping by doctrinal theme: (a) Consecration, Canon and sacrifices, (b) Communion of priest and faithful, (c) Requiem and special endings. Inspect exact primary texts, correct and link original sources in EN/FR, then send each group through a formal editorial review. After P0, tackle variable proper/seasonal source controls and then less risky prose. When all substantive content is approved, integrate in the existing UX and verify the actual deployment.

**Status:** substantial content coverage, useful first-pass corrections and a strict source ledger; **not a finished releasable module** and not live on Vercel.

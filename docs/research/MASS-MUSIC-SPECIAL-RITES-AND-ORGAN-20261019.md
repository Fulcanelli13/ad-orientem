# Special-rite music scenes & 1958 organ rules — Ultra Master bridge (19 October 2026)

**Status:** Source-indexed, regression-tested **authority layer**, not yet a live Schola ticker for special rites. Complements the 41-sheet Ultra Master musical timeline, 21-step Mass music acceptance scenes (PR #1448), and the independent LIVE Schola clock on `main` (#1450, #1454).

## Canonical ownership

`data/research/mass-special-rite-music-events-20261019.v1.json` indexes **24 musical events across 8 existing rite controllers**:

| Existing native rite | Music events | Source-owned surface |
|---|---:|---|
| Asperges/Vidi aquam | 3 | `ASP-R02` (mutually exclusive ordinary/Paschal), `ASP-R04` dialogue/collect |
| Palm Sunday | 5 | `PALM-R01/02/04/05/06`, including *Hosanna*, *Pueri*, *Gloria laus*, *Ingrediente* |
| Candlemas | 3 | `CND-R03/05/06` distribution/processional chants |
| Rogations | 4 | `ROG-R01–04` antiphon and Litany; 1962 petitions are not doubled |
| Corpus Christi procession | 3 | `CORPUS-R02/04/05` *Pange lingua*, *Tantum ergo*, prayer |
| Holy Thursday after Mass | 3 | `HT-R01/03/05` translation hymn, reservation hymn, altar stripping |
| Requiem Absolution | 2 | `ABS-R03` *Libera me*, optional `ABS-R05` *In paradisum* |
| Generic following procession | 1 **hold**, not a chant | `PROC-R02`: no fabricated feast-specific text |

Every event points to **existing native Latin source fields**. No Latin strings, translations, event clocks or rubrical gestures are duplicated into the registry. A source path must exist or its resolver fails closed. Performer ownership differentiates priest intonation and dialogue from Schola and faithful responses. The registry's status is `EXPECTED_NOT_OBSERVED`, never a claim to have detected live singing.

**Asperges vs Vidi aquam:** requires the actual season formula; the reader already owns the 1962 Passiontide Gloria Patri omission. The music index may **not** show both formulas.

**Lifecycle:** Palm/Candlemas/Rogations return to the **Introit-only** Mass pathway; Sunday Asperges returns to the existing prayers-at-foot pathway. Post-Mass processions are only active on an explicit following-action plan. No universal procession is inferred from a calendar feast.

## Organ authority

`src/mass/reader-rite-music-authority.js` implements a **pure no-side-effects policy** under the Sacred Congregation of Rites, *De musica sacra et sacra liturgia* (3 September 1958):

- **§16(b)**: no accompaniment to the ritual chant of celebrant/ministers or their chanted responses.
- **§27(e), (g)**: no singing/playing during the Consecration; no organ while the final blessing is given.
- **§§80–82**: seasonal instrumental prohibitions including Advent, Lent/Passiontide, September Ember ferias, and Masses/Offices of the Dead; the Septuagesima distinction for other instruments.
- **§83(a)–(c)**: certified holy-day/local exceptions, Gaudete/Laetare/Chrism/early Holy Thursday Gloria organ exceptions, and accompaniment-only permission for singing at Mass/Vespers (not independent organ solos).
- **§84**: the Triduum ban overrides accompaniment permissions until the Easter Vigil Gloria, except the precise Holy Thursday §83(b) allowance.

The function explicitly takes known Mass/season/context flags; it **does not calculate them from date alone** and does not assert the organ is actually sounding. Its possible results are `FORBIDDEN`, `PERMITTED_NOT_OBSERVED`, `ACCOMPANIMENT_ONLY_NOT_OBSERVED` or `REQUIRES_CONTEXT`. Requiem solo playing is not authorized by asserting a generic feast exception.

## Release limits and pending sources

1. This initial set does **not** implement a new Schola panel on special-rite cards. The musical scene **must not borrow** the ordinary Mass cue clock, scrolling, or animation timer. UI integration comes only after actor/translation/phrase ownership is modeled separately.
2. Do **not** auto-display an organ icon, ticker, solo, voluntary or accompaniment merely because a time-window says it is permitted.
3. Good Friday (*Popule meus*, *Ecce lignum*, *Crux fidelis*, etc.) and Easter Vigil (*Lumen Christi*, Exsultet, litany), along with Palm variants and the exact processional antiphon grouping, require separate stage-level crosswalks to the Good Friday/Easter Vigil native readers before runtime.
4. Strict 1962 text provenance and correctness must be rechecked for each applied ceremonial variant. Not all functions represented by external processions have a universally fixed chant.
5. No 279 canonical Sung cue IDs, existing pre-/post-Mass reader paragraphs, LIVE/Simple/Missal identities or source clocks change in this PR.

**Primary sources:** [1958 Instruction](https://adoremus.org/1958/09/instruction-on-sacred-music/), especially §§15, 16, 21, 27 and 80–85; [Latin Mass Society Schola's Guide](https://lms.org.uk/scholas-guide-sung-mass), especially Asperges/Introit transitions. Native published 1962 witnesses are recorded in each existing `reader-*.v1.json` payload; no secondary sources replace their Latin.

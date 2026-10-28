# Ad Orientem — Prayer & Divine Office source inventory B05

**28 October 2026 · Research only · Zero-cost · No runtime, prayer import, production merge, or editorial approve/reject.**

## What became genuinely measurable

| Source | Scope | B05 completed | Critical remaining |
| --- | --- | --- | --- |
| Divinum Officium | 1960 Roman Office among multi-version text corpus | Complete non-truncated Git tree, exact paths + blob SHAs for **3,950 Latin**, **2,010 English**, **1,651 French (`Francais`)**, **6 shared Ordinary** files: **7,617 manifest rows** | Parse text sections, select genuine 1960 Roman witnesses; per-hour 1960 rubrics, EN/FR translation fidelity, completeness, rights |
| Raccolta | 189 historical numbered entries (1866-labelled online mirror) | Title-level provisional triage of **189/189**; 17 directly component-inspected 1866 mirror entries unchanged; 6 **1857** cross-witness structures independently checked | **172** entries still need component-level inspection in 1866 witness; all individual texts require original print collation |
| Sensus outside Novenas | Site-wide prayer-bearing materials, unknown total | **55** further individually enumerated *hierarchical* source-index rows (12 Francis prayers, 3 canticles, 18 Alphonsus works, 3 Montfort works, 18 Guéranger indexes, 1 Fifteen Saturdays practice) | Inventory all embedded prayers, more works, dynamic site archive pagination, remove duplicate source sightings later |
| Sensus dedicated Novenas | 61 entries | B04 status retained: **61/61** form structures, 141 component descriptions | Historical text editions, multilingual verification, material outside Novenas index |
| ICKSP/ICRSP | American/French and further international sources | Prior 25 selected source records and 98 Office-subsection index records preserved | Remaining national indexes, primary source witnesses and parallel drafts |

**Never add these counts together as 'prayers'.** File paths, section headings, source works, Office Hours, historic chaplet components, and actual authored prayer texts are different entities.

## Divinum Officium — snapshot and file manifests

Upstream public source: [DivinumOfficium/divinum-officium](https://github.com/DivinumOfficium/divinum-officium), recursive Git tree `47d2eb2d9441ad688d51648df5540768e6043722`, **not truncated**, contains **40,420 git blob files**, of which **25,394** are under `web/www/horas/`. This is NOT solely Roman 1960.

Immutable source-path TSVs with blob hashes and byte sizes:
- [Latin — 3,950](../../data/pray/divine-office-source-files-latin.b05.tsv)
- [English — 2,010](../../data/pray/divine-office-source-files-english.b05.tsv)
- [Francais — 1,651](../../data/pray/divine-office-source-files-francais.b05.tsv)
- [Shared Ordinarium — 6](../../data/pray/divine-office-source-files-ordinarium.b05.tsv)
- [Per-folder and language-coverage data](../../data/pray/divine-office-file-tree-census.b05.json)

**Base directory file comparison — exact same relative path only:**

| Source category | Latin paths | Same-path EN | Same-path FR | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Sancti | 896 | 453 | 439 | Many unpaired Latin date variants; no completeness assertion |
| Tempora | 643 | 589 | 582 | Variant paths and language inheritance unverified |
| Commune | 66 | 44 | 44 | Some Latin alternate common forms not mirrored |
| Psalterium | 222 | 220 | 196 | French lacks multiple Psalm identifiers (e.g. 247–255); check content/fallback |
| Martyrologium | 367 | 367 | 367 | File counterparts present, not proof contents all translated |
| Regula | 125 | 123 | 0 | French `Regula` directory absent; most Regula not necessarily canonical Office |
| Appendix | 8 | 0 | 6 | Appendix includes prayers outside Office, e.g. Table Blessings, Itinerarium, commendation, Gradual/Penitential Psalms |
| **Core-folder subtotal** | **2,327** | **1,796** | **1,634** | Not a 1960 Office text coverage percentage |

**Corrections to B04 assumptions:** French directory is `Francais`, not `French`; 6 Ordinary templates live at shared `web/www/horas/Ordinarium/`, not under `Latin/Ordinarium/`. The shared `Minor.txt` template handles Terce, Sext, None. The Latin directory includes `CommuneOP`, `CommuneCist`, `TemporaM`, etc. These cannot be pooled into a single 1960 Roman Divine Office corpus without classifying rites/versions. [Upstream repository](https://github.com/DivinumOfficium/divinum-officium) explicitly describes the directory and section format.

## Raccolta — 189-item safe title classification

[Full B05 title triage](../../data/pray/raccolta-189-entry-triage.b05.json) now has a row for each historical number 1–189: source section, original index label, evidence tier, title-based possible type, component review status, print collation, and publication hold.

- 17 entries: component structure read from Sensus **1866-labelled** mirror during B04.
- 55 entries: title suggests a multipart/devotional sequence; **structure NOT read**.
- 49 entries: title suggests an exercise or historical notice; **content NOT read**.
- 12 entries: title suggests Office, hymns, psalms or liturgical references; **content NOT read**.
- 50 entries: title suggests an individual prayer or aspiration; **content NOT read**.
- 6 entries: undetermined from title; **content NOT read**.

These provisional categories are **not source-text classifications**. The mirror intermittently fails direct fetch. Do not promote 172 unread entries merely because index labels now exist.

An independently accessible [1857 St John Wikisource edition](https://en.wikisource.org/wiki/The_Raccolta_(1857)/Index) allowed six [separate edition-witness records](../../data/pray/raccolta-1857-cross-witness.b05.json). It supports seven daily Marian prayers in §84; two alternatives under §77; St Bridget's chaplet §73; Marian Litany §74; and the Mass thanksgivings §4 and Rosary §71. These are NOT evidence that all 1866 variant texts match word-for-word. The unknown §157 and §40 Precious Blood short chaplet inconsistency remain unresolved.

## Sensus outside Novenas

[55 source-index entries](../../data/pray/sensus-extra-collection-index.b05.json):
- [St Francis Works](https://sensusfidelium.com/meditations/works-of-st-francis-of-assisi/) contains twelve separately named prayers and three canticles. Four individual prayer bodies were read; eight links were identified but timed out. Attributions are from an 1848 Cologne compilation's English translation, not yet a verified original manuscript.
- [St Alphonsus index](https://sensusfidelium.com/meditations/st-alphonsus/) lists 18 distinct works/sections; two are explicitly titled Novena or Prayers for the Gifts of the Holy Ghost, many other works embed additional prayers; no full embedded-prayer counts.
- [St Louis de Montfort](https://sensusfidelium.com/meditations/st-louis-de-montfort/) lists three works; *True Devotion* and *Secret of the Rosary* should retain their historical publication context.
- [Dom Guéranger's Liturgical Year](https://sensusfidelium.com/the-liturgical-year-dom-prosper-gueranger/) is indexed by six seasons and twelve months; these overlap in dates, not 18 additional books.
- [Fifteen Saturdays of the Holy Rosary](https://sensusfidelium.com/meditations/the-fifteen-saturdays-of-the-holy-rosary-by-blessed-bartolo-longo/) is a fifteen-week (or fifteen-day) guided practice with the existing fifteen traditional mysteries.

## Remaining inventory gates (no editorial selection yet)

1. Complete 1866 Raccolta direct **component** review of 172 entries, using print originals or exact alternate witnesses where the Sensus mirror is inaccessible. Distinguish historical notices from constituent prayers; verify section #40 and #157.
2. Extract actual prayers and canonical identities from Sensus beyond the 61 dedicated novenas and the 55 new leads; enumerate site archives and paginate automatically through a suitable browser/website archive before claiming completeness.
3. Enumerate more Institute/ICRSP international sources beyond initial 25/98 records, with draft implementation status separate from source intake.
4. Parse the 7,617 enumerated Office source file bodies; filter to 1960 Roman Office and resolve exact 1960 date/hour Proper/Common/Psalterium/Ordinary combinations, Office of Dead and Little Office. Verify source and translation rights by witness.
5. Reconcile all witnessed prayers to live Ad Orientem prayer IDs with historical variants retained; calculate final genuine unique-text counts and coverage.

**B05 has advanced the actual file and hierarchical index census. It has NOT completed site-wide prayer textual verification or authorised anything for Ad Orientem production.**

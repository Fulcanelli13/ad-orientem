# Biblical Theatre × Sacred Art — 44 subject-identity reconciliation

12 October 2026 · **Research crosswalk only. No painting, art placement, crop, licence, biblical identity or public release has been newly approved.**

Canonical owners: [Sacred Art PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887) owns the 44 editorially scoped subject choices and one original per artwork ID; [Biblical Atlas PR #1069](https://github.com/Fulcanelli13/ad-orientem/pull/1069) owns the 181 stable Theatre scene IDs and 151 biblical event IDs.

## Findings

- **44/44** existing selected art subject keys have been reconciled; no image objects or alternative catalogue has been copied.
- **17** are potential episode/sub-episode depictions, still requiring original artwork approval and passage-level curatorial review.
- **26** are associated with a Theatre scene for positive candidate or explicit hold; **18** have no corresponding Theatre scene.
- **3** earlier selections use excluded El Greco and remain blocked (Good Friday, Fourth and Fifth Sorrowful Mysteries). Historical choices are preserved only as past editorial evidence.
- **3** must not be displayed as the cited moment: Easter Resurrection imagery versus John 20's empty tomb (two subjects), and Our Lady of Sorrows' Lamentation versus burial.
- **2** composite artworks carry figures/episodes not directly narrated, and **one** involves disputed identification of Mary Magdalene with Luke's unnamed sinful woman.
- **Pentecost** (Calendar and Rosary) and **Massacre of the Innocents** are genuine gaps in the 181 Theatre scenes, not permission to substitute a different passage.

## Canonical subject coverage by decision class

Each row is a **subject-to-scene editorial association**, never artwork selection or release. `sceneKey` is stable; historical displayed scene indices must not be stored in the final artwork registry.

### Strong candidate subject depictions

| Sacred Art subject | Scene ID | Source passage | Relation and caution |
|---|---|---|---|
| `calendar.christmas` | `biblical:scene:christ:061` | Luke 2:1–20 | **DEPICTS SUBEPISODE REVIEW** — Shepherds' adoration is part of Luke 2:1–20, not a depiction of every moment in the Nativity passage. |
| `calendar.epiphany` | `biblical:scene:christ:063` | Matthew 2:1–12 | **SAME EPISODE REVIEW** — The Magi's adoration is Matthew 2:1–12; exact figures and setting still need art review. |
| `calendar.annunciation` | `biblical:scene:christ:057` | Luke 1:26–38 | **SAME EPISODE REVIEW** — The Annunciation corresponds to Luke 1:26–38; approved art subject does not certify a screenshot crop. |
| `calendar.holy-thursday` | `biblical:scene:christ:119` | Luke 22:14–20 | **SAME EPISODE REVIEW** — Last Supper corresponds to Luke 22:14–20; 151-event reference Luke 22:7–20 covers a broader passage. |
| `calendar.palm-sunday` | `biblical:scene:christ:115` | Matthew 21:1–11 | **SAME EPISODE REVIEW** — Entry into Jerusalem is depicted; separate Synoptic verse boundaries must remain distinct. |
| `calendar.candlemas` | `biblical:scene:christ:064` | Luke 2:22–38 | **SAME EPISODE REVIEW** — Presentation of Jesus in the Temple, Luke 2:22–38. |
| `calendar.holy-saturday` | `biblical:scene:christ:130` | John 19:38–42 | **SAME EPISODE REVIEW** — The Entombment is part of John 19:38–42; depicted details still need verification. |
| `calendar.ascension` | `biblical:scene:christ:137` | Acts 1:6–12 | **SAME EPISODE REVIEW** — The Ascension corresponds to Acts 1:6–12. |
| `calendar.st-john-baptist` | `biblical:scene:christ:094` | Mark 6:17–29 | **SAME EPISODE REVIEW** — The beheading of St John the Baptist is in Mark 6:17–29, although this scene lacks a 151-event match. |
| `rosary.joy1` | `biblical:scene:christ:057` | Luke 1:26–38 | **SAME EPISODE REVIEW** — Same Annunciation event as the Calendar subject; reuse one canonical artwork identity. |
| `rosary.joy3` | `biblical:scene:christ:061` | Luke 2:1–20 | **DEPICTS SUBEPISODE REVIEW** — Shepherds' adoration occurs during Luke's Nativity pericope. |
| `rosary.joy4` | `biblical:scene:christ:064` | Luke 2:22–38 | **SAME EPISODE REVIEW** — The Presentation corresponds to Luke 2:22–38. |
| `rosary.joy5` | `biblical:scene:christ:068` | Luke 2:41–52 | **SAME EPISODE REVIEW** — Christ among the Doctors corresponds to the Finding in the Temple, Luke 2:41–52; do not conflate Nazareth transition. |
| `rosary.sor1` | `biblical:scene:christ:123` | Matthew 26:36–46 | **SAME EPISODE REVIEW** — Agony in the Garden corresponds to Matthew 26:36–46. |
| `rosary.sor2` | `biblical:scene:christ:127` | John 19:1–16 | **DEPICTS SUBEPISODE REVIEW** — Flagellation is within John 19:1–16 but that theatrical scene includes crowning and presentation. |
| `rosary.glo2` | `biblical:scene:christ:137` | Acts 1:6–12 | **SAME EPISODE REVIEW** — Ascension as narrated in Acts 1:6–12. |
| `person.peter` | `biblical:scene:christ:125` | Luke 22:54–62 | **DEPICTS SUBEPISODE REVIEW** — Peter's tears after his denials are part of Luke 22:54–62; painting requires subject confirmation. |

### Artistic or historical identity holds

| Sacred Art subject | Scene ID | Source passage | Relation and caution |
|---|---|---|---|
| `calendar.easter` | `biblical:scene:christ:131` | John 20:1–18 | **DIFFERENT MOMENT HOLD** — Artwork depicts the Resurrection; John 20:1–18 narrates the empty tomb and Mary Magdalene, not a witnessed instant of Resurrection. |
| `calendar.our-lady-sorrows` | `biblical:scene:christ:130` | John 19:38–42 | **DIFFERENT MOMENT HOLD** — Lamentation imagery and John's burial narrative cannot be treated as identical moments. |
| `rosary.joy2` | `biblical:scene:christ:059` | Luke 1:39–56 | **COMPOSITE ICONOGRAPHY HOLD** — Visitation scene includes saints Nicholas and Anthony Abbot in the painting; their presence is not narrated in Luke 1. |
| `rosary.sor3` | `biblical:scene:christ:127` | John 19:1–16 | **COMPOSITE ICONOGRAPHY HOLD** — Crowning with Thorns and Mourning Virgin together are an artistic devotional composite, not one documented John 19 moment. |
| `rosary.glo1` | `biblical:scene:christ:131` | John 20:1–18 | **DIFFERENT MOMENT HOLD** — A depicted Resurrection instant must not silently stand for the empty tomb and Mary Magdalene in John 20. |
| `devotion.confession` | `biblical:scene:christ:088` | Luke 7:36–50 | **HISTORICAL IDENTITY HOLD** — The penitent Magdalene is not securely identified as Luke 7's unnamed sinful woman; do not attribute identity from tradition to narrative evidence. |

### Excluded artist selections

| Sacred Art subject | Scene ID | Source passage | Relation and caution |
|---|---|---|---|
| `calendar.good-friday` | `biblical:scene:christ:128` | Luke 23:26–32 | **EXCLUDED ARTIST HOLD** — The previously selected Carrying the Cross work is by El Greco; no display or automatic replacement. |
| `rosary.sor4` | `biblical:scene:christ:128` | Luke 23:26–32 | **EXCLUDED ARTIST HOLD** — The selected Carrying the Cross work is by El Greco, excluded from shortlisting despite earlier subject choice. |
| `rosary.sor5` | `biblical:scene:christ:129` | John 19:17–30 | **EXCLUDED ARTIST HOLD** — The selected Crucifixion work is by El Greco, excluded from shortlisting despite earlier subject choice. |

### No corresponding scene

| Sacred Art subject | Scene ID | Source passage | Relation and caution |
|---|---|---|---|
| `calendar.pentecost` | — | — | **NO THEATRE SCENE** — Acts 2 Pentecost is in the biblical source chronology but is not among these 181 Theatre scenes; do not invent a scene. |
| `calendar.trinity` | — | — | **NON NARRATIVE SUBJECT** — Trinitarian representation is devotional/doctrinal, not one narrated event. |
| `calendar.corpus-christi` | — | — | **NON NARRATIVE SUBJECT** — The Mass of Saint Gregory is a later devotional/liturgical subject, not a biblical episode. |
| `calendar.sacred-heart` | — | — | **NON NARRATIVE SUBJECT** — Sacred Heart imagery is devotional, not an event depicted within the 181 scenes. |
| `calendar.assumption` | — | — | **NON NARRATIVE SUBJECT** — The Assumption painting is not an explicitly narrated episode in the canonical Gospel/Acts passages. |
| `calendar.immaculate-conception` | — | — | **NON NARRATIVE SUBJECT** — The Immaculate Conception is a doctrinal subject, not the Annunciation. |
| `calendar.holy-rosary` | — | — | **NON NARRATIVE SUBJECT** — Marian Rosary devotion with later saints is not an episode of Scripture. |
| `calendar.saint-joseph` | — | — | **NON NARRATIVE SUBJECT** — A general Holy Family image is not proof of a particular childhood episode. |
| `calendar.holy-innocents` | — | — | **NO THEATRE SCENE** — The Massacre of the Innocents is not a separate scene in this 181-scene selection. |
| `rosary.glo3` | — | — | **NO THEATRE SCENE** — Pentecost is absent from the 181 Theatre scenes, despite appearing in the canonical biblical timeline. |
| `rosary.glo4` | — | — | **NON NARRATIVE SUBJECT** — Assumption is not a depicted event in the canonical Gospel/Acts narrative source. |
| `rosary.glo5` | — | — | **NON NARRATIVE SUBJECT** — Coronation of the Virgin is not narrated as a discrete Gospel/Acts historical episode. |
| `devotion.immaculate-heart` | — | — | **NON NARRATIVE SUBJECT** — Existing painting is iconographically the Immaculate Conception, not a documentary Immaculate Heart event. |
| `devotion.sacred-heart` | — | — | **NON NARRATIVE SUBJECT** — Devotional Sacred Heart painting, no direct 181-scene event. |
| `person.paul` | — | — | **NON NARRATIVE SUBJECT** — Peter-and-Paul paired portrait is not proof of a single specific Acts scene. |
| `person.benedict` | — | — | **NON NARRATIVE SUBJECT** — St Benedict is post-biblical and has no 181-scene historical event. |
| `person.francis-assisi` | — | — | **NON NARRATIVE SUBJECT** — St Francis is post-biblical; his Marian vision is not a biblical event. |
| `person.dominic` | — | — | **NON NARRATIVE SUBJECT** — St Dominic is post-biblical and has no 181-scene event. |

## Binding and release gates

1. The Sacred Art owner resolves a subject key to its existing approved canonical artwork ID; it must never derive an artwork from a title search or manufacture an image copy in the Theatre dataset.
2. A positive relation in this research worklist is **not** an approved exact-episode relation. Its full Scripture boundary, painted figures, anachronistic devotional elements, editorial identity, rights, original SHA and mobile crop each need independent review.
3. The Theatre renderer defaults to **no artwork**. Its existing `approvedBibleSceneArtwork` gate may only receive a separately publication-approved exact-scene association from Sacred Art. No row in this crosswalk meets that status.
4. The source-only regression `tests/biblical-theatre-art-subject-crosswalk.mjs` checks all 44 subjects against the 181-scene source, including missing scenes and held historical claims. Do not replace event keys with numeric position IDs.
5. Before actual integration, rerun tests against the latest Sacred Art branch and the latest Atlas branch, because these pipelines still diverge from main. Do not merge either draft solely on this research inventory.

Original source decision set: [SACRED-ART-CURATOR-REVIEW-20261011](https://github.com/Fulcanelli13/ad-orientem/blob/platform/885-sacred-art-candidates/data/calendar/sacred-art-curator-decisions-20261011.v1.json). Crosswalk source: [machine-readable 44-subject file](https://github.com/Fulcanelli13/ad-orientem/blob/feature/biblical-atlas-current-main-convergence-20261012/data/explore/biblical-theatre-art-subject-crosswalk.v1.json).

# Biblical Theatre × Sacred Art — 44 subject-identity reconciliation

12 October 2026 · **A12 source-reviewed additions. Research only; no artwork, date association, crop, licence, geographic location or release has been approved.**

Canonical owners: [Sacred Art PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887) holds prior 44 subject decisions and original artworks; [Biblical Atlas PR #1069](https://github.com/Fulcanelli13/ad-orientem/pull/1069) owns 151 chronology event keys and the Theatre scenes. The Theatre now contains **183 source-reviewed scenes**: all **181 original scene identities unchanged** plus two append-only sources.

## Resolved gaps and source placement

- **Holy Innocents, scene #181** (`biblical:scene:christ:181`) covers [Matthew 2:16–18](https://bible.usccb.org/bible/matthew/2); it joins canonical 151-event #73, with a stable `biblical:event:bethlehem-additional-003` key. Chapter Incarnation navigates **Flight into Egypt → massacre → return** according to the order of Matthew 2, not a cross-Gospel dated harmony.
- **Pentecost, scene #182** (`biblical:scene:paul:182`) covers [Acts 2:1–41](https://bible.usccb.org/bible/acts/2); it joins 151-event #126 by stable `biblical:passage:acts-2-1-41`. Scene #182 now opens the pre-existing *Apostolic Age* chapter before Saul's conversion, without presenting Pentecost as an event in Paul's life.
- **The original 181-indexed records remain index-for-index stable.** Original chapter IDs remain 14; the two new source records are inserted into chapter scene-order arrays only. Statuses become 67 exact-citation cases, 29 overlaps and 87 without direct match. There are 66 uniquely navigable exact-citation cross-references (previously 64). Source equality is not certification of painted subject, event date or geography.

## Curated painting-subject matching

- All **44** existing subject selections are still represented without copying artwork objects or importing picture files.
- **20** potential episode/sub-episode depicted subjects are candidates for separate art evaluation; **29** subjects now have corresponding Theatre scene IDs, counting those explicitly held.
- **15** other subjects do not correspond to a literal biblical narrative scene (doctrinal images, later saints or broad devotional themes); this is intentional, not a gap in the Theatre.
- The **three El Greco exclusions** remain on hold; earlier user selections are preserved as historic decisions, not released artwork. A painted Resurrection moment ≠ the empty tomb and Mary Magdalene in John 20, and Luke's unnamed sinful woman ≠ an automatically identified Mary Magdalene.
- The selected Sacred Art Pentecost painting and the Holy Innocents painting are **not** approved to render: their relation is `SAME_EPISODE_REVIEW`, while the independent exact-art image gate still requires `APPROVED` subject, rights, high-quality original and crop.

## Every selected subject by editorial classification

These are **subject-to-scene research joins**, with `release:false` for all records. Use the exact stable `sceneKey` and optional uniquely proved canonical `atlasEventKey`, not a zero-based display number.

### Preliminary source-congruent episodes

| Art subject target | Canonical Theatre scene | Scripture | Evaluation |
|---|---|---|---|
| `calendar.christmas` | `biblical:scene:christ:061` | Luke 2:1–20 | **DEPICTS SUBEPISODE REVIEW** — Shepherds' adoration is part of Luke 2:1–20, not a depiction of every moment in the Nativity passage. |
| `calendar.epiphany` | `biblical:scene:christ:063` | Matthew 2:1–12 | **SAME EPISODE REVIEW** — The Magi's adoration is Matthew 2:1–12; exact figures and setting still need art review. |
| `calendar.annunciation` | `biblical:scene:christ:057` | Luke 1:26–38 | **SAME EPISODE REVIEW** — The Annunciation corresponds to Luke 1:26–38; approved art subject does not certify a screenshot crop. |
| `calendar.holy-thursday` | `biblical:scene:christ:119` | Luke 22:14–20 | **SAME EPISODE REVIEW** — Last Supper corresponds to Luke 22:14–20; 151-event reference Luke 22:7–20 covers a broader passage. |
| `calendar.palm-sunday` | `biblical:scene:christ:115` | Matthew 21:1–11 | **SAME EPISODE REVIEW** — Entry into Jerusalem is depicted; separate Synoptic verse boundaries must remain distinct. |
| `calendar.candlemas` | `biblical:scene:christ:064` | Luke 2:22–38 | **SAME EPISODE REVIEW** — Presentation of Jesus in the Temple, Luke 2:22–38. |
| `calendar.holy-saturday` | `biblical:scene:christ:130` | John 19:38–42 | **SAME EPISODE REVIEW** — The Entombment is part of John 19:38–42; depicted details still need verification. |
| `calendar.ascension` | `biblical:scene:christ:137` | Acts 1:6–12 | **SAME EPISODE REVIEW** — The Ascension corresponds to Acts 1:6–12. |
| `calendar.pentecost` | `biblical:scene:paul:182` | Acts 2:1–41 | **SAME EPISODE REVIEW** — The newly added Pentecost scene cites Acts 2:1–41 exactly. The selected Pentecost painting is a subject candidate only; its figures, original quality, rights and crop still require review. |
| `calendar.st-john-baptist` | `biblical:scene:christ:094` | Mark 6:17–29 | **SAME EPISODE REVIEW** — The beheading of St John the Baptist is in Mark 6:17–29, although this scene lacks a 151-event match. |
| `calendar.holy-innocents` | `biblical:scene:christ:181` | Matthew 2:16–18 | **SAME EPISODE REVIEW** — The new Matthew 2:16–18 scene now depicts Herod's massacre as narrated. The selected artwork needs editorial review of its painted episode and figures; no historically precise individual child or location is claimed. |
| `rosary.joy1` | `biblical:scene:christ:057` | Luke 1:26–38 | **SAME EPISODE REVIEW** — Same Annunciation event as the Calendar subject; reuse one canonical artwork identity. |
| `rosary.joy3` | `biblical:scene:christ:061` | Luke 2:1–20 | **DEPICTS SUBEPISODE REVIEW** — Shepherds' adoration occurs during Luke's Nativity pericope. |
| `rosary.joy4` | `biblical:scene:christ:064` | Luke 2:22–38 | **SAME EPISODE REVIEW** — The Presentation corresponds to Luke 2:22–38. |
| `rosary.joy5` | `biblical:scene:christ:068` | Luke 2:41–52 | **SAME EPISODE REVIEW** — Christ among the Doctors corresponds to the Finding in the Temple, Luke 2:41–52; do not conflate Nazareth transition. |
| `rosary.sor1` | `biblical:scene:christ:123` | Matthew 26:36–46 | **SAME EPISODE REVIEW** — Agony in the Garden corresponds to Matthew 26:36–46. |
| `rosary.sor2` | `biblical:scene:christ:127` | John 19:1–16 | **DEPICTS SUBEPISODE REVIEW** — Flagellation is within John 19:1–16 but that theatrical scene includes crowning and presentation. |
| `rosary.glo2` | `biblical:scene:christ:137` | Acts 1:6–12 | **SAME EPISODE REVIEW** — Ascension as narrated in Acts 1:6–12. |
| `rosary.glo3` | `biblical:scene:paul:182` | Acts 2:1–41 | **SAME EPISODE REVIEW** — Shares the same canonical Pentecost subject and artwork original as the Calendar; do not duplicate the painting. All depicted figures and iconography require separate source review. |
| `person.peter` | `biblical:scene:christ:125` | Luke 22:54–62 | **DEPICTS SUBEPISODE REVIEW** — Peter's tears after his denials are part of Luke 22:54–62; painting requires subject confirmation. |

### Image, identity or chronology holds

| Art subject target | Canonical Theatre scene | Scripture | Evaluation |
|---|---|---|---|
| `calendar.easter` | `biblical:scene:christ:131` | John 20:1–18 | **DIFFERENT MOMENT HOLD** — Artwork depicts the Resurrection; John 20:1–18 narrates the empty tomb and Mary Magdalene, not a witnessed instant of Resurrection. |
| `calendar.our-lady-sorrows` | `biblical:scene:christ:130` | John 19:38–42 | **DIFFERENT MOMENT HOLD** — Lamentation imagery and John's burial narrative cannot be treated as identical moments. |
| `rosary.joy2` | `biblical:scene:christ:059` | Luke 1:39–56 | **COMPOSITE ICONOGRAPHY HOLD** — Visitation scene includes saints Nicholas and Anthony Abbot in the painting; their presence is not narrated in Luke 1. |
| `rosary.sor3` | `biblical:scene:christ:127` | John 19:1–16 | **COMPOSITE ICONOGRAPHY HOLD** — Crowning with Thorns and Mourning Virgin together are an artistic devotional composite, not one documented John 19 moment. |
| `rosary.glo1` | `biblical:scene:christ:131` | John 20:1–18 | **DIFFERENT MOMENT HOLD** — A depicted Resurrection instant must not silently stand for the empty tomb and Mary Magdalene in John 20. |
| `devotion.confession` | `biblical:scene:christ:088` | Luke 7:36–50 | **HISTORICAL IDENTITY HOLD** — The penitent Magdalene is not securely identified as Luke 7's unnamed sinful woman; do not attribute identity from tradition to narrative evidence. |

### Excluded historic artist selections

| Art subject target | Canonical Theatre scene | Scripture | Evaluation |
|---|---|---|---|
| `calendar.good-friday` | `biblical:scene:christ:128` | Luke 23:26–32 | **EXCLUDED ARTIST HOLD** — The previously selected Carrying the Cross work is by El Greco; no display or automatic replacement. |
| `rosary.sor4` | `biblical:scene:christ:128` | Luke 23:26–32 | **EXCLUDED ARTIST HOLD** — The selected Carrying the Cross work is by El Greco, excluded from shortlisting despite earlier subject choice. |
| `rosary.sor5` | `biblical:scene:christ:129` | John 19:17–30 | **EXCLUDED ARTIST HOLD** — The selected Crucifixion work is by El Greco, excluded from shortlisting despite earlier subject choice. |

### Non-narrative devotional / biographical subjects

| Art subject target | Canonical Theatre scene | Scripture | Evaluation |
|---|---|---|---|
| `calendar.trinity` | — | — | **NON NARRATIVE SUBJECT** — Trinitarian representation is devotional/doctrinal, not one narrated event. |
| `calendar.corpus-christi` | — | — | **NON NARRATIVE SUBJECT** — The Mass of Saint Gregory is a later devotional/liturgical subject, not a biblical episode. |
| `calendar.sacred-heart` | — | — | **NON NARRATIVE SUBJECT** — Sacred Heart imagery is devotional, not an event depicted within the 181 scenes. |
| `calendar.assumption` | — | — | **NON NARRATIVE SUBJECT** — The Assumption painting is not an explicitly narrated episode in the canonical Gospel/Acts passages. |
| `calendar.immaculate-conception` | — | — | **NON NARRATIVE SUBJECT** — The Immaculate Conception is a doctrinal subject, not the Annunciation. |
| `calendar.holy-rosary` | — | — | **NON NARRATIVE SUBJECT** — Marian Rosary devotion with later saints is not an episode of Scripture. |
| `calendar.saint-joseph` | — | — | **NON NARRATIVE SUBJECT** — A general Holy Family image is not proof of a particular childhood episode. |
| `rosary.glo4` | — | — | **NON NARRATIVE SUBJECT** — Assumption is not a depicted event in the canonical Gospel/Acts narrative source. |
| `rosary.glo5` | — | — | **NON NARRATIVE SUBJECT** — Coronation of the Virgin is not narrated as a discrete Gospel/Acts historical episode. |
| `devotion.immaculate-heart` | — | — | **NON NARRATIVE SUBJECT** — Existing painting is iconographically the Immaculate Conception, not a documentary Immaculate Heart event. |
| `devotion.sacred-heart` | — | — | **NON NARRATIVE SUBJECT** — Devotional Sacred Heart painting, no direct 181-scene event. |
| `person.paul` | — | — | **NON NARRATIVE SUBJECT** — Peter-and-Paul paired portrait is not proof of a single specific Acts scene. |
| `person.benedict` | — | — | **NON NARRATIVE SUBJECT** — St Benedict is post-biblical and has no 181-scene historical event. |
| `person.francis-assisi` | — | — | **NON NARRATIVE SUBJECT** — St Francis is post-biblical; his Marian vision is not a biblical event. |
| `person.dominic` | — | — | **NON NARRATIVE SUBJECT** — St Dominic is post-biblical and has no 181-scene event. |

## Release checks

1. The original source selected-artwork decisions remain in [the Sacred Art registry](https://github.com/Fulcanelli13/ad-orientem/blob/platform/885-sacred-art-candidates/data/calendar/sacred-art-curator-decisions-20261011.v1.json); this Theatre research map stores target IDs only, never images, artist metadata, licence claims or cropped files.
2. **Every** A12 subject relation is `SOURCE_ASSOCIATION_NOT_APPROVED` and `release:false`; even the 20 positive candidate rows cannot independently turn on the default-off canonical artwork gate.
3. The [183-scene source](https://github.com/Fulcanelli13/ad-orientem/blob/feature/biblical-atlas-current-main-convergence-20261012/data/explore/biblical-cinematic-studies-review.v1.json) is independently validated against the unchanged 151-event chronology; run source and phone acceptance for both new 151-event handoffs before contemplating integration.
4. The forthcoming full visual gallery review must approve individual art associations and public-rights/crop evidence before the 181+2 Theatre may display anything.

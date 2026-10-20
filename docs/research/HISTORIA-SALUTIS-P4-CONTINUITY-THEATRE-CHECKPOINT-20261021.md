# Historia Salutis P4 — continuity and theatre research checkpoint

**21 October 2026 · Research only · Work in progress, not editorially approved**

This checkpoint was added to the P3 continuation branch after inspecting the latest records on PR #1345, PR #1310 and PR #1069. It records the source baseline and a resumable queue; it does not certify work that the source records leave open.

## Source records inspected

- P3 continuous-reading proof: `data/research/historia-salutis-v18-continuous-reading-proof.v1.json` (37 movements; exact CPDV coordinates; separate Douay comparison/wording data; publication approval false).
- P3 continuity desk pass: `data/research/historia-salutis-v18-continuity-desk-pass.v1.md` and its JSON companion.
- P3 main spine: `data/research/historia-salutis-v18-main-spine-consolidation.v1.json` (217 original units retained and dispositioned).
- P1 master crosswalk: `data/explore/historia-salutis-p0-master-crosswalk.v1.json` and `data/explore/historia-salutis-p1-person-story-scripture-links.v1.json`.
- Existing theatre source: `data/explore/biblical-cinematic-studies-review.v1.json` on the #1069 research branch.

## Task A — movement review state

The P3 continuity desk document describes source-level opening/closing checks for M01–M19 and explicitly says it is not a start-to-end oral reading. The 37-movement proof supplies proposed CPDV verse spans for every movement. For M20–M37, the proof contains no movement-level `literaryDeskPass` record. Therefore those exact spans are a starting citation set, not evidence that the requested full seam review, Douay comparison, omission-sufficiency check, parallel-account treatment or source-matrix reconciliation has been completed.

| Movement | Working title | Recorded literary desk state | Proposed Scripture references in the proof |
|---|---|---|| HS-M20 | The Forerunner and first disciples | NO movement-level desk-pass record | Matthew 3:1–6; Matthew 3:11–17; Matthew 4:1–11; Mark 1:14–15; John 1:35–51 |
| HS-M21 | The Kingdom in Christ's teaching and signs | NO movement-level desk-pass record | Matthew 5:1–12; Matthew 6:9–15; Mark 2:1–12 |
| HS-M22 | Christ the Bread of Life | NO movement-level desk-pass record | John 6:1–15; John 6:26–35; John 6:47–59 |
| HS-M23 | Peter's confession and the Transfiguration | NO movement-level desk-pass record | Matthew 16:13–28; Matthew 17:1–9 |
| HS-M24 | The approach to Jerusalem | NO movement-level desk-pass record | John 11:1–7; John 11:14–17; John 11:20–27; John 11:32–35; John 11:38–44; John 11:45–53 |
| HS-M25 | The King's entry into Jerusalem | NO movement-level desk-pass record | Matthew 21:1–11 |
| HS-M26 | The Last Supper and Christ's final teaching | NO movement-level desk-pass record | Luke 22:7–20; John 14:16–17 |
| HS-M27 | Gethsemane, betrayal and trial | NO movement-level desk-pass record | Matthew 26:36–46; Matthew 26:47–56; Matthew 26:57–75; Matthew 27:1–2; Matthew 27:11–26; John 19:1–16 |
| HS-M28 | The sacrifice on Calvary | NO movement-level desk-pass record | John 19:17–30; John 19:38–42 |
| HS-M29 | The risen Lord and his witnesses | NO movement-level desk-pass record | John 20:1–3; John 20:6–9; John 20:11–18; John 20:19–29; Luke 24:13–35 |
| HS-M30 | The Ascension and promised mission | NO movement-level desk-pass record | Acts 1:3–5; Acts 1:6–12 |
| HS-M31 | Pentecost and the first Church | NO movement-level desk-pass record | Acts 2:1–8; Acts 2:11–18; Acts 2:21; Acts 2:37–41; Acts 2:42–47; Acts 7:51–53; Acts 7:54–59 |
| HS-M32 | Saul and the Gospel to the Gentiles | NO movement-level desk-pass record | Acts 9:1–11; Acts 9:17–22; Acts 10:1–6; Acts 10:9–16; Acts 10:19–20; Acts 10:24; Acts 10:28–29; Acts 10:33–48 |
| HS-M33 | Antioch, apostolic missions and the Council | NO movement-level desk-pass record | Acts 11:19–26; Acts 13:1–5; Acts 15:1–2; Acts 15:5–11; Acts 15:13–20; Acts 15:22–29 |
| HS-M34 | The Gospel proclaimed in Rome | NO movement-level desk-pass record | Acts 19:21; Acts 28:16; Acts 28:23–31 |
| HS-M35 | Christ and the Lamb in heavenly vision | NO movement-level desk-pass record | Revelation 4:1–11; Revelation 5:1–14 |
| HS-M36 | The final conflict and judgment | NO movement-level desk-pass record | Revelation 12:1–17; Revelation 19:11–21; Revelation 20:1–15 |
| HS-M37 | The New Creation | NO movement-level desk-pass record | Revelation 21:1–7; Revelation 22:1–5 |

Across the 37 movements, the proof still marks `readAloudAccepted:false` and `readyForPublication:false`. M20–M37 queue: compare each listed span to the original v18 segment and independent source-evidence matrices; read the selected Catholic witness text in order; assess omitted setup, agency, response, consequence and ending; check Gospel parallels individually; record source verses separately from editorial connective context. Do not promote a verse trim solely to meet a length target. Keep Matthew 1:1–17 and Luke 3:23–38 independent in the existing genealogy view.

## Task B — theatre scene source audit

The existing scene study declares 183 scenes in 14 chapters against the 151-event chronology. Its recorded classifications are 67 exact-reference, 29 passage-overlap-review-only and 87 with no direct passage match. All 183 have a Bible reference, English synopsis, English evidence note, location label, stable scene key and classification. The 87 unmatched records have no Atlas candidate. The record is citation-only and declares that it imported no coordinates, routes or artwork.

The 14 existing chapter batches, in current index order, are: PATRIARCHS (25; indices 0–24); DELIVERANCE (13; indices 25–37); WILDERNESS (5; indices 38–42); COVENANT (6; indices 43–48); WANDERINGS (8; indices 49–56); INCARNATION (13; indices 57–181); MINISTRY (46; indices 69–114); PASSION (16; indices 115–130); RISEN (7; indices 131–137); APOSTLES (6; indices 138–182); FIRST_MISSION (10; indices 143–152); SECOND_MISSION (11; indices 153–163); THIRD_MISSION (6; indices 164–169); TO_ROME (11; indices 170–180).

The scene JSON gives useful preliminary evidence labels but does not itself provide source citations for its historical-geographic assertions, a normalized actor list, event dates or covenant/genealogy relationship fields. Its prose sometimes explicitly limits a marker to a city or region, a traditional identification, a proposed identification or an unidentified site. These need a row-by-row evidence audit before any coordinates or historical claim can be added. Do not infer a point from a place name or from a schematic route. Where Scripture names a region but not an exact site, retain that distinction. Where tradition identifies a site, label it as tradition; where scholarship disputes the identification, keep competing candidates and citations; otherwise mark it unidentified.

## Task C — crosswalk rules and current limits

Use `sceneKey` as the scene identity and the existing `atlasEventKey` values in each scene's `candidates` array for Atlas relationships. Preserve the existing status values. An exact reference remains a citation relationship, not proof that two records describe the same event. Passage overlaps remain review-only. A missing candidate remains null/none and must not be filled by guessed coordinates or a duplicate canonical event.

Join narrative movements only when the movement's source reference demonstrably overlaps the scene's biblical reference, with the relation labeled exact or overlap and the movement/source citation retained. Covenant links must use the seven existing covenant IDs and P0's source-backed relationships. Genealogy links must use existing Genesis, Matthew and Luke witness structures; no inferred identity joins and no Matthew/Luke harmonization. This checkpoint adds no location coordinates, canonical IDs, production text, UI or new storytelling route.

## Resumable work queue

1. Complete a verse-by-verse seam review for HS-M20–HS-M37; record each decision, supporting Catholic witness/reference, parallel-account handling and open issue in the existing P3 proof/desk-pass schema.
2. Reconcile those movements against the 217-unit necessity audit and publisher source matrices; carry forward all original unit IDs and preserve the original workbook as editorial owner.
3. Audit all 183 theatre rows in their existing index order (chapter batches above). For each, document chronology basis, actors actually identified by the cited text, location class (exactly named biblical place / regional only / traditional / disputed / unidentified), sourced historical-geographic claim and associated event keys. Keep uncertainty explicit.
4. Add only substantiated movement–scene–Atlas–covenant–genealogy relations to a reusable crosswalk; report unmatched scenes as unresolved rather than manufacturing anchors.
5. Update this queue as batches are actually completed. Publication, merge, canonical Scripture edits, coordinate creation, and new experience routes remain outside this research task.

## Review boundary

PR #1345 is a draft research overlay; PR #1310 owns the master covenant/genealogy/story crosswalk; PR #1069 owns the existing Atlas and scene studies. This branch is based on the latest P3 head and is intended as a continuation checkpoint. No source in this file approves Bible text, historical prose, coordinates, rights, theology, production UI or publication.

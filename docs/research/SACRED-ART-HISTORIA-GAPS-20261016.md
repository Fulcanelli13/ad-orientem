# Sacred Art × Historia Salutis — Genuine Gap Crosswalk v1
**As of:** 16 October 2026. **Owner:** Sacred Art PR #887. **Upstream:** draft Historia Salutis PR #1310.
**Status:** research evidence only; no original selection, rights approval or production change.

## Read this before using numbers
The baseline 168-category gallery (153 with photographic sources in the current separate inventory) is **not the complete art universe**. The crosswalk below analyses **44 character stories and 12 proposed narrative arcs** against **111 Bible art editorial subjects**, **83 art research rows**, **151 Atlas events**, and **183 Theatre scenes**. These overlap; none is a painting quota.

A matched Scripture reference is an **editorial candidate relation**, not a visually verified painting-to-story join. Identically named people or similarly titled paintings never establish physical-object identity. The existing rejected 0–2 originals and the artist exclusions Fra Angelico and El Greco remain binding. All prior selected works and numeric ratings are unchanged.

## Summary
- **12** Historia arcs; **11** have at least one documented reference-matched Bible-art subject or existing Theatre-scene artwork candidate. The **Davidic Kingdom** has no directly matched art subject in this particular dataset; that is not proof that no painting exists.
- **80 distinct Bible editorial subject IDs** match at least one arc's existing Atlas event reference, subject to depiction verification.
- **44** proposed character stories: **9** have an earlier selected Bible artwork with an equal passage reference; **2** link through Theatre art; **1** has a previously acquired art research-source record; **3** have institutional art leads; **7** match other Bible-art research subjects; **22** have no direct art-subject passage match.
- **0** new paintings automatically selected or promoted. Art release and usage permission remains independent and unassessed.

## Per-arc source match matrix
| Proposed narrative arc | Existing events | Reference-matched Bible subjects | Earlier selected subjects | Theatre art leads | Disposition |
|---|---:|---:|---:|---:|---|
| Creation, Fall and the First Promise | 3 | 3 | 2 | 0 | Candidate evidence |
| Noah, Covenant and Nations | 3 | 3 | 1 | 0 | Candidate evidence |
| Abraham and the Patriarchs | 12 | 11 | 5 | 0 | Candidate evidence |
| The Exodus and Sinai Covenant | 11 | 9 | 2 | 0 | Candidate evidence |
| The Promised Land and First Kings | 6 | 3 | 0 | 0 | Research candidates |
| The Davidic Kingdom | 4 | 0 | 0 | 0 | No direct match |
| Prophets, Exile and Return | 27 | 11 | 3 | 0 | Candidate evidence |
| The Incarnation and Holy Family | 12 | 3 | 2 | 7 | Candidate evidence |
| The Public Ministry of Christ | 31 | 13 | 3 | 0 | Candidate evidence |
| The New Covenant: Passion and Resurrection | 17 | 2 | 0 | 7 | Candidate evidence |
| Pentecost and the Apostolic Church | 20 | 19 | 4 | 1 | Candidate evidence |
| Christ's Triumph and the New Jerusalem | 5 | 3 | 0 | 0 | Research candidates |

The large difference between Gospel coverage and the Old Testament story gaps is **partly methodological**: only *exact* passage equalities and the existing signed-off crosswalk bridge were counted, not broader character matches or pictures whose subjects are adjacent. This intentionally leaves some valid reuse unassigned pending curator confirmation.

## Individual-story research classifications
| Evidence tier | Count | Examples |
|---|---:|---|
| Previously selected Bible artwork (reference match) | 9 | Cain and Abel, Isaac, Jacob (Israel), Judith, Esther, Susanna, St Joseph, husband of Mary |
| Earlier Theatre artwork (reference match) | 2 | The Blessed Virgin Mary, St Mary Magdalene |
| Previously acquired Bible research-source record | 1 | Adam and Eve |
| Institutional artwork lead | 3 | St Peter, Philip the Evangelist, Cornelius |
| Existing Bible-art research subject | 7 | Noah and his family, Joseph, son of Jacob, Rahab at Jericho, Isaiah, Daniel, Three youths in the furnace, Lydia |
| No direct Bible-art reference link yet | 22 | Ruth and Boaz, Deborah, Gideon, Samson, Hannah, Samuel, King Saul |

**Do not create 22 image-acquisition tasks** from the last row. A historical painting might be documented against a different moment in the character's story; maps, genealogy, Scripture and text also provide legitimate narrative coverage.

## Priority execution

**P0 – protect and reuse what is already good.** Keep the 101 historical selected artworks, the original scores, and existing Bible iconography tied to precise scene/episode references. For example, Cain and Abel, Isaac's Sacrifice, Jacob's Dream, Susanna and Judith have older artwork selections whose depiction and physical identity must be verified, but their selection must not be replaced by a new image found through a text search. Reuse strong Annunciation, Nativity, Presentation, Passion and Resurrection scenes across Calendar/Rosary/Historia/Mass only where the connection is accurate.

**P1 – fill the most valuable narrative weaknesses.** Start with the Davidic kingdom: Davidic covenant, David/Nathan, Solomon, and royal typology. Next, the early kingdom/judges sequence (Ruth, Saul, Deborah, Gideon, Samson) and the Prophets/Exile (Elijah, Jeremiah, Ezekiel, Tobit, Maccabees). Prefer a few signature paintings that do justice to whole arcs and key stories. Do not assume these lack artworks merely because our exact Scripture join finds none.

**P1 – New Jerusalem.** The final arc has three existing Bible art subjects but no prior selected exact-match artwork. Identify suitable visionary/New-Creation imagery using the right passage and subject rather than rebranding a generic Christ in Glory as a painting of the New Jerusalem.

**P2 – optional illustrations.** Other characters without a confirmed exact-scene painting can remain text/map/genealogy-led. Do not automatically seek portraits of each participant, still less every one of the 3,231 unverified donor identities.

## Canonical join and assessment rules

1. Exact physical artwork `ARTWORK_ID` and its chosen reproductions are separate from Bible subjects and visual context keys.
2. Existing `biblical:passage:...` event keys from Historia retain ownership. Passage equality is marked **source-reference match only**, pending actual depicted-scene verification. Do not treat `biblical:event:...` old Theatre identifiers as identical without a source-backed bridge.
3. Art/source links across Rosary, Bible, Calendar, Saints, Mass and Genealogy are canonical references, never duplicate bytes or new art objects.
4. Covenants are seven *theological stages*, not seven mandatory paintings, and some are promises rather than named covenant events.
5. Photograph aesthetics are judged at mobile width with complete painted surface; external frame removal uses a separate derivative. No megapixel threshold.
6. Rights, attribution, user aesthetic star scores, contextual suitability and actual app publication remain separate gates.
7. No production app, existing user decisions or Historia drafts have changed.

## Next practical action
From this matrix, create **one short P1 art shortlist**: David/royal promise, Ruth/judges, prophets/exile, New Jerusalem, plus existing strong Rosary/Gospel/Mass anchors. Reconcile exact paintings and verify whether already acquired, then present for human aesthetic review only when the full image collection is ready.

The source-linked machine-readable matrix is [`sacred-art-historia-genuine-gap-crosswalk-20261016.v1.json`](../../data/calendar/sacred-art-historia-genuine-gap-crosswalk-20261016.v1.json). It pins Git blob SHA for each upstream research source, and records all 44 character stories and 12 arcs individually.

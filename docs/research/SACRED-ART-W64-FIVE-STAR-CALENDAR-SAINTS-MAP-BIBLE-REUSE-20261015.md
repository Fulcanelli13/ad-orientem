# W64 — Previously five-star artwork reuse in the 2026 calendar, Saints Map and Biblical Atlas
**15 October 2026 · research-only; stacked on W59/W60/W61/W62/W63; Sacred Art owner PR #887 unchanged**

## Work completed

This pass does not restart aesthetic rating or search for new paintings. It restores the user's **existing** 5-star decisions (and their per-original limitations), then tests connections to exactly identified calendar observances, saints, and Scripture passages.

### Four W64 machine-readable registers

1. `data/research/sacred-art-w64-existing-five-star-original-reuse-20261015.v1.json` — **86** latest W49 five-star *subject placements* on **83 candidate IDs**, across **64 reviewed saint subjects**; separately **10** earlier effective directly scored five-star artworks and **14** five-star historical baseline records from W46. The union has **107 source candidate IDs before final physical-object deduplication**; do **not** claim 107 unique original paintings. **18** are exact master-registry-ID joins, **one** additional museum URL identity join is provisional, **88** are not yet joined to the 281 master objects. Scores are preserved; no score of 4 or 0–3 is re-opened. A global blocked-original source is checked before reuse.
2. `data/research/sacred-art-w64-2026-five-star-date-reuse-crosswalk-20261015.v1.json` — **365 real production-resolved 1962 civil-date rows**, including principal observance IDs/titles, feast rank and actual source commemorations, matched to user-rated-five source subject IDs, name/identity/date guards, the earlier W63 source physical original links and the source-owned Class I research scene/art match. **34 dates** have one or more five-star subject/image leads (**50 artwork-date-role rows, 42 art IDs**), **32 dates** have at least one that is not already known to have a photo or subject-placement hold. **17** dates have principal-person-subject links, **eight** have commemoration-person-subject links. A principal's picture NEVER erases or replaces its commemorations.
3. `data/research/sacred-art-w64-bible-atlas-five-star-scene-reuse-20261015.v1.json` — six individually grounded artwork-to-Scripture episode/subepisode leads among the **151** canonical production timeline events, and three links also into the distinct **183** cinematic research scenes. Three of the six have exact original IDs and SHA metadata in the 281 registry; three have rated original source IDs but still need physical-object identity/provenance adjudication.
4. `data/research/sacred-art-w64-saints-map-five-star-reuse-20261015.v1.json` — source-ID matching across **119** shrine dedication name strings and **41** existing Saints-pipeline-to-Sacred-Art subject pointers, without person-name fuzzy guessing. **34** shrine-name rows have five-star subject overlap (50 rated-five art-to-subject links; 48 candidate IDs) and **28** have at least one without a known photograph or placement hold. These are **not 34 published Saints Map portraits**, nor is 119 the count of distinct canonical saints.

### Specific six Bible reuse links (all release hold)

| Canonical event | Actual rated artwork reference | Subject relationship |
|---|---|---|
| #1 The Fall, Genesis 3:1–24 | John Faed, *Expulsion of Adam and Eve*, `cma-150046` | Depicts Genesis 3 expulsion **subepisode**, not the whole Fall |
| #69 Birth of Jesus, Luke 2:1–20 | Savoldo, *Adoration of the Shepherds*, `nga-46185` | Shepherds' adoration subepisode of the Nativity |
| #75 Return from Egypt, Matthew 2:19–23 | Poussin, *Return of the Holy Family to Nazareth*, `cma-130392` | Main narrative return subject, still check image crop |
| #120 Empty tomb/Mary Magdalene, John 20:1–18 | Gustave Vanaise, *Magdalene in Christ's Tomb*, `C32:gustavevanaisemagdaleneinchriststombjpg` | Historical scene lead, physical source image rights gate |
| #123 Risen Lord appears to Apostles, John 20:19–29 | Caravaggio, *Incredulity of Saint Thomas*, `W07-014` | John 20:24–29 **subepisode**, also cinematic scene Christ 134 |
| #128 Martyrdom of Stephen, Acts 7:54–60 | Juan de Juanes, *Martyrdom of Saint Stephen*, `ART-uan-de-uanes-artyrdom-of-aint-tephen` | Direct event-subject lead; original accession/source not registered yet |

A painting's user score 5 is an aesthetic decision, *not* evidence that an original/reproduction is rights-cleared, that the correct pixels were actually displayed during rating, or that it has an approved phone crop.

### Source hierarchy and subtle safeguards

- **Never conflate 5-star placements with unique works.** The Pittoni `cma-150955` original appears in four W49 placements (Anthony of Padua, Benedict, Lucy, Agnes), all explicitly marked `SUITABLE_ELSEWHERE`. Its 5/5 status remains protected but it **cannot count as a correct individual Saint portrait** on any of those four dates or Saints Map entries.
- Fifteen rated candidate IDs have pre-existing card-photo or subject-ID holds (examples include a different Rubens Martyrdom of Andrew image on an Andrew portrait card, Goya/Met St Gregory confusion, Cavallino vs a Saint Anthony church file, and Stilke vs Carrière Joan of Arc). The 5-star score protects **what the user actually saw**; **never** transfer that rating to the nominal catalogue original until the object and photo are reconciled.
- The v43.33 legacy `311` components remain distinct from the actual 2026 `365` observed principals and their named commemorations; W64 labels each date role. Lent displaced saint feasts: examples include the 2026-03-07 Thomas Aquinas commemoration, 2026-03-17 Patrick commemoration, 2026-03-21 Benedict commemoration. They are not the Mass principal.
- Calendar W63 had **27 dates** with surviving, still-unapproved earlier research candidates. W64 now has **32 dates** with existing five-star references without current known image/placement holds. The two sets overlap on **nine** dates, yielding **50 distinct 2026 dates with some unrejected earlier-source candidate or existing 5/5 artwork reference**. **315** other dates have no match in these **limited** source tables; **NOT 315 proven missing artworks**.
- No variant of any physically rejected 0–2 work should enter ratings or the final app. Fra Angelico and El Greco excluded. A 4-star is *pending user choice*, not a 5 or a rejection.

## What remains before a true coverage percentage

1. Retrieve full lifetime rating/export audit beyond the available W49/W46 partial snapshots, including W57/W58 accepted restorations, to ensure all old 5-star decisions and genuine physical duplicates are accounted for.
2. Resolve the 88 W64 rated IDs not joined to the 281 canonical registry; some are genuinely additional originals while others are aliases or photos of other works. Do not dedupe by painter/name alone.
3. Finish any of the 15 photo mismatches **without asking the user to re-rate**; correct card object identity and rights/description.
4. Join every remaining 2026 saint/commemoration to a stable person/group ID, using the Calendar/Saints pipelines' owners. Handle displaced feast days and collective martyr groups without inventing independent portraits.
5. Check actual published Home, Calendar, Saints Map and Biblical Atlas image rendering, master files, licences and phone crops.
6. **Only then** calculate exact/contextual/awaiting/missing percentages and research genuinely missing visual subjects with greatest Map/Timeline and Saints Map reuse.

**No production app edit, approval overwrite, art re-rating, or new art search.** Existing PR #1231 remains draft and stacked on W59.

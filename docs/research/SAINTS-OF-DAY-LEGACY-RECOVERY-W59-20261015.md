# Saints of the Day legacy artwork recovery — W59 (15 October 2026)

**Research-only.** This branch must NOT be merged into runtime calendars or interpreted as new artistic approvals without canonical reconciliation.

## Recovered from the preserved v43.33 HTML

- `legacy/v43.33.parts/chunk-010-p00.txt`: **SAINT-ART-MANIFEST-v3.3**, target **252 saint-bearing calendar dates / 311 identity components**. This is a historical coverage expectation, not a verified current per-person count.
- **87** historical `APPROVED_ART_RULES` (49 saint identities, 27 groups, 3 angels, 8 events). All have `approved:true` in the *old resolver*, **not** the user's subsequent 5-star aesthetic approval.
- Only **17** rules name specific Commons files (**18** file directives total). **76** rules point to Commons categories (**99** category directives), overlapping the preceding 17. One rule, Cornelius/Cyprian, has no direct file or Commons category despite its historical approval flag; it is **not** a picture in hand.
- `legacy/v43.33.parts/chunk-000-p00.txt`: **49 identified Proper artworks with source URLs**, tied to **50 calendar/Proper mappings**; 47 old GREEN, 2 HOLD, 1 NO_ART. These are legacy editorial assignments only and must be checked against the user's later art ratings, identity, photographic quality and rights.
- The legacy Proper set contains **Fra Angelico** and **El Greco** selections, inconsistent with the user's current artist exclusions. Never carry those through as current approvals.
- **79 canonical display aliases**, **27 explicit date overrides** mapping **47 components**, and **36 date-specific identity locks** recovered into the companion file.

## Directly relevant W57 protected-feast gaps

The old researched rules name the following identities. Except where a specific painting can be tied to a current approved artwork ID, they are **discovery leads, not newly covered dates**.

| W57 feast | Old rule | Quality of legacy lead |
|---|---|---|
| 17 Jan — Anthony Abbot | `saint.anthony` | Category search for Anthony the Great; excludes Anthony of Padua |
| 11 Jun — Barnabas | `saint.barnabas` | Generic Commons categories |
| 5 Jun — Boniface | `saint.boniface-mainz` | Commons category; excludes Boniface of Tarsus |
| 1 Feb — Ignatius of Antioch | `saint.ignatius-antioch` | Commons category; excludes Ignatius of Loyola |
| 31 Jan — John Bosco | `saint.john-bosco` | Commons category |
| 29 Jul — Martha of Bethany | `saint.martha-bethany` | Commons category |
| 24 Mar — Gabriel | `angel.gabriel` | Commons category; **W58 already identified a 5-star artwork reuse** |
| 16 Sep — Cornelius and Cyprian | `group.cornelius-cyprian-carthage` | Historical identity rule only; **no exact Commons file/category recorded** |

**W58 has independently restored approved reuse** for Gabriel from Philippe de Champaigne's Annunciation and for Guardian Angels from Pietro da Cortona; do not re-add as newly uncovered or re-rate the same physical artwork. W58 also restored historic user-rated 4s for Anthony Abbot and Philip Neri: never downgrade or reset those ratings.

## Stable identity boundary

A newer branch `saints/2026-10-15-identity-and-holiness-pilot` contains `data/saints/cross-module-source-reconciliation-20261015.v1.json` (119 historical shrine-name strings, 41 linked art subject IDs), `data/saints/identity-exception-triage-20261015.v1.json`, and a six-person holiness-first pilot. Those are the **identity/biography owners**. They should attach approved `artwork_id` links without copying old Commons records into separate art catalogues.

- Example mapping to review: `saint.therese-lisieux` (legacy art resolver) ↔ `saint:therese-of-lisieux` (new identity registry).
- New pilot entries have `image_state: AWAITING_SACRED_ART_OWNER_APPROVAL`; do not mark them finished based on old legacy research.
- Keep Saint Timothy the Apostle distinct from Timothy the Roman martyr; keep Augustine Canterbury/Hippo, Ignatius Antioch/Loyola and Boniface Mainz/Tarsus separate.
- Martyr groups may be historical liturgical units and must never be misrepresented as one person.

## Before issuing any further visual rating sheet

1. Match old rules and the 49 Proper artwork URLs to W48 user's approved/rejected paintings; fingerprint by physical artwork, NOT saint name or Commons category.
2. Match to W55/W56 options and Breviarium's 83 plates. Reuse canonical physical IDs and prior individual-artwork ratings.
3. For the 87 old rules, resolve actual image files from Commons category searches; do not count a mere category as a verified painting.
4. Check 1962 calendar authority, image provenance, license and exact identity. Do not convert past `CERTIFIED_NO_ART` into a permanent aesthetic rejection: it meant the former registry had no verified rule.
5. Add all independently 5-star-rated paintings to the eligible homepage rotation for a given liturgical subject; retain 0–2 rejections without resurfacing them. The subject itself can receive more 5-star works.
6. Integrate only **read-only artwork references** into the current `saints/` pilot after the Sacred Art owner verifies the images.

## Current research branch outputs

- `data/research/saints-of-day-legacy-art-recovery-w59-20261015.v1.json` — 87 historical rules; 49 Proper artworks; 50 Proper mappings; provenance and exact historical rule text
- `data/research/saints-of-day-legacy-identity-crosswalk-w59-20261015.v1.json` — aliases, overrides, locks

**Not done:** exhaustive legacy-to-W48 physical image matching; reconstructing all 311 runtime identities as a serialised table; verifying 87 source/image identities or rights; merging this branch into main. Avoid claiming these research files close the W57/W58 gaps.

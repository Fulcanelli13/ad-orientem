# R18 — eleven-action Calendar parent/subtype release structure

**State (29 October 2026): editorial staging only.** Owner [PR #1759](https://github.com/Fulcanelli13/ad-orientem/pull/1759); no Calendar deployment, no new canonical IDs, no approved new articles, no new blessing, shrine event or indulgence.

## Structural decision

For the eleven previously unresolved R18 actions, retain **eleven named working identities** in eight **noncanonical conceptual families**. This is the least lossy release structure: a shared devotion or medium does not collapse different actions, while mere differences of country, material, singer or ritual form do not generate gratuitous canonical subarticles.

- Polish **pisanki** and Ukrainian **pysanky** are two cultural subtypes under one provisional Easter egg-decorating craft identity (R18-04), not two approved canonical IDs.
- Polish **kolędnicy** (R18-08) and Hungarian **betlehemezés** (R18-09) are separate named practices but **linked siblings** in the same conceptual visiting-performance family. Thematic grouping is not a new parent article and does not require merging their national traditions. Actor/puppet variations stay inside the Hungarian record, singer/drama variations inside the Polish record.
- St John Baptist's bonfire (R18-03), Maltese Resurrection procession (R18-13), Tivoli's two-image Inchinata (R18-15) and Sassari's guild Faradda (R18-16) are **four locality-bound ceremonial records**, not an extra universal liturgical procession, and not additions to the app's event schedule.
- Austrian Marian image relay (R18-05), Québec alms collections (R18-07), Polish Pentecost greenery (R18-14), and Bavarian Frauendreißiger (R18-17) retain their named historical action and locality. The Bavarian named devotional period must never be promoted into a 1962 Calendar season.

## Editorial placement register

| R18 | Proposed article | Action scope | Regional or internal forms | Calendar exposure after review |
|---|---|---|---|---|
| 03 | St John Baptist's community bonfire | local ceremonial context | Historically documented parish fire gatherings | Local event hold |
| 04 | Decorating Easter eggs: pisanki and pysanky | single craft identity with named regional subtypes | Polish pisanki decorating techniques; Ukrainian pysanka decorating techniques | Regional/seasonal only |
| 05 | Herbergsuche — Advent Marian-image visits between households | local household relay | House-to-house Marian image relay | Regional/seasonal only |
| 07 | La guignolée — French Canadian Christmas alms collection | local charitable collection | Locally organized charitable collection | Regional/seasonal only |
| 08 | Polish kolędnicy — Christmas visiting carollers | regional visiting performance sibling | House-to-house Christmas carollers; Nativity and Herod dramatic forms within kolędnicy | Regional/seasonal only |
| 09 | Hungarian betlehemezés Nativity visiting plays | regional visiting performance sibling | Nativity dramas performed by actors; Nativity dramas performed with puppets | Regional/seasonal only |
| 13 | L-Irxoxt — Maltese running procession with the Risen Christ | local ceremonial context | Local Easter procession of the Risen Christ; Running with the statue in certain localities | Local event hold |
| 14 | Pentecost greenery decorating Polish homes | regional seasonal decoration | Pentecost greenery at houses and gates | Regional/seasonal only |
| 15 | Tivoli's Inchinata procession | local ceremonial context | Meeting and ceremonial bow of processional images | Local event hold |
| 16 | Faradda di li Candareri — Sassari's Marian offering procession | local ceremonial context | Guild procession carrying monumental wooden candelieri | Local event hold |
| 17 | Frauendreißiger — thirty days of Marian devotion | local shrine devotional period | Named Assumption-to-Holy-Cross Marian devotional period | Regional/seasonal only |

There are **15 named subordinate examples**, and these are **not** 15 extra Customs. No existing published article is being appropriated as a generic global parent. Existing comparators include `ADVT-003` Las Posadas, `EPIP-001` Sternsinger, `BLSS-004` Easter food blessing, `MARI-001` French Assumption procession and `DEV-001` May Marian devotion; they remain distinct and unmodified.

## Bilingual editorial pass

All **11 original eight-field EN/FR articles** remain in [the full 18-record source ledger](../data/customs/customs-r18-all18-release-ownership-reconciliation.v1.json). The [revised bilingual copy pack](../data/customs/customs-r18-eleven-bilingual-editorial-copy-review.v1.json) offers EN/FR replacements for three fields per proposed article: `description`, `history` and `caution` (**33 paired field revisions**). Each separates short introductory description from source-bounded historical details and explicit scope/rite/event limitations. Other fields and all URLs remain associated with the original candidate, not silently rewritten.

**Not accepted:** every language review is PENDING. Source claims were narrowly rechecked by the original research workflow, **not independently certified across the entire article**. A reviewer must check every final EN and FR rendering, source localisation, exact local schedule and liturgical/cultural status before converting any research record into a canonical article.

## Rehearsal and release invariants

The read-only [Calendar structural rehearsal](../tools/customs/simulate-r18-eleven-calendar-context.mjs) checks:
- all 11 candidates map to existing research records and 8 noncanonical thematic families;
- all 15 subordinate regional variants remain children, not canonical article IDs;
- all 8 approval gates per candidate remain `false`;
- every proposed article still resolves to a complete eight-field EN/FR copy with the revised fields;
- source blob SHA is pinned and verified; 35 live articles remain exactly as in the existing Calendar read model;
- four locally scheduled practices have **no event date** until actual current local announcements are separately corroborated;
- original and future grant text, especially Maria Thalkirchen's reported plenary indulgence, remain unverified, and **zero** indulgences are linked;
- the source editorial research records and this staging pack remain **unimported by the production Calendar**.

### Publication sequence

1. Secure final **identity** dispositions and answer whether each working practice is an article versus only contextual evidence. All currently remain proposed.
2. Finish human **EN copy**, **FR copy**, narrow source, geographic/ministerial and 1962 Calendar checks, then explicitly sign individual records.
3. Allocate collision-free canonical IDs only for independently approved separate practices. Keep regional child examples nested inside those approved parent identities. Local-event publication requires additional contemporaneous place and date evidence.
4. Integrate approved records through the existing `customs-atlas-seed.v1.json` → `customs-read-model.js` / `customs-extra-articles.js` and established Calendar/seasonal search and mobile tests, never a Customs Atlas.
5. Keep six existing proposed release IDs (`PATR-002`, `XMAS-002`, `XMAS-003`, `SBAR-001`, `XMAS-004`, `EPIP-004`) in the existing PR #1759 six-item release pipeline; reserve `EPIP-003` and `CRIB-001` for the independent PR #1642. Neither cohort is counted as a newly published article here.

**Current publication count: 35. Current new approvals: 0.**

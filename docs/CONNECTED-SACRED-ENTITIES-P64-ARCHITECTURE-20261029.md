# P64 — Connected Sacred Entities: one source, multiple entry points

**Status:** read-only architectural pilot, not a production UI release or a new owner.
**Owner principle:** Existing Calendar, Geography, Shrines/Pilgrimages, Customs, Saints, Sacred Phenomena, Sacred Art and prayers remain independent canonical owners. This projection only connects exact IDs and cites the original source rows.

## Why

Explore should feel like a pilgrimage guide, not a directory record. Its Place profile should show **the site's story, saints, relics, artworks, customs, and Calendar occasions**, while the Calendar should reveal the very same sites when relevant. One person must not have separate competing biographies in Calendar and Explore. No parallel Calendar, Customs Atlas, saint gazetteer or relic map-pin schema is to be invented.

The current repository already has `src/calendar/pilgrimage-places.js`, `src/calendar/customs-profile-links.js`, `src/find/saints-calendar-context.js`, `src/find/place-profiles.js`, `data/explore/sacred-phenomena-seed.v1.json` and a source-bound relic/Place model. P64 provides **read-only integration contracts**, not another corpus.

## Entity and relationship contract

| Identity | Canonical owner | Important distinctions |
|---|---|---|
| `place:CC:slug` | `data/geography/seed-registry.v1.json` | Physical site/complex; owns locator, not biographies, Mass times, object location inside buildings or relic authenticity |
| `saint:slug` or `blessed:slug` | Existing Saints corpus | Person biography and recognition status; not inferred from patron or dedication text |
| `saint.slug` | Calendar person crosswalk | Used only when exact reviewed Saints identity bridge exists; no automatic feast |
| `relic:CC:slug` | Sacred Phenomena | Attested object custody as of cited source; not independent authentication or permanent display |
| `DOM-006` etc. | Customs corpus | Custom identity; place relation requires a Place-specific attestation |
| Calendar semantic key | `src/calendar/intelligence.js` | Calendar exclusively calculates dates, precedences, observances and transfers |
| Pilgrimage/route/shrine | `data/shrines/shrines-pilgrimages-seed.v1.json` | Existing canonical sources for place/time/pilgrimage context |
| Image and sacred art | Existing approved asset registries | Only rights-cleared local files, never candidate hotlinks |

`src/find/connected-sacred-entities.js` derives the following typed, source-bound relationship families:

- `ATTESTED_RELIC_CUSTODY` — Place -> existing `relic:` ID; only a verified source claim, no authenticity or regular visitor access assertion.
- `PLACE_ATTESTED_CUSTOM` — Place -> canonical published Custom; requires exact Place-specific, strong attestation, not merely a cultural-area note or a name hint.
- `PILGRIMAGE_CALENDAR_CONTEXT` — Place -> Calendar semantic key; traverses existing Shrine and Pilgrimage identities, with an approved temporal link; NOT a second date rule.
- `DOCUMENTED_PERSON_SHRINE_ASSOCIATION` — Place -> exact Saint/Blessed identity using existing `place_links`. Current Saint biographies are `EDITORIAL_REVIEW_ONLY`, so their links are likewise held from public presentation.
- `EXACT_REVIEWED_PERSON_IDENTITY` — Saints identifier -> Calendar-person identifier, only with the explicit reviewed bridge, never by name. This is **identity**, not feast publication.

Every edge includes its existing `owner`, `record_id`, evidence source IDs or URL and narrowly scoped meaning. The returned `public_context` and `editorial_review` arrays must never be silently merged at publication. This model introduces **zero new physical Place records**, Calendar calculations, Mass/proper selections, universal customs, claimed verified relics, approved image assets or biography texts.

## Integration acceptance cases

1. **Chartres** — existing Pentecost pilgrimage temporal link, not a fabricated feast of the cathedral or its presumed patron.
2. **Paray-le-Monial** — Sacred Heart pilgrimage key, documented family consecration, source-attested remains of St Margaret Mary and a *separately held* Saint biography link.
3. **Sainte-Anne-d'Auray** — the Grand Pardon custom's actual Place-level attestation; do not create a new `saint:` identity from a string.
4. **Notre-Dame de Paris** — Crown of Thorns, True Cross fragment and Holy Nail separately linked to the same physical Place, without three new pins, relic authentication claims or automatic date association.
5. **Père Laval, Mauritius** — distinct `blessed:` identity retained; no automatic canonization, feast or on-site routine schedule inferred.
6. **Saint Thérèse** — the reviewed `saint:therese-of-lisieux` / `saint.therese-lisieux` crosswalk remains purely an identity link, with the 1962 Calendar's ownership intact.

## Implementation path and bounded release gates

1. **P64 model (this PR):** derive and test correct relationships from existing sources. No UI publication.
2. **P65 editorial template:** one approved EN/FR biography owned by Saints; separate sanctuary description owned by Place editorial; relic/object and Custom texts owned by respective registries. Include original sources, edition, provenance, text rights and explicit tradition/history classifications. No text copied wholesale from contemporary ICRSP pages.
3. **P66 batch research:** prepare small, source-only exports by canonical ID for Claude. Index ICRSP saint entries and identify exact public-domain original sources when applicable; do not expose the whole repository. Machine-check IDs, sources and scope on import. Distinguish fact extraction from editorial prose approval.
4. **P67 Place presentation:** evolve existing `src/find/place-profiles.js` and `explore-presentation.js` using read-only connectors. Hero, one compelling biographical introduction, subject-specific gallery, saints, sacred treasures, local customs, pilgrimage and visit information. Display empty sections only when relevant information exists. No new separate page layer that supersedes Place.
5. **P68 Calendar reciprocal links:** add a concise `Places / Traditions` entry under the existing Calendar date. It lists only approved, Calendar-resolved semantic links, source qualified local notices and exact verified saint identities. Do not change the 1962 observance, precedence or Mass selection.

**Publishing standard:** bulk-import high-confidence crosslinks and photos automatically after deterministic checks; a finite exception queue handles uncertain identities, rights, custody, dates or historical claims. Do not wait for comprehensive individual photo or biography coverage before publishing the basic registry.

## Zero-cost constraints

Use existing repositories, free reusable media and static registries. External scraped Google Maps pictures are not a rights-cleared permanent photo archive. No paid APIs, licensed text acquisition, metered storage or recurring AI runtime cost.

## Test

`node tests/connected-sacred-entities-p64.mjs`

This test verifies exact Place-backed relationships, ordinary Calendar ownership, editorial hold separation, false-identity protection, source evidence presence, absence of new pins and safe behavior with missing geography.

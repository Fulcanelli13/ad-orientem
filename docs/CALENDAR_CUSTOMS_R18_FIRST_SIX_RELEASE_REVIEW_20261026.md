# Calendar Customs — first six release-copy review (main-based)

**26 October 2026 · draft Calendar integration branch · no new published articles.**

## Why this branch exists

The original research PR [#1723](https://github.com/Fulcanelli13/ad-orientem/pull/1723) is stacked on older Customs research code and **does not contain** the existing production Calendar read-model files now present on `main`. It cannot safely be used to publish Calendar changes. This draft PR instead starts from `main` and stages its approved-release review artifacts directly adjacent to the actual Calendar owner.

The file [`src/calendar/customs-r18-first-six-staging.v1.json`](../src/calendar/customs-r18-first-six-staging.v1.json) contains **six source-linked English/French candidate articles**. Each includes the existing article contract's title, description, history, meaning, practice, caution, occasion and scope, plus references, date-hint provenance, explicit editorial signoffs (all false), and no allocated canonical article ID.

**Production remains at 35 published custom articles** (11 `PUBLISHED_ARTICLES` and 24 `CANONICAL_EXTRA_CUSTOM_ARTICLES`). Neither `customs-read-model.js`, `customs-extra-articles.js`, nor `customs-profile-links.js` imports the staging file. It cannot display extra Calendar cards or create event schedules.

## Article-level evaluation and remaining decisions

| Working identity | Occasion | Source-to-copy status | Required final disposition |
|---|---|---|---|
| `CANDIDATE-STPATRICK-RIBBON` | 17 March | Galway City Museum records 1680s crosses and decline by the 1930s | **Historical** rather than an ongoing, universal Irish custom; no Lenten exemption |
| `CANDIDATE-IRISH-CHRISTMAS-CANDLE` | Christmas Eve/night | National Museum quotes a 1941 Kerry witness; archival Dúchas pages currently challenge automatic reopening | Optional historic household context, candle safety, no spirit claims; full archival-source review outstanding |
| `CUST-XMAS-POLISH-HAY` | 24 December | Polish Ministry of Culture directly describes the white tablecloth and hay | Distinguish domestic Christmas hay from Advent manger straw and divination |
| `CUST-BARBARA-BRANCHES` | 4 December | Vienna Archdiocese directly describes putting cherry/apple branches in water | Distinguish the witnessed custom from uncertain saint biography and predictive folklore |
| `CUST-XMAS-PROVENCAL-PAIN-CALENDAL` | 24 December | Le Var regional tourism directly describes a cross-scored round loaf and portion for the poor | Keep “for miracles” strictly as reported folklore; do not imply a blessing or merge with post-midnight réveillon |
| `CUST-EPIPHANY-SPANISH-MAGI-GIFTS` | 5–6 January | Spain tourism guide published December 2023 for 2024 explicitly describes shoes | Distinguish theatrical Magi, family gifts, Gospel text and any real dated civic procession |

Some original research descriptions were identical to their history fields. The six staged drafts deliberately separate a short accessible introduction from documented provenance and have parallel French text. This is editorial copy editing; it does not alter the research master or certify the whole document and is **not** user approval.

## Recommended presentation in the *existing* Calendar

All six belong only as context-sensitive suggestions on their associated civil dates or seasons. The existing Calendar continues to own the 1962 date/feast resolver; civil dates do not create new rubrics, rankings or priestly duties. Seasonal event suggestions must not be represented as automatic future parish events. A regionally appropriate item can be shown as optional household heritage with clear geographical scope; St Patrick's cross should be labelled historical. No new home dashboard, Customs Atlas or custom date engine is permitted.

**Required release sequence:** (1) a human content owner explicitly accepts each distinct identity against the existing corpus, (2) separate source-to-claim and 1962 ministerial/feast checks, (3) explicit final EN and FR copy acceptance, (4) precise Calendar date/visibility and location-policy approval, (5) canonical ID assignment without collisions, (6) controlled import into `customs-read-model.js`/`customs-extra-articles.js` and browser/date regression. Any item may be held individually without blocking the other five.

The source/research approvals and Calendar releases of [#1642](https://github.com/Fulcanelli13/ad-orientem/pull/1642) and [#1720](https://github.com/Fulcanelli13/ad-orientem/pull/1720) are separate, with no duplicated new identity in this staging.

## Source references

- Galway City Museum: https://galwaycitymuseum.ie/blog/1-reviving-an-old-tradition-st-patricks-crosses/
- National Museum of Ireland, Christmas folklore, including Annascaul 1941 witness: https://source.museum.ie/en-IE/Collections-Research/Folklife-Collections/Folklife-Collections-List-(1)/Religion-and-Calendar-Customs/Generations-past-how-Christmas-was-celebrated-in-y
- Schools' Collection alternate witness (full page challenge currently): https://www.duchas.ie/en/cbes/4758582/4756445/4934128
- Polish Ministry of Culture: https://www.gov.pl/web/kultura/nowy-wpis-na-krajowej-liscie-niematerialnego-dziedzictwa-kulturowego
- Archdiocese of Vienna: https://www.erzdioezese-wien.at/heilige-barbara
- Le Var regional source: https://www.visitvar.fr/agenda/evenements-incontournables/noel-provence/traditions-de-noel-provence
- Official Spain tourism guide for 2024 (published December 2023): https://socialnewsroom.spain.info/three-kings-day-in-spain-2024/

## Machine gates

The [six-item staging test](../tests/calendar-customs-r18-first-six-staging.mjs) enforces: exactly six keyed working identities, 35 existing published cards unchanged, complete eight-field EN/FR text pairs, no release signoffs, no runtime staging import, no calendar triggers/recurrences, no canonical IDs, distinct description/history, and continued preservation of the inaccessible Dúchas witness plus the accessible National Museum source.

All six have `publication_allowed=false`; the PR must remain draft until specifically reviewed. No merge or Calendar publication is authorized by merely completing these preparation tasks.


## Implemented in the canonical Calendar recommendation API (review-only)

The actual `src/calendar/customs-read-model.js` now exposes `calendarR18ReviewRecommendations`, and its existing `calendarCustomRecommendations` accepts an **explicitly supplied** optional `r18Review` object. This does **not** change default Calendar behaviour, the canonical article map, the all-traditions catalogue or the yearly customs view.

For development/reviewer inspection (Node 22 or browsers supporting JSON import attributes), call:

```js
import pack from "./src/calendar/customs-r18-first-six-staging.v1.json" with { type: "json" };
import {calendarCustomRecommendations} from "./src/calendar/customs-read-model.js";

const dayCards = calendarCustomRecommendations("2026-12-24", {
  r18Review: {
    enabled: true,
    regionCode: "PL", // explicit editorial selection, not geolocation
    candidates: pack.records
  }
});
```

The resulting collection preserves the published articles and appends a clearly flagged **`previewOnly:true`** article for the Polish hay custom. Its ID is `REVIEW:CUST-XMAS-POLISH-HAY`: an ephemeral review ID, **not** an assigned canonical ID. A reviewer may pass `PL`, `IE`, `AT`, `FR-PROVENCE` or `ES`. Dates are matched to explicit mm-dd hints, and night spans require exact calendar days (5/6 January, 24/25 December). Unselected, missing and unrelated regions return **no** research suggestions. No location is guessed from the user's IP or device, and no local event time is generated.

**Production remains unchanged.** `calendar-runtime.js` does not pass a `r18Review` argument; `src/calendar/customs-read-model.js` does not import the staging JSON; `calendarCustomArticleIds()` continues to expose only 35 approved identifiers. `calendarR18ReviewRecommendations` rejects any candidate with a changed editorial status, claimed canonical ID, signoff, auto date trigger, event recurrence, missing bilingual prose or mismatched review key. The behaviour is verified with [`tests/calendar-customs-r18-region-preview.mjs`](../tests/calendar-customs-r18-region-preview.mjs).

**Still needed for public release:** record distinct-identity approval, inspect English and French final wording, resolve source caveats, approve local/region visibility as a product behaviour, assign canonical IDs, and separately activate those articles in the current live Calendar read model. The programmatic review mode is not a substitute for any of these decisions.

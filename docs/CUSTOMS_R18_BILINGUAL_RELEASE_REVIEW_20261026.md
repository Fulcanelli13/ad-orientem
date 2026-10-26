# Customs R18 — English/French editorial acceptance packet

**26 October 2026 · 18 staged articles · no editorial signatures or runtime publication**

## Current release-readiness counters

| Gate | Completed | Not yet completed |
|---|---:|---:|
| Specific source-claim corroboration | 18/18 | Full-source and independent-witness certification remains open |
| Staged bilingual article field pairs (8 text pairs) | 18/18 | Human copy/editorial approvals 0/18 |
| Six original article fields preserved verbatim from master | 17/17 | Formal identity approvals 0/18 |
| Newly drafted Provençal *réveillon* EN/FR introduction | 1/1 | Its companion-ownership approval 0/1 |
| 1962 rite/minister/date/locality release approval | 0/18 | All pending |
| Existing Calendar runtime integration | 0/18 | No production changes in this PR |

**Publication count stays at 35 published identities in the existing main read-model** (11 original primary articles + 24 canonical extras), with 3 separate context-only research identities and 18 unapproved master identities in the 56-record research metadata. Published metadata and deployed Calendar projection have different meanings; this new packet does not change either.

The complete machine-readable staging file is [`customs-r18-bilingual-calendar-candidate-pack-20261026.v1.json`](../data/customs/master/customs-r18-bilingual-calendar-candidate-pack-20261026.v1.json), cross-joined by immutable `review_key` to the [18-case editorial dispositions](CUSTOMS_R18_EDITORIAL_DISPOSITIONS_20261026.md).

## Compatibility with the *real* Calendar

On the repository's current **main** branch, the existing published read-model files are:

- `src/calendar/customs-read-model.js`: 11 published original articles, a stable published map, and real day/season recommendation selection.
- `src/calendar/customs-extra-articles.js`: 24 published extra articles.
- `src/calendar/customs-profile-links.js`: predefined links to already published identities.

These paths **do not yet exist on this stacked research branch**, which is based on PR #1610. Do not generate an extra Calendar or treat absence on this older branch as license to recreate it. Integration must start from a then-current main snapshot and remain in the actual Calendar owner, after explicit release approval.

The Calendar article contract uses `title`, `description`, `history`, `meaning`, `practice`, `caution`, `occasion`, `scope` as EN/FR text fields plus `sources` with source IDs, titles and URLs. This packet stages exactly those human-readable text fields while deliberately **omitting production canonical article IDs** for any new proposed identity.

For every candidate, `acceptance` fields remain `PENDING` and `acceptance.publish` is `PROHIBITED`. Source links are retained, but full source independence and all article sentences are not thereby certified.

## Complete review matrix

| # | Custom / action | Proposed Calendar presentation | Occasion (research hint only) | Draft origin | Editorial signoff |
|---:|---|---|---|---|---|
| 1 | St Patrick's ribbon cross | Historical context | 17 March | Inherited EN/FR six-field draft | Pending |
| 2 | The Irish Christmas candle | Regional optional | 24–25 December; local duration varies | Inherited EN/FR six-field draft | Pending |
| 3 | St John Baptist's community bonfire | Local event context | Nativity of St John Baptist, 24 June; eve commonly 23 June | Inherited EN/FR six-field draft | Pending |
| 4 | Decorating Easter eggs: pisanki and pysanky | Cross-confessional context | Easter season; no independently established universal Holy Saturday decorating time | Inherited EN/FR six-field draft | Pending |
| 5 | Herbergsuche — Advent Marian-image visits between households | Local parish relay | Advent; individual parish house-visit itinerary, not a universal fixed nine-day programme | Inherited EN/FR six-field draft | Pending |
| 6 | Christmas Eve hay beneath the tablecloth | Regional optional | 24 December, Christmas Eve in Polish households | Inherited EN/FR six-field draft | Pending |
| 7 | La guignolée — French Canadian Christmas alms collection | Charitable tradition | Christmas-season charity drive; actual annual dates locally announced | Inherited EN/FR six-field draft | Pending |
| 8 | Polish kolędnicy — Christmas visiting carollers | Regional cultural practice | Christmas cycle; dates and troupe forms differ across regions | Inherited EN/FR six-field draft | Pending |
| 9 | Hungarian betlehemezés Nativity visiting plays | Regional cultural practice | Christmas season, local dates | Inherited EN/FR six-field draft | Pending |
| 10 | St Barbara branches — Barbarazweige | Regional optional | Traditional observance 4 December; voluntary domestic symbolism, not a Mass rite | Inherited EN/FR six-field draft | Pending |
| 11 | Provençal Christmas pain calendal and the poor person's portion | Regional domestic meal | 24 December, traditional Provençal Gros Souper; local family observance | Inherited EN/FR six-field draft | Pending |
| 12 | Three Kings gifts left in children's shoes | Regional optional | Evening of 5 January into 6 January; Spanish household custom | Inherited EN/FR six-field draft | Pending |
| 13 | L-Irxoxt — Maltese running procession with the Risen Christ | Local procession | Easter Sunday, only parishes with actual announced procession | Inherited EN/FR six-field draft | Pending |
| 14 | Pentecost greenery decorating Polish homes | Regional optional | Pentecost, movable feast resolved by Calendar | Inherited EN/FR six-field draft | Pending |
| 15 | Tivoli's Inchinata procession | Local procession | Evening 14 August and morning 15 August; Tivoli local Assumption observance | Inherited EN/FR six-field draft | Pending |
| 16 | Faradda di li Candareri — Sassari's Marian offering procession | Local procession | 14 August local procession associated with Assumption, not a universal Marian vigil rite | Inherited EN/FR six-field draft | Pending |
| 17 | Frauendreißiger — thirty days of Marian devotion | Shrine devotion | 15 August–14 September in cited Bavarian diocesan and pilgrimage accounts | Inherited EN/FR six-field draft | Pending |
| 18 | Provençal Christmas réveillon after midnight | Companion paragraph | Companion date unassigned | New EN/FR introduction | Pending |

The local event/projection gate applies to St John bonfires, Maltese Easter processions, the Tivoli and Sassari ceremonies, the Austrian Marian-image relay, and locally scheduled charitable or shrine programmes. A source naming a 2025/2026 ceremony proves neither parish continuity nor a future performance date. No GPS inference, map pin, notification, universal prescription or priestly blessing may be enabled automatically.

## Newly authored bilingual introductory paragraphs — review only

**Provençal post-midnight réveillon (EN)**

> In Provence, the traditional Christmas Eve Gros Souper was followed by a richer réveillon after midnight. The French Ministry of Culture's heritage inventory distinguishes these two meals within regional Christmas customs.

**Réveillon provençal après minuit (FR)**

> En Provence, le gros souper traditionnel de la veille de Noël était suivi d'un réveillon plus copieux après minuit. L'inventaire patrimonial du ministère de la Culture distingue ces deux repas dans les coutumes provençales de Noël.

This description distinguishes the after-midnight meal from the earlier `pain calendal` at the `Gros Souper`. It is a *companion prose proposal* under working owner `CUST-XMAS-PROVENCAL-PAIN-CALENDAL`; no new identity or second dated Calendar card is proposed. The original EN/FR history, meaning, practice and caution from the 30-dossier packet remain unaltered.

## Final acceptance workflow, in one controlled cohort

1. **Identity/ownership:** One accountable reviewer marks each of the 18 `review_key` entries as accepted distinct, regional/cultural context, merged under an existing identity, or held. The first 17 are working identities, not automatically promoted; the Provençal companion requires explicit ownership acceptance.
2. **Witness and claim:** Check the specific source sentence against every public assertion and source dependency. The source-audit's 18/18 refers to narrow claims only; it does not certify all prose, historical continuity, an original date or independence among citations. Complete remaining provenance flags (especially local Polish photo, Irish household record and cross-confessional egg craft).
3. **Ritual/authority:** Never treat ethnography as a Roman Ritual blessing; distinguish priestly rites, popular household choices, civic heritage and dated parish processions. No changes to any Mass reader or 1962 propers.
4. **Bilingual copy:** Individually sign off all English/French fields. The inherited six core fields are verbatim snapshots; the new `occasion` and `scope` localization pairs and the *réveillon* intro are new drafts, not accepted translations.
5. **Calendar association:** Authorize only contextual suggestions on existing day/season screens; retain exact region and optional/historical status, without publishing local event start times unless freshly verified. Moving feasts use the existing 1962 Calendar resolver.
6. **Publish gate:** Once approvals are documented, allocate stable IDs only where a genuinely new identity is explicitly accepted, integrate into current-main `customs-read-model.js` and/or `customs-extra-articles.js`, adjust date/context projections only where authorized, and execute browser/date regression. Keep existing approved cards unchanged and avoid backporting the research branch's older Calendar modules.

The previously owned five release subjects remain under PRs [#1610](https://github.com/Fulcanelli13/ad-orientem/pull/1610), [#1642](https://github.com/Fulcanelli13/ad-orientem/pull/1642) and [#1720](https://github.com/Fulcanelli13/ad-orientem/pull/1720). They are not added to the R18 count.

**CI:** `tests/customs-r18-bilingual-candidate-pack.mjs` runs in the existing Customs workflow. It blocks any missing bilingual field, mismatched owner/source URL, altered inherited six-field article, false source-independence claim or pre-authorized Calendar trigger/publication.

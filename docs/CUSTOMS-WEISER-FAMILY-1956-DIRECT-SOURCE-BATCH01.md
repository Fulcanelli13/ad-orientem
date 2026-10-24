# Weiser’s *Religious Customs in the Family* — first full-scan research extraction (23 October 2026)

**Book:** Francis X. Weiser, S.J., *Religious Customs in the Family: The Radiation of the Liturgy into Christian Homes*, The Liturgical Press, 1956.

**Verified online scan locator:** https://distantreader.org/stacks/pamphlets/pdf/005457130.pdf (104 PDF pages, including four inserted advertising pages). Source index records cite both original printed pagination and PDF page index with extracted-text line ranges.

## Delivered from the full original 1956 scan

- **111 individually identified source observations**, spanning sacramental and family prayer traditions, home sacramentals, patron/name-day customs, Advent and Christmas, Lent and Holy Week, Easter, Marian, Saints and Holy Souls customs.
- Of these, **15 match subject matter already present in the previous 16-entry commercial-preview extraction**. The additional **96** are new *source observations relative to that preview*, not 96 demonstrably unique customs.
- Claim types: **63 reported practices; 17 reported historical practices; 4 rite/context descriptions; 4 personal anecdotes; 22 author suggestions; 1 contested interpretation**.
- **54** descriptions have *proposed* overlaps with Handbook source observations. **16** have at least one relationship proposal to an existing 56-identity research master ID. **56** have no direct handbook/master relation yet. These sets overlap; the totals cannot be added.
- Source files contain exclusively brief, independently worded factual descriptions and locators, not a reproduction of copyrighted passages.
- No production app identifiers, 1962 rules, rituals, user-facing pages or calendar changes.

## Examples of family and household content that were not on the first 16-entry preview sheet

- Saint Joseph's Night wedding-night practices and blessing of the newly established home;
- Family prayers for priestly vocations and Priest-Saturday Communion;
- Parent blessing children with holy water and the Sign of the Cross;
- Household novenas with the O antiphons; unveiling a Christmas crib with Gospel and carol;
- Removing decorative flowers for Lent, use of Lenten pretzels, Holy Week spring-cleaning;
- Easter lamb centrepiece, special breads, holy-water customs and local decorations;
- Children's Marian scapular/Sodality participation, feast-related family meals and Guardian Angels' day.

**Editorial distinction:** Weiser mixes historical reports, recommendations for modern families, illustrative anecdotes and popular-origin claims. A source mention proves that Weiser wrote about a practice, not that it occurred identically in every Catholic region or that it is still observed today. His personal suggestions should not be catalogued as ancient inherited custom without evidence.

## Current registry pipeline status

| Research layer | Count | Interpretation |
|---|---:|---|
| Handbook source observations | 568 | Index from 28/28 chapters, not exhaustive-passage proof |
| Working Handbook practice/variant group proposals | 308 | 309 source mentions grouped; overlaps and distinctness not adjudicated |
| Prior working master identities | 56 | May overlap Handbook groups, not additive |
| Family-book direct-scan observations | 111 | 1956 book, wide first source pass, 96 not in prior preview |
| Proposed Family→Handbook links | 54 | Tentative source-level relationships, not independent corroboration |
| Family observations without direct bridge yet | 56 | Still require source-level relationship research |
| New independently approved canonical customs | 0 | Independent registry is separate from app |

## Next outstanding steps

1. Inspect original 1956 source passages around all 111 locators, especially unusual history claims and one-off anecdotes; verify exact page labels and separate suggested conduct from attested custom.
2. Exhaust the full 1956 book systematically page-by-page, rather than assuming the 111 selected passages capture every named custom; special note to the binding/insertion shift in PDF pagination.
3. Distinguish **one practice with several witnesses** from **several materially different variants**; do not automatically deduplicate two different Weiser descriptions.
4. Reconcile remaining 56 Family-book observations without a direct match to the Handbook/master; retain original source pointers and provisional distinctness.
5. Extend the source register to other independent Catholic family and regional tradition corpora, with the same preservation and provenance rules.

Files:
- `data/customs/master/weiser-family-1956-fullscan-source-pass01.v1.json` (111 source observations);
- `data/customs/master/weiser-two-book-relationship-review.v1.json` (111 cross-source status records);
- `tests/customs-full-registry-census.mjs` (source IDs and candidate relationships checked structurally; remote Node CI execution remains to be confirmed).

**Scope lock:** No app integration, calendar selection, sacred art, custom popularity ranking or geography-first screening until the comprehensive source registry is mature.

# Sacred Art — Class III 2026 matching, consolidated 131-date pass

**State:** research and curatorial proposals only; no new Calendar hero assignment, image rights certification, publication or source download.

The existing 2026 coverage master records **165 Class III days**, including **34 contextual proposals** already recorded, leaving **131 unmatched dates**. This pass does not overwrite those 34 or any Class I/II, Prayer, Rosary, published-photo or user rejection decisions.

## Why the earlier first reading understated progress

The prior date evidence uses multiple artwork metadata variants:

- Catalogue rows: `title`, `artist`.
- External museum inventories: `titleAsSource`, `artistAsSource` or `titleAsCatalogued`, `artistAsCatalogued`.

Treating only the first pair as real artworks gave **39** apparent named dates; that was incorrect. Normalisation recovers **106 dates** with **177 named title–artist source entries**. Exactly **25 dates** lacked pre-existing date-specific artwork candidates. Of those 25, the frozen 989 research groups supply 15 subject-specific title leads, not vetted imagery. A single follow-up **artwork-object matching** pass (not photo-acquisition research) identified **seven more** dated painting objects, including two legitimate but incomplete multi-saint groupings.

### Resulting editorial worklist

| Class III group | Dates |
| --- | ---: |
| Existing named date-source work | 106 |
| New title-only candidate from existing 989 gallery | 15 |
| Newly researched artwork objects, full saint/feast subject | 5 |
| Newly researched artwork objects, partial multi-saint observance | 2 |
| Still no identified artwork object | 3 |
| **Total Class III unmatched days triaged** | **131** |

There are now **128 dates with a named candidate**, but these are **not 128 owner-approved/photographically cleared date images**. The remaining three **exact object** gaps are Sts Soter & Caius (22 April), St Boniface (5 June), and the four-saint Nazarius/Celsus/Victor/Innocent feast (28 July). For 12 May and 10 July, selected paintings show only subsets of each observance; the missing saints must not be claimed in image captions.

### Specific additions beyond frozen records

1. Our Lady of Lourdes (11 Feb) — Southern Italian school, *Apparizione della Madonna a Lourdes*, ICCD 1700126164 (1888, aesthetically weak / damaged original).
2. Seven Servite Founders (12 Feb) — Gaspare Diziani's *Madonna Presents the Dead Christ to the Seven Founders*, Treviso museum attribution recorded via Commons. **Secondary-source identity hold; no Commons image admitted.**
3. St Monica (4 May) — Ary Scheffer, *Saints Augustine and Monica*, National Gallery NG1170 (nineteenth-century style exception).
4. Nereus, Achilleus, Domitilla and Pancras (12 May) — Cristoforo Roncalli's oil painting of **Nereus, Achilleus and Domitilla only**; Pancras is not confirmed.
5. Seven Holy Brothers, Rufina and Secunda (10 July) — Brera's 1620–24 *Martyrdom of Rufina and Secunda* only; the seven brothers are not depicted.
6. St Cajetan (7 Aug) — Giovan Gioseffo Dal Sole, *San Gaetano da Thiene riceve Gesù Bambino dalla Madonna*, Zeri original-object catalogue.
7. St Clare (12 Aug) — Cima da Conegliano, *Madonna and Child with Saints Francis and Clare*, Met object 435901 (Renaissance fallback).

Exact object pages, authors, original medium, source/attribution caveats and every remaining rights/quality hold are recorded in `sacred-art-2026-class-iii-final-gap-seven-source-leads-20261110.v1.json`.

## Historical identity and gallery safeguards

The 131-date master includes **17 explicit namesake/observance disambiguation notes**. In particular, guard Anthony Abbot against Anthony of Padua; Sylvester Gozzolini the abbot against Pope Sylvester I; Pope Martin I against Martin of Tours; William of Montevergine against William of Aquitaine; Jerome Emiliani against Jerome of Stridon; Pius X against Pius V.

**Retain prior accepted artworks.** Source ratings such as `APPROVED_LOCKED` and `APPROVED_5` are preserved as historical painting evidence, but never extended to an unapproved feast-date binding. Class III has 12 recommended works with source-level prior acceptance; 94 more come from existing named candidate research. No user-rejected painting has been reinstated. In particular, artwork research that points to Prado does not grant permission to use its image. The 15 gallery matches are research titles, not auto-admitted Commons photos.

## Next release-oriented implementation

- Keep already selected art fixed; produce a **single owner-facing image selection slate** from the 128 candidates, grouped by exact-saint/partial-scene/rights-hold instead of 131 individual repeated source audits.
- Date-scoped owner acceptance and exact source-image approval are **separate gates**, followed by whole-painting/facial quality checks and mobile crops.
- The 3 hard subject gaps and 2 partial multi-saint groupings need a final **artwork-selection** decision or honest contextual single-saint depiction; do not force an invented group portrait.
- Work on Class I frozen works and the accepted Prayer releases can proceed independently; do not block on the Class III source rights queue.

Run `node tests/sacred-art-2026-class-iii-131-curatorial-master.test.mjs`. It checks the full 131-date set, original 177 named source entries, photo/source gating, historic accepted-art scope, 7 new sources, 2 partial scenes and 3 genuine remaining gaps. It changes no app runtime or live Calendar hero mappings.

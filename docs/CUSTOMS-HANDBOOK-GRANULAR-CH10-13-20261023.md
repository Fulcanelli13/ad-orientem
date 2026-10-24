# Customs research: Handbook targeted source reread — 23 October 2026

## Executive outcome

The 1958 *Handbook of Christian Feasts and Customs* index of 568 observations was a first pass, not a complete source-census. Six independently numbered omissions from pp.128–129 had previously been added. This pass now captures **57 finer-grained details** across **24 individual printed pages** in chapters **10–13**, covering the book's Christmas Week, Feast of the Circumcision/New Year, Epiphany, and Pre-Lent discussions (roughly pp.123–167).

**Crucial distinctions:**
- 568 original Handbook observations + 6 separately recovered omissions = **574 base observation rows**.
- **57 further source details** are linked as candidate components, local variants or historical refinements of older observation rows; they overlap source passages and **must not be counted as another 57 independently established customs**.
- The separate 1956 *Religious Customs in the Family* first full scan has 111 source observations.
- **685 base source-observation rows** across the two Weiser books, **742 catalogue research rows inclusive of 57 nested detail records**. Neither is a count of unique customs.
- Existing master 56 working identities + 308 provisional Handbook practice groups + 39 historical group leads + 6 addendum leads; overlap is unresolved.
- **No new verified canonical custom IDs, no app publications.**

## Source methodology

Book: Francis X. Weiser, *Handbook of Christian Feasts and Customs* (1958).

- Primary PDF scan: https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf
- Searchable source witness (OCR): https://www.scribd.com/document/447017805/Handbook-of-Christian-Feasts-and-Customs
- The `weiser-handbook-targeted-addendum-ch10-13.v1.json` ledger assigns each record: original printed page, corresponding zero-based scan page index, exact OCR extracted-line interval, earlier source observation relationship, and evidence tier.
- The scanned 1958 PDF printed page to screenshot index was spot-calibrated: printed p.123 is zero-based PDF page 140; p.129 is index 146; p.149 is index 166; hence `pdf_index = printed_page + 17` in main text.
- Textual sections and individual passages were read and source labels independently worded, with several relevant original-page screenshots checked. **The 24 page locations do not mean those 24 entire pages have been exhaustively line audited**. Existing observation paragraphs overlap new details.
- The new rows explicitly distinguish seasonal household acts, ritual/ministerial acts, local food traditions, historical pageants, Orthodox/Eastern practices, civic seasonal folklore and contested folk efficacy. Related historical folk practices are **described**, not endorsed or presented as Roman Catholic rites.

## Material newly itemized within older broad labels

| Cluster | Examples of details retained |
|---|---|
| Christmastide | Christmas-tree nightly family Rosary; children's parish crèche devotions; Saint Stephen riding variants; Staffan Riders; Saint John blessed wine kept and used at home; Holy Innocents novices' festive precedence |
| New Year | Horse-mounted carollers and parish tower music; household-delivery gratuities; gifts to traffic-police families; traditional noises and divination kept as folk context |
| Epiphany | Water blessing and immersion in historical eastern localities; distinct Mid-Pentecost water procession; Epiphany chalk at homes; historical non-liturgical Magi plays; Spanish live Magi gift delivery; cakes with both king and queen beans |
| Pre-Lent | Byzantine Meatfare/Cheesefare; Alleluia work song and Auxerre liturgical farewell variant; German `Brandsonntag` fire wheels; French `Fête des brandons`; Easter dawn water customs as **folk practices with contested effects**; Tyrolean newlywed maypole; English collops, Scottish crowdie, Norwegian buns, Russian Butter Week foods and effigies |

Every example remains attached to original Weiser observations, even when its relationship might ultimately justify a separate identity.

## Source-completeness expansion — Weiser precursor works

In the 1958 Handbook **Foreword**, Weiser expressly explains that he condensed three previous books and left out some *recipes, music and poems*. He also says some folklore was obtained through personal observation or correspondents without always identifying published evidence. The earlier titles are therefore **source-critical acquisition targets**, not merely optional reading:

1. *The Christmas Book* (1952; Harcourt, Brace). A reprint and edition metadata were located, **full original text not extracted**.
2. *The Easter Book* (1954; Harcourt, Brace). Historical excerpt and archival bibliography located; **complete original text not extracted**.
3. *The Holyday Book* (1956; Harcourt, Brace). Bibliographic/archive and edition data located; **text not extracted**.
4. *The Year of the Lord in the Christian Home* (1964; Liturgical Press). Additional later Weiser work confirmed in Jesuit archival bibliography; **contents not inspected**.

See `weiser-precursor-works-acquisition.v1.json` for catalogue links and evidence status. These are not four books already mined, and because they share the same author they do not independently corroborate his Handbook.

## Integrity checks

`tests/customs-full-registry-census.mjs` checks:
- 57 unique nested-detail IDs that cannot collide with prior 574 original/addendum Handbook IDs;
- all 57 parent-observation references exist;
- OCR intervals and printed-to-PDF page mapping;
- four precursor source IDs unique;
- catalogue source counts 685 base observations, 57 nested details, 742 combined research rows;
- no invented verified distinct identity or app publication.

Workflow `.github/workflows/customs-master-integrity.yml` automatically runs the test in the draft PR. **CI outcome must be checked separately after the latest commit; a committed test is not itself a passed test.**

## Remaining research

The current step is a **targeted source passage audit, not full 1958 book page closure**. Continue with systematic larger spans across all 28 Handbook chapters, especially earlier 1–9 and later 14–28; capture new omission rows and nested variations separately. Then compare precursor books where content is actually accessible, and finally reconcile source-mention to distinct-custom practice/variant identities with explicit time/place scope and independently supported evidence.

Research stays separate from Ad Orientem's calendar, UX, prayers, liturgical rites, or published catalogue.
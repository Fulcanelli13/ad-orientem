# 1962 Missal ↔ Bible: 44 clustered candidates, 13 visual edge-case decisions

**Research checkpoint — 12 October 2026 — PR #1018 only.** No modifications to published Mass, LIVE, Calendar, Bible Atlas or Formation.

## What is now supported by primary-page witnesses

The high-priority review queue contains **100 source files**. All 100 were compared as Latin anchor phrases against the existing text layer of the 1,088-page CMAA [full 1962-labelled Missal scan](https://media.musicasacra.com/pdf/missale62.pdf); SHA256 `648fdb8fe830ed65a08aa4a95de6f94424c533ddf2398c8fc26b18735fd3518a`. This gave **86/100 files with at least one literal OCR candidate** and **44 files with stronger multiple-section page clusters**. An OCR match is an index lead, not 1962 liturgical certification. The complete edition's decree and 1962 reprint variations remain a separate check.

The [44-path contextual OCR dossier](../../data/geography/research/mass-1962-44-cluster-printed-page-context-20261012.v1.json) now provides 66 distinct candidate PDF page positions, page-heading samples, specific matched Latin source sections and direct source references. The [printed-heading crosscheck](../../data/geography/research/mass-1962-44-cluster-calendar-heading-reconciliation-20261012.v1.json) found:

| Candidate class | Source paths |
|---|---:|
| Same Sanctoral date in matched-page running heading | 17 |
| Matching month but continuation/uncertain day | 5 |
| Different printed month — mandatory visual recheck | 7 |
| Explicit July 3 Irenaeus alias | 1 |
| Commons/votives requiring rubrical interpretation | 2 |
| Local/supplemental formularies requiring geographic entitlement | 2 |
| Temporal-cycle source/printed placement review | 8 |
| Other non-date code review | 1 |
| Heading OCR unavailable | 1 |
| **Total** | **44** |

These are provisional retrieval classes, not nine levels of certification.

## Physical-page verification of seven apparent cross-month contradictions

A second [17-page image proof run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38201883028) completed with exact source PDF SHA validation. **Fourteen** of the rendered pages were actually examined and are preserved as **13 adjudicated source path cases** in [this primary-image register](../../data/geography/research/mass-1962-visual-13-calendar-edge-case-adjudications-20261012.v1.json):

- **St Paul, 25 January → 30 June:** `Sancti/01-25` explicitly says `ex Sancti/06-30`; printed p. 571 is **30 June, Commemoration of St Paul**, III class. This cross-month OCR hit has a genuine source-parent explanation; **not** automatic January-25 printed-Proper certification.
- **St John Bosco, 31 January → February running header:** printed p. 462 carries the preceding Bosco Gradual, Tract, Offertory and Communion *above* the start of the 1 February St Ignatius Mass. This is a page-break boundary, not evidence against Bosco's Mass.
- **St Gabriel of Our Lady of Sorrows, 27 February → March running header:** printed p. 482 carries the tail of St Gabriel's Mass before the 4 March St Casimir text. A separate June 4 hit points to another Mass; both need word-level boundary checks. Treat neither date as a replacement for 27 February.
- **Martyrs, 20 January versus 30 July:** `Sancti/01-20` names SS. Fabian and Sebastian; printed p. 607 is **SS. Abdon and Sennen, Commemoratio**. Shared Gradual/Tract language must not be interpreted as the same celebration.
- **St Gabriel Archangel, 24 March versus 29 September:** `Sancti/03-24` names Gabriel; printed p. 670 unequivocally heads the **Dedication of St Michael the Archangel**, I class. Angelic shared or inherited texts must be traced to actual rubrics.
- **Martyrs, 2 June versus 11 August:** `Sancti/06-02` names Marcellinus, Peter and Erasmus, with Common directives; printed p. 623 begins the **SS. Tiburtius and Susanna, Commemoratio**. Do not replace one with the other by verse coincidence.
- **St Joachim, 16 August versus 1 February:** `Sancti/08-16` names Joachim; printed p. 463 identifies **St Ignatius, bishop and martyr**, III class. Matching Tract/Offertory does not attest Joachim's 1962 festival placement.

## Other high-leverage rubrical corrections

- Printed **p. [200]** in the CMAA scan is St Peter Claver's Mass under `Missae pro aliquibus locis`. The `Sancti/09-09n` record therefore requires local/regional eligibility and cannot be loaded as a universal calendar Mass.
- Printed **p. [221]** is `Commune plurium confessorum non pontificum`, consistent with the `Sancti/07-13pl` source naming rather than a universally dated feast.
- Printed **p. 698** says `Festa octobris (dominica ultima)` and includes the Kingship readings and **non-commemoration of the ordinary Sunday**. `Sancti/10-DU` is a **last-Sunday-of-October rule**, not a fixed October day. Verify the feast title on its preceding printed page before certifying the whole rubric.
- Printed **p. 693** contains the end of a preceding October St John's Proper *and* the start of the 21 October St Hilarion commemoration; `Sancti/10-20` should be interpreted section by section across the boundary, not from the top header.
- `Tempora/Quad5-5` matches material at **15 September, Seven Sorrows of Mary, II class**, printed p. 656; the September feast page is *not* itself evidence that a Passiontide Friday uses every such chant.
- `Tempora/Pasc7-6t` matches **Lenten Ember Saturday**, printed p. 76 with extended lessons, Gospel of the Transfiguration and specialised Tract. A `Pasc` path prefix does not validate a Paschal calendar owner. Reconcile exact source inheritance and `GradualeL...` boundaries before publishing.

## Progress reconciliation, with correct denominators

- **1,052/1,052** upstream source files have been retrieved in the research index.
- **100/100** HIGH paths have machine-readable source packets.
- **44/100** HIGH paths have at least one stronger multi-section printed-page cluster.
- **20/44** clustered source paths have at least some manual printed-page inspection, when combining the earlier seven spotchecks, July 5 printed comparison and twelve newly observed distinct cases; **24/44** clustered paths still await manual visual reconciliation.
- **56/100** HIGH paths remain outside the stronger printed-page cluster class and require original source, rubric or alternative index treatment.
- **0/100** have passed complete title/decree+calendar+rubric+Latin Bible edition+French Crampon verification; **0** new results approved for the production app.

[Heading-integrity workflow](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38202350688) passes checks that all seven initial month discordances are represented in primary-image decisions and all publication flags remain closed.

## Next batch / non-negotiable gates

Review the **24 remaining strong page-cluster sources** using printed heading, beginning/end section boundaries, and source inheritance. After that, take the **56 non-clustered HIGH paths**, prioritizing missing Commons and seasonal/Ember variants. Resolve actual 1962 eligible liturgical usage separately from Latin chant and Vulgate verse identity, especially the distinct **Alleluia, Tract, Sequence and GradualeL** structures. Compare Clementine, Crampon and Douay word-by-word only for contextually verified liturgical occurrences.

Keep existing source-owning Mass, Bible Atlas, and Formation pipelines independent; do not merge this research PR into production on the basis of OCR hits or printed incipits alone.

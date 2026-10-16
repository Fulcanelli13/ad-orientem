# Ad Orientem — Scripture story-first editorial triage and path proposal
**16 October 2026 · Research-stage review · No final selection of Scripture verses**

## Governing objective
Ad Orientem is not creating a 73-book reading curriculum. Its guided Scripture journey should introduce memorable biblical stories, explain why they matter for Catholic faith, and encourage readers to open the longer/full passage in the existing native Bible reader.

**Canonical preservation:** 151 original Atlas event IDs and chronology reference points, 37 existing reading sections, 460 original publisher-reference records, approved Bible versions, geolocated art/places and existing reader are not replaced. A decision to omit an event from a **guided path** does not delete the original Atlas event or remove it from Scripture browsing.

**Sources of truth:**
- `data/explore/biblical-story-first-editorial-policy.v1.json` — new user-directed selection policy.
- `data/explore/biblical-story-first-editorial-triage.v1.json` — complete 151-event + 53-supplement + 41-split proposal decisions, source evidence and 13 narrative arcs.
- `data/explore/biblical-story-first-curation-review.v1.csv` — flat **245-item editable decision queue** with blank reviewer response columns.
- `data/explore/biblical-pericope-comparative-full-master.v7.json` — original 460 published reading references retained unchanged.
- `data/explore/biblical-scripture-reading-granularity-audit.v1.json` — 41 structural split suggestions + 53 supplement suggestions, neither a production schema nor mandatory lesson count.

## Preliminary decisions, not approved readings

| Editorial use | Original Atlas events (151) | Proposed supplemental readings (53) |
| --- | ---: | ---: |
| **CORE_STORY** — primary engaging guided narrative | 94 | 19 |
| **SUPPORTING_REFLECTION** — prophecy, doctrine, Psalm, prayer or companion passage | 21 | 29 |
| **OPTIONAL_DEEPER_READING** — link into full native Bible or optional study | 23 | 3 |
| **SKIP_GUIDED_PATH** — not an independent guided lesson | 13 | 2 |
| **TOTAL** | **151** | **53** |

These counts represent **113 possible core story elements**, not a target of 113 lessons, and every range remains subject to Scripture context and authorized-edition review. Multiple core story elements can compose a single readable chapter or narrative encounter. Every source-family vote belongs to the v7 registry and cannot be multiplied because one chapter gets split.

The previous 41 proposed split plans are re-triaged:

| Treatment | Parent milestones | Effect |
| --- | ---: | --- |
| Keep one story with internal anchors | **30** | Reader may jump to literary/narrative movements; do not create multiple compulsory lesson entries |
| Consider separate companion or internal study unit | **4** | Visitation/Magnificat, Sermon on the Mount, Bread of Life discourse, Pentecost; preserve parent story coherence |
| Optional structure only | **7** | Parent does not currently justify multiple required lessons |

**Duplication audit:** A supplemental Lazarus reading repeats existing Atlas event 104; supplemental Ethiopian baptism repeats event 129. Both are held as duplicates from the guided path. John 20:19–23 and 20:24–29 belong to the existing John 20:19–29 event 123, which should provide internal anchors rather than duplicate event cards.

## Suggested 13 user-facing story arcs

These are editorial *groupings*, not a new Gospel harmony or a new 13-tab app navigation. Existing 37 section IDs remain.

1. Beginnings, Fall and covenant — Genesis creation, temptation, Protoevangelium, Flood and Noah.
2. Abraham and patriarchs — Abraham's call, sacrifice of Isaac, Jacob and covenant.
3. Joseph and Providence — betrayal, elevation **and missing reconciliation (Genesis 45)**.
4. Moses and deliverance — burning bush, plagues, Passover, Red Sea, manna, Sinai.
5. Ruth, Samuel and kingship — Ruth, Samuel's call, David and Goliath, Davidic promise, Elijah.
6. Prophets, exile and fidelity — chosen dramatic stories of Judith, Esther, Daniel, Susanna and Martyrs; brief messianic prophetic passages.
7. Annunciation, Nativity and Holy Family — Gabriel, Mary and Joseph, Visitation, shepherds, Magi, Presentation.
8. Christ begins his public ministry — Baptism, temptations, calling disciples, Cana, healing, Sermon/Beatitudes/Our Father.
9. Encounters, parables and signs — living water, Bread of Life, mercy parables, Lazarus, Good Shepherd.
10. Entry, Eucharist and Passion — Palm Sunday, washing of feet, Last Supper, Gethsemane, trial, Calvary and burial.
11. Resurrection and Ascension — Magdalene, Emmaus, Apostles, Thomas, lake of Galilee, Ascension.
12. Holy Ghost and apostolic Church — Pentecost, Peter, Stephen, Ethiopian, conversion of Saul, Cornelius, Jerusalem Council, Paul.
13. John and the heavenly Jerusalem — Christ in glory, the Lamb, heavenly liturgy and the New Jerusalem.

Main arc priority must not be determined by equal time allotment: Passion and Gospel may merit much more space than monarchies or exile. Typological supporting passages from Genesis, Exodus, David, Isaiah, Wisdom, Daniel and Song of Songs must be used precisely, **not forced into a fabricated historical scene or presented as an explicit quotation when interpretation is devotional**.

## Six urgent editorial continuity checks
1. **Joseph's restoration:** Existing Atlas 15–17 omits Genesis 45 reconciliation; include as substantive candidate to avoid misleadingly jumping from betrayal to Egypt's settlement.
2. **Plagues and Paschal causality:** An Exodus 7 first-plague event cannot itself cover the full Plagues and first Passover. Choose sufficient context and climactic outcome before finalizing excerpts.
3. **Matthew 2 order:** Atlas index 73 (Holy Innocents) comes before index 74 (Flight to Egypt), whereas Matthew's written sequence is Flight (2:13–15), then massacre (2:16–18). Avoid silently certifying this as harmonized Gospel chronology.
4. **Early public ministry across Gospels:** Baptism, John's first disciples, temptations and Cana currently intermingle the evangelists; the exact order across Gospel accounts is not a settled source reconciliation here.
5. **Overlapping Luke 2:** Hidden life verses 51–52 already conclude the Finding in the Temple story.
6. **Overlapping 2 Kings 25:** The Exile event cites a subset of the Destruction of Jerusalem passage; one reading should suffice.

## Reading experience proposed, not yet implemented
A typical user-facing story could show: (1) short introductory context identifying persons and setting, (2) exact excerpted original Scripture, retaining speech and causal sequence, (3) brief explanation of meaning and any well-grounded Old/New Testament relationship, (4) optional “Read more in Scripture” action opening the full passage in the existing reader. Avoid authoring a new synthetic biblical narrative, converting non-story books into obligations, or replacing Scripture with catechetical prose.

**No selections, approvals, new Atlas IDs, native-reader changes or production app changes have occurred.** All recommendations in this file and JSON remain provisional until contextual and theological editorial review. GitHub CI execution remains separately unconfirmed.

## Next work: editorial evidence-rich first cohort
Select an initial small group of major stories across eras (rather than all 113) for contextual readability review, retrieving exact text using the *previously agreed* Bible edition within Ad Orientem. Strong first comparisons include Genesis 3 (Fall and Protoevangelium), Genesis 22 (Isaac), Genesis 45 (Joseph reconciliation), Exodus 12 (Passover), Luke 1 (Annunciation and Visitation), John 4 (Samaritan), John 6 (Bread of Life), John 11 (Lazarus), Luke 22/John 13 (Last Supper), John 19 (Calvary), Acts 2 (Pentecost), and Revelation 5/21 (the Lamb and New Jerusalem). Use the published 460-reference master to compare actual cuts, not to compute popularity or decree an exact verse range automatically.

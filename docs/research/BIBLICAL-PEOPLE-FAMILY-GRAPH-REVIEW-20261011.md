# Biblical People & Genealogy — full corpus research explorer (11 October 2026)

## Purpose and owner
This is the **third Biblical Atlas view**, independently reviewed against the 151-event production Atlas (#998) and 181-event cinematic pilot (#1010). Its branch begins from the authentic imported OpenBible/STEPBible research files in #923. It exploits the full research corpus, without treating kinship or coordinates as historical certification.

## Working results
- **Offline, standalone HTML:** reviews/biblical-genealogy-research-prototype-20261011.html. Embedded data, branch expansion, all-name search, geographical co-mentions and per-person detail.
- **All imported persons:** data/geography/research/biblical-people-network-2026-10-11.v1.json. Original structural relationships preserved unapproved.
- **All imported geographical identities and modern hypotheses:** data/geography/research/biblical-geography-network-2026-10-11.v1.json.
- **Exact verse-level concordance:** data/geography/research/biblical-person-place-covertex-2026-10-11.v1.json.

## Measured imported-data totals
| Measure | Count |
| --- | ---: |
| Raw STEP person rows / unique person IDs | 3,232 / 3,231 |
| Distinct normalized name forms retained | 3,951 |
| Distinct per-person verse references | 25,663 |
| Unresolvable distinct relationship target strings | 68 |
| OpenBible ancient places | 1,342 |
| Modern location hypotheses | 1,596 |
| Place/verse observations | 8,742 |
| Place identities with multiple modern proposals | 777 |
| Places without modern proposal | 7 |
| Exact same-verse person/place matches | 9,802 |
| Persons with at least one same-verse place | 1,153 |
| Places with at least one same-verse person | 784 |
| Non-normalized imported reference variants | 30 |

**9,802 textual co-mentions are not 9,802 visits or journeys.** A person and place mentioned in the same verse may refer to many different situations, including a simile, a prophecy, a letter addressed to another city, or a region discussed by someone who is not present.

## Kinship truth and Catholic publication gates
1. Source fields for father, mother, partner, children and siblings are research hypotheses until separately checked. Unreviewed relationships are shown dashed, with a toggle to hide them.
2. The upstream adapter incorrectly treats Adam and Eve as siblings. This is neither displayed nor promoted.
3. It treats the named brethren of Jesus as children of Mary and Joseph. The viewer suppresses these alleged biological children, even when unreviewed source candidates are visible. Joseph's relationship to Jesus is **legal**, while Mary is His mother.
4. Its proposed attribution of Heli as Mary's father is disputed and not displayed as verified ancestry.
5. Matthew 1 and Luke 3 require separate verse-defined genealogical treatments. Never silently mix the two lists or infer a genealogy from the imported person's automatic relationship edges.
6. Missing, question-mark-qualified, pseudo-person and inconsistent ID relationships need reconciliation; do not make them accepted genealogical facts.
7. Faithful source citations need to accompany individual reviewed genealogical edges, not merely the overall data table.

## Review functionality
Search all 3,231 people including alternate name forms; expand the family tree one generation at a time; jump between parent and child; show checked example edges versus unreviewed edges; inspect each person's citations; inspect ancient places from same-verse evidence and competing modern location candidates. All functions work from one HTML file without an external API. The research map is expressly **not** an apostolic itinerary.

## Next expansion batches
- Verify key names with many distinct identities: Mary, John, James, Judas, Philip, Joseph, Simon.
- Build source-critical, citation-bearing genealogies for Genesis 4–11, the patriarchs, Ruth 4, Chronicles 1–9, Matthew 1 and Luke 3.
- Add an **Apostolic Dispersion** network for Peter, John, James, Andrew, Thomas, Philip, Bartholomew, Matthew, Simon, Jude, Matthias, Mark, Luke, Barnabas and Our Lady, distinguishing Scriptural itineraries, early patristic witness and later traditions.
- Reconcile all 1,342 biblical places, 1,596 modern proposals and original source judgments with Sacred Geography before making public place pins.
- Complete the missing Catholic-book geographic coverage, deuterocanonical books, Greek Esther/Daniel additions and Douay/Crampon/Vulgate verse correspondence.
- Only when design and evidence pass review, synchronize the third genealogy view to the current chronological timeline and cinematic map.

## Provenance
OpenBible https://github.com/openbibleinfo/Bible-Geocoding-Data at pinned 7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f (CC BY 4.0 core, ODbL where OpenStreetMap-based coordinates apply).
STEPBible https://github.com/STEPBible/STEPBible-Data, via Patristic Text Archive https://github.com/PatristicTextArchive/tipnr_data using an **older 2024 adapter**, not represented as a certified 2026 upstream synch. Refer to the pinned vendor acquisition manifest in #923 for full source SHA and licensing details.

**Research only: no published map pins, app reader changes or approved family trees.**

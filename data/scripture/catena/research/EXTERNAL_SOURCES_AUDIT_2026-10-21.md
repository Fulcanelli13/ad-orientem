# Living Catena — external data audit, 21 October 2026

**Research only. No external Father excerpts or question-to-Father associations have been approved for publication.**

## Decisions

The existing source-pinned Ad Orientem Catena remains the **only rendered Father-text registry**. External projects provide candidate vocabulary, subject headings, verse references and optional independent witnesses. An external question does not prove that a Father addressed it; a verse-linked original excerpt does not automatically answer every question about that verse.

| Resource | Directly inspected data | Rights and Catholic-suitability constraints | Decision |
| --- | --- | --- | --- |
| [Open Christian Data](https://huggingface.co/datasets/OpenChristianDataOrg/open-christian-data) | Twelve data configurations; 3,509 catechism Q&A, 5,945 topical entries, 70,164 Scripture-linked Fathers quotations, 115,069 commentary entries. Records include source, tradition, edition, licence and Scripture reference fields where applicable | Published dataset labelled CC0, but upstream-rights exceptions remain recorded; code, schemas and tools are separately CC BY-NC. Mixed confessions and historical translations must be filtered | **Priority 1:** extract Catholic questions and topic reference metadata only; source rights per item |
| [Baltimore Catechism No. 1](https://github.com/OpenChristianData/open-christian-data/blob/main/data/catechisms/baltimore-catechism-no-1.json) | The inspected file contains 206 Q&A records. Metadata identifies 1885, Third Plenary Council of Baltimore, Catholic tradition, Project Gutenberg provenance, per-question item ID, original question and answer | Catholic teaching is valuable question vocabulary, **not** the words of the Fathers. Multiple questions have broad theological scope beyond a particular Gospel verse | **Priority 1:** exact question strings; connect to Catena only as explicitly reviewed candidates |
| [Baltimore Catechism No. 2](https://github.com/OpenChristianData/open-christian-data/blob/main/data/catechisms/baltimore-catechism-no-2.json) | 421 rows with analogous provenance and Catholic tags. Some questions are literally duplicated from No. 1 | Do not count duplicate editions as independent reader demand; preserve edition and question ID | **Priority 2:** deduplicated question family, with historical wording |
| [HistoricalChristianFaith Commentaries-Database](https://github.com/HistoricalChristianFaith/Commentaries-Database) | Verse-based author TOML records with quote, source_title, source_url and optional date; supports SQLite/JSON/CSV. Actual John Chrysostom / John 1:1 file cites Homily on John 2 and explains the name Word | Repository LICENSE dedicates public-domain compilation and historical extracts, **but exempts excerpts from still-copyrighted works** that it uses under fair use. Historical labels/translations need verification | **Priority 2:** independently source-checked public-domain patristic witnesses, never bulk copy |
| [Nave and Torrey topical indexes](https://github.com/OpenChristianData/open-christian-data) | Open Christian Data reports 5,945 combined topical reference records | Their established subjects are helpful vocabulary, not Catholic doctrine or Father-to-question proofs; specific verse records still need sampling and normalization | **Priority 1:** source-labelled subject-to-verse candidates, after per-record inspection |
| [NEUU Nave/Torrey derivative](https://github.com/neuu-org/bible-topics-dataset) | Reports 5,745 normalized merged subjects and 65,485 biblical references, with a distinct AI-enriched pilot layer | Historic source works are public domain; its compiled data is stated CC BY 4.0. AI enrichment should never become theological authority | **Fallback** if the Open Christian Data index is structurally unsuitable |
| [OpenBible topical queries](https://www.openbible.info/topics/) | Crowd-shaped contemporary questions, linked verses and weekly data files | Popularity does not validate interpretation; quoted ESV Scripture text has a separate copyright | **Later:** modern search formulations only, with attribution and no verse-text republication |
| [BiblIndex](https://www.biblindex.org/en/overview) | Scholar-curated biblical quotations/allusions, named Father/edition/page/line coordinates. The site says it does not give access to underlying texts | Bibliography and original-text licensing must be assessed separately | **Validation reference**, not a quote supplier |

## Real source examples inspected

The **original Catholic question wording** below was read from the Baltimore Catechism No. 1 JSON, with identifiers preserved:

- Item 26 — “Is the Holy Ghost God?” Candidate links to Matthew 3:17 and John 14; neither is approved to answer this catechism question automatically.
- Item 69 — “What do you mean by the Incarnation?” Candidate link to John 1:14.
- Item 94 — “Who is the Holy Ghost?” Candidate link to John 14; historical patristic explanation may address only the Spirit's action, not a full definition.
- Item 152 — “What is Baptism?” Candidate contextual link to Mark 1:9; John's baptism must not be silently equated with the later sacrament's full doctrinal definition.
- Item 238 — “What is the Holy Eucharist?” Candidate links to Mark 14:22 and Luke 22:19, subject to full source and doctrinal review.
- Item 156 — “How is Baptism given?” Inspected as a potential later crosswalk; **not inserted** into the current 40-passage pilot.

The [separate Chrysostom witness on John 1:1](https://github.com/HistoricalChristianFaith/Commentaries-Database/blob/master/John%20Chrysostom/John%201_1.toml) names Homily on the Gospel of John 2 and asks why the Evangelist names Him the Word. This is useful evidence that patristic **texts themselves sometimes contain natural questions**. It has not been aligned to a matching Catena fragment or verified against a critical edition.

## Crucial data findings

- A large topical corpus is not a large corpus of **questions that particular Fathers answered**.
- **Three actual historical-topic records were additionally read**, using the [NEUU source-labelled Nave/Torrey parsed data](https://github.com/neuu-org/bible-topics-dataset): BAPTISM (Nave, “General references”, Mark 1:4,5,8–10, containing Mark 1:9), BREAD (Torrey, “Illustrative: Of Christ”, John 6:33–35, containing John 6:35), and GRACE (Torrey, “Christ was full of”, John 1:14). Those verse alignments are individually confirmed in the structured records. They remain **topic-to-verse** evidence only, not patristic Q&A approval. The derivative repository declares CC BY 4.0.

The published Open Christian Data corpus imports data partly from HistoricalChristianFaith: counting both as independent witnesses without lineage deduplication would inflate apparent evidence.
- Open Christian Data's online tabular preview currently reports a data casting/schema error on its default display. Inspection of the publicly available original JSON repository works, but we should not promise that the hosted row viewer works across all subsets.
- The catechism edition is a Catholic theological source for user language, not a patristic attribution source; biblical topics are navigation candidates, not statements that a verse means a particular thing.
- Original author **rhetorical questions** can be harvested where attested, but only after reading context and determining whether they make suitable prompts.
- Every patristic quotation in a source-answer screen must still be retrieved unchanged from the authoritative Catena pack, with its real attribution and source reference.

## Relationship contract for the future registry

A usable relationship must separately record:
- Exact original question string, source identifier, source work/edition, source licence and tradition.
- Source topical heading and exact original biblical notation; only mark a topical mapping verified when the individual source row has actually been examined.
- Normalized Scripture location and original notation, without assuming all Bible editions have identical versification.
- Existing Ad Orientem original Catena pericope and excerpt ordinal, with an actual verbatim evidence span.
- Editorial relationship status: candidate / supported-direct / related-context / rejected. Approvals require an identified reviewer, evidence and date; no unreviewed candidate can be presented as “the Father answered this”.
- Lineage and duplicate detection across upstream databases, editions and digital transcriptions.

## Forty-pericope pilot

See [external-pilot-40-pericopes.v1.json](external-pilot-40-pericopes.v1.json), a **research-only** register covering **10 distinct passages in each Gospel**, with 41 source-checkable existing editorial questions and eight external candidate links. The questions already present in Ad Orientem's original test fixtures are **not misrepresented** as externally mined question records. External linkages are deliberately labelled candidate/unreviewed.

This is Phase 1 inventory and pilot selection, **not** a completed source-mining or independently approved question database. The next implementation gate is to extend the now-demonstrated Nave/Torrey record-level matching to an actually reviewed three-way crosswalk from source question → source-verified subject/verse → genuine patristic excerpt. No paid access or rights-holder contact is part of this route.

# Scripture Correspondences — four source assessments and a first Naaman research presentation

**26 October 2026** · [Existing Scripture owner, draft PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553), issue #1552. Source evidence: ICRSP France commentary draft [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666).

This is a **real review of the four source-supported candidates**, rather than another discovery pass. The review separately decides (a) which source claim is directly witnessed, (b) how it must be classified, (c) whether its original-language locus exists, and (d) what further approvals are needed for *user-visible publication*. **A source-level finding confirmed by this research is not equivalent to a human theological editor approving an article.** No production app content was changed.

## Four individual reviews

| Claim | Direct finding from source | Editorial outcome | Publication |
| --- | --- | --- | --- |
| **CLM-001 Naaman mentioned in Luke** | **Luke 4:27** literally identifies Naaman the Syrian in an episode referencing Elisha. [Public-domain Catholic translation](https://www.biblegateway.com/passage/?search=Luke+4%3A23-30&version=DRA), checked with [2 Kings 5:10–14](https://studybible.info/DouayRheims/2%20Kings%205%3A10-14). Vulgate **IV Regum = English 2 Kings**. | **Direct biblical person-reference confirmed**, eligible for text/link-level editorial review. **Not** a claim that Jesus explicitly names Baptism. | Human review/edition resolver still pending |
| **CLM-002 Naaman as baptismal type** | **St Ambrose, *De mysteriis* III.16–17** explicitly narrates Naaman and the cleansing by grace; critically, **IV.21** goes further and directly compares Naaman's seven washings with **Christian Trinitarian Baptism**. See [actual original Latin, Migne PL 16](https://la.wikisource.org/wiki/De_mysteriis_(ed._Migne)). | **Patristic sacramental typology witnessed in the Latin text.** Earlier B13/B14 pointers to §§16–17 alone were incomplete as the explicit Trinitarian comparison is in §21. This is a source-locus improvement, not an attempt to change Baptism rubrics. | Theological formulation and edition critical-review gate pending |
| **CLM-005 Elisha/Nain** | [ICRSP Thursday Lent IV Guéranger commentary](https://icrspfrance.fr/textes-liturgiques.php?article=a0205_ancien) juxtaposes the 1962 lesson **2 Kings 4:25–38** and Gospel **Luke 7:11–16**. Aphrahat [*Demonstration VIII.11*](https://www.newadvent.org/fathers/370108.htm) knows Elisha raising the Shunammite child but **does not** explicitly attribute the pairing with Luke 7. | **Later historical liturgical-Christological comparison**, **not** an explicitly witnessed exact Aphrahat Elisha/Nain link. Preserve separated author attributions. | Guéranger 1903 day printed page and human interpretation review pending |
| **CLM-006 Elijah–Christ** | Aphrahat [*Demonstration XXI.14*](https://www.newadvent.org/fathers/370121.htm) explicitly compares Elijah raising the widow's son and Jesus raising the widow's son, Lazarus, and Jairus's daughter. Original Syriac section examined from the [Digital Syriac Corpus XML](https://github.com/srophe/syriac-corpus/blob/main/data/tei/21.xml), but that TEI is an **uncorrected transcription**. | **Attested early Christian Christological analogy**, distinct from direct fulfillment or prophecy of **John 11**. The ICRSP Friday Lent IV source pairs **1 Kings 17:17–24** with **John 11:1–45** as a later separate liturgical relationship. | Syriac/attribution-context and human doctrinal review pending |

**Explicitly excluded:** CLM-003 stays day-context only; CLM-004 stays held due to Hippolytus/Fabricius/Bonwetsch numbering and critical text; CLM-007 Joseph remains related at Genesis 37 chapter scope to the *existing* `wisdom-recounts-joseph` Scripture-retells-Scripture topic, but the Joseph–Christ typology is not automatically that same claim and Genesis 37:28 remains outside the Friday Lent II lesson Genesis 37:6–22.

## First presentation experiment: Naaman, water, and grace

We have added an **offline, single-file research HTML example** at [`docs/research/prototypes/scripture-naaman-source-first-20261026.html`](https://github.com/Fulcanelli13/ad-orientem/blob/explore/1552-biblical-correspondences-evidence/docs/research/prototypes/scripture-naaman-source-first-20261026.html), plus its machine-readable [`icrsp-naaman-source-first-demo.v1.json`](https://github.com/Fulcanelli13/ad-orientem/blob/explore/1552-biblical-correspondences-evidence/data/scripture/correspondences/icrsp-naaman-source-first-demo.v1.json). **Not deployed, not used by any app route and not an approved theological article.**

The preview presents **two Bible excerpts side-by-side** — Naaman's cleansing in **2 Kings 5:14**, and Jesus identifying Naaman in **Luke 4:27** — followed by **two short, authentic Latin excerpts from Ambrose**. The two passages have distinct labels **§17** (water versus grace) and **§21** (Christian Baptism in the name of the Trinity); the English labels are clearly *editorial labels, not patristic quotations or artificial dialogue*. Linked full sources provide context. Historical Guéranger commentary is linked but **not copied**. The visual style is muted, dark and typographically restrained. The HTML has no scripts, APIs or external assets.

This model demonstrates one important theological distinction: **the Gospel remembers Naaman as a real named referent**, while **Ambrose offers a later sacramental interpretation**. Neither relationship is misrepresented as a direct scriptural prophecy. The production compendium should replace excerpt-only placeholders with canonical edition-aware Scripture retrieval and licensed approved translations; **do not put AI summaries of the Fathers into a messenger or assistant persona.**

### Deliverables and numerical gates

- **4/4** research-candidate sources assessed individually; **1** explicit Bible cross-reference, **2** patristic comparisons with original-language/older translation witnesses, **1** later liturgical commentary pairing.
- **1** complete research-only source-first presentation fixture; **1** corresponding dark static HTML file, standalone and not deployed.
- **0** original printed-critical-edition release certifications, **0** final independent human theological endorsements, **0** approved patristic translations for new public presentation, **0** user-visible app changes.
- No revisions to the 56 UBS candidate topics, eight canonical thematic-seed research topics, Historia Salutis narration, Mass, Calendar, reader, or Catena.

**Assessed claims file:** `data/scripture/correspondences/icrsp-four-source-assessment.v1.json`.

**Integrity contract:** `tests/scripture-icrsp-four-source-and-first-preview.mjs` checks claims, sources, authentic Latin excerpts, record counts and publication gates. The existing Scripture Correspondences research workflow must run this test alongside its earlier registry and ICRSP intake tests.

### Practical next step

Ask for concrete **editorial accept/reject decisions** on the four *specific* source statements and cite original Latin/Syriac edition, Bible witness, theology/translation approvals. Separately assess whether the new UI pattern fits the existing app aesthetic before any source-side merge. The unresolved Fabricius/Guéranger/Parisot facsimiles remain critical-source exceptions; they do not justify another 51-article research sweep.

# ICRSP France — Batch 16: Hippolytus Greek OCR, original-print exceptions, Scripture-owner typed crosswalk

**26 October 2026** · [Issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666) · Research only. No published Mass, Calendar, Scripture, rights or posture/rubric changes.

## Actual advance: Hippolytus Greek textual witness, with an edition-numbering problem

The ICRSP [Saturday Lent III source](https://icrspfrance.fr/textes-liturgiques.php?article=a0198_ancien) quotes Guéranger on Susanna as a type of the persecuted Church. B13 located the Hippolytus-attributed *Commentary on Daniel* in T. C. Schmidt's **©2010 translation**, at **I.15.5–6, p. 25**, but the historical 1716 Fabricius citation p.27 was not photographed.

B16 found a **digital original Greek textual witness** in a [Bonwetsch GCS 1 (1897)-derived OCR presentation at Sophia Scriptura](https://sophiascriptura.com/fathers/hippolytus-in-danielem/1-1/), whose content grouped under `1.4` begins on GCS printed p.10 and visibly includes the statement, in recognisable but OCR-imperfect Greek, that Susanna prefigures the Church and her husband Christ. A separate [Ancient Library Greek index](https://ancientlibrary.net/hippolytus-of-rome-commentary-on-daniel/) places a closely corresponding sentence under **14.5**, while the modern Schmidt witness calls it **I.15.5**. This exposes a **numbering/segmentation divergence** between presentations. We have NOT verified that those are equivalent editorial sections by looking at the original printed Bonwetsch page or Fabricius p.27. Do **not** silently convert `14.5`, `I.15.5` and `1.4` into a single definitive original-source identity.

The public Sophia original-language text has visible OCR noise and represents editorially combined passage blocks; it is not independently a complete reliable Greek-critical text. That site's modern English presentation was AI-translated and is **not** the text to authorize for Ad Orientem; use older original sources and distinct original-edition bibliographic proof instead. The underlying historical patristic interpretation is attested, but specific edition-level numbering and attribution must remain held, with period-specific rhetoric accurately contextualized. Do not reproduce ©2010 translated paragraphs.

## The six remaining printed-page checks

| Requested print locus | Identified printed witness | Actual page image inspected? | Decision |
| --- | --- | ---: | --- |
| Fabricius, 1716, **p.27** | [Bavarian State Library digitized vol. I, bsb11759163](https://www.digitale-sammlungen.de/de/details/bsb11759163), 378 scan images | No | HOLD. [MDZ's official IIIF documentation](https://digitale-sammlungen.de/en/interfaces) exposes a manifest/image interface, but the actual manifest for this volume could not be opened in this research environment. A catalogue is not an image verification. |
| Guéranger, *Le Carême*, **1903**, Monday Lent III | [1903 16e edition catalogue, 639 pp.](https://lasource.diocese85.org/index.php?id=6188&l_typdoc=&lvl=indexint_see&nb_per_page_custom=25&nbr_lignes=40&page=1) | No | HOLD. Association-hosted day text compared with ICRSP, not with a photo of that printing. |
| Guéranger, *Le Carême*, **1903**, Saturday Lent III | Same 1903 catalogue | No | HOLD. The linked Internet Archive volume is dated 1911, **not** a photographic 1903 witness. |
| Parisot, *Aphrahat*, **1894**, VIII.11 | [1894 original-edition bibliographic contents](https://books.google.com/books/about/Aphraatis_sapientis_Persae_demonstration.html?id=uutRoYBAOUIC), **De Resurrectione Mortuorum starts on p.361**, chapter spans 361–406 | No | HOLD. B15 directly inspected exact Syriac TEI section, not the Parisot printed page. |
| Parisot, *Aphrahat*, **1894**, XXI.14 | Same 1894 volume, **De Persecutione starts p.931**, chapter spans 931–990 | No | HOLD. Digital Syriac section checked in B15; printed page/column within chapter not determined. |
| Parisot, *Aphrahat*, **1894**, XXI.15 | Same, `De Persecutione` | No | HOLD. Digital Syriac text checked; no scanned-page alignment. |

The Google Books table of contents supplies **chapter-start locations** only. They must not be asserted as the printed pages of each selected paragraph. Internet Archive's original 1894 PDF was discoverable but its download redirected to a host inaccessible by the available web reader. Its pages therefore could not be screenshot-verified in this batch.

## A concrete seven-claim handoff instead of another catalogue

[PR #1553, the independent Scripture-correspondences owner](https://github.com/Fulcanelli13/ad-orientem/pull/1553), contains **56 named provisional thematic topics** in `data/scripture/correspondences/thematic-source-leads.v1.json`. Its known family codes include `baptism`, `christ-prefigured`, `passion` and `spirit-church`. B16 has reconciled **all seven** existing B12 claims, with exact original Mass `sourcePath`, lesson/Gospel pair, source-witness category and responsible owner. The integration is a **research contract/handoff**, not an edit to #1553 or another typology registry.

| Existing claim ID | Exact relationship type | Existing family to consult |
| --- | --- | --- |
| CLM-001 Naaman | **Direct reference**: Luke 4:27 names Naaman | `baptism` |
| CLM-002 Naaman/Jordan | **Patristic and Guéranger typology**; not a direct baptismal quotation in Luke | `baptism` |
| CLM-003 Susanna/John 8 | **Historical selection/lection pairing**: innocence and mercy; not a direct cross-quotation | `spirit-church` |
| CLM-004 Susanna/Church | **Patristic ecclesial type**, author/edition/Greek numbering hold | `spirit-church` |
| CLM-005 Elisha/Nain | **Mass lection pairing**, Aphrahat VIII.11 only *general resurrection* support | `passion` |
| CLM-006 Elijah/Lazarus | **Aphrahat XXI.14 authorial Elijah–Christ comparison**, not literal prophecy of John 11 | `passion` |
| CLM-007 Joseph/tenants | **Christological reading with an out-of-lection event**; Genesis 37:28 is outside Lent II Friday's selected 37:6–22 lesson | `christ-prefigured` |

These are category and handoff decisions, **not approved new theology or certified absences**. Existing 56 thematic titles do not enumerate these names, but the 2,193 UBS groups and all other registers have **not** been semantically cleared of overlaps. The status of Joseph's missing sale verse remains a hard hold; neither the Propers nor the Calendar can be changed from commentaries.

## Quantified result

- **7/7** B12 atomic claims given a typed, existing-owner handoff across **five** exact existing Mass source paths.
- **1** new Greek OCR original-language witness examined with explicit OCR/section-number caveat.
- **6/6** historical print-image target checks still unresolved, **0** genuine printed page certifications.
- **0** full 1962 Mass ritual certifications, production changes, new Scripture app claims or permissions approved.

**Machine-readable evidence:** `data/source-text/icrsp-france-b16-edition-divergence-crossdomain-parity.v1.json`. **Regression:** `tests/test_icrsp_b16_edition_claim_reconciliation.py`. Future work should resolve **print-paginated section boundaries only when the exact page is available**, then hand the claim-specific evidence to existing PR #1553 for its own theological/copyright release gates. Avoid another forty-page website sweep before the selected verified claims can serve an actual Scripture-correspondences experience.

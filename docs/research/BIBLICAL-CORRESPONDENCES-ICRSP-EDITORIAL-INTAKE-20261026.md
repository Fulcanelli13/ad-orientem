# ICRSP Lenten claim intake — editorial acceptance gate (26 October 2026)

**Owner:** existing [Biblical Correspondences draft PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553), issue #1552.
**Source work:** ICRSP France commentary [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666), using its [pinned Batch 16 evidence at commit `88d922d8...`](https://github.com/Fulcanelli13/ad-orientem/blob/88d922d8bf9e3cf92d0e414e04edc66a5cd3b1e9/data/source-text/icrsp-france-b16-edition-divergence-crossdomain-parity.v1.json).
**Purpose:** hand source-specific research over to the *existing* independent biblical-parallels compendium. Do not put it into the salvation-history narrative or import historical rubrics into the 1962 Mass.

## Exact de-duplication finding

There were **56** named provisional UBS-derived research topics (80 assigned of 249 cross-Testament groups), and **eight** separately supported thematic-seed topics. The ICRSP source thread had checked the former, but **the latter already contains a Joseph entry** named `wisdom-recounts-joseph` with **Wisdom 10:13–14 → Genesis 37/41 at chapter scope**. This is a **real chapter/subject overlap** with ICRSP's Joseph reading, but it is *not* the same theological claim. The current seed relationship is `scripture_retells_scripture`, whereas Guéranger's ICRSP interpretation compares Joseph and Christ in the selected Lent II Gospel of the vineyard tenants. Do **not** create a duplicate Joseph topic, and do **not** silently reclassify the retelling as prophecy or typology. Actual Friday Lent II lesson ends at **Genesis 37:22**; the sale is in **37:28, not read at that Mass**.

The imported 2,193 UBS groups were also checked for exact targeted cross-episode pair identities and the Catholic deuterocanonical candidate table was inspected for relevant source books. No imported UBS word-alignment group directly gives these **exact narrative-to-Gospel pairing witnesses**, and the deuterocanonical table primarily targets its own seven Catholic source books. **Neither finding is a proof of no overlapping theology elsewhere**.

## Editorial dispositions by existing claim ID

| Claim | Relationship that may be investigated | Queue status |
| --- | --- | --- |
| CLM-001 Naaman | **Luke 4:27 directly identifies Naaman of 2 Kings 5**. Independently of baptismal typology. | Editorial review candidate |
| CLM-002 Naaman/Jordan | St Ambrose, *De mysteriis* III.16–17, and Guéranger attest a **patristic/historical sacramental prefiguration**; no fabricated direct Gospel quotation. | Editorial review candidate |
| CLM-003 Susanna/John 8 | Guéranger's **historical Lenten lection juxtaposition**: innocence and mercy. Daniel 13 is four **disjoint** segments. | Mass day-context only, not biblical typology claim |
| CLM-004 Susanna/Church | Hippolytus-attributed *In Danielem* on Susanna as Church. Original-language Greek OCR visible but **Fabricius 1716 vs Bonwetsch 1897 vs Schmidt 2010 segmentation conflicts**, origin/period rhetoric unresolved. | Source-critical hold |
| CLM-005 Elisha/Nain | Historical **Guéranger** lection and Christological comparison; Aphrahat VIII.11 does **not** attest the exact Elisha/Nain pairing. | Editorial review candidate with attribution guard |
| CLM-006 Elijah/Lazarus | Aphrahat XXI.14, inspected in Syriac digital TEI, **explicitly compares Elijah and Jesus raising the dead**, including Lazarus. **Not** a direct prediction of John 11. | Editorial review candidate |
| CLM-007 Joseph/vineyard tenants | Already overlapping the Genesis 37 chapter scope in `wisdom-recounts-joseph`, **different relationship type**; verse 37:28 strictly out of the Mass lesson. | Existing topic overlap + out-of-lection hold |

**Four source-supported candidates are ready for a human editor to inspect. No claims have passed theological acceptance, publication, translation licensing, or production gates.** The queue states express the *next editorial action*, not a count of validated or published theological statements.

The authoritative seven-claim table is [`data/scripture/correspondences/icrsp-lent-atomic-editorial-review.v1.json`](https://github.com/Fulcanelli13/ad-orientem/blob/explore/1552-biblical-correspondences-evidence/data/scripture/correspondences/icrsp-lent-atomic-editorial-review.v1.json); integrity gate `node tests/scripture-icrsp-atomic-editorial-review.mjs`. The source evidence stays in PR #1666; only **versioned source pointers, references and editorial classifications** live here. We have **not** added a second thematic master, altered the previous 56/8 subjects or the existing eight theological seed articles, modified any app interface, or used AI paraphrases as patristic quotations.

## Acceptance procedure

1. A human theological editor examines the four candidates **from actual biblical text and attributed ancient/historical sources**, checking the author, source edition, original wording and actual link type. Historic descriptions of peoples require explicit period attribution. The three context/held records are not promoted automatically.
2. Approve link-level evidence explicitly or reject/reclassify it in the **existing correspondence owner**, assigning precise canonical references and vetted translations. A direct scriptural reference may be verified separately from the more demanding theological typology.
3. Independently clear reuse rights, accessible scripture translation text and source-edition provenance. CC BY 4.0 original Syriac TEI is an identifiable licence for *that edition*, not a licence for all the modern French or English prose on these pages.
4. Only after these gates, prepare actual compendium presentation with side-by-side **Scripture passages** and precise links to the Fathers' **authentic words**. The chronology, Mass reader and Calendar remain unchanged.

**Next accountable measure:** edit reviews recorded and accepted/rejected explicitly in PR #1553; currently accepted **0/7**. The remaining six targeted historic print pages are **source-critical exception work**, not a reason to manufacture publication-ready text.

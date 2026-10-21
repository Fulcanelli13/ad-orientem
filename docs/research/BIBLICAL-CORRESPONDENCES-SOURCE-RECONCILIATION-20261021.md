# Biblical Correspondences — first cross-source ingest and Catholic audit
**21 October 2026 · Research registry, not app content**  
**Owner:** Scripture · **Canonical issue:** [#1552](https://github.com/Fulcanelli13/ad-orientem/issues/1552)

## Locked product boundary

The user approved a **separate Catholic compendium of biblical correspondences**, chiefly organized by theological subjects. Biblical parallels, quotations, fulfilments, typology and Scripture-retells-Scripture must **not** be injected into the existing chronological *Historia Salutis* narration. Do not fork the Bible text, Catena, Mass, or Scripture navigation owners.

## Files and measured imports

| Research-only file | Source | Extracted entries |
|---|---|---|
| `data/scripture/correspondences/catholic-deuterocanon-candidates.v1.json` | [Catholic Bible](https://github.com/ronaldoscotti/catholic-bible), pinned `e7b233ab9403b89a223c37017d3d12e8732fdcf0` | 565 unclassified directed candidate records at 457 source verses from Wisdom (150), Sirach (260), Tobit (30), Judith (23), Baruch (17), 1 Maccabees (42), 2 Maccabees (43) |
| `data/scripture/correspondences/ubs-parallel-passages.v1.json` | [UBS Parallel Passages](https://github.com/ubsicap/ubs-open-license/tree/a15a96cfaa4ca18a6c0339016645ba1e534db3c8/parallel%20passages), pinned `a15a96cfaa4ca18a6c0339016645ba1e534db3c8` | 2,193 **multi-passage groups**, 5,266 original-language verse entries, 60 book identifiers, 437 groups with range expressions |
| `data/scripture/correspondences/thematic-seed.v1.json` | Scriptural evidence + the two imports + historical Douay | 11 navigation families; eight research subjects; 13 individually typed evidence links; three coverage gaps |

These are **different units**. Do not add 565 + 2,193 and present the result as independently certified theological connections. There are no independently certified theological claims yet. This work contains no deployed UI and no Runtime calls.

### Deuterocanonical coverage

The 565 Catholic rows split into **232 `douay` historical-margin pointers** (marked `chapter:true` upstream) and **333 `na27` modern editorial allusion candidates** (verse-specific). The key `na27` is a source label in the upstream dataset, **not** a claim that each record is certified by the Nestle-Aland critical apparatus. Upstream numerical weights (100/90) are copied as opaque metadata, not independent confidence levels.

The UBS file has **zero** entries from Wisdom, Sirach, Tobit, Judith, Baruch, 1–2 Maccabees. The imports should therefore coexist as separate evidence layers, not be intersection-filtered: the direct UBS intersection with the seven Catholic source books is necessarily **zero**. Word-alignment digits and compound/range references are retained without trying to resolve them against the local edition.

### Douay chapter/verse traps: 4 hold records

Four upstream `douay` records claim chapter scope but carry a raw verse coordinate not ending in `.1`. Checking the **original printed marginal text** through the [CC0 original Douay–Rheims transcription](https://github.com/janvier-s/original-douay-rheims/blob/d82b2852d55a2ab8f0e57311ee42acde25740781/bible/tagged/ecclesiasticus.json) gives:

| Source verse | Exported target | Original margin | Disposition |
|---|---|---|---|
| Sirach 7:4 | `ECC.6.12` | `Eccl. 7.` | Edition / chapter-boundary review |
| Sirach 11:9 | `DEU.13.2` | `Deu. 13.` | Edition / chapter-boundary review |
| Sirach 29:13 | `EXO.21.37` | `Exo. 22. Deu. 14.` | Edition / chapter-boundary review; source margin is multipart |
| Sirach 49:13 | `HAG.1.15` | `Agge. 2.` | Edition / chapter-boundary review |

**Do not coerce these into verse-specific claims**, assume the modern address is the same chapter as the original margin, or silently throw out parts of an original citation. The raw destination remains in the imported record; the four holds live in its audit field.

### Three-passage correction

UBS passage group index **358** (0-based, pinned import) contains `DEU 8:3`, `MAT 4:4`, `LUK 4:4`. Matthew 4:4 explicitly quotes **Deuteronomy 8:3**, while Wisdom 16:26 expresses related teaching. The Catholic import contains the `WIS.16.26 → MAT.4.4` lead, but this is **not** an explicit Matthean quotation of Wisdom. That incorrect source description is rejected. The thematic-seed record preserves both the explicit quotation and the less direct thematic correspondence.

UBS group **92** preserves `EXO 12:46`, `NUM 9:12` and `JHN 19:36` in the Paschal-Lamb correspondence. John identifies a Scripture-fulfilment relationship; both Mosaic loci remain attached.

### Historical interpretation vs explicit citation

The [original Douay–Rheims note at Wisdom 2:12](https://github.com/janvier-s/original-douay-rheims/blob/d82b2852d55a2ab8f0e57311ee42acde25740781/bible/tagged/wisdom.json) (`notes[label=d]`) calls this an evident prophecy of the malice of Christ's persecutors and cites Matthew 27:41. It supplies **historical Catholic exegesis** for the suffering-righteous-man theme, not proof that Matthew attributes a direct quote to Wisdom. The modern `WIS.2.18 → MAT.27.43` link remains classified as literary echo/historical Christological reading pending review.

## Structural model

- Imported Catholic rows retain `from_verse`, `raw_to_address`, `target_scope`, `source_key`, `upstream_weight`. The raw destination is **not** automatically a certified local Scripture target.
- UBS groups preserve each passage, original-language alignment label and word-by-word match digits. Multi-verse expressions (e.g. `LUK 6:27-28,35`) are not flattened.
- The small thematic seed adds theological-family ownership, typed relationships, specific data witnesses and explicit review outcomes. It is **not** an exhaustive 11-family publication catalogue.
- `data/scripture/README.md` remains the Bible edition owner. The Catholic import uses another project's 73-book spine and must be mapped to local Scripture coordinates before any click-through. The original 1582/1609–1610 Douay–Rheims repository contains **76 printed books** because three appendix books accompany its **73 canonical** books; the appendix must never be silently promoted into the Catholic canon.
- Future authentic patristic witnesses should be linked to the existing `data/scripture/catena` provenance rather than copied or AI paraphrased.

## Rights and integrity

- UBS: © United Bible Societies, **CC BY-SA 4.0**, attribution + share-alike obligations. This dataset is deliberately stored separately, with alignment markings and source. No public redistribution or combination into another licensed artifact before compatibility review.
- Original Douay–Rheims transcriptions: upstream claims **CC0**; verify the precise transcription and its bibliographic source for interpretation.
- Catholic Bible import: Douay pointers claimed CC0; `na27` links claimed to be uncopyrightable bare reference facts. Verify reuse rules before app publication; copyright posture is distinct from theological reliability.
- The [Catholic Bible LIMITS](https://github.com/ronaldoscotti/catholic-bible/blob/e7b233ab9403b89a223c37017d3d12e8732fdcf0/LIMITS.md) explains that its public repository cannot completely regenerate its original private-source import. The pinned output and visible cross-references are auditable; the source pipeline is not independently reproducible.

## Verification and next gate

`node tests/scripture-biblical-correspondences-registry.mjs`

The test asserts all import counts, unique keys, source/chapter scope, four versification holds, preserved UBS original-language matching/ranges, corrected Deuteronomy and Paschal-Lamb groups, 11-family/8-subject seed, and source evidence for all 13 relationships.

**Editorial work still pending:** map to the existing approved Catholic Scripture editions; verify original verses and translation-sensitive references; review literary vs traditional vs explicitly inspired links; inspect 565 imported candidates, add broader Old Testament and Gospel themes, confirm Catholic rights requirements, and certify specific records individually. Only then consider a separate UI. No changes to Historia Salutis narration.

## Second pass — corpus-wide discovery indexes

The following research-only files extend the **same** integration branch and Scripture owner, without altering Historia Salutis or the Bible reader:

- \`external-book-crosswalk.v1.json\`: maps the existing \`src/scripture/canon.js\` 73 IDs to both external data sources; handles the original Douay \`ESG\` and \`DAG\` forms and expressly excludes appendix \`1ES\`, \`2ES\` and \`MAN\` from the Catholic 73.
- \`discovery-index.v1.json\`: indexes all 2,193 UBS groups by canonical book and structural cohort, plus Catholic imported rows by originating canonical book. It does **not** classify a textual parallel as prophecy or typology.
- \`thematic-source-leads.v1.json\`: **56** named, provisional thematic research subjects attached to **80 distinct** of the 249 Old–New Testament UBS groups, distributed across nine of the 11 theological families. The remaining **169** cross-Testament groups remain openly unassigned to a curated subject. There are deliberately no UBS-only entries assigned to the Marian and Baptism families because the UBS textual matching data does not establish those typologies. Existing Catholic research seeds remain separate.
- \`original-douay-margins.v1.json\`: stores literal historic printed marginal reference strings from the seven original deuterocanonical books, separately from the modern transformed references. Complete audit: **4,376 verses checked, 217 source verses containing 227 marginal entries**, compared with the modern \`douay\` source's 202 source-verse addresses and 232 mapped records. **199 source-verse addresses match**, **18 appear only in the original transcription** and **three only in the normalized export**. These are address comparison counts, *not* a judgment that 18 verified links are missing. Thirteen of the original-only entries are numbered Tobit note markers, not interpretable book/chapter/verse addresses without resolving the printed note register. Others include original Wisdom offsets and a self-reference in 2 Maccabees 5:18.

The UBS structural breakdown is **1,184 OT-only groups; 760 NT-only groups; 249 OT–NT cross-Testament groups**. **624** of the 760 NT-only groups refer exclusively to Gospels. There are **441** UBS groups with a hyphen or comma verse-range expression (the source's earlier 437 count measured hyphenated expressions only); ranges are never coerced into a first verse. These counts have a reproducible CI contract.

**Thematic titles are research labels.** Word alignments are not a claim that the evangelist knowingly quoted the older text, or that a Catholic doctrine is supported by the alignment alone. Each subject retains an unreviewed gate pending the precise Bible text, original-language assessment and Catholic interpretation. Subsequent work should prioritize assigning the remaining 169 cross-Testament groups, systematic Catholic full-canon supplementation and exact comparison of the 217 printed historical margin locations against their 232 modern equivalents.

Additional CI contract: \`node tests/scripture-correspondences-bulk-discovery.mjs\` checks the entire crosswalk against \`src/scripture/canon.js\`, recomputes all cohorts, verifies all 56 source-linked research leads and checks literal Douay margin alignment.

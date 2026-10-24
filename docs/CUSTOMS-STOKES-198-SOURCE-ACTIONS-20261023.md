# Catholic customs research: independent-author intake (Stokes, 1955)

**Date:** 2026-10-23  
**Research status:** source-action screening only; **no distinct custom identities certified; no application publications**.

## Directly inspected source

Rev. Bernward Stokes, O.F.M., *How to Make Your House a Home: Family Liturgy and Religious Practices* (Family Life Bureau, National Catholic Welfare Conference). Its title page records an imprimatur dated **24 September 1955**. Witness consulted: [EWTN full online ASCII transcription](https://www.ewtn.com/catholicism/library/how-to-make-your-house-a-home-family-liturgy-and-religious-practices-10449), especially online lines 132–570. The digital transcription and line numbering are not confirmed against every printed page; **no original printed page numbers have been assigned**.

### This intake

- **198** short, independently worded, line-located **source-action observations**, stored in `data/customs/master/stokes-1955-family-liturgy-ewtn-first-pass.v1.json`.
- **98** reported/described practice mentions; **49** author suggestions; **27** named-source/family reports; **14** blessing/ritual/authority questions; **7** historical custom claims; **3** folk-belief/dramatization notes.
- One EWTN line can yield multiple observations when it actually describes multiple separable actions; these are **not** counted as different verified practices merely because the indexing splits them.
- All 198 observations are cross-indexed under `external_source_observations_stokes` in the unified comprehensive research catalogue.
- Prior 1,095 source/detail research rows + 198 = **1,293 non-deduplicated, non-identity-certified research rows**.
- Previous 408 provisional Handbook/historical/action labels and 56 overlapping working master identities are preserved unchanged. **Neither 198 nor 1,293 is a unique-custom count.**

## Independence and interpretation

This is a **different author and publication** from the two Weiser books and Helen McLoughlin, but the source contains many **secondhand witnesses** from Maria von Trapp, Therese Mueller, Donald Attwater, Katherine Byles, and others. The presence of the same act in this compilation and in one of those author's own works **must not be called independent corroboration** unless Stokes contributes independent historical/local testimony.

Classify distinctly: recorded regional practice, a described family observance, an author's modern adaptation, historical generalization, folk belief, official rite, or suggested devotional activity. An example in a Catholic home does not establish universal Catholic practice. Cultural and non-religious regional customs remain indexed for study but are not automatically Catholic devotional customs.

**Authority gate:** the 1955 historical imprimatur does not establish that quoted household prayers are approved Roman Ritual formulas; nor does it validate Stokes's statements of indulgences, dates or ecclesiastical prescriptions for a 1962 or present-day product. Blessings of objects, children, marriage and mothers must be compared with the applicable ritual books and minister requirements before any liturgical claim is accepted. Folk-protective customs and frightening children's dramatizations are descriptive witnesses, not product recommendations.

## Coverage and limitations

The transcription sections screened include Advent, Christmas, Epiphany, Candlemas, Lent, Holy Week, Easter, Ascension, Pentecost, the Sacred Heart, Christ the King, the Assumption, All Saints and All Souls, baptism, confirmation, confession, First Communion, marriage, funerals, home blessings, and domestic prayer. This is a **wide source-action first pass**, not a line-by-line certified exhaustive census of the complete web text, not a verified facsimile or printed-page transcription, and not yet an action-level identity comparison against every prior source observation.

## Next high-volume gates

1. Use the 198 source-action IDs as a **bulk reconciliation queue** against the 408 provisional groups and 56 research master identities; preserve many-to-many links and do not automatically merge shared calendar dates or object names.
2. Extract the compiler's footnote dependencies to distinguish genuinely new regional testimony from **Stokes → von Trapp/Mueller/Attwater/Byles** restatements. Reused claims receive no independent-source increment.
3. Acquire and screen further full-text sources from distinct authors across broader seasons: Therese Mueller's *Our Children's Year of Grace* (1943), Mary Reed Newland's *The Year and Our Children* (1956), Florence Berger's *Cooking for Christ* (1949), and Maria von Trapp's *Around the Year with the Trapp Family* (1955). Accessibility and publication/edition identity must be verified before extract counts are assigned.
4. Begin an explicit separate **source-coverage numerator/denominator**: available text spans, source observations located, independently verified practices, ritual authority gates, and geographic variants. Do not treat a source index as a completeness certificate.
5. Keep Calendar integration and actual Ad Orientem publications outside the scope of this research-only PR.

## Automated checks

`tests/customs-full-registry-census.mjs` now verifies preservation and count parity of all 198 new IDs, source anchors, claim-class distribution, the new 1,293 combined research-row figure, and no change to the earlier 408 provisional-group or zero-publication gates. Repository CI status must be checked on the updated head; this document does not by itself certify CI success.

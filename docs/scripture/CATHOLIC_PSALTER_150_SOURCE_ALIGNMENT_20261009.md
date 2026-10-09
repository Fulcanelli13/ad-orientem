# Catholic Psalter — complete 150-Psalm source alignment (9 October 2026)

## Result

The entire original-author CPDV Psalter was checked against the pinned full Douay–Rheims Challoner Catholic witness, within the same **Vulgate Psalm numbering**. The computer compared **every nonblank verse** for the same chapter/verse coordinate, the source verse count, lexical overlap in context and whether a nearby verse was a substantially better match.

- **133 / 150** complete Psalms satisfy the conservative alignment gates. Their 133 exact chapter bounds are frozen in `src/scripture/psalter-identity-crosswalk.js` and source-audited in CI.
- **4** known exceptional Psalms (13, 42, 92 and 150) have previously established partial, source-checked multi-verse correspondences, with explicit unmatched superscription/blank terminal slot.
- **13** other Psalms remain entirely restricted for automatic cross-edition verse handoff: **16, 64, 73, 75, 76, 77, 88, 101, 108, 111, 115, 120, 137**.
- The remaining **17** fail the complete-chapter automatic-match threshold, but that is not a finding of theological or textual error. Some contain a short verse with insufficient lexical evidence or an edition-specific boundary difference.

## Technical controls

1. **Bounds must be checked.** `Psalms 22:7` is not an automatically valid verse simply because Psalm 22 is a passing chapter; its source chapter contains only six numbered verses. The runtime crosswalk rejects references outside the verified source-specific bounds.
2. **No Hebrew/modern numbering shortcut.** Both matched witnesses use Catholic/Vulgate chapter numbers. A modern Psalm 23 source is not automatically treated as Psalm 22 unless a separate verified Vulgate/modern crosswalk is available.
3. **Existing source exceptions prevail.** Psalm 13:3–6 CPDV is aligned to Douay 13:3; Psalm 42 has partially shared verses; Psalm 92 has a CPDV-only superscription; Psalm 150 contains an empty third-party Douay 150:6 slot.
4. **CI compares every pinned chapter again.** An updated source edition which adds/removes verses or materially changes the lexical alignment must invalidate the hardcoded 133-chapter manifest until reviewed and regenerated.
5. **Neither theological certification nor full Bible publication follows from this result.** All full CPDV corpus records remain `reviewed:false` in staging and the in-app text remains `enabled:false`.

## Primary sources

- CPDV maintained original author: https://sacredbible.org/catholic/OT-21_Psalms.htm
- CPDV complete canonical index: https://sacredbible.org/catholic/index.htm
- Douay–Rheims Challoner public domain witness: https://ebible.org/details.php?id=engDRA

This audit only authorises verified **reference handoffs** at specific Vulgate-numbered verse coordinates. The CPDV is an independently authored public-domain translation selected as the free alternative, not an ecclesiastically approved source.

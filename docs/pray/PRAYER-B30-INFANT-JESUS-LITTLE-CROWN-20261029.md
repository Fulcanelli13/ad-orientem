# Prayer B30 — Little Crown of the Holy Infant Jesus (AO-AQ-029)
**29 October 2026 · scoped Prayer Corpus shortlist completion · existing Rosary & Chaplets reader**

## Admission decision and exact form
Admit only the well-attested **fifteen-bead core**: three Our Fathers in honour of the Holy Family (Jesus, Mary, Joseph), followed by twelve Hail Marys in memory of Christ's first twelve years. The Incarnation aspiration must precede **each** of the fifteen canonical prayers. This is not an alternate Rosary or a new top-level module.

**Historical English textual witness:** L. R. Mace, *The Holy Infant of Prague*, Catholic Truth Society of Ireland, no. bh340a (1940), "LITTLE CHAPLET OF THE HOLY INFANT JESUS":
- https://www.pamphlets.info/Ireland/ctsibh340a/
- https://www.pamphlets.info/Ireland/ctsibh340a.pdf — the displayed PDF has modern digital page setting; **this is not certified original printed-page photographic collation**.
- Exact EN formula for all beads: "And the Word was made Flesh and dwelt amongst us."

**Independent French practical witness:** ICKSP France, *Dévotions à l'Enfant-Jésus*:
- https://icrspfrance.fr/?page=child-jesus-devotions
- Confirms three Pater and twelve Ave with the Incarnation aspiration before each. French formula is sourced to this separate witness, **not claimed as a translation from the 1940 English author**.

**Latin aspiration:** *Et Verbum caro factum est, et habitavit in nobis* (Vulgate John 1:14). Its source is Scripture, not the 1940 chaplet edition.

## No mixing of forms
The ICKSP page additionally gives a medal invocation, a concluding Gloria and twelve mysteries with prose meditations. Other published renditions include different medal prayers or closing invocations. They are **not** silently combined with the 1940 15-bead core. No independently authored childhood event is fabricated for each of the twelve years; "Year 1–12" denotes repetition only. The three common prayers reuse frozen canonical prayer owners; no historical 1940 text beyond the short aspiration is reproduced.

Do not represent period indulgence wording, historical devotional promises, special blessed beads, association membership or dates as current ecclesial grants or conditions. No timer, paid service, registration, user profile or new Calendar.

## Product and UX
- Parent: **Pray → Rosary & Chaplets → Little Crown of the Infant Jesus**; route `pray.little_crown` maps to existing internal view `littleCrown`.
- Fifteen individually selectable 48px accessible beads, visually distinguished first three and last twelve.
- Each bead explicitly contains its own Incarnation aspiration and the **complete** existing canonical Pater or Ave in the active EN/FR/Latin language.
- Progress role and accessible current-step, back/next and final exit to existing family, no auto-advance or mandatory physical beads.
- Historical witness and source precision disclosed in-reader; no false copyright or printed-page authentication claim.
- No changes to original 48 canonical prayers or 16 baseline novena IDs.
- No new main navigation/card family, independent chaplet engine, or duplicated Scripture.

## Gates and stopping condition
- `tests/pray-b30-little-crown.mjs` verifies exact order, uniqueness, all 15 preceding aspirations, 48/16 frozen invariants, source cautions, three-language reuse and basic rendering.
- Existing `test:pray-owner` includes B30.
- Real `tests/pray-chaplets-discovery-phone.mjs` covers 320px and 390px parent navigation, beads 1/4/15, prayer identity, Latin, back, source details, finish, screenshots and no document horizontal overflow.
- Reachability/Formation registries update additive expected chaplet list from five to six while preserving the original twenty-three Prayer family items.
- **Do not merge until CI and phone checks pass.** Verify the exact merged SHA is Vercel production READY before calling this live.

This exhausts the five format-distinct candidates in the B22 editorial shortlist after B24–B29. Freeze **new Prayer Corpus expansion** after B30; future work should only correct source defects, address accessibility and UI inconsistencies, or implement a separately justified user request. The old B22 research snapshot remains historically frozen rather than rewritten to reflect later releases.

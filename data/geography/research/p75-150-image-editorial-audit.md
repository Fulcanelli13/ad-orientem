# P75 visual editorial review — 150 existing Commons images (2026-10-29)

The review uses all three [P75 original-file contact sheets](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40827269279) generated from **whole-original SHA1 checked** binaries. The 150 source records span 96 canonical Places currently lacking pictures. Original download/format checks passed for **120/150** (82 Places); **30** had source/encoding hold results.

**Editorial dispositions (not publication approvals):**
- **51 IMPORT** — primary exterior candidates from legible church/shrine photographs, across 41 Places.
- **53 IMPORT_WITH_CORRECTIONS** — appropriate mainly as interior, historical, architectural, site or sacred-detail images, with recaption/role/identity corrections required.
- **16 REJECT** — the photo does not serve this exact Place card, including at least one provably wrong-country Basilica assignment.
- **30 HOLD_SOURCE_OR_ENCODING** — no verified preview; do not infer aesthetic suitability.

No photo was silently auto-approved. Every editorial decision in `p75-150-image-editorial-decisions.v1.jsonl` is linked to its frozen entity and exact Commons original SHA1. IMPORT / IMPORT_WITH_CORRECTIONS are **selection requests**, **not** rights-cleared, high-resolution reviewed or published.

## Critical exceptions

1. **#041 Bilbao:** The candidate explicitly shows *Basilica of Our Lady Immaculate, Guelph, Canada*, not Begoña, Bilbao. **REJECT exact-Place match**.
2. **#053 Trier Holy Robe:** Image is a relic exhibit. It must link to a verified relic/object identity and never become an exterior hero.
3. **#024, #026, #027, #058, #118:** Historical reproductions and framed work are not accepted as architectural photographs; separate underlying rights may apply.
4. **#008 and #054:** Performance/music/event scenes are not architecture. **REJECT** for this card role.
5. **#070, #093:** Lamp and road sign rather than church building. **REJECT**.
6. **#111, #112:** Framed chapel paintings are excluded from this architectural photo programme; Sacred Art review belongs to the separate gallery workflow.
7. **#033 and #138:** Chiquinquirá sacred objects/site must not be automatically confused with the Venezuelan Basilica of the same dedication.
8. **#030, #104, #125, #148:** Better contextual exteriors emerge as strong candidates; still require independent original-page identification and rights clearance.
9. **#098, #129, #130, #132, #150:** Real-looking interiors are gallery images, not default exteriors.

The full assessment is based on contact-sheet previews of 330×200 pixels, not a 100% zoom of each original. No original bytes from this pass were added to production; no new hero or gallery images published.

## Next finite release

Select the 51 `IMPORT` primary exterior candidates and independently resolve exact-place identity, author/licence, and full-resolution quality before conversion. Prioritize the **distinct currently unillustrated Place IDs** and stage local WebP binaries in one **30–50-image reviewed asset PR**, within the existing €0 pipeline. Corrected secondary images can follow in a gallery pass. Do not repeat search queries for the same photographed Place, and do not duplicate the separate 1,879-venue Directory programme.

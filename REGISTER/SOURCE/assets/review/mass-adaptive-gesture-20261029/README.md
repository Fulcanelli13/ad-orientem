# Seven adaptive 1962 Mass gesture SVGs — user-reviewed original archive

**Archival snapshot:** 29 October 2026. These seven files are byte-for-byte copies of the user-reviewed 29 October adaptive single-colour SVG package, archived under `assets/review/mass-adaptive-gesture-20261029/`, **not** `assets/active/`.

**Explicit user choices:** six approved *as concepts*, one rejected.

| Cue | User concept decision | Liturgical / technical gate |
|---|---|---|
| C0117 | APPROVE | Validate brief raised eyes/hands before Veni, sanctificator; not a sustained Y pose |
| C0155 | APPROVE | Verify source-specific joined hands, bowed head and Memento rubric |
| C0161 | APPROVE | Two open palms visibly above Host and chalice |
| C0169 | **REJECT** | Redraw: briefly raises and lowers eyes while holding the Host; *not* major elevation |
| C0193 | APPROVE | **Blocked from production:** misleading monstrance must be removed or redesigned; canonical Mass has no monstrance here |
| C0204 | APPROVE | **Blocked from production:** show the genuinely slight combined Host-and-chalice minor elevation, not a major elevation |
| C0263 | APPROVE | Verify eyes/hands and joining/bow before final blessing; context applies only when blessing is prescribed |

The original user's approval of the *visual concept* does not certify the 1962 rubric, correct image mistakes or grant permission to bind the existing image in LIVE. The rejected C0169 file is retained **solely for provenance** and must not appear in production.

**Canonical authority:** `data/mass/gesture-icon-user-review-20261029.v1.json`; preserved original concepts live in `svg/Cxxxx.svg` inside the ZIP and identically in this folder. The corrected C0193 SHA-256 is `8d156dd5cc83d3b2ee02c4db02ab7867b9771b9935efebce69397cc3c9775b30`. The earlier ledger accidentally omitted 24 characters; the byte-identical artwork and user's approval did not change.

**Preservation:** full package `Ad_Orientem_7_Adaptive_Gesture_SVG_Review.zip` saved in the user's Library under `/Ad Orientem/Mass Reader/Adaptive Gesture SVG Review 2026-10-29/` together with each SVG. Original ZIP SHA-256: `21e50cacc4397c61e5e8b19d25300651be286fac34da4d72c1feb41f6931b5a4`. Source image generation and `currentColor` recolouring proofs remain in the ZIP, not the production icon bank.

**Implementation safeguards:** `tests/mass-seven-adaptive-svg-user-review.mjs` checks each committed file's SHA-256 and that every SVG has transparent, dynamically colourable vector paths with no embedded raster. Existing gesture matrix remains 142 records / 125 active bindings / 17 unbound; 67 frozen active masters remain unaffected. `assetStatus` stays `REVIEW_ONLY_NOT_RELEASED`.

**Next:** redraw *only* C0169 as a new review variant, and prepare separately correct alternate versions for C0193/C0204 while retaining original accepted hashes and decisions; seek an additional explicit user review for each changed illustration. Keep 10 faithful profile/local-custom rules untouched.

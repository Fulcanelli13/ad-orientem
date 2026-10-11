# Mass integration — Campion gestures, positions and icon decision gate (10 October 2026)

This is **not** a Mass reader rewrite. The active source-first R17 reader, canonical 48-card LIVE ownership, frozen v4.6 original icon bank, form-specific cue engines and source-resolved Propers remain unchanged. The objective is to make the outstanding 1962 gesture artwork decisions and next-stage form/special-rite integration **auditable**.

## Verified baseline

- Forms: **Low**, **Missa Cantata without incense**, **Missa Cantata with incense**, **Solemn**. They are four independent ceremonial forms, not four different texts or reader apps. See `data/mass/form-registry.v2.json`.
- Low Mass: **275** canonical form-state cues; no automatic Schola or sacred-minister lane. Solemn has **19** minister delta events. Its actor roles must never be inferred onto a Low or Missa Cantata celebration.
- Sung reader: original 279 cues, original source-first **48 LIVE presentation cards**, exact cue-owned gestures and positions; native special-rite controllers for Asperges, Palm, Ash, Candlemas, Rogations, Absolution, Corpus/generic procession, Holy Thursday following action, Good Friday and Easter Vigil.
- Campion 1954 is a **catechetical discovery witness**. It is not a normative 1962 rubric. The canonical matrix is `data/mass/gesture-matrix.v1.json`: **142** action records, **83 priest and 59 faithful**; **100** carry Campion page provenance, but all must still respect their normative/customary authority classification.
- Frozen `assets/active/mass-v46/manifest.v1.json` has **67 original exact donor master assets**. Exactly **125 of 142** gesture rows have semantic bindings. **17** have `PENDING_EXACT_MASTER` and remain deliberately *unbound*, rather than becoming made-up gestures.
- The priest-position source `data/presentation/reader-priest-positions.v1.json` has **49 exact sourced station transitions**. The right ribbon currently gives the Epistle-side and Gospel-side stations a generic altar-centre glyph. This is an **art mismatch**, not an absent positional cue.

## Artwork worklist and review rules

The review file [`reviews/mass-campion-icon-review-20261010.html`](../reviews/mass-campion-icon-review-20261010.html) shows the **17 pending gestures plus three distinct station identities**, a current comparison, proposed plain vectors where an exact pose can be drawn, original cue and Campion page references, and reviewer choices. Decisions can be exported as JSON.

Four separate editable, monochrome source SVGs have been staged in `assets/review/mass-icon-candidates`: Epistle station, Gospel station, eyes and hands raised, hands over oblations. These are **not** applied automatically in R17, not merged into the frozen 67-key v4.6 manifest, and not a stealth replacement of original donor pictures.

The remaining rows fall into 3 groups:

1. **Exact 1962 priest pose needed**: joining hands/bowing, gaze toward Sacrament, eyes raised without arm raise, small elevation with Host *and* Chalice. A generic cross/canon or major-elevation graphic would be misleading.
2. **Conditional faithful posture/gesture**: kneeling versus bowing, local Christmas/seasonal custom, and response-specific action. Prefer existing source-driven text/posture cue until a profile-aware graphic is approved; *never* force a universal rubric from Campion alone.
3. **Recollected or sustained attention**: cannot imply a new bodily movement at each prayer. Use a discreet instruction or no icon rather than repeating an incorrect static pose.

Also pending from Campion pp. 71–96: the priest's handling of particles/paten (requires exact 1962 ceremonial verification before an event is added); the faithful's sign of cross at pre-Communion absolution (French-world customary review, not automatically universal). **Neither is promoted** by this icon project.

## CI acceptance and next implementation

- `npm run test:mass-icon-review` asserts all **142** source records, **125/17** binding disposition, **49** station transitions, **3** unresolved distinct station art, review HTML export, four pure offline SVG proposals, and immutability of all original 67 masters.
- `npm run test:mass-integration-grid` tests **27** source-owned combinations covering four forms × normal/votive/Requiem/Nuptial, five preceding rites, four following actions, Good Friday and Easter Vigil; no legacy fallback or sacred-minister contamination into Low/Missa Cantata.
- Only after approval, add artwork to a **separate supplemental registry**, review in the native R17 390px reader, keep the exact-source cue ownership, and promote individually with screenshot acceptance. No automatic gap filling based on string matching.

The remaining larger Mass-project tasks are final visual polishing, the general actual-Celebration and Proper certification, form-specific postures in real parishes, and final integrated Mass-module acceptance. Passing this gate does not mean every local Mass, Proper, custom or icon is certified.

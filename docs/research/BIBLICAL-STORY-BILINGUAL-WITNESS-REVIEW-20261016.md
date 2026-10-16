# Ad Orientem — Bilingual Bible witness collation and offline story-review tool

> **Current corrected reviewer — v2 (16 October 2026):** The earlier v1 HTML incorrectly exposed only Challoner English and Crampon French. The already agreed English **Catholic Public Domain Version (CPDV)** contemporary alternative is restored as the first review display. Use `data/explore/biblical-story-scripture-review-offline.v2.html` and `data/explore/biblical-story-scripture-three-edition-witness-collation.v2.json`. Challoner remains the traditional English comparison, Crampon remains the French default and Clementine Vulgate remains the Latin reference in the product catalogue. **The product edition roles have not been changed.** v1 is retained as historical research only.

**16 October 2026 | 14-story first cohort | research-only; not certified or published**

## Outcome

- **13 original biblical chapters** serving the 14 audited stories; **26 original repo witness chapter extracts** (13 English Douay–Rheims/Challoner, 13 French Crampon 1923).
- **1,133 actual indexed verse slots** in these 26 chapter extracts, **0 blank slots** and **0 missing numeric slots** in this limited chapter set. This is only a machine-level completeness check, not a printed-edition collation of every verse.
- **14 read-and-compare story review choices** built into a single, offline, dependency-free HTML file with both text witnesses and multiple proposed excerpt scopes. Ratings, verdicts and notes are **per excerpt option**, while overall priority ranking is **per story**.
- Research results and original source provenance saved to `data/explore/biblical-story-scripture-bilingual-witness-collation.v1.json`.
- Working offline prototype: `data/explore/biblical-story-scripture-review-offline.v1.html`. Open the downloaded raw HTML locally in a modern browser. Select a story, then alternate a complete/short/internal-beat candidate and choose English, French or bilingual text. Individual verse labels are displayed **inside their own witness**; never silently force same-numbered verse alignment.
- The browser keeps draft editorial judgments in localStorage (where allowed), and **Export my ratings (JSON)** produces a user-review file with story order, excerpt-option ratings, verdicts and notes. Import is limited to its own schema, and no action modifies GitHub or production Scripture.
- Regression: `tests/biblical-story-scripture-bilingual-review.mjs` compares the entire embedded HTML source dataset byte-for-byte as parsed JSON against its canonical collation JSON, then matches every individual verse cell against each original repository source witness file; also syntax-checks the inline client script in Node's `vm.Script`.

## Source identity and rights/release status — do not confuse presence with certification

The source file `data/scripture/witness/README.md` explicitly states these are **`ao.scripture.source-witness.v1` / `UNCOLLATED_SOURCE_WITNESS`** transcriptions. Challoner comes from a pinned historical Catholic text candidate, while the French Crampon transcription was imported from a candidate machine-readable file labelled 1923; the French candidate has not been fully collated against the printed Desclée edition. The witness files **are not certified `src/scripture/pack-loader.js` edition packs**, which remain disabled under independent human-reviewed release gates.

These 13 chapters have no blank verse cells, but a zero-blank test does **not** establish full theological, textual or verse-equivalence certification. Do not promote this review file or any final excerpt to published app Scripture until corresponding edition-based source checks are approved.

The original research-only source master (460 publisher reference rows), 151 Atlas IDs, 37 section IDs, 14-story context audit and selected native Bible editions remain unchanged.

## Collation issue A: John 6 unequal verse numbering

The English Douay–Rheims/Challoner source file contains **John 6:1–72**, while the French Crampon source file contains **John 6:1–71**. These are not simply one missing verse in one dataset:

- Challoner verse 6:51 = “I am the living bread which came down from heaven.”
- Challoner verse 6:52 begins “If any man eat of this bread…”.
- Crampon **combines the corresponding material in verse 6:51** (the French line includes both the living bread and the gift of flesh).
- Consequently, 6:53–72 Challoner map provisionally to 6:52–71 Crampon, not their identical numbers. The review tool implements the explicitly annotated **English-to-French semantic-range view** (DR 1–50 = FR 1–50, DR 51 and 52 = FR 51, DR 53–72 = FR 52–71), while preserving original numbering and text verbatim. This is a comparative aid, **not** a full textual critical apparatus.

The imported witnesses also have a genuine confession difference, beyond counting: Challoner at John 6:70 reads “Christ, the Son of God”, while Crampon John 6:69 reads “le Saint de Dieu”. **Never normalize to one supposed identical text or silently erase the difference.** Previously harvested published references such as John 6:52–59 must be tied to a known edition and are not automatically equivalent across English/French witnesses.

## Collation issue B: Genesis 3:15

The English imported witness says “she shall crush thy head” while French Crampon has “celle-ci te meurtrira à la tête”. These must be reproduced exactly when contrasting editions. Marian typology and the historical Vulgate/translation-tradition differences need explicit catechetical distinction, not unnoticed substitution.

## Collation issue C: lectionary half-verses

Two deliberately published short-form citations refer to part of a verse, not the whole verse:
- Genesis 22 lectionary SHORT: `Gen 22:1–2, 9a, 10–13, 15–18`.
- John 11 lectionary SHORT: `John 11:3–7, 17, 20–27, 33b–45`.

The imported witness files preserve **whole verse text only**, so the offline tool cannot reconstruct the exact `9a` or `33b` published cut. To let the user read surrounding context, it displays full containing verse 9 or 33, accompanied by a prominent warning that this is an **approximation, not an exact published liturgical excerpt**. These review choices must not be approved or exported as exact pericopes.

## How to use this research tool

1. Open the single downloaded HTML file offline; the content is embedded and does not request another website.
2. Choose one of the 14 stories on the left, then use **Which passage to read?** to compare the coherent account, published shorter option (where available), and/or proposed internal part.
3. Read English/French side-by-side or one at a time; the John 6 alignment warning is shown with that story.
4. Record a **0–5 suitability score and verdict for each individual excerpt option**. Add notes on omitted narrative context. Enter an overall story priority rank separately.
5. Export the **JSON ratings file** and return it for the next edition-critical and editorial selection stage. Keeping this file is recommended even if the browser also saves local changes.
6. All scores are provisional editorial judgments; the app receives no text, timestamps, reading decisions, pins or release changes.

## Next research gate

After the user's initial ratings, reconcile individual highly rated choices with printed-source verses in both selected editions; address Jon 6 numbering and Genesis 3:15 theological explanation; compare omissions to contextual completeness, including the 9a/33b lectionary splits. Verify the witness chain before any final exact ranges or native-reader navigation wiring.

**No AI-authored Bible history, no automatic shortening of Scripture and no merged Gospel paraphrase.** The tool extracts the original historical candidate strings exactly from their dedicated repository source-witness files.

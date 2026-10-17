# Shared Scripture and commentary mining — 17 October 2026

## Decision locked
**English reading default = CPDV**, chosen for readability. **Douay–Rheims/Challoner = optional historical comparison.** Existing stored explicit choices survive. French Crampon remains its language default. No new Bible translation is imported and no previously disabled edition pack is falsely certified.

## First working editorial tool
Open `previews/scripture-mining-workbench-20261017.html` through a static server rooted at the repository (ES modules and JSON book assets require HTTP/HTTPS). The new tool is a **source-backed research workbench**, not a replacement for the public canonical Scripture overlay.

- Select any of the 20 Rosary mysteries and its individual 10 Guided-bead citations (including Luminous).
- Or enter an exact Bible reference and classify its originating module as Mass, Formation, Historia Salutis or Prayer.
- Load original CPDV source-witness verses first, with a collapsed Douay historical comparison, reusing `src/scripture/witness-loader.js`.
- Load attributed original English `Catena Aurea` excerpts from the *existing* pinned chapter packs, reusing `src/scripture/catena-inline.js`.
- Reuse `src/scripture/context.js` for existing verified external commentary witnesses where no text pack exists (e.g. Bellarmine for Psalms); never invent an excerpt.
- Restrict the display to exact requested verse coordinates; note missing/uncollated source text; withhold automatic side-by-side mapping for Esther, Psalms and Song of Songs unless the existing source-collated crosswalk proves the target coordinates.
- Save a **0–5 review** with `KEEP_HERE`, `SUITABLE_ELSEWHERE`, `REJECT` or `UNDECIDED`, a destination mystery/bead and a duplicate flag. Persist locally and export/import *metadata-only* JSON. No Scripture or copyrighted commentary is duplicated into saved reviews.
- Show commentary authors and source links, not inferred paraphrases. Search the loaded Catena text.
- Deep-linkable through `?module=rosary&mystery=joy1&bead=2` or `?module=formation&reference=Luke%201%3A28`. All modules share the importable `mineScriptureReference(reference,{origin})` service.

## Ownership and next integration gate
The **public** app already uses one shared Scripture overlay (Passage / Full chapter / Commentary / Related) for Rosary, Mass, Prayer, Formation, and Calendar; do not fork it. The editorial mining workbench operates separately so draft ratings and unapproved sources cannot be exposed as final devotional texts. Future source-edition acquisition and actual source-specific text import should extend `src/reference/`, not create a competing parser.

**Current source limitations**: CPDV/Douay and French Crampon source-witness files are not fully collation-approved. Original English Catena is available for four Gospels; Bellarmine is linked but not locally imported. The proposed Haydock, original Douay annotations, à Lapide and Fillion text corpora are NOT silently claimed as imported. Their exact historical edition, original author/translator, machine-readable source, source-level reuse rights and accurate passage locators must be checked first. **No purchases or permissions requested.** Public access or attribution by itself never authorises republication.

Rosary: original 200 Guided contemplations are **not certified verbatim Bible quotations**; a final published bead must cite one Bible verse (at most two), and an Old Testament parallel remains a separate bead with its own reference and classification. Apparitions, Assumption and Coronation must not be represented as directly narrated by a Gospel.

Corpus scope, original IDs and owner state are left untouched. Nothing in this PR changes the 1962 Mass reader, the Rosary recitation mechanics, or existing source registries. The editorial workbench is not yet a mass-published app route; test it before wiring any ordinary-user route.

## Run
```sh
npm run test:scripture
```
`tests/scripture-mining.mjs` checks the default, preservation of explicit Douay preference, proper evidence/source origin, crosswalk fail-closed behavior, independent-family counting, metadata-only decisions and the workbench entry point. An actual static-server browser session should follow before release acceptance.

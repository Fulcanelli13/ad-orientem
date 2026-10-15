# Biblical Atlas — Pleiades reconciliation, research batch 1

**15 October 2026.** Canonical issue #342. Source of truth for existing live pins remains `src/find/bible-atlas.js:ATLAS_GEO`; 151 chronology and the 22 opt-in source-settlement labels remain **unchanged**.

## Batch results

- **38 source owner entries**, representing **35 unique physical-reference keys** (three Jerusalem usages; two Golgotha/tomb usages).
- **28 candidate Pleiades place URIs** with source-record title, representative point, coordinate difference, Pleiades precision, and up to eight attested historical name records including source-stated period bounds and certainty.
- **Seven direct-match holds**: `nain`, `bethesda`, `siloam`, `bethphage`, `olives`, `gethsemane`, `holy-sepulchre`. A nearby generic city or monument is **not** substituted for a distinct Biblical named event/site.
- Pleiades classifies the representative coordinates for **Athens and Rome as rough**. Those candidate links corroborate city identity but do not justify replacing the currently displayed locations. Even entries tagged `precise` remain subject to Pleiades's separate positional-accuracy and association-certainty qualifications.
- **Non-transferable event meanings:** Tabor is an ancient mountain name, not evidence that the Transfiguration occurred there; Carmel is a mountain feature, not an identified altar of Elijah; Bethlehem and Ein Karem can have ancient-settlement matches without proving a traditional Nativity/Visitation locus.
- **Era-specific names really matter:** Pleiades records `Ninuwā`, `Nȋnos` and modern `Nineveh`; `Ioppe` and earlier forms for Joppa; `Caesarea Philippi` vs modern `Banias`; `Stratonos Pyrgos` vs `Caesarea`; and `Col. Aelia Capitolina` must not be projected indiscriminately into the era of David or the time of Christ. The crosswalk stores original name period fields for editorial review, not as ready-to-display map labels.

## Provenance

**Pleiades** — an academic gazetteer of past places maintained by contributors. Canonical stable place URIs: https://pleiades.stoa.org/help/what-are-pleiades-uris . The exact source used was `isawnyu/pleiades.datasets` revision **`d8c06f28656312eee6b7a0f76415b34a89e3c728`**, GIS `places.csv` Git blob `7ba355133562bea6d9f91be2ec1b0d9e094574aa` and `names.csv` blob `58484bd989af90f919c1a36a4f4cba60e132f36e`. Do not silently switch to continuously updated “latest” datasets when reproducing this batch. The Pleiades data license is **CC BY 3.0**, attribution to Pleiades contributors. See https://pleiades.stoa.org/help/how-to-cite-pleiades .

The GIS exports distinguish place, name, location, association certainty, reported historical name dates, and representative points. **Representative coordinates are not archaeological precision guarantees**; see https://atlantides.org/downloads/pleiades/gis/ . Matching here screened name/title and nearby coordinate, but is **not yet a qualified place-identity collation** against individual place pages, older geocoding provenance or the original ancient sources. Records are conservatively labelled `CANDIDATE_UNCOLLATED`, physical-feature/site cautions or `NO_DEFENSIBLE_DIRECT_MATCH`.

## No repetition or duplicate data ownership

Crosswalk keys exactly reuse existing `ATLAS_GEO.key`. Repeated source owners remain visible without duplicate candidate records. The map owns its current published 151 narrative event IDs, coordinate estimates, source URLs, precision categories and opt-in bilingual labels. This crosswalk is **not imported by any runtime**. No pins are moved, no new exact site asserted, and none of its alternate historical name strings are displayed publicly.

## Next acceptance pass

1. Audit the 22 displayable modern aliases against attested first-century/Biblical-era names in their Pleiades records, retaining both modern and relevant ancient label **with clear chronology and uncertainty**. Prioritize mixed eras (Jerusalem, Joppa, Samaria, Corinth) and the source's rough city representative points.
2. Open each candidate's canonical Pleiades place page/JSON and the independent pinned OpenBible coordinate witness; inspect the actual associations, preferred location/accuracy and historical name period, then qualify or reject the candidate. Geographic proximity alone is insufficient.
3. Investigate the seven holds using subject-specific Biblical archaeological atlases, published excavation records, pilgrimage evidence and source distinctions. Do not turn local tradition into a geolocation fact or promote an unrelated neighboring town.
4. Keep the historical terrain/shorelines, physical-handset drag acceptance, artistic curation and #1069 genealogy/theatre research separately gated. No new request for external permissions is needed; comply with published licenses and citation standards.

**Status: RESEARCH ONLY · editorial HOLD · zero code/production changes.**

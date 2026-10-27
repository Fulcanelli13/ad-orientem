# Gregorian chant: high-volume 1961 Graduale source archive
26 October 2026 — draft PR #1749 — **research only, never a production score import**.

## Actual work completed
The source is the GregoBase SQL snapshot dated **5 January 2024**, preserved
in the public `gregorio-project/GregoBase` repository. The source file
`gregobase_online.sql` has Git blob SHA
`c43cc2d08488eef0f128933fe10b6bb292fa4f3b`.
The source table's edition **ID 2** is `Graduale Romanum`, editor Solesmes,
**1961**; it is not the 1908 or 1974 edition. We select by the relational
`gregobase_chant_sources` link, not a text search for "1961".

The initial cohort covers the six primary Proper chant categories:
`in` (Introit), `gr` (Gradual), `al` (Alleluia), `tr` (Tract),
`of` (Offertory), `co` (Communion). These are classified by
**source office-part**, not by calendar date.

| Category | Imported GABC research records |
|---|---:|
| Introit | 229 |
| Gradual | 189 |
| Alleluia | 284 |
| Tract | 83 |
| Offertory | 185 |
| Communion | 225 |
| **Total** | **1,195** |

Of 1,254 source-linked rows in these categories, **one** record was excluded
by the upstream `duplicateof` relationship, and **58** were quarantined
because the GABC transcription was missing or was not represented in the
expected structured data. No copyright-flagged records were admitted.
The 58 IDs and their exact raw page references remain in
`gr1961-proper-index.json`. Do **not** call them nonexistent chants; they
are parser/source-format exceptions to be examined separately.

The retained 1,195 include one exact-GABC duplicate pair (861/1644,
preserved until historical source-identity review) and two
same-category/same-incipit cases with different notation
(200/4653 and 827/8201). These are explicitly flagged, not silently
merged. Five already-known Christmas pilot IDs occur in the research
archive and are not counted as five *additional* production approvals.

## Data files
- `data/mass/chant-corpus/gr1961-proper-001.json` … `006.json`:
  **six research batches** of 200, 200, 200, 200, 200, 195 records.
- `data/mass/chant-corpus/gr1961-proper-index.json`: source edition and
  snapshot provenance; total counts; every quarantine exception;
  per-batch sizes and SHA-256 checksums; duplicate/variant review findings.
- Each retained item has immutable GregoBase ID, 1961 page token
  (including literal starred/bracketed page notation), incipit,
  source office part, transcriber, full GABC and record-level SHA-256.
- `tools/mass/import-gregobase-graduale1961.mjs`: **offline,
  deterministic importer**. Refuses SQL other than the pinned blob SHA,
  refuses unexpected cohort counts, and never modifies application
  reader/Calendar files.
- `tests/gr1961-chant-corpus-bulk.mjs`: hashes all batches and
  GABCs, checks unique source IDs, quarantined-row exclusion,
  live-reader non-import, edition identity and variant preservation.

The snapshot SQL itself is **not added** to the GitHub repository; this avoids
needlessly duplicating a ~17 MB public upstream database. The committed GABCs
are the source-backed research corpus and require no cloud service or fee.

Rebuild verification with an external copy of the exactly pinned source:
```sh
node tools/mass/import-gregobase-graduale1961.mjs --input /path/to/gregobase_online.sql --verify
node tests/gr1961-chant-corpus-bulk.mjs
```
`--write` intentionally overwrites the *research files only* from that
same source and should be used only if an audit authorizes regeneration.
Do not replace the snapshot with a newer upstream download under the
same 2024 identifier.

## Screening versus liturgical release
**1,195 staged does not mean 1,195 verified or available Mass scores.**
Direct structural screening of all retained GABCs found a leading clef
and a final `(::)` in each record; this is **not** full SVG rendering
acceptance, pitch accuracy or edition concordance.

Promotion to a reader-consumable score is a distinct, auditable workflow:
1. Resolve the **actual selected 1962 Proper** and exact chant segment
   through the existing `properToReaderSlots` owner; no feast-name or
   calendar-date inference.
2. Confirm correct musical type/slot, the full Latin text and any variant,
   especially same-incipit Graduals, Offertories, Alleluias and Tracts;
   preserve source edition/page and all variants.
3. Check notation fidelity (clefs, neumes, episemata, quilisma, morae,
   repeat instructions, verses) against the 1961 printed witness.
4. Test the candidate GABC through the pinned Exsurge engraver on narrow
   and wide viewports and in actual offline application usage.
5. Approve it in a **separate release registry**, maintaining frozen
   source IDs, checksum and human editorial sign-off. Only this registry
   can feed the existing native Schola, not the research archive.
6. For a specific Mass, distinguish a source-text score match from the
   **choir's actual performance**, which remains user-reported/observed.

Next batch priority is matching 100–200 of the newly staged records
against the existing 1962 Proper corpus, counting all cases as
screened/matched/unresolved with strict identity and edition gates, rather
than declaring the entire Graduale completed based on ingestion volume.
Seasonal variants, Sequences, processional rites and the wider Kyriale
need separate category rules before automated publication.

The separate pre-Mass listening section still has **zero cleared
recordings**. No copyrighted recording, artificial chant audio, paid
service or runtime network dependence is introduced by this pipeline.

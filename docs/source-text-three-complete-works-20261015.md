# Phase 16 — Two additional complete works in one bulk run (15 October 2026)

PR: [Ad Orientem #1229](https://github.com/Fulcanelli13/ad-orientem/pull/1229), **draft, unmerged**. This is a staged acquisition/indexing pipeline, not a live module or an AI-authored narrative.

## Actual acquisitions — pinned original digital files

1. **Thomas à Kempis, *The Imitation of Christ***, English translation by **Rev. William Benham**, Project Gutenberg **#1653**, [pinned GITenberg commit a15dfc4b](https://github.com/GITenberg/The-Imitation-of-Christ_1653/tree/a15dfc4b9a5df8c7b12acae980d7d6a86dc5f6a8). Full historical digital file preserved at `data/source-text/staging/imitation-benham-pg1653-full.txt` (359,002 source bytes). Parsed **4 books / 114 numbered chapters**, plus four book introductions and historical front matter: **119 reading sections**, **786 paragraphs**, **61,769 words**. The original print copy-text corresponding to Gutenberg's historical etext remains undetermined; Benham's translation must not be conflated with another English edition.
2. **St Francis de Sales, *Introduction à la vie dévote***, **French 1832 Périsse frères edition** (Lyon/Paris), Project Gutenberg **#53540**, [pinned GITenberg commit 6ad311ec](https://github.com/GITenberg/Introduction-a-la-vie-devote_53540/tree/6ad311ecadc2dd5a414b5f11230806dec46b80b8). Full historical digital file preserved at `data/source-text/staging/francis-sales-vie-devote-pg53540-full.txt` (601,135 source bytes). Parsed **5 parts / 119 numbered chapters**, five part introductions, front matter and **two separately owned appendices**: Saint Francis de Sales's historical rosary instructions and the feast-day prayer. **127 reading sections**, **943 paragraphs**, **93,648 words**. The source is historical French, not an English translation, and not automatically textually identical with the saint's first edition.

These are genuinely complete **electronic** source witnesses with retained original Project Gutenberg notices. They have not been independently matched letter-for-letter to printed originals and are not public app texts yet.

## Aggregate with Phase 15

| Metric | Brother Lawrence | Imitation (Benham EN) | Introduction (1832 FR) | Total |
|---|---:|---:|---:|---:|
| Reading sections | 22 | 119 | 127 | **268** |
| Paragraphs indexed | 182 | 786 | 943 | **1,911** |
| Words processed | 11,024 | 61,769 | 93,648 | **166,441** |
| Grade B, machine-readable | 182 | 786 | 943 | **1,911** |
| Grade A, independently passage-certified | 0 | 0 | 0 | **0** |
| Grade C, suspicious OCR | 0 | 0 | 0 | **0** |
| Exception records | 31 | 121 | 173 | **325** |

Most exception records are **one warning per chapter about unstable ordinal passage numbering**, plus very short paragraphs requiring optional targeted review—not missing pages or 325 required manual proofreading tasks. Grade C zero means the parser found no flagged OCR indicators; it does **not** guarantee typographic correctness.

The persisted metadata indices are:
- `data/source-text/staging/brother-lawrence-pg13871-index.v1.json`
- `data/source-text/staging/imitation-benham-pg1653-index.v1.json`
- `data/source-text/staging/francis-sales-vie-devote-pg53540-index.v1.json`

The real source bodies stay in the separate `-full.txt` files. Paragraph records contain edition-anchored IDs, word counts, source checksums and review grades but **not the raw text**. The checksum is a lightweight integrity signal, not a cryptographic attestation. Tests compare *every one of the 1,911 persisted paragraph IDs and text fingerprints* against fresh whole-book parsing, as well as verifying expected chapter order and exclusion of Gutenberg boilerplate.

### One repeatable command

```bash
node scripts/source-text-bulk-ingest.mjs data/source-text/bulk-jobs.v1.json
```

The batch manifest now has **three** complete-work jobs; each is pinned to its own edition, language, digital source commit and exact expected chapter list. The command validates structural completeness and stages a metadata-only exception report. No separate page-by-page proofreading occurs during import.

## Research ownership and reuse

The source-text inventory now has **25 distinct scoped work IDs**: 13 from the canonical work registry, 10 prior proposed works, and **two genuinely new work IDs** (Brother Lawrence and Thomas à Kempis). The de Sales text is a **newly ingested edition of an existing canonical work ID**, not a duplicated saint/author/work entry. There are **three complete digitally staged witnesses**.

Previously ingested **12,692 Catena Aurea fragments**, **408 Formation source bindings**, **304 Formation witness URLs**, Scripture, Rosary and the 65-card Mass reading model remain with their existing owners. These figures count different record types and must not be added together as if they were books.

A separate `data/source-text/read-further-candidates.v1.json` adds **six prospective chapter-level links** to existing Mass/Prayer themes. Examples: de Sales's 1832 French part II chapter XIV on Mass, part II chapters XIX/XX on Confession/Communion, the historical rosary appendix, and Thomas à Kempis Book IV on the Eucharist. These are **read-further discovery leads only**, not source-verified explanations of any single Mass prayer, not completed Formation citation crosswalks and not new liturgical cards. Original module owners must accept any exact claim-level link.

## Quality and release limits

**A** = independently verified precise text/edition/locator; **B** = parsed real electronic source suitable for discovery and chapter navigation with clear provenance, but not independently verified exact quotation; **C** = OCR/structure anomalies flagged for correction. Reproduction clearance is separate from all three; a public-domain work does not automatically validate a particular translator's digital transcription or publication packaging. Raw source bodies have **not** been inserted into the live app.

The Fortescue critical-edition detour stays frozen as a source-collation regression fixture. The new active path is: acquire whole pinned electronic works → parse chapters and paragraph anchors → generate exceptions → compare against existing canonical research → verify only the passages needed for actual explanatory claims → publish approved references through module owners.

**Next practical work:** choose priority source works already listed in the canonical registry and acquisition candidates, ingest available complete digital editions, and create source-identity crosswalks to existing Mass/Formation assertions rather than new AI-authored text. No automatic publication or merge is authorized.

# Prayer and Divine Office source inventory — B01 (28 October 2026)

**Scope:** complete source discovery and verbatim provenance before ANY include/exclude, content import, UI work, or automatic deduplication.

**Canonical master seed:** [data/pray/prayer-office-source-inventory.b01.json](../../data/pray/prayer-office-source-inventory.b01.json).

## What is already inventoried (not equivalent to unique prayers)

| Source | Captured | Exact meaning | Outstanding |
| --- | ---: | --- | --- |
| ICKSP/ICRSP initial research list | 25 | Individual source-selected records imported from existing draft PR #1800 | Further US/UK/FR/other Institute pages; source text witnesses |
| ICRSP French Office subsection | 98 | Index entries: 2 complete offices; 3 already in app; 8 hymns; 1 canticle; 14 Office sections; 2 historic poetry; 3 psalm collections; 65 psalm references | Entire French site, per-item texts, authoritative Office corpus |
| Raccolta 1866 | 40/40 | Verified numbered section pages; one supplementary page | Historical numbered entries and all component prayers under each entry |
| Sensus Fidelium /tag/novena/ | 15 | First visible page; includes a litany and a Seven Sorrows/Joys devotion, not just novenas | Pagination ('Load More'), alternative tags, archives, text witnesses |
| Sensus Fidelium /meditations/ | 19 | Named source collections | Individual works, chapters and embedded prayers |
| Roman Office 1960 | 8/8 | Canonical Hours and seven source-folder classes identified | Full file tree, language-specific text records, unique variants and 366-day calendar/office matrix |

**Do not sum these numbers.** They mix source items, chapter records, references, pages, and Hours; Office and Raccolta references overlap other collections. Unknown unique-prayer denominator is deliberately null.

## Historical editions MUST remain separate

* The *Raccolta* hosted section collection is the 1866 Ambrose St John English edition. Its historical numbering is observed to reach 189 in the supplement; the count of independent prayers is unknown.
* Several standalone Sensus Fidelium novenas identify a **1910 Raccolta** source. These are another edition/witness, not automatically equivalent text to 1866.
* The `Raccolta` contains an entry (1866 §109) describing twenty historical novena subjects, not necessarily twenty complete nine-day texts embedded on that webpage.
* The Divinum Officium source is a structured liturgical database. Do not count every daily rendering as an independent prayer.
* Printed historical indulgence notices must be retained as source history; no historic grant is to be presented as current.

## Required inventory model

1. **Source witness:** site host, collection, title, URL, original publication/edition, language, editorial/transcription status, rights, retrieval evidence.
2. **Hierarchical source item:** book section, numbered entry, individual prayer/antiphon/hymn/reading, sequence and sub-prayers, numbered position, text exactness.
3. **Canonical identity (later):** match or non-match to existing Ad Orientem prayer IDs; preserve different editions and alternative formulations; NEVER delete source records when deduplicating.
4. **Release status:** independent of source selection and research. Initial state is RESEARCH ONLY for all master seeds. No inclusion recommendation or production content is authorized.

## Subsequent enumeration gates

- G0 source tree: enumerate every relevant Institute devotion index, Sensus prayer-bearing page (including tag pagination), 1866 *Raccolta* page and the Office source repository, with broken links and alternate mirrors recorded.
- G1 work-level: extract all title/source items; historical numbering must be reconciled with page content. Every section should carry audited `entry_count`, `subprayer_count`, `index_complete`.
- G2 witness-level: source text and precise edition, alternate source, language status (LA/EN/FR and original as applicable), completeness, translation attribution, rights disposition.
- G3 ownership: compare with full canonical Ad Orientem Pray library, Novena, Rosary, Mass, Calendar and Scripture. Exact duplicates, variants and partial excerpts get separate statuses.
- G4 Divine Office: inspect 1960 Roman Ordinary, Psalterium, Psalms, Tempora, Sancti, Commune, Martyrologium and 1960 calendars, all eight hours, proper/common rules, special offices; validate against original printed source and EN/FR witnesses.
- G5 audited master: publish the counts **unique prayers / historical variants / Office text units / verified texts / incomplete translations / access/rights holds / app duplicates**. Only then start editorial decisions.

## Source references

- [ICKSP USA devotion index](https://institute-christ-king.org/resources/devotions-prayers)
- [ICRSP France liturgical index](https://icrspfrance.fr/textes-liturgiques.php)
- [Pre-existing ICKSP accepted-source register — PR #1800](https://github.com/Fulcanelli13/ad-orientem/blob/research/icksp-devotions-pray-gap-audit-20261028/data/pray/icksp-devotional-gap-register.b01.json)
- [Pre-existing 98-entry ICRSP Office register — PR #1800](https://github.com/Fulcanelli13/ad-orientem/blob/research/icksp-devotions-pray-gap-audit-20261028/data/pray/icrsp-divine-office-index.b02.json)
- [Raccolta 1866 table of contents](https://sensusfidelium.com/the-raccolta/)
- [Sensus Novena tag (not exhaustive)](https://sensusfidelium.com/tag/novena/)
- [Sensus Meditations collections](https://sensusfidelium.com/meditations/)
- [1960 Roman Breviary rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html)
- [Divinum Officium technical source-folder map](https://divinumofficium.hu/www/horas/Help/technical.html)

**B01 acceptance**: one persistent, source-attributed, reproducible baseline. Not a completed page-level or prayer-level census; no site-wide or Office completeness claims.

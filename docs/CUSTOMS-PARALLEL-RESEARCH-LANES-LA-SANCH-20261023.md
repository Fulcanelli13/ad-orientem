# Catholic customs registry — parallel-source division and La Sanch wave (23 October 2026)

## Explicit nonduplication agreement for simultaneous research chats

Both research conversations edit the same draft PR #1572 (`research/customs-full-registry-census-20261023`), stacked on the unmerged research master. **Check branch HEAD and already indexed source_dataset_paths before each extraction.** Two source-extractors must not mine the same edition/witness or rewrite one another's source registers independently.

| Workstream | Chosen task ownership | Sources excluded as already actively mined |
|---|---|---|
| **Regional Europe (this research stream)** | French official cultural-heritage inventories; new Italian regional diocesan/archival source records; Irish Schools' Collection folio verification when original witness readable; era- and village-specific Catholic processions, penitential practices, local household customs. | Weiser's two books, Mueller, McLoughlin, Stokes, Kelly, Chaney, Trapp, Berger, Newland, Hynes, and the parallel Lent/Easter 1992 family-guidance extract. Do not repeat the other chat's broad Anglo-American/English devotional-source mining or its corpus-wide lexical review. |
| **Parallel historical-household text stream** | Its extant English-language household books, authors, and overlapping observation reconciliation, including current Lent/Easter work. | Avoid treating La Sanch 2023, Brittany pardon 2020 and Besta Berri Basque 2018 as unowned new intake when the exact files are already present. |

This is **an evidence-work allocation**, not a claim that the other chat has received an automatic notification or a lock. Read this file and the source file path list before new work. Prefer dedicated independent source files and only update `comprehensive-customs-working-catalogue.v1.json` against the current SHA; on 409 conflicts, reread and reconcile rather than overwrite.

## La Sanch intake: direct national inventory document, one family of practices

Full text inspected: French Ministry of Culture, *La Sanch, processions des pénitents du Vendredi saint en Roussillon (Pyrénées-Orientales)*, inventory id `2023_67717_INV_PCI_FRANCE_00523` (36 printed PDF pages). Document link:

<https://www.culture.gouv.fr/Media/Thematiques/Patrimoine-culturel-immateriel/Files/Fiches-inventaire-du-PCI/la-sanch-processions-des-penitents-du-vendredi-saint-en-roussillon-pyrenees-orientales>

**86 source-page and PDF-line-located research observations** were indexed under `FRSAN23-001…086`, covering Perpignan, Arles-sur-Tech and Collioure:

| Source detail classification | Observations |
|---|---:|
| Regional procession variants | 11 |
| Material or processional components | 23 |
| Historically dated actions or changes | 21 |
| Confraternity social/charitable practices | 3 |
| Intergenerational transmission/participation | 10 |
| Devotional processional actions | 18 |
| **Total** | **86** |

The ministry's historical synthesis specifically distinguishes (1) prior Holy Thursday processions, (2) a 1956 shift to Good Friday, (3) Perpignan's 1870–1943 indoor period and later exterior recovery, and (4) Collioure's 1959 nocturnal restoration. It also describes penitential clothing, carried Passion `misteris`, the `Creu dels Improperis`, Catalan `goigs`, stations, the children’s Holy Wednesday devotion, and local variation. These distinctions must survive deduplication.

**Caution:** a ministry compilation is one textual witness, not 86 independent historical documents. Its historic dates often rely on cited earlier secondary works, and the materials include physical objects, brotherhood social acts, regional costume, and modern staged elements. They are source details of one related regional processional family, not 86 new Catholic customs; an ecclesiastical inventory is not equivalent to a 1962 Roman Ritual authorisation. No original sixteenth/eighteenth-century chronicles were directly inspected in this wave.

Artifacts:
- `data/customs/master/france-2023-la-sanch-ministry-inventory-source-actions.v1.json`
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — 86 nested external source records integrated atop 2,051 prior research rows, reaching **2,137** total at this commit; historical detail rows are non-deduplicated.
- `tests/customs-full-registry-census.mjs` — source ID uniqueness, every locator, exact corpus crosswalk, kind accounting, no publication, baseline preservation.

**Identity and publication locks:** 408 provisional groups unchanged; 56 earlier master identity records unchanged and potentially overlapping. 0 newly certified distinct customs, 0 app/Calendar releases, 0 automatic equivalence merges.

## Next independent-source regional batch

1. Use Italian **official institutional/diocesan archives**, not repeats of UNESCO's single four-city summary, to study the discrete events Nola (Gigli), Palmi (Varia), Sassari (Candelieri) and Viterbo (Santa Rosa). Source and date each local observation; separate the sacred act from load-bearing guild craftsmanship and civic festivities. The four are not variants of one identical feast.
2. Where readable, verify individual Irish 1930s Schools' Collection *Dúchas* folios, preserve informant/school/date and original transcript lines, and explicitly separate Catholic prayer from non-endorsed folk magical efficacy; **search-result snippets remain discovery leads**, not full-text verified records.
3. Read and reconcile original 1950s and earlier Roussillon confraternity reports cited in the Sanch inventory (e.g. 1951/1955 local reports), but only when directly accessible. Do not treat a ministry's quotation of the same historic document as independent corroboration.
4. Keep higher-volume intake separate from verified custom identity decisions and release gates. If a source is already present in current `source_dataset_paths`, spend effort on genuinely *new* original witnesses rather than reindexing it.

No live Ad Orientem Calendar, Mass reader, rites, prayers, or runtime changes are authorised by this documentation.

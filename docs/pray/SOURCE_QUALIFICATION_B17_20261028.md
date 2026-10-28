# PRAY B17 — Source qualification and precise provenance

Date: 28 October 2026. Scope is **existing** Novenas, Seven Words and Tenebrae, with no new prayers, translated texts, editions or invented liturgical requirements.

## Source review results (audited from the repository)

| Corpus | Source-derived coverage | Pending / not certified |
|---|---|---|
| Main novena corpus | 16/16 bilingual playable novenas; 72 individual original-language day-prayer beginnings and endings checked against available digital transcriptions; 27 historic Hammer English meditation/practice pairs already embedded | 0/16 complete original-print certificates; 0/72 full English digital line-by-line certificates; 0 independently authenticated original French Hammer meditations |
| Seven Words | Seven Gospel anchors and seven separately attested Baltimore Manual 1889 English meditations are packaged locally. The closing Marian prayers are a separate appendix. The local transcription documents two normalizations of Wikisource anomalies: `you shalt` and `burn tli the desire`, with a secondary 1923 historical witness | Full print-facsimile page-by-page critical collation pending. The distinct 1854 Berthaumier method is **not** a translation of the Baltimore edition; no French Baltimore meditation is invented |
| Tenebrae | Source-owned Matins (32 sections) and Lauds (10 sections) for each of three Triduum days, in Latin, English and French, from locally integrated Divinum Officium files. Pinned repository revision `b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0` was verified against the public GitHub commit. The source's missing/edition-macro branches fail closed rather than substituting later texts | No independent full collation to a photographed 1961 Breviarium Romanum; no claim to certify the 15-candle parish ceremony or other rite |

## B17 source-status release

- **Novenas:** source drawers now state, per each of the 16 audited records, that digital witness availability does not certify the English prayer body or any French witness as matching a complete original printed edition. Existing individual historical notes, primary source links, indulgence status and actual prayer forms remain intact. The audit registry is fixed to the 16 IDs and cross-checked against `data/pray/novena-source-review.v3.json` by CI.
- **Seven Words:** the already existing source disclosure expressly identifies the two historically documented OCR/transcription corrections and retains the *print collation pending* distinction. Scripture vs meditation and English-only historical witness remain separate.
- **Tenebrae:** source disclosure links to the **exact** verified Divinum Officium upstream commit when and only when the locally compiled hour reports that pinned revision. Otherwise show a non-certification message, not a guessed link. Keep source uncertainty and ceremonial boundaries unchanged.

## Next research gates — do not confuse with content expansion

1. Obtain independent printed-page facsimile evidence for the 16 novenas; prioritize published editions behind digital reproductions, and log actual page ranges and each accepted discrepancy.
2. For Seven Words, independently collate all seven English prayer bodies and the Marian appendix against the scanned 1889 Baltimore edition, with special inspection of the two existing corrected glyphs and the separate 1923 comparison. Do not import the distinct French Berthaumier recension as a Baltimore translation.
3. For Tenebrae, compare each of six source-generated hours, especially French Good Friday and Holy Saturday Christus factus est substitutions, against a photographed 1961 Roman Breviary and record the relevant printed rubrics. Do not assert printed certification until the evidence is obtained.

No mandatory new novenas, no online dependency, no change to user prayer wording. Strict zero cost.

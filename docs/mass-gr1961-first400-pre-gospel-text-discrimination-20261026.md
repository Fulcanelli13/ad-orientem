# GR1961 first 400 — pre-Gospel source-text discrimination (26 October 2026)

This is an additional **research-only** screen, not a new chant import or a certification of actual 1962 selected Proper. It compares musical transcription **GABC lyrical openings** for all **47** provisional pre-Gospel candidates found among archived records 1–400 against complete pinned Latin `[Graduale]` / `[Tractus]` / `[Alleluia]` **source sections** from **49** Divinum Officium source files, commit `ad8783641455bae38a8eb5782b34241a7b3ff2ef`. Each file's Git blob hash was checked before the section evidence was captured. Latin diacritics and historical ligatures are normalized for comparison, while original text and line numbers remain retained. Musical chant separation has **not** been inferred from the presence of a word such as `Alleluia`.

| Primary text triage (47 exclusive records) | Records |
|---|---:|
| At least 8 initial normalized words agree in some line | **33** |
| Partial agreement, 4–7 initial words in best line | **7** |
| Priority continuation divergence, only 2–3 words agree | **7** |
| **Total** | **47** |

The 47 candidates have **69** occurrence-level matches across **49** original source paths; **11** candidates recur across several source paths. **3** candidates have a matching passage in an explicit `[Tractus]` source section. A text match in a `[Graduale]` composite is **not** proof of a specific musical segment.

## Seven priority textual mismatches

- `GREGOBASE-38`, *Domine Deus virtutum*: GABC continues **converte nos**, source **exaudi preces**.
- `GREGOBASE-56`, *Ego sum*: GABC continues **radix et genus David**, whereas the sampled Easter Proper continues **pastor bonus**. This disproves the proposed identification from the two-word incipit alone, independently of its `tr` musical label.
- `GREGOBASE-63`, *Cor meum*: GABC continues **et caro mea**; sampled passages continue differently.
- `GREGOBASE-134`, *Salvum me fac*: GABC continues **Deus, quoniam**; source passages continue differently.
- `GREGOBASE-249`, *Manum suam*: GABC continues **aperuit inopi**; source **et tetigit os meum**.
- `GREGOBASE-329`, *Exaudi orationem*: GABC has a different following clause from the sampled Proper passages.
- `GREGOBASE-348`, *Laudate Dominum*: GABC continues **de caelis**; source **omnes Angeli ejus**.

These seven are **not rejected from the entire Graduale**. They remain staged as authentic research transcription records but are not legitimate *matches to the specific sampled source passages* on current evidence. Full Latin text, source inheritance, chant segment boundaries, 1962 selected Proper, original 1961 printed notation and choir programme selection all remain independent and unapproved.

`gr1961-first400-pre-gospel-source-sections.v1.json` preserves source sections and line numbers with pinned SHA identities. `gr1961-first400-pre-gospel-text-discrimination.v1.json` is a 47-record deterministic report. Regenerate/verify with `node tools/mass/discriminate-gr1961-first400-pre-gospel.mjs --verify`. New negative regression cases prevent source drift. No runtime imports or release permission. PR remains draft.

Next prioritize selected ProperResolver results and the existing **trilingual** `reader-pre-gospel-chant-source.js` boundary gate for eligible records, and find alternative correct Proper/formulary source owners for divergent GABCs. Then separately review the printed 1961 music.

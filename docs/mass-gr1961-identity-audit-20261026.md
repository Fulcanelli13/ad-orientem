# Graduale 1961 — complementary chant-identity risk audit

26 October 2026. Research-only supplement to the **already committed**
`data/mass/chant-corpus/gr1961-proper-001.json` through `006.json`
and `docs/mass-gregorian-bulk-import-20261026.md`. This is NOT
another SQL importer, archive or reader catalogue.

## Scope and verified figures

The six canonical source batches contain 1,195 GABCs (200/200/200/200/200/195).
The separately signed-off corpus has 1,254 source-linked core records, one
upstream duplicate excluded, 58 GABC-format exceptions, and zero records
automatically accepted as production liturgical settings.

The deterministic secondary audit over all 1,195 staged rows found:

| Identity risk | Count | Rule |
|---|---:|---|
| Unique office-part + normalized incipit keys | 1,192 | Keep office-part ownership |
| Normalized incipits occurring in multiple chant roles | 101 groups / 213 records | Never map from incipit alone |
| Same-part/same-incipit groups with distinct GABC hashes | 3 groups | Preserve all sources; compare to printed page |
| Exact GABC content shared by different source IDs | 1 group | Retain both IDs; review edition/version |
| Nondecimal page tokens (starred, bracketed or letters) | 440 records | **Not malformed**; retain authentic page tokens |
| Promoted by this research audit | **0** | Editorial approval is independent |

The three same-role transcription pairs are:

- Communion `Dum venerit Paraclitus`: **GREGOBASE-39** and
  **GREGOBASE-17793**, both page 270, with incipit suffix "(2)"
  in the latter. The different leading clefs and GABC hashes **do not
  establish** that there are distinct melodies; transposition, copying and
  edition practices require comparison.
- Gradual `Inveni David`: **827** and **8201**, page [3].
- Offertory `Domine Deus... qui repertus`: **200** and **4653**,
  page [74].

The distinct-ID pair **861/1644** has **exactly identical GABC text**
despite different source titles/version labels. Preserve both for review.

The 101 cross-role groups are expected in a repertory that reuses
Scripture texts as Introits, Graduals, Alleluias, Tracts, Offertories or
Communions. An actual chant choice requires its **canonical 1962 Proper
slot and source**; an identical textual incipit in another role is never
equivalent musical evidence.

## Reproduction and ownership

- Input: six immutable 2024-snapshot research batches plus their
  SHA-256-indexed `gr1961-proper-index.json`.
- Output: `gr1961-identity-audit-v1.json`, an **additional audit**,
  not a replacement for the authoritative source index.
- Reproduce/verify:
  `node tools/mass/audit-gr1961-identity-risk.mjs --verify`
- Regression:
  `node tests/gr1961-identity-risk-audit.mjs`
- All staged GABC hashes and source-batch hashes are checked before audit
  conclusions are accepted; all six production promotion gates in
  `tools/mass/gr1961-promotion-gate.mjs` remain unchanged.

## Next release milestone

Match the first 100–200 staged Proper references to authenticated 1962
Proper source text **after** resolution by the existing DayResolver and
`properToReaderSlots`. Preserve distinct Alleluia vs Tract segments.
Report *matched candidate*, *ambiguous*, *text/source unavailable* and
*human-editorially approved* as separate counts. The runtime must not
import the entire 1,195-score archive or infer a chant from a feast date.

No payment, external audio API, AI singing, or new liturgical reader
architecture is introduced.

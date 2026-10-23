# W63 — 2026 date-by-date artwork evidence matrix (15 October 2026)

**Research-only.** This audit reconciles the existing 1962 production calendar source snapshot with the Sacred Art owner's **early** exact and contextual source associations, then applies the **later user 0–2 physical-original blocklist**. This is **not** a visual/crop/rights or frontend rendering acceptance test.

## Recovered full-year canonical calendar — source truth

The original Sacred Art GitHub Action [2026 full-year production resolver run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38052691678) contains **artifact #11670466022** (`calendar-1962-2026-audit.zip`, inner file `1962-2026-full-year-audit.json`), generated **2026-10-10**. The archive was retrieved and its JSON inspected. Its reported result:

| Audit basis | Count |
|---|---:|
| Calendar year | 2026 |
| Dates evaluated by actual production DayResolver | **365 / 365** |
| Status `ready` | **365** |
| Unresolved/failed dates | **0** |
| Principal feast/source ID, title, rank, colour missing | **0** |
| Independently checked sample cases | **72** |
| Independently matched sample cases | **72** |
| Independent certification of all 365 | **NO** |
| Class I / II / III / IV days | **53 / 76 / 165 / 71** |
| Principal source prefixes `sancti` / `tempora` / `commune` / empty-feria | **171 / 123 / 12 / 59** |
| Dates with raw commemoration strings | **112** |

The 2026 observed principal is the actual resolver output; historical nominal saint feasts, living-sanctoral overlay, optional votive and local propers must **not** overwrite it.

**Full dated output:** the unaltered GitHub Action artifact is the immutable source for 365 titles/Proper identities, rank, colour, raw commemorations and source details. This research branch also includes a [compact 365-date source-image association index](../../data/research/sacred-visual-w63-2026-365-date-candidate-image-index-20261015.v1.json), linked to the exact artifact by run and artifact IDs. The user-facing W63 full JSON matrix is separately attached to the conversation. Do not manufacture principal fields for days beyond the 53 already in the Sacred Art first-class snapshot.

## Join to existing candidate art — after score blocklist enforcement

Existing source ledgers are from `platform/885-sacred-art-candidates`:
- `data/calendar/sacred-art-1962-exact-feast-source-links.v1.json`: **24** direct dated source associations (`EXACT_FEAST_SUBJECT`, `EXACT_APPOINTED_GOSPEL`, `EXACT_TITULAR_SAINT`) across **21** 2026 dates.
- `data/calendar/sacred-art-2026-i-class-contextual-reuse.v1.json`: **28** contextual associations across **28** 2026 dates.
- All 52 are exact original IDs present in `data/calendar/sacred-art-candidates.v1.json`; **32 distinct physical originals** represented. This is source-identity matching, *not* image-quality approval.
- **49** distinct dates have at least one scoped old research association, **316** are absent from these *two* date-association ledgers. Absent ≠ no artwork elsewhere.
- **Critical correction:** the later `sacred-art-w49-permanent-original-rejection-blocklist-20261014.v1.json` identifies **9 original physical artworks globally rated 0–2** amongst these old suggestions, spanning **24 dated source links**. Those 24 links are **PERMANENTLY INELIGIBLE** despite earlier `EXACT` art associations. **22** dates have only blocked links in these two ledgers; another **2** dates have a surviving nonblocked alternative.
- **28** eligible-for-further-review candidate links across **27** dates remain after the permanent exclusions. **Eligible for review does not mean artistically rated 4–5, sourced, cropped, legal for app publication, or actually visible in the app.**
- Zero of these old sources declares artwork release approval. The full 365 current UI hero and gallery components have not been image-inspected during this audit.

### Rejected old source originals that must NEVER reappear automatically

| Physical artwork ID | Old proposal context | Binding user rejection score |
|---|---|---:|
| `met-437272` (Perugino, *Resurrection*) | Easter and Easter Week | 2 |
| `commons-multscher-pentecost` | Pentecost and its week | 2 |
| `met-435618` (Bartolomeo di Giovanni, *Trinity*) | Trinity Sunday | 0 |
| `met-458984` (Sano di Pietro, Baptist's birth) | St John the Baptist | 2 |
| `met-458998` (Bernardo Daddi, *Assumption*) | Assumption | 1 |
| `commons-el-paso-sacred-heart-retablo` | Sacred Heart | 0 |
| `met-437578` (*Christ in Glory*) | Christ the King | 0 |
| `met-910391` (Cecco del Caravaggio, *Christ on the Cross*) | Passion Sunday | 2 |
| `kress-k0355` (Vittore Carpaccio, *St John the Baptist*) | Advent Sundays | 2 |

These nine rejected physical originals must not be offered again to the user for a fresh rating simply because an older liturgical association table mentions them. Their subject remains valid and better paintings may be sought after the full corpus reuse pass.

## What W63 actually proves

1. A production-resolved *dated* 365-row 1962 calendar source exists and was successfully recovered from the original CI evidence artifact.
2. Exactly 52 historically proposed dated artwork source associations can be joined by unchanged physical artwork IDs; **9** of the originals have since been vetoed. This is an example of why source chronology and aesthetic chronology must be reconciled before “coverage” claims.
3. The conservative current score gate yields 28 not-yet-rejected candidate links on 27 dates in this restricted source pool.
4. It does **not** prove the remaining 338 dates lack an eligible painting. The 235-subject index, W48/W49 five-star selections, 49 historic Proper leads, 83 Breviarium labels and older saint art must still be joined by physical original identity.
5. One approved artwork can legitimately serve multiple day contexts. There is no requirement for 365 unique original masterpieces.
6. A principal feast picture does not discharge the independent picture requirement for an individual saint/collective martyrology component, and calendar principal rank must never be fabricated from date strings.

## Next concrete artwork coverage pass

- Link every day row's observed source ID to exact Sacred Art owner subject IDs, considering independent 72 checkpoints and the 53 first-class source snapshots; maintain `UNMATCHED` when no exact identity.
- Join **all** previously user-5-scored original artworks by reliable museum accession/original SHA and valid subject relation, without promoting unrelated same-name paintings. Suppress the 9 now blocked dated physical originals.
- Link 1962 saint/group occurrences, commemorations and the optional separately labelled living-sanctoral context to **distinct image requirements**.
- Query the current Home/Calendar frontend asset/gallery selection after permissions to verify actual published visual and valid crop/rights, not just artwork record presence.
- Only then calculate comprehensive `approved_exact`, `approved_contextual`, `research_only`, `rejected_source_only`, `genuine_gap` counts for all 365, followed by every prayer and map/timeline scene.

**Ownership:** Calendar controls the observance; Sacred Art controls original painting and human aesthetic approval; Saints controls identities and holiness-first bios; Map controls coordinate/source place. This PR is a non-mutating research pointer/crosswalk.

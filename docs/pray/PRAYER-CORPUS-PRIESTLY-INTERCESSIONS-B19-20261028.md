# Prayer Corpus B19 — Useful prayers for priests, vocations and perseverance

28 October 2026. **One user-facing experience inside the existing Eucharistic Prayer family**, not a new top-level module, prayer encyclopedia, Calendar obligation or recurring task.

## Admission decisions

| Purpose | Selected work | Reason | Text coverage | Status |
|---|---|---|---|---|
| Priests | *O Jesus, Eternal Priest* | Short, frequently usable prayer for the sanctification of priests | Historical English only | Admit with anonymous/uncertain author label |
| Vocations | *For the Increase of Labourers*, Raccolta 1910 §464.I | Specific request for priestly vocations, distinct from general clergy intercession | Historical English and printed Latin | Admit |
| Perseverance | *For the Preservation of the Clergy*, Raccolta 1910 §464.II | Specific prayer for clergy in danger and perseverance | Historical English and printed Latin | Admit |
| Sacred Heart, Eternal High Priest | ICKSP US online text | The webpage contains an obvious duplicated clause; independent correction is not source-approved | Corrupt witness | Hold |
| Prayer to Our Lady of the Priesthood (Fr Thévenin) | ICKSP UK | Modern author and translation status unresolved | English online | Hold rights |
| Benedict XVI priest prayer | ICKSP UK | Modern text, rights and recensional overlap | English online | Hold rights |
| UK 1st Thursday two-part prayers | ICKSP New Brighton | Useful local devotional composite but overlaps the three already selected intentions | English online | Defer as local option |
| Raccolta §463 extended sanctification prayer | 1910 | Lengthy, overlap with first prayer; period language includes a Marian formulation requiring explanation | English online | Defer |

The first selected text was reported in *The Ecclesiastical Review*, vol. 50 (1914), pp. 608–609, and appears in the ICKSP US and UK devotional websites. It is **often attributed to St Thérèse**, but a historical source investigation finds no convincing original attribution. **Never present her as its author.** Its original 1914 page-image has not been independently checked. ICKSP is a witness, not proof of attribution.

The two Raccolta prayers are complete historic parallel English and Latin text witnesses from the 1910 edition, p.181 (PDF zero-index 180), §464.I and II. The original PDF page image fetch was unsuccessful, so exact print-image certification is **false**, despite complete digitally extracted text.

## Integration

- `src/pray/priestly-intercessions-b19.js` holds exactly three works, each with source URLs, original language, authorship status and source-image caveats. The existing 94 ownership/48 canonical records are untouched; one historical ICKSP source lead is reconciled as an alias, not a fourth work.
- `src/pray/internal-route-owner.js`: exact nested `pray.for_priests` route, using the existing Prayer surface and return behavior.
- `src/pray/presentation-runtime.js`: direct **Pray for priests and vocations** contextual choice in the existing Eucharistic family, then 3 one-tap intention choices. No extra card in the frozen 23 family-entry list.
- EN displays original historical English; FR displays the original Latin *Raccolta* formulas, or a clearly labelled historical English version for the first prayer. No invented French prayer text; users may deliberately switch Latin/English on the two 1910 works.
- Small provenance disclosure carries uncertainty and links. No old indulgence data is advertised as current, no automated reminders, no mandatory First Thursday requirement, no copying contemporary papal prayer.
- `tests/pray-priests-intercessions-b19.mjs`: 3 intents, source and attribution guards, language and route contracts. Attached to existing `test:pray-owner`.
- `tests/pray-chaplets-discovery-phone.mjs`: mobile 320/390 checks of the actual Priest experience, Latin switch, persistence of prior Rosary/chaplet routes, and no horizontal clipping.

Source links:
- https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests
- https://icksp.org.uk/newbrighton/the-most-holy-rosary-of-the-blessed-virgin-mary/
- https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf
- https://fauxtations.wordpress.com/2016/10/01/st-therese-and-praying-for-priests/

**Editorial principle:** useful choices by real prayer intention. No fixed numerical cap, but no duplicate display of near-identical recensions. Source-image QA and historic French witness acquisition remain future provenance upgrades, not license for invented text.

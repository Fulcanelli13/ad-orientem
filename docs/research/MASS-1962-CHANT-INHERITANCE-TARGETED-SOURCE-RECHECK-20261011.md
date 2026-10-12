# Targeted source recheck: eight outstanding inherited chant references

Date: 2026-10-11. Scope: research only; no 1962 typical-edition certification and no publication clearance.

Parent registers: [105-source census](MASS-1962-105-PROPER-CHANT-COVERAGE-CENSUS-20261011.md) and `data/geography/research/mass-1962-chant-inheritance-source-traces-20261011.v1.json`.

## Two direct source sections independently retrieved

1. **Trinity Sunday** `Tempora/Pent01-0` Introit points literally to `@Tempora/Pent01-0r:Introitus`. [The actual parent file](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Pent01-0r.txt) contains `[Introitus]`: `!Tob 12:6` for *Benedicta sit sancta Trinitas* and `!Ps 8:2` for *Domine, Dominus noster*. **Status:** raw-parent-note located; not yet collated with the 1962 printed Missal or Clementine text.

2. **September Ember Friday** `Tempora/093-5` has a directive for `Tempora/Quad1-6:GradualeL3`, not ordinary `Graduale`. [The precise source file](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Tempora/Quad1-6.txt) includes `[GradualeL3]`, annotated `!Ps 89:13; 89:1`, beginning *Convertere, Domine, aliquantulum*. **Status:** exact specialised raw section and notes located; actual 1962 Ember ordering and text not certified. Do not silently substitute generic Gradual.

These two results reduce *unlocated direct parent sections in the specified eight-source target list* from eight to six; they do **not** change the 364 directly annotated source positions, the immutable 420-row census or its zero publication certifications. They have not been promoted to the master inheritance dataset.

## Six remaining Common-section holds (four distinct parent paths)

| Child source and section | Parent source and required section |
|---|---|
| `Sancti/02-02` Offertory | `Commune/C6b:Offertorium` |
| `Sancti/03-25` Introit | `Commune/C10b:Introitus` |
| `Sancti/03-25` Offertory | `Commune/C10:Offertorium` |
| `Sancti/03-25` Communion | `Commune/C10a:Communio` |
| `Tempora/Adv3-3` Communion | `Commune/C10a:Communio` |
| `Tempora/Adv4-0` Communion | `Commune/C10a:Communio` |

At the checked upstream `master` location, direct fetches for the four corresponding `web/www/missa/Latin/Commune/C*.txt` paths returned 404. This is **not evidence the chant or the Common is absent from the 1962 Missal**. The source repository may encode Commons elsewhere or use alternative filenames. Trace the actual original layout, compare literal Latin and edition-specific rite before assigning Scripture.

## Next research stages

- Establish a full **1962 liturgical celebration / Common / votive / ritual / funeral denominator** independently of the 105 app-owned witnessed Proper paths; do not use 105 as a complete Missal count.
- Inspect complete Alleluia, Tract, Sequence and extended Ember/Holy Week section ordering, recording actual variants.
- Resolve the six Common references by original source path and chant phrase, not by similarity of celebration titles.
- Collate each candidate Scripture annotation against the **printed 1962 Missal**, Clementine Vulgate (traditional Psalm numbering and Esther/Daniel additions), Crampon and Douay–Rheims.
- Keep devotional typology, author-attributed interpretation and actual quoted Proper texts as separate edge classes; keep every publication gate closed until independently checked.

No production reader, LIVE cues, formation content, Bible Atlas or art was changed by this targeted recheck.

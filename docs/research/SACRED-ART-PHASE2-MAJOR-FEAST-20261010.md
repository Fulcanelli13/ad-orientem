# Sacred artwork — Phase 2 / major-feast and I-class research reconciliation
10 October 2026 · Canonical owner #885 · work in [PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887)

**Scope:** Research and acquisitions, not artistic approvals or production image changes. The frozen baseline [Phase 1 audit](SACRED-ART-LITURGICAL-FIRST-AUDIT-20261010.md) reported 181 candidates / 166 acquired originals / 92 of 168 subject minima met. This paper records the first Phase 2 follow-up without rewriting that baseline.

## Verified after Phase 2 major-feast acquisitions

| Measure | Phase 1 baseline | Phase 2 verified | Change |
|---|---:|---:|---:|
| Painting candidates in master | 181 | **188** | +7 |
| Downloaded, hash-recorded originals | 166 | **173** | +7 |
| Museum CC0 original files | 163 | **165** | +2 |
| Commons public-domain, held | 3 | **3** | — |
| Kress public-domain, held | 0 | **5** | +5 |
| Target subjects meeting original minimum | 92/168 (54.8%) | **95/168 (56.5%)** | +3 |
| Major feast/Triduum subject targets meeting minimum | 17/26 (65.4%) | **18/26 (69.2%)** | +1 |
| Remaining under-minimum subjects | 76 | **73** | −3 |
| Images approved for app publication | 0 | **0** | — |

**Source:** [focused batch 6 original run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38052449434), [Met Saints Peter and Paul run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38053123235), [current source coverage audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38053219354).

### Individual original files reconciled

| Canonical painting ID | Painted subject | Research relationship | Source rights | Validation |
|---|---|---|---|---|
| `kress-k2017` | Entry into Jerusalem | Palm Sunday exact subject, preliminary | Foundation public domain; commercial reuse review held | 5,510 × 7,700; hash recorded |
| `kress-k2016` | Transfiguration | 6 August / optional luminous Rosary / Scripture exact subject, preliminary | Foundation public domain; rights held | 5,448 × 7,584; hash |
| `kress-k1782` | Massacre of the Innocents | Holy Innocents exact narrative, preliminary | Foundation public domain; rights held | 6,301 × 3,114; hash |
| `met-438462` | Massacre of the Innocents | Holy Innocents exact narrative, preliminary | Met museum CC0 | 4,000 × 3,487; hash |
| `kress-k0355` | Saint John the Baptist | **Contextual saint painting**, *not* Nativity or Beheading | Foundation public domain; rights held | 2,732 × 6,213; hash |
| `kress-k2027` | Last Judgment | Last Things in Formation; contextual All Souls/All Saints, **not exact feast iconography** | Foundation public domain; rights held | 5,530 × 7,620; hash |
| `met-442491` | Saints Peter and Paul, Bartolomeo Manfredi | Exact **observed I-class 29 June** source ID, but no artistic approval | Met museum CC0 | 4,000 × 3,113; hash |

The strict published subject totals rely on the original sha256 plus precise iconographic keys and crosswalk; any subject target met does not imply a masterpiece-quality publication-ready image.

## Observed first-class 2026 worklist

The [actual production DayResolver](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38052691678) resolved all **365/365 dates**, including **53 I-class** principals. The 53-row [canonical source research crosswalk](../../data/calendar/sacred-art-first-class-2026-research-crosswalk.v1.json) captures exact year/date, principal source ID, observed name, source-strength classification and canonical target pool. The [auditor](../../tools/calendar/report-sacred-art-liturgical-priorities.mjs) enforces parity of all 53 IDs with the production day resolver and publishes original candidate IDs by subject pool without automatic approval.

- **51/53 I-class days (96.2%)** have at least one acquired original in an associated subject pool, but this is merely research potential and can be contextual or scripturally unresolved. Subject pools are not verified **observed-day** links.
- **1/53 (1.9%)** has an explicit verified artwork → 1962 observed-principal ID: `met-442491` maps `sancti:06-29:1:r` for Saints Peter and Paul, according to the Met object and actual DayResolver. This is an identity/subject link **only**, not curator approval or app image release.
- **0/53** I-class days have curator-approved publication images.
- The two I-class research target pools with no acquired original are the **Sacred Heart** and **Christ the King**. These subjects demand targeted high-quality *painting* research, not metalwork plaques, frescoes, prints, photographs, or a generic King of the Jews Ecce Homo used as a Christ-the-King painting.
- All seven acquired files are source records and CI artifacts, **not** live app assets. GitHub artifacts have 30-day retention; durable storage must follow acceptance.

## Next research order

1. Target exact-source **Sacred Heart** and **Christ the King** original paintings from authoritative museum or official foundation collections with 2500px+ actual colour reproduction, preferably CC0. Reject false “Sacré-Cœur” landscape/architecture search hits, print/metalwork, and rights-restricted modern photography.
2. Fill the remaining feast-target acquisition minima (Palm Sunday, Transfiguration, All Saints, All Souls, St John Baptist Nativity/martyrdom, Our Lady of the Rosary). An image of Saint John standing alone is not his Nativity or martyrdom.
3. Progress through 53 I-class days and their **appointed** Gospel/lesson associations, especially the Sundays of Lent/Advent and the Holy Week/Pentecost vigil and Ember Days. Distinguish a reusable Easter/Pentecost octave representation from a specific Gospel image.
4. Then source missing app modules (Stations and Scripture scenes, recurring devotions, Formation and saint portraits), followed by II-, III-, and IV-class celebrations as agreed.
5. **Only after research/acquisition**: one local HTML curatorial gallery containing all categories and real painting previews, Accept/Reject/Needs-review and JSON export. The exported JSON will be validated against canonical image IDs, source hashes, rights, crop and subjective artistic decisions before production inclusion.

No new selection HTML has been created.

# Prayer work identity registry — Stage 1 audit (6 November 2026)

**Scope:** Research branch only. No edits to existing prayer texts, readers, navigation, public assets, main, or GitHub Pages. This is not a certification that all 133 works are independently published.

## Deliverables

- data/pray/prayer-work-identity-registry-20261106.v1.json — source-owner identity registry. **No prayer body text is copied.**
- tests/pray-work-identity-registry-20261106.mjs — executable coverage and integrity contract.
- .github/workflows/pray-work-identity-registry.yml — branch / PR validator with no deployment job.

## Exact accounting

| Measure | Result |
| --- | ---: |
| Original masterplan numbered rows | 138 |
| Proposed catalogue work records | **133** |
| Canonical source records | 48 |
| Independent canonical works after Loreto/Requiem grouping | 46 |
| Main novena programmes | 16 |
| Rosary-owned components (not standalone entries) | 2 |
| Distinct Immaculate Conception novenas | 2 |
| Source-owned works whose live route still needs independent verification | 85 |
| Canonical-family works with existing published availability preserved | 46 |
| External-link-only St Thérèse items | 2 |

The 138 original numbers become 133 works by combining the Loreto editions, Requiem forms and Easter hymn recensions (three fewer), plus retaining the Fatima prayer and Rosary collect as components of the Rosary (two fewer). **Do not combine the two independently structured Immaculate Conception novenas.** The previous 132 estimate is superseded.

## Family counts

| Family | Works |
| --- | ---: |
| I — God, the Most Holy Trinity | 23 |
| II — Our Lord Jesus Christ | 28 |
| III — The Holy Eucharist | 20 |
| IV — The Holy Ghost | 5 |
| V — Our Lady | 22 |
| VI — The Angels and Saints | 15 |
| VII — Holy Church and every need | 8 |
| VIII — Scriptural Prayer | 4 |
| IX — The last things | 8 |
| **Total** | **133** |

Relative to the old 132 projection, V increases by one from retaining the distinct Institute Immaculate Conception novena. VIII increases by one and IX decreases by one because De profundis is classified as a Psalm.

## Specific corrections recorded

- Morning Offering: II / Sacred Heart; morning is a contextual facet.
- De profundis: VIII / Psalms; faithful-departed use is a contextual facet.
- Adoremus in aeternum and Psalm 116: III / Benediction, with Scripture reuse metadata.
- Divine Praises: I / Praise and thanksgiving, referenced by Benediction.
- Loreto and Requiem: one work each, with both original canonical form IDs preserved.
- Immaculate Conception novenas: two separate programmes, same subject but not the same edition.
- Tantum Ergo: excerpt of the not-yet-acquired full Pange lingua. No fabricated destination ID.
- Holy Name Litany: one work, referenced in Montfort preparation.
- Fatima Prayer and Rosary collect: two programme-owned Rosary components, not independent library entries.
- Montfort's Augustine prayer and consecration act: tagged as programme-owned components, not new independent prayer library entries.
- St Thérèse Institute perpetual Tuesday novena and missionary intercession: external links only; the Twenty-Four Glory Bes novena and historical 1925 prayer remain distinct.
- No Learning to Pray module, exercises, navigation or generic reader has been added.

## What the validation actually establishes

The test checks original table-row coverage, one family and subcategory, unique identities, source-owner paths, 48 canonical source IDs, sixteen main novenas, edition groupings, parent relations, missing references, source pointers for full-language canonical records, and separate publication / verification status.

**85 records have route-unverified availability.** This does not mean unpublished or hidden. It means this research pass has not individually audited their public reader route. No existing live entry may be removed on that basis.

The 46 canonical-family works preserve their published state, while their edition evidence remains source-recorded-not-recertified. The registry has language evidence pointers but does not claim new original-edition print certification.

The separate 97-row historical acquisition ledger is not another catalogue of published prayers. It is not counted in the 133 and its statuses remain unchanged.

## Open research (not silent publication blockers)

1. Confirm exact addressee/edition for the Montfort components and the three questioned Lenten hymns: Audi benigne, O sol salutis, Ex more docti.
2. Collate St Thérèse's separate missionary and historical 1925 texts before treating them as editions of one work.
3. Verify whether a complete Pange lingua is already source-owned; only then wire the Tantum Ergo excerpt relation.
4. Audit the 85 source-owned reader routes and their actual available languages without removing public functionality.
5. Reconcile remaining source editions and the acquisition ledger without mistaking overlapping research for unique works.
6. Confirm homepage facets against the existing calendar and user customisation before changing presentation.

## Non-regression gate

- Never rewrite or overwrite the Latin, English or French prayer texts for classification.
- Never replace or alter specialised Rosary, Mass, Confession, Adoration, Benediction, Stations, Offices or Novena readers.
- No app imports this research registry yet, and no Prayer / homepage UI has changed.
- GitHub Actions + GitHub Pages remain the sole publication infrastructure; the new validation workflow deploys nothing.
- Do not claim structural test success as proof of public route, print edition, historical rights or liturgical-correctness audits.

Run the validator with:

    node tests/pray-work-identity-registry-20261106.mjs

Only a finished Node or GitHub Actions execution counts as validation execution evidence; the initial in-memory construction check is a separate preliminary check.

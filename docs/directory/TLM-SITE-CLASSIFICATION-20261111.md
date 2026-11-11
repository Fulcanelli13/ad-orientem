# TLM Atlas — source site-category census (11 November 2026)

This is a scoped, app-loaded classification census, **not** a claim that the
operator of every building has been independently verified. It preserves the
established CL2 physical-site identities and CL27 source-ministry relationships.

## Coverage

| Category | Physical sites | Scope |
| --- | ---: | --- |
| Priestly society / clergy ministry | 1,392 | Source-reported context, **not automatically legal building ownership** |
| Diocesan / parish context | 633 | Source-reported context; candidate for the diocesan photo lane |
| Religious house | 97 | House/family context, **not necessarily the celebrant** |
| Lay association / local group | 25 | Organizer context, not a proven priest |
| Mixed / host relationship | 14 | Multiple roles; preserve separately |
| Directory group only | 74 | Discovery/association does **not** confirm operator |
| Unresolved | 345 | No defensible operator/category beyond the source label |
| **Total** | **2,580** | **140 exact source-affiliation labels classified** |

Of 2,580, **2,161** carry a usable source-reported category and **419** remain
operator/category holds (74 directory-only, 345 unresolved). Separately, 1,335
distinct sites have existing source-ID exact ministry links for the 1,418
FSSP, ICKSP, SSPX, IBP and AASJMV CL27 records. These links do not certify
the current Mass or whole-building ownership.

## First-party exact-site witness upgrades (11 November)

After the baseline census, a separate source-exact witness overlay resolves
**37 formerly unresolved venues** without changing a CL2 anchor or treating an
organiser as a property owner:

| Venue category | Added | Current category total |
| --- | ---: | ---: |
| Diocesan / parish context | 24 | 657 |
| Religious house | 9 | 106 |
| Mixed / hosted venue | 4 | 18 |

The remaining operator/category hold count is **382**, consisting of 308
unresolved and 74 directory-only associations. Overall **2,198 / 2,580**
venues now have a positive source-reported or separately verified category,
including 37 individually validated first-party cases.

The verified sources include 11 additional UK cathedral/monastery identities, notably Wrexham, Portsmouth, Leeds, Newcastle, Belmont Abbey, Tyburn, Farnborough, Douai, Prinknash, Buckfast and St Dominic’s Priory. These sources do not certify 1962 use at the sites.\n\nThe witnesses deliberately include mixed examples:

- St Aloysius Parish in Thorold: a parish in the diocese served by FSSP
  priests, without declaring the whole building FSSP-owned.
- St Paul's College Chapel, Hikurangi's Holy Name of Mary and Lawson's Our
  Lady of the Nativity: FSSP official listing proves a hosted ministry, not
  venue title or the Missal at every other celebration.
- Silverstream Priory and Notre Dame Priory, Colebrook: Benedictine houses.
- Holy Family, Toronto: parish administered by Oratorians, not a blanket
  Roman/1962 assertion.
- Westminster Cathedral: unequivocal diocesan cathedral. The current use
  of the word *Latin* is not accepted as a 1962 Missal certification.

Each upgraded row preserves its original source-affiliation text, exact CL2
anchor and source ID, and cites the individual first-party identity page.
`src/find/tlm-exact-venue-categories.js` applies the 37-item witness overlay
only after the baseline category matrix. Neither the album/photograph nor
institute emblem nor liturgical books are changed in this pass.

## Major outstanding holds

- 209 Latin Mass Society discovery rows labelled unverified operator.
- 74 unclassified historical LMD source rows.
- 39 CMRI-directory-only and 25 SSPV-directory-only affiliations.
- 20 labelled Other, 17 friendly but unclassified, 12 blank.
- Smaller cases remain identified by exact source label in the matrix.

## Image and liturgical phases (not completed by this pass)

1. Assign the approved **church photograph** to diocesan-parish contexts,
   with an appropriate placeholder when a photograph is absent.
2. Assign the corresponding institution/society/community **emblem**, when
   identity evidence matches; otherwise use a neutral, appropriately
   labelled category mark. Mixed/hosted sites must not misrepresent ownership.
3. Use existing **source-ministry** liturgical norms for the FSSP, ICKSP, SSPX,
   IBP and AASJMV; preserve direct rite evidence for Dominican, other religious
   and exceptional liturgies. Do not infer Missal, una cum, rubrics or
   canonical standing from a generic category or third-party directory listing.

**Authority order**: exact celebration > explicit local ministry > exact
source-linked institutional norm. This source-label census sits beneath these
and never overwrites them.

## Implementation

- `data/directory/cl2-source-site-category-matrix-20261111.v1.json` is
  exhaustive across the currently frozen 140 literal affiliation labels.
- `src/find/tlm-site-category-associations.js` validates 2,580 rows,
  140 labels and exact source-ID joins, then adds `site_category` metadata.
- `src/find/preliminary-directory-r49.js` loads the manifest after
  institutional joins; old offline snapshots can omit it without failing.
- `tests/tlm-cl2-site-category-census.mjs` and `test:directory` enforce
  complete coverage, explicit holds and non-mutation of liturgical data.

No changes to the Excel master, CL2 anchors, map positions, public Mass
schedules, approved media or GitHub-only deployment.

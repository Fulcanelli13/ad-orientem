# Directory frozen 2,579-site identity audit — 29 October 2026

**Status: research-identity disposition complete; independent current Mass-site verification incomplete.**
This document closes the fixed population crosswalk, **not** publication of all research entries. It is a reproducible classification policy and scorecard from the user's frozen `Ad_Orientem_TLM_Phase27M_Strict_Certification_2579_2026-10-29.xlsx`, sheet **ALL 2579 GATES** (2,579 distinct `research_anchor_id` values). The workbook is retained outside the GitHub repo; this is a row-level audit of that snapshot, not a claim that the workbook is in CI.

## Strict, exhaustive identity disposition

| Frozen research category / evidence | Research IDs | Administrative action |
|---|---:|---|
| `R49_EXACT_SOURCE_ID_REUSE` | 1,844 | EXISTING: retain original source/Place identity; do not create duplicate |
| `EXISTING_FSSP_ID_AND_ADDRESS` | 30 | EXISTING static generator ID and matching address; do not publish another venue |
| Currently primary-source-certified RG anchors outside those two classes | 12 | RECONCILED: 8 historical name-country leads, 1 address candidate and 3 former no-static-match anchors; preserve distinct/associated research IDs |
| **Total linked/reconciled** | **1,886** | **No duplicate publication** |
| `NO_STATIC_PROVIDER_MATCH_YET`, excluding 3 reconciled above | 516 | DEFER, not proved absent or new |
| `V19_NAME_COUNTRY_ONLY_UNVERIFIED`, excluding 8 reconciled above | 102 | DEFER, no reliable same-building identity |
| `NEW_V19_SAME_ADDRESS_CANDIDATE`, excluding 1 reconciled above | 57 | DEFER, building/operator confirmation needed |
| `NEW_V19_NAME_LOCALITY_CANDIDATE` | 9 | DEFER |
| `EXISTING_FSSP_ADDRESS_ALIAS` | 6 | DEFER exact identity judgement; do not assume alias is a second chapel |
| `FSSP_CONTEXTUAL_ALIAS_REVIEW` | 2 | DEFER |
| `REJECTED_FALSE_POSITIVE_STREET_MISMATCH` | 1 | DEFER site; permanently reject the specific false-positive join, not the site's existence |
| **Total held** | **693** | **No new venue or Mass schedule from these entries** |
| **Frozen IDs accounted for** | **2,579** | **100%** |

The historical **519** no-static-provider group therefore contains **3** later reconciled RG anchors (Holy Family, Southampton; Our Lady Immaculate and St Edmund, Withermarsh Green; and Kaplica św. Piusa X, Kraków), leaving **516** unreconciled within that group. The 12 current-source reconciliations are **source anchor IDs**, not 12 newly published physical sites.

## Previously deployed first-party cohort

PR [#1891](https://github.com/Fulcanelli13/ad-orientem/pull/1891) adjudicated **41 distinct source-certified physical sites / 44 historical RG anchors**: 39 physical venues already represented in the static Directory, and 2 new **address-only** Find admissions (Kraków and Withermarsh Green). The three associated duplicate RG identities do not create extra chapels. The published admission gate is an explicit two-ID allowlist; new entries provide **no uncertified Mass times and no speculative map coordinates**. This document does not expand that allowlist.

## Quarantined geometry and metadata exceptions

Four historical R49 same-address multi-source groups have conflicting original map points >150 m apart; **preserve IDs and coordinates until independent building-point evidence**, with no blind geocoding or destructive merging:

- `RG-76D2AEF365FE`: Church of the Holy Name, Stepney (AU), **579.0 m**.
- `RG-956BB24E14EA`: Maternal Heart, Lewisham (AU), **495.2 m**.
- `RG-4279040C75AD`: Cathedral crypt, Geraldton (AU), **299.0 m**.
- `RG-9DE31147B6ED`: St Mary's College Chapel, Galway (IE), **233.6 m**.

Also preserve the source-name conflict `RG-B13D9BC10CC3` (Świerad versus Sarkander) without automatic renaming. The additional **36 G0 private research identities** are a different population and must not be added to the 2,579 or the 693. Previously screened historical UK entries remain source-qualified/held as appropriate, not evidence of a current Mass.

## Release completion policy

1. **Close this frozen crosswalk**: all 2,579 IDs have a conservative identity disposition. Do **not** reopen broad discovery/bulk-research waves to manufacture a 100%-published metric.
2. **Preserve the 693 as a finite, non-public exception population**, with identity/provenance gaps recorded. An unmatched historical name does not prove a venue is absent from live dynamic Directory sources.
3. **Only reopen a specific site** when an original operator or diocese source proves the physical address, distinct identity and appropriate traditional Mass rite. A public address-only Find record may be admitted through an explicit approval gate. Verify schedules, recurrence and building coordinates **separately** before displaying them.
4. **No duplication** of the independent Mass timetables workflow; retain all existing R49 Place/source IDs and hold safeguards. No costs, owner contact or unlicensed bulk imports.

**Production impact of this document: none.** It does not authorize new venue IDs, pins, schedules, or moves. Future status claims must distinguish *historical source linkage*, *present-day site certificate*, *public Find listing*, and *certified Mass times*.

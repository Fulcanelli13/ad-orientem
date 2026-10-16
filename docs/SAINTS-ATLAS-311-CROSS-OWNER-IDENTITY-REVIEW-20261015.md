# Saints of the Day — all 311 historical occurrences reconciled with current owners

15 October 2026 · Research-only · [Map of Saints draft PR #1227](https://github.com/Fulcanelli13/ad-orientem/pull/1227)

## Scope, source truth and reproducibility

This is the first **component-by-component current-owner identity audit** after recovery of the original frozen `v43.33` Saints of the Day engine. Historical extraction itself is **already certified** by the original source hash and the dedicated `saints-v4333-original-sanctoral.yml` workflow; do not duplicate or infer 311 records from monthly totals.

The reproducible [passing CI #38737829358](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38737829358) runs `tools/saints/reconcile-311-historical-person-owners.mjs`. Its [full 311-row JSON artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38737829358/artifacts/11974588184) is `saints-v4333-311-owner-identity-and-art-review.json`.

Source inputs are the existing owners, **read-only and pinned to exact Git revisions**:
- Original history: `data/saints/historical-v4333-311-components.recovered.v1.json` (original v43.33, 37,954,985 bytes, SHA-256 7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3).
- Calendar PR #1226 at `07516f7ecf96ec2bef6c0746966bd3442496f4ef`: 38 Doctors, six living sanctoral review persons, 258 official-index post-1960 named persons.
- Sacred Art PR #1231 at `c61b6531a8bead35746e8a7cf1f7503fde643480`: 87 frozen historical art identity-rule IDs via W62; W64 original user-rated-five portrait subject leads.
- Existing `data/explore/worldwide-relic-subject-census.research.v1.json`: 161 subjects, still a research census; subject identity and relic authenticity are independent questions.
- Existing Saints six EN/FR biographies and reviewed two-person Calendar identity bridge in draft PR #1227.

**Nothing is copied into or renamed within the owners' canonical person, feast, artwork, place or relic registries.** This file does not serve production data.

## Observed coverage of existing historical identity IDs

| Measured subject | Component occurrences |
| --- | ---: |
| Frozen historical `saint.*` namespace | 244 |
| Frozen `group.*` namespace | 58 |
| Frozen `event.*` namespace | 7 |
| Frozen `angel.*` namespace | 2 |
| **Total recovered source instances** | **311** |
| Distinct frozen identity keys | 307 |
| Exact `saint.*` keys appearing in Calendar's Doctor roster | 13 |
| Exact `saint.*` keys appearing in Calendar's current six reviewed persons | 2 |
| Exact historical `*.id` keys used by W62 historical Sacred Art rules | 89 |
| Mechanical `saint.*` → `subject:saint-*` matches in Relic census | 40 |
| Existing Map of Saints pilot persons linked to historic component | 2 |
| Currently released new portrait bindings from this job | **0** |
| Newly canonically published persons or group profiles from this job | **0** |

These counts overlap; they are not distinct Saint counts. **The historical component's presentation mode must not override its semantic namespace**: the old UI may mark a liturgical event such as the Conversion of St Paul as `individual`, while the semantic `event.conversion-paul` continues to be an event, not an additional canonized person. Groups remain a single collective profile. Three rows historically displayed as exact liturgical traditions and one hybrid are also retained without flattening member identities.

Calendar Doctor exact-ID matches are strong provenance links, **not** a blanket modern Doctor-title declaration during a 1962 Mass. Because some Calendar person slugs differ from the frozen historical slugs, 13 exact matches are a conservative lower bound for identity reconciliation, not evidence that only 13 Doctors appear historically. Namesakes, Greek/Latin spellings and minor slug differences need date/source-ID adjudication.

Mechanical relic ID similarity does **not** certify a person match, current physical custody, authenticity, permanent map location or first-class attribution. Later canonization indexing has zero *exact historical ID overlaps* in this snapshot because the research corpus is a modern post-1960 canonization list; this does not undermine the historical status of any saint.

## Approved aesthetic rating vs releasable saint portrait

Sacred Art W64 now has **two existing user-rated-five person-subject leads** reused without re-rating:

1. `saint:therese-of-lisieux` → `carmel-lisieux-1925-therese-aux-roses`, the 1925 *Thérèse aux roses* by Céline Martin. Link from exact Calendar `saint.therese-lisieux`, with historical 3 October source.
2. `saint:margaret-mary-alacoque` → `podesti-margaret-mary-source`, a Sacred Art owner-reviewed five-score source candidate, with observed 17 October Sanctoral and frozen `saint.margaret-mary-alacoque`.

The **score 5 survives as a user aesthetic judgement of a reviewed original**; it is not a legal assertion that the particular digital photograph is properly identified, public domain/licensed, high-resolution, adequately cropped, or suitable for the exact saint biography. Both candidates remain `releaseAllowed: false`; the Saints reader continues to render neutral placeholders. No new artwork is selected or rated here.

## Next identity-review and release sequence

1. **Resolve nominal-date and source-ID aliases for the remaining historical persons**, starting with Doctors and namesakes where Calendar uses a slightly different slug. Do not substitute name substring matches for canonical person reconciliation. Keep an explicit exception list for apparent identical-name individuals and groups.
2. **Prioritize meaningful EN/FR lives**, using already documented Calendar, Sacred Art and Relics evidence. A discovered identity is not yet a verified paragraph about heroic virtue. Record holiness, historical acts, and appropriately sourced apparition, miraculous cure or stigmata claims independently. Empty extraordinary lists are not assertions of absence.
3. **Coordinate one art master per original** with W64 source/rating/rights approval; never copy art or repeat 0–5 user assessments. A user 5-score alone is not a publication credential.
4. **Link geographic places only from existing physical Place IDs** with source-backed relationships; a shrine dedication does not prove birthplace/death/relic custody.
5. **Expand the existing six-person Map of Saints slowly** to a 30–50 profile pilot only after editorial claims and person identity are source-verified. Keep the independent Calendar "Also honoured" overlay and original 1962 principal Mass untouched.

## Validation / status

The exact source-owner job passed, conserves every original 311 component, 307 distinct frozen identity keys and semantic namespace counts, and adds **zero** current people/artworks/relic authentications. The PR remains draft and unmerged, separate from other parallel pipelines; no published Pages change.

# Comprehensive Catholic Customs Registry — 53 unowned source actions and 54 possible pair conflicts
**Date:** 23 October 2026. **Authority:** independent research draft #1572 stacked on #1536. **App publication:** none.

## Scope and result

The preceding pass had completely **routed** 340 fine-grained 1958 Handbook records, 371 provisional practice groups, 111 1956 Family-book source observations and 53 geographic families. But **53 of 340 details had no proposed practice or working-master candidate**, and **54 pairs of provisional groups** were linked only because they shared an owner umbrella or source mention.

This pass created *reversible action-level decisions*, rather than simply repeating that those records needed review:

| Work population | Source rows | New disposition |
|---|---:|---|
| Previously unassigned Handbook details | **53 / 53** | 36 descriptions provisionally grouped into **37 action labels** (one description includes the English horkey cart and Scottish kirn doll); one related to an existing group; 16 classified as context, other-rite comparison, or folk/historical source information |
| Shared-owner or shared-witness pairs | **54 / 54** | 25 clearly different described primary actions; 7 potentially related actions or regional variants; 22 related contextual or different-time/action pairs; **zero certified sameness / merges** |
| Prior provisional group inventory | 371 | Retained unchanged |
| New provisional action labels | +37 | No automatic relationship to previous IDs asserted |
| **Total research provisional group/action labels** | **408** | **Not a count of 408 distinct Catholic customs** |
| Book research observations/details | **1,025** | No new source rows added in this identity-only pass |
| App runtime, Calendar, reader or public customs modified | **0** | Source-first gate preserved |

### Formerly unassigned source actions promoted *only into research working labels*

Examples: first-Sunday-of-Lent German `Brandsonntag` rolling fire wheels; French `Fête des brandons` torch-bearing; Plough Monday / `Blochziehen`; Easter dawn water-washing; maypole customs of Tyrolean newlyweds; the Mexico/South America Last Supper dramatic reenactment; Pentecost dew practices; the Scandinavian St Lucy inscription and bonfire variants; harvest last-sheaf doll, Austrian `Erntebraut`, English horkey cart and Scottish kirn doll; domestic holly charms and reported Christmas or seasonal folklore.

**Different belief status is essential**: source-attested seasonal folklore, unsupported supernatural claims, historical Church ceremonies, Eastern Christian rites and Catholic household prayer are **different research categories**. Every practice-like source report may merit catalogue preservation, but it does *not* become an approved Catholic act, a Church ritual, or proof of modern continuity.

### Sample direct scan verification in this pass

Source: Francis X. Weiser, *Handbook of Christian Feasts and Customs* (1958). Original public scan: <https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf>. Relevant directly examined pages include:
- Printed p. **125** — `Perchten` masks, whip and gun salute customs, tree and field fertility incantations, distinguished from Catholic approval.
- Printed p. **139** — New Year carol bands and mounted carollers, plus divinatory folk games whose predictive effects are unverified.
- Printed pp. **161–162** — `Brandsonntag` burning wheel practice in Germany and French firebrand walks; Plough Monday / `Blochziehen` reported as linked to older fertility celebrations.
- Printed p. **196** — Last Supper reenactment and a Malta charitable food table, described distinctly.
- Printed p. **269** — last-sheaf `harvest baby`, Austrian harvest-bride wreath and English/Scottish cart/doll traditions; the author explicitly discusses pre-Christian beliefs.
- Printed p. **105** — holly practices and the English historic aversion to indoor Christmas ivy; magical claims are folklore descriptions only.
- Printed p. **342** — St Lucy name/figure inscriptions and fires/incense in Scandinavia; efficacy or magical protection is not accepted as fact.

Other records in this batch are **based on the previously captured Weiser index labels and page locators**, without fresh original-page inspection. Source spot-checks support the specific described actions but **do not certify any whole page, chapter, or complete book extraction**.

### The 54 co-association pairs and false merges

These were all compared at the **source-label/action level**, *not* independently republished or checked against all 54 original passages:

- St Blaise bread sticks and St Blaise throat blessings are different acts, even though both are under the same saint and may have been assigned the same umbrella owner.
- Easter egg decoration, Easter egg giving, egg-based food, and Easter flower decoration must not be collapsed.
- Palm Sunday willow tapping, reconciliation using blessed branches, and keeping branches in barns concern different people and actions.
- A cemetery prayer visit, a vigil, grave cleaning, lighting votive candles, and repairing graves may coexist but are not guaranteed to be identical customs.
- German and French bonfire traditions can belong to a related seasonal family without being the same locally named form.

Seven relationships remain **possible variants/subpractices**, including locally distinct Easter egg colouring and cemetery visiting or candle customs. These require the original passages and local witness comparison before any `same identity` decision.

## Files and testing

- `data/customs/master/53-no-owner-customs-action-review.v1.json` — all 53 research dispositions and 37 newly staged working action labels.
- `data/customs/master/54-coassociation-action-level-relationship-review.v1.json` — 54 source-label-level pair outcomes with explicit nonmerger flags.
- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — now includes 37 action label records and cross-links to both new files; total **408 provisional groups**, **56 previous master identities**, base source row count unchanged.
- `tests/customs-full-registry-census.mjs` — new validation of exact 53 and 54 identity sets, 37 unique action IDs, all related previously known IDs, no claimed modern confirmation, and no automatic equivalence.

**Do not add** 408 and 56 and claim that there are 464 unique Catholic customs; there is overlap and there are reported non-Catholic or secular acts. Our goal remains source-complete evidence and reversible practice identity normalization.

## Genuine remaining acceptance gates

1. Compare exact **source passages and local tradition documents** for the seven possibly same-action pair candidates and the 37 new action labels.
2. Finish page-by-page completeness for the 342 main printed pages of the 1958 Handbook, then the 1956 Family book; existing printed-page **locations** do not indicate fully audited pages.
3. Establish stable identities of customs and exact local variants with participants, date, object, setting, source and region fields. Keep material practices distinct when the action differs.
4. Mine all accessible original Weiser precursor books and independent Catholic ethnographic/parish sources without prioritizing a calendar implementation.
5. Audit geographic attestations and provenance rather than converting unverified mentions directly into mapped or modern customs.

No work on Ad Orientem app integration is part of this stage.

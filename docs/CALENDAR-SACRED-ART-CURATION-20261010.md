# Calendar sacred artwork — first curated museum source pass

**Owner:** [#885](https://github.com/Fulcanelli13/ad-orientem/issues/885) · **Date:** 2026-10-10 · **Status:** research/selector groundwork; **not deployed or image-certified**.

## Outcome

- 40 *distinct colour paintings* with individually inspected **Met object pages**, across Annunciation, Nativity, Epiphany, Baptism, Passion, Crucifixion, Resurrection, Ascension, the Samaritan woman, denial of Peter, Virgin and Child, and Christ Blessing.
- All are linked to their original holding-institution object pages in [the candidate registry](../data/calendar/sacred-art-candidates.v1.json). Those pages identify eligible works as Public Domain, under [The Met's CC0 Open Access terms](https://www.metmuseum.org/hubs/open-access). Each painting is only a **source-verified candidate**, not a visually certified app asset.
- No engravings, drawings, frescoes, murals, monochrome reproductions, sculptures, photographic tourist shots, generated fakes, or standalone generic icon-bank symbols are part of this catalogue.
- Existing app icons and frozen semantic asset identities are untouched.

## Non-negotiable curatorial gate

Publication requires **all** of the following:

1. Holding-institution object metadata, artist attribution, original title, source link, object ID and reusable-image rights checked. Prefer directly licensed **CC0** images; a generic assertion that the painter died centuries ago is insufficient for image rights.
2. Acquire the museum's actual original image—not a Google Images result, search thumbnail, user upload, social-media copy or photograph taken through glass.
3. Inspect full-resolution original in colour. Minimum 2500 pixels on the longest side (prefer higher). Reject monochrome, blurred, noisy, compression-damaged, low-resolution and visibly retouched reproductions, tourist photos, perspective distortion, glare, frames, margins, and wall context. Reject claims to high resolution based on artificial enlargement.
4. Curator explicitly approves artistic distinction, historical attribution and Catholic suitability. Reject a merely adequate candidate; seek a better masterpiece.
5. Inspect full image **and** intended portrait/landscape mobile hero crop; never require a crop that cuts off the principal sacred subject. Store crop coordinates/alternate ratio only after visual verification.
6. Store a locally controlled compressed approved image under `assets/sacred-art/`, verified file hash, original image dimensions, exact source, credit line and approval evidence. Provide an uncropped full-screen artwork view in later UI work. Do not hotlink undocumented temporary artwork URLs.
7. Human approval record sets all required `review.*` flags and image metadata; selection code will refuse a record until then.

No image has passed these last pixel/crop/curator gates in Batch 1. Neither image download nor phone visual acceptance has been performed.

## Selection hierarchy (pure, fail-closed)

In `src/calendar/sacred-art-selection.js`, use exact metadata supplied by the existing 1962 observed DayResolver:

1. Exact **observed principal** identifier.
2. Principal **observed mystery/saint subject** from verified source identity (not a translated name).
3. The **appointed Gospel** subject from source-bound readings.
4. The **appointed Epistle/other Scripture** subject from source-bound readings.
5. The **1962 liturgical period** from `buildLiturgicalYear(selected).currentPeriod.id`: `advent`, `christmas`, `epiphany`, `after-epiphany`, `septuagesima`, `lent`, `passion`, `easter`, `ascension`, `pentecost`, `after-pentecost`.
6. A separately documented traditional devotional association.
7. Universal approved Christ/Marian masterpiece.

Only verified explicit subject keys may be passed. Never extract subjects from title strings, infer an observance from fixed civil date, mislabel a collective martyr as a portrait, or use a modern-lectionary reading. An unknown/unresolved Proper must not be silently represented as Scripture certainty. In case of no approved artwork, return `null`; render the existing neutral interface, not a random unapproved painting. Stable date variation occurs *within a tier*, not across priorities.

## Devotional time layer

The **optional**, **disabled-by-default** selector accepts already-local time as `HH:MM`, with configurable morning (06:00), midday (12:00), evening (18:00) start and 20-minute duration. This is an artwork overlay, not an alert, calendar change or requirement to pray at a universal fixed hour. Map to Annunciation/Angelus paintings outside Eastertide; use Resurrection/Regina Cæli artworks in `easter`, `ascension` and `pentecost` liturgical periods. Do not autonomously query clocks or infer user location. Back out to the main day's image after the window. If a suitable approved overlay image is missing, omit the substitution. Eastertide determination comes from the canonical 1962 year period, not a modern seasonal guess.

## Integration sequencing / honest coverage

- **Batch 1 here:** 40 museum source candidates, a pure selector, regression tests. **0 production image assets**. **0 daily dates visually approved**. No new Calendar hero yet.
- **Batch 2:** Acquire source originals and manually approve images, using a curated 40–50-masterpiece target, rather than approving every candidate. Add image manifests/crops, rejection reasons and resolution evidence.
- **Batch 3:** Map source-linked 1962 observed principal identifiers and **actual reading IDs** for complete ordinary and leap years. Verify per-date results (A exact, B Scriptural, C seasonal, D documented devotional, E universal) and no unapproved works; report reuse distribution and thin days. Distinguish calendar days with logical fallback from verified paintings with safe mobile crops.
- **Batch 4:** Integrate into redesigned Today and Calendar with full-image credits and a locally configurable Angelus/Regina Cæli overlay; test desktop/phone, offline, international date/time, no flicker, colour accessibility and transition behaviour.

**Ownership:** research registry under `data/calendar/`, pure selector under `src/calendar/`, later real image collection separate from the frozen `src/assets/asset-registry.js` contract. Never create a new competing 1962 calendar, orphan art registry, or another separate artwork pipeline.

## QA command

```bash
node tests/calendar-sacred-art-selection.mjs
```

This is an algorithmic gate, not a claim that a curated 365/366-image calendar already exists.

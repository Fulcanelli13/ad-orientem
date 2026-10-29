# Prayer B38 — historical private Litany reading on phones
29 October 2026

## Scope and evidence
The existing private Litany of the Saints reader uses two **separate historical witnesses**: the English Catholic Prayer Book (1883), and Corneille's French collected works (1862). Both are uncollated. The public Major Litanies, Easter Vigil and Forty Hours remain **distinct rites**, with the full 1962 public text withheld until line-by-line source collation. Do not import a private list into a public rite or silently correct suspect historical French transcription readings.

The browser audit uncovered a more consequential issue: the shared Prayer semantic-prose formatter was flattening the 18 separately marked Litany invocations into a **single text span**, joining words and eliminating line boundaries. To prevent source corruption in the actual UI, the private Litany uses a dedicated `aoP435930LitanyPrayer` / `aoP435930LitanyVerses` structure, retaining the original per-invocation paragraphs. It is intentionally excluded from the generic prose semantic face; the existing focused-source paragraph adapter remains attached to the individual lines. This is a presentation ownership fix, not textual editing.

The current source-owned Litany reader already provides the chapter timeline; do not create a second Previous/Next system. A review of actual shared CSS showed a **16px** litany-line face with a **52px / 16vw right gutter**, even on 320px devices, and the generic distant-paragraph **30%** opacity which dims historical invocations rather than merely guiding them.

The second 320px phone test exposed another issue: the shared dual-axis stylesheet hid every `.aoP435930GuideNav`, unintentionally hiding the **distinct historical-edition/ritual-use selector** in the private Litany. B38 retains the original chapter rail but places edition choices inside an accessible collapsed-by-default `<details>` disclosure. When expanded, the selector's four 44px+ buttons appear in a compact two-column grid despite the generic chapter-nav suppression. Public source-reference screens retain the directly visible selector.

## Code change
1. Scope all layout changes to `[data-ao-devotional-owner="litany"]`, which exists only for the private Litany reader. Change invocations to 18–22px responsive liturgical-serif, 1.58 line height and 12px line spacing. Keep a 15px horizontal card padding on ≤420px devices instead of the excessive right gutter.
2. Keep the guide and source metadata secondary, with compact guide margins. The actual historical invocation lines are prominent and legible. Do not remove the original 18-line chapter pagination or source edits.
3. For the `kind==="litany"` focus owner alone, keep non-active adjacent source paragraphs at .88 and farther ones at .76; the active paragraph stays 1.0. Novena values (.80/.65) and every other shared reader's defaults (.56/.30) remain intact.
4. Preserve existing bilingual source provenance, distinct private/public navigation, failed-source state, collapsed source disclosure, public-rite fail-closed editorial boundary and all routes.

## Acceptance and limitations
- Required Main includes the existing source-use and edition regression, expanded with checks for private-only typography and focus.
- The dedicated 320px/390px browser acceptance loads a **synthetic test-only** Litany witness into the existing exact locale cache key. Synthetic fixtures are never published or treated as verified prayers. This exercises the *actual* app reader and historical extraction/pagination without runtime network dependency. English/French are separately checked for 18px text, 1.5+ leading, minimum .76 opacity, retained chapter rail, collapsed edition disclosure, accessible line width and no horizontal overflow.
- Navigate to the second source-owned chapter; confirm active card and typography persist. Switch to the public Major Litanies reference; ensure the private text disappears and the uncollated public source remains a reference-only screen.
- Capture temporary 320px/390px EN/FR phone screenshots for visual inspection, three-day retention. No permanent screenshots, external storage fees, new image assets or dependencies.
- Merge only on successful B38 phone acceptance and Required Main; verify Vercel READY on the exact resulting merge SHA.

## Remaining
Full production collation of the public 1962 Litany is a separate editorial programme and **not** a UI precondition for this private-reader repair. Further Litany source corrections require printed-facsimile evidence, not assumptions.

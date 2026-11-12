# LIVE sanctuary original visual assets — staging only

The owner-supplied 65-scene original HTML and 65 icon files are preserved byte-for-byte. `ao-sanctuary-embedded.js` is an adapter; the original 3-D geometry, figures, camera, lighting and keyframes are not edited. Enable only with the host preview flag `aoSanctuaryPreview=1`.

The canonical native LIVE reader owns the 1962 prayers, cues, dynamic rubrics, icon rails, and Mass progression. The Schola owns independent Gregorian Propers; its music or sample chant clock NEVER causes sanctuary choreography. Source focus drives an illustrative visual, not an observation of the celebrant.

## Source-triggered choreography under review

| Native source cue | Original visual | Forms | Condition |
| --- | --- | --- | --- |
| AO.SM.C0174 / AO.CARD.015 | C36, Host elevation | Low, simple Sung, incense Sung, Solemn | Active certified Host elevation source cue |
| AO.SM.C0181 / AO.CARD.016 | C38, Chalice elevation | Low, simple Sung, incense Sung, Solemn | Active certified Chalice elevation source cue |
| AO.SM.C0121–C0124 / AO.CARD.010 | C24, Offertory incensation | Non-Requiem incense Sung, non-Requiem Solemn | Starts **only** at C0121 (offerings), continues without restarting through C0122–C0124; never from C0120 incense blessing or the independent Schola Offertory. Requiem remains static because the original C24 routine incorrectly incenses additional people |

Elevations cancel immediately on leaving their *single* active cue, extinguishing their glow. The C24 incense choreography instead remains active through its sourced C0121–C0124 sequence (the original motion lasts approximately 16 seconds), and cancels when the reader exits that sequence. Continuation cues do not start or restart it. Returning to the initial C0121 after leaving can replay it. LIVE→MISSAL now sends an explicit cancel to the still-mounted iframe: pending actor keyframes, smoke and elevation effects must not survive the mode change. These are preview-only illustrative source-focus bindings. Green technical tests are not a certification of the complete choreography.

## Deliberate source holds

- **C13 Missal transfer**: the existing source cue AO.SM.C0081 describes priest arrival at the Gospel-side Missal; it does not establish the earlier server transfer timing. In Solemn Mass the same boundary belongs to the deacon's Gospel procession. Do not automatically trigger the original server movement from C0081. A sourced non-text preparatory event is required.
- **C57 Communion walk**: AO.SM.C0246 describes distribution already at the Communion rail, not the priest's preceding route. Do not animate an approach based on that text. A separate route event/boundary is required.
- **P1 Asperges**: native five-stage R20 sequence (ASP-R01…ASP-R05) now presents Claude's unchanged P1 scene *outside* the canonical 65 Mass cards, in LIVE only, for valid Sung/Solemn profiles. The original complete nave-walk remains **untriggered**: the source graph does not certify a precise observed priest departure. The faithful's explicit `markActuallySprinkled()` report at ASP-R03 may show a brief, adapter-only water-drop gesture on the original figure, once per explicit observation; it never triggers the full nave walk or changes faithful posture. No droplets arise from Asperges/Vidi aquam chant.
- **Solemn Gospel, ordinary and Requiem**: the inherited C14 gave the Gospel book to the *deacon*, but Ritus VI.5, research record MR62.SOL.B02.008, assigns it to the *subdeacon*, who holds it between the candlebearers as the deacon proclaims. The preview adapter now transfers the existing book prop to the subdeacon, without touching original figures or geometry. In a Solemn **Requiem**, Ritus XIII.2 research records MR62.SOL.B02.064/.065 omit incense and candles **but retain two acolytes** to support the Gospel book. Earlier staging incorrectly hid those two people entirely. Now only the thurifer is hidden; the original two acolytes remain without torches, with a single existing book prop used as a provisional representation of their jointly supported book. Correct paired hand positions and precise geometry remain unverified.
- **Solemn Requiem Offertory**: Ritus XIII.2 permits incensing oblations/altar, but afterward only the celebrant is incensed. Claude's ordinary C24 16-second routine incenses additional ministers/people. The full original routine is **suppressed** for Requiem and the static source scene is retained until a Requiem-accurate choreography exists.
- **Solemn minister staging**: full O'Connell ceremonial audit and exact deacon/subdeacon/acolyte positioning remain open; the 67-record historical research set is explicitly **not runtime-certified**. The sung-Mass acolyte now stands by the sedilia instead of kneeling.
- **Meaning texts**: draft, not approved.

The full original animations have been exercised in isolated Chromium playback, and five native LIVE viewport scenarios passed at the earlier draft head. Re-run required CI after any new binding change; do not merge or publish until the new gate and ceremonial holds are resolved. GitHub Actions and GitHub Pages only, no Vercel.

## 12 November R20 and Requiem source-verification scope

- Native Asperges formula (ordinary vs Vidi aquam) is selected by the existing R20 1962 season controller; Palm Sunday exclusion and Passion Sunday Gloria Patri omission are unchanged. Native five-stage ASP source IDs must match exactly; low Mass, MISSAL mode and Schola-only messages fail closed.
- The water effect is **illustrative**, attached transiently to the existing priest figure after the user's explicit receipt-of-sprinkling report. It does not certify the physical position, direction or precise time of the celebrating priest; neither a priest route nor a new 1962 rubric is created. Detailed hand/aspersorium action and live physical choreography remain outstanding.
- The Requiem guard is populated through `isExplicitRequiemMass(prepared)`, never a day name, prototype title or user scroll. Source-checked historical minister rows govern preview-only actor corrections: in ordinary Solemn Gospel the subdeacon bears the book; in Requiem the acolytes remain to support the book without torches or thurifer. These rows do not become observed event clocks.
- Acceptance now includes the four-language/mode All Saints Sunday Asperges native browser suite with the original P1 iframe staged in LIVE; the explicit-water-effect assertions are separate from approval of complete priest sprinkling choreography.
